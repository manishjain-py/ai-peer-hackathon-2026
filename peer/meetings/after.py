"""After the meeting (S3 "After"): the brief in the owner's DM and on the page, a memory file, the log.

Right after the bot leaves (the storage links expire): the full transcript and the mixed recording into
~/.ai-peer/<owner>/meeting-runs/<id>/ (never git). The brief comes from one brain run (meeting_brief) over
the live lines (which carry real speaker names; the after-meeting file labels the Peer's own lines
"Unknown") plus what the Peer said; requests made to the Peer in the meeting are follow-ups for the owner.
"""
from __future__ import annotations

import json
import logging
import time
from datetime import datetime, timezone

from ..brain.runner import run_agent
from ..brain.schemas import MEETING_BRIEF
from ..events import now_iso
from ..memory.layout import Memory, slug
from ..notify import send_meeting_dm
from . import store as mstore
from .cover import local_time

log = logging.getLogger("peer.meetings.after")


def _fetch_media(sess) -> dict:
    out = {}
    try:
        lines = sess.rec.transcript_lines(sess.bot_id, timeout=90)
        (sess.run_dir / "transcript.json").write_text(json.dumps(lines, indent=1, ensure_ascii=False))
        out["transcript_lines"] = len(lines)
    except Exception as e:  # noqa: BLE001
        out["transcript_error"] = str(e)[:120]
    deadline = time.time() + 150
    while time.time() < deadline:
        try:
            url, info = sess.rec.media(sess.bot_id, "video_mixed")
            if url:
                p = sess.rec.download(url, sess.run_dir / "recording.mp4")
                out["recording"] = str(p)
                break
        except Exception as e:  # noqa: BLE001
            out["recording_error"] = str(e)[:120]
            break
        time.sleep(6)
    return out


def _timeline(sess) -> list[dict]:
    items = [{"t": x["t"], "speaker": x["speaker"], "text": x["text"], "peer": False, **({"via": "chat"} if x.get("via") else {})}
             for x in sess.lines]
    for e in sess.peer_log:
        if e["kind"] in ("intro", "update", "answer", "no_update"):
            items.append({"t": e["t"], "speaker": f"{sess.bot_name} (the Peer)", "text": e.get("text", ""), "peer": True,
                          "kind": e["kind"], **({"certainty": e.get("certainty"), "flagged": e.get("flagged"),
                                                 "sources": [s.get("title") for s in e.get("sources") or []]}
                                                if e["kind"] == "answer" else {})})
    return sorted(items, key=lambda x: x["t"])


def brief_text(sess, b: dict) -> str:
    def bullets(items, fmt):
        return "\n".join("• " + fmt(i) for i in items) if items else "• none"
    m = sess.m
    return (f":robot_face: *Meeting brief* · {m['title']} ({m['label']}), {local_time(sess.st, m['start'])}\n"
            f"{b['summary']}\n\n*Decisions*\n" + bullets(b["decisions"], lambda i: f"{i['what']} ({i['who']}" + (f", {i['when']}" if i.get('when') else "") + ")") +
            "\n\n*Questions for you*\n" + bullets(b["questions_for_owner"], lambda i: f"{i['what']} ({i['who']})") +
            "\n\n*What I said*\n" + bullets(b["peer_said"], lambda s: s) +
            "\n\n*Follow-ups*\n" + bullets(b["follow_ups"], lambda i: f"{i['what']}: {i['who']}" + (f", {i['when']}" if i.get('when') else "")) +
            f"\n\n_Your AI Peer took these notes; nothing it said committed you. Every step is in the activity log._")


def memory_note(sess, b: dict, media: dict) -> str:
    m = sess.m
    date = (m.get("start") or now_iso())[:10]
    rel = f"meetings/{date}-{slug(m['title'])}.md"
    def sec(title, items, fmt):
        return f"## {title}\n\n" + ("\n".join("- " + fmt(i) for i in items) if items else "- none") + "\n"
    body = (f"# {m['title']} ({date})\n\n{b['summary']}\n\n"
            + sec("Decisions", b["decisions"], lambda i: f"{i['what']} ({i['who']}" + (f", {i['when']}" if i.get('when') else "") + ")")
            + "\n" + sec("Questions for the owner", b["questions_for_owner"], lambda i: f"{i['what']} ({i['who']})")
            + "\n" + sec("What the Peer said", b["peer_said"], lambda s: s)
            + "\n" + sec("Follow-ups", b["follow_ups"], lambda i: f"{i['what']}: {i['who']}" + (f", {i['when']}" if i.get('when') else ""))
            + f"\nSource: the meeting's transcript ({m['label']}, the Peer's Recall bot), {date}.\n")
    Memory(sess.st.owner_dir).write_note(rel, m["title"], body, kind="meeting", summary=f"meeting brief, {date}",
                                         sources=[{"title": f"{m['label']} transcript", "url": f"meetings:transcript:{sess.bot_id}",
                                                   "date": date}],
                                         meta={"meeting_id": sess.mid, "start": m["start"], "lines": media.get("transcript_lines")})
    Memory(sess.st.owner_dir).rebuild_index()
    return rel


def finish(sess) -> dict:
    st = sess.st
    media = _fetch_media(sess)
    timeline = _timeline(sess)
    (sess.run_dir / "timeline.json").write_text(json.dumps(timeline, indent=1, ensure_ascii=False))
    req = {"playbook": "meeting_brief", "from_owner": False,
           "meeting": {"title": sess.m["title"], "start": sess.m["start"], "end": sess.m["end"], "where": sess.m["label"]},
           "owner": {"first": sess.first},
           "transcript": [{"speaker": x["speaker"], "text": x["text"], "peer": x["peer"]} for x in timeline],
           "peer_log": [{k: v for k, v in e.items() if k in ("kind", "text", "question", "asker", "certainty", "as_of", "flagged")}
                        for e in sess.peer_log]}
    res = run_agent("meeting_brief " + json.dumps(req, ensure_ascii=False), MEETING_BRIEF, label=f"meeting-brief:{sess.mid}",
                    effort=st.get("brain.claude_effort", "high"))
    if not res.ok:
        sess.note("failed", f"Could not write the brief for {sess.m['title']}: {res.error}", outcome="failed")
        mstore.update(st, sess.mid, status="ended", brief_error=res.error, media=media)
        return {"did": "ended", "brief": None, "error": res.error}
    b = res.output
    rel = memory_note(sess, b, media)
    text = brief_text(sess, b)
    r = send_meeting_dm(st, sess.chat, sess.owner_chat_id, text, None, f"mtgbrief:{sess.mid}", kind="meeting_brief_sent",
                        summary=f"Sent the brief for {sess.m['title']}", dry_run=sess.dry_run, meeting_id=sess.mid,
                        sources=[{"title": f"{sess.m['label']} transcript", "url": "", "date": sess.m["start"][:10]}])
    mstore.update(st, sess.mid, status="briefed", brief=b, brief_file=rel, brief_dm=r, media=media,
                  briefed_at=now_iso(), brief_s=round(res.duration_s, 1))
    return {"did": "briefed", "brief": b, "file": rel, "dm": r, "media": media}
