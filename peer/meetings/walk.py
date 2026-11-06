"""The S3 walk: the colleague bot plays s3-meeting.yaml on cue against the Peer (PRD S3, D13).

The colleague bot is a second Recall bot named as a scripted test bot; it speaks as the invented colleagues
(world.yaml) in their own voices (local while building, ElevenLabs for the live walk). Cues come from the
Peer's activity log (meeting_joined, meeting_update_played, meeting_answered), so the same script drives a
dry walk (one process: fake Slack, real Recall, Zoom and brain) and the live walk (the running Peer).
"""
from __future__ import annotations

import json
import threading
import time
from datetime import datetime, timezone
from pathlib import Path

import yaml

from ..adapters.meetings import MeetingsAdapter
from ..adapters.voice import VoiceAdapter, duration_s
from ..events import now_iso
from ..settings import PKG, Settings, secret
from . import store as mstore
from .live import OUTPUT_LATENCY_S

SCENE_DIR = PKG / "scenarios"


class Walk:
    def __init__(self, st: Settings, name: str):
        self.st, self.name, self.t0, self.log = st, name, time.time(), []

    def note(self, what: str, **kw) -> None:
        e = {"t": round(time.time() - self.t0, 1), "at": now_iso(), "what": what, **kw}
        self.log.append(e)
        print(f"[{e['t']:>6}s] {what}" + (f": {json.dumps(kw, ensure_ascii=False)[:400]}" if kw else ""), flush=True)

    def save(self, extra: dict, suffix: str = "") -> Path:
        d = self.st.owner_dir / "walks"
        d.mkdir(exist_ok=True)
        p = d / f"{self.name}{suffix}-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"
        p.write_text(json.dumps({"log": self.log, **extra}, indent=1, ensure_ascii=False, default=str))
        return p


class LogWatch:
    """Waits for the Peer's activity-log entries for one meeting (the colleague's cues)."""

    def __init__(self, path: Path, mid: str):
        self.path, self.mid = path, mid
        self.pos = path.stat().st_size if path.exists() else 0

    def wait(self, kind: str, timeout: float = 90) -> dict | None:
        deadline = time.time() + timeout
        while time.time() < deadline:
            if self.path.exists():
                with self.path.open() as f:
                    f.seek(self.pos)
                    chunk = f.read()
                    self.pos = f.tell()
                for line in chunk.splitlines():
                    try:
                        e = json.loads(line)
                    except ValueError:
                        continue
                    if e.get("kind") == kind and (e.get("extra") or {}).get("meeting_id") == self.mid:
                        e["_seen"] = time.time()
                        return e
            time.sleep(0.4)
        return None


class ColleagueBot:
    def __init__(self, st: Settings, name: str):
        self.st, self.name = st, name
        self.rec, self.voice = MeetingsAdapter(st), VoiceAdapter(st)
        self.bot_id: str | None = None

    def join(self, url: str) -> dict:
        b = self.rec.create_bot(url, self.name, transcript=False, metadata={"owner": self.st.owner, "role": "scripted colleague"})
        self.bot_id = b["id"]
        return self.rec.wait_status(self.bot_id, {"in_call_recording"}, timeout=180)

    def say(self, person: str, text: str) -> dict:
        clip = self.voice.render(text, person)
        d = duration_s(clip)
        r = self.rec.output_audio(self.bot_id, clip)
        return {"ok": r["ok"], "clip_s": round(d, 2), "api_s": r["api_s"], "call": time.time() - r["api_s"]}

    def leave(self) -> dict:
        return self.rec.leave(self.bot_id) if self.bot_id else {"ok": False}


def play_scene(st: Settings, walk: Walk, mid: str, sc: dict, question: str, watch: LogWatch, start_peer=None) -> dict:
    """The colleague bot opens the meeting, then (dry walk) the Peer is started; the steps play on cue."""
    url = mstore.link(st, mid)
    col = ColleagueBot(st, sc.get("colleague_bot", "Scripted colleagues (test bot)"))
    s = col.join(url)
    walk.note("colleague bot in the call", status=s["status"], sub_code=s.get("sub_code"))
    if s["status"] != "in_call_recording":
        col.leave()
        raise SystemExit(f"the colleague bot is not in the call ({s['status']}, {s.get('sub_code')})")
    if start_peer:
        start_peer()
    out = []
    try:
        for i, step in enumerate(sc["steps"]):
            cue = step.get("after", "none")
            if cue != "none":
                e = watch.wait(cue, timeout=120)
                if not e:
                    walk.note(f"FAIL: no {cue} from the Peer within 120 s")
                else:
                    clip_s = float((e.get("extra") or {}).get("clip_s") or 0)
                    walk.note(f"Peer: {cue}", said=(e.get("said") or "")[:300], clip_s=clip_s,
                              sources=[x.get("title") for x in e.get("sources") or []])
                    time.sleep(max(0.0, clip_s + OUTPUT_LATENCY_S + 1.2 - (time.time() - e["_seen"])))
            else:
                time.sleep(1.5)
            if step.get("leave"):
                walk.note("colleague bot leaves", **col.leave())
                break
            say = step["say"]
            text = say["text"].replace("{unscripted}", question)
            r = col.say(say["as"], text)
            walk.note(f"{say['as']} says", text=text, clip_s=r["clip_s"])
            out.append({"step": i, "as": say["as"], "text": text, **r})
            time.sleep(r["clip_s"] + 0.5)
    finally:
        if col.bot_id and col.rec.bot(col.bot_id)["status"] not in ("done", "call_ended"):
            col.leave()
    return {"colleague_bot": col.bot_id, "said": out}


def load_scene(name: str) -> dict:
    return yaml.safe_load((SCENE_DIR / f"{name}.yaml").read_text())


# -- the dry walk: fake Slack, real Recall, Zoom and brain, local voices, the test owner ---------------------------------
def dry_walk(st: Settings, name: str = "s3-meeting", question: str | None = None) -> Path:
    from ..adapters.fake import FakeAdapter
    from ..memory.discovery import load_world
    from ..watcher import Watcher
    from . import cover
    from .live import MeetingSession

    if st.owner == "manish":
        raise SystemExit("the dry walk runs on a test owner (AI_PEER_OWNER=wp4test)")
    if not question:
        raise SystemExit("pass the unscripted question chosen at walk time: --question \"...\"")
    sc = load_scene(name)
    walk = Walk(st, name)
    fake = FakeAdapter()
    fake.owner_id = "UOWNER"
    fake.users["UOWNER"] = {"id": "UOWNER", "name": "Manish", "real_name": "Manish Jain", "tz": "Asia/Kolkata"}
    for c in load_world()["colleagues"]:
        fake.users[f"U{c['person_id'].upper()}"] = {"id": f"U{c['person_id'].upper()}", "person_id": c["person_id"],
                                                    "name": c["name"], "real_name": c["name"], "tz": c["tz"]}
    w = Watcher(st, fake, dry_run=True, synchronous=True)
    mt = sc["meeting"]
    r = cover.request(st, "test", at="+1m", title=mt["title"], minutes=int(mt.get("minutes", 15)), seeded=True)
    if not r["ok"]:
        raise SystemExit(r["why"])
    mid = r["meeting"]["id"]
    watch = LogWatch(st.log_path, mid)
    walk.note("handed the Peer the meeting", id=mid, label=r["meeting"]["label"], start=r["meeting"]["start"])
    d = cover.draft_update(st, mid)
    walk.note("update drafted", ok=d.get("ok"), update=(d.get("update") or {}).get("update"), brain_s=(d.get("update") or {}).get("brain_s"))
    n0 = len(fake.acts)
    cover.send_card(st, fake, "UOWNER", mid, dry_run=True)
    card = fake.acts[n0]
    buttons = [el["text"]["text"] for b in card["payload"]["blocks"] if b.get("type") == "actions" for el in b["elements"]]
    walk.note("Peer act: dm (the update card)", text=card["payload"]["text"], buttons=buttons)
    w.executor.on_interactive({"type": "block_actions", "user": {"id": "UOWNER"}, "trigger_id": "dry",
                               "actions": [{"action_id": "peer_mtg_approve", "value": mid}]})
    for _ in range(120):
        if mstore.get(st, mid)["status"] == "approved":
            break
        time.sleep(0.5)
    m = mstore.get(st, mid)
    walk.note("owner taps Approve update", status=m["status"], clip_s=m["data"].get("update_clip_s"),
              card_update=[a["payload"].get("text") for a in fake.acts[n0 + 1:]])
    sess = MeetingSession(st, mid, chat=fake, owner_chat_id="UOWNER", dry_run=True)
    result: dict = {}
    th = threading.Thread(target=lambda: result.update(sess.run()), daemon=True)
    scene = play_scene(st, walk, mid, sc, question, watch, start_peer=th.start)
    th.join(timeout=480)
    m = mstore.get(st, mid)
    briefs = [a for a in fake.acts if a["idempotency_key"] == f"mtgbrief:{mid}"]
    walk.note("after", status=m["status"], brief_file=m["data"].get("brief_file"), media=m["data"].get("media"))
    if briefs:
        walk.note("Peer act: dm (the meeting brief)", text=briefs[0]["payload"]["text"])
    return walk.save({"meeting_id": mid, "scene": sc, "question": question, "colleague": scene,
                      "peer_log": sess.peer_log, "lines": sess.lines, "fake_acts": fake.acts, "result": result}, "-dryrun")


# -- the live walk: the running Peer (owner manish) covers it; only the colleague bot is ours ------------------------------
def live_walk(st: Settings, name: str = "s3-meeting", question: str | None = None, auto_click: bool = False,
              approve_timeout_s: int = 900) -> Path:
    if not question:
        raise SystemExit("pass the unscripted question chosen at walk time: --question \"...\"")
    from . import cover
    sc = load_scene(name)
    walk = Walk(st, name)
    mt = sc["meeting"]
    r = cover.request(st, "test", at=mt.get("at", "+3m"), title=mt["title"], minutes=int(mt.get("minutes", 15)), seeded=True)
    if not r["ok"]:
        raise SystemExit(r["why"])
    mid = r["meeting"]["id"]
    watch = LogWatch(st.log_path, mid)
    walk.note("handed the running Peer the meeting", id=mid, start=r["meeting"]["start"])
    deadline = time.time() + approve_timeout_s
    clicked = False
    while time.time() < deadline:
        m = mstore.get(st, mid)
        if m["status"] in ("approved", "skipped", "live"):
            break
        if m["status"] == "drafted" and auto_click and not clicked:
            from .. import browser
            from slack_sdk import WebClient
            bot = WebClient(token=secret("SLACK_BOT_TOKEN", required=True))
            owner = bot.users_lookupByEmail(email=json.loads(st.profile_path().read_text())["slack_email"])["user"]["id"]
            dm = bot.conversations_open(users=owner)["channel"]["id"]
            clicked = browser.click_latest(dm, "Approve update")
            walk.note("Approve update clicked in the Peer's browser profile", ok=clicked)
        time.sleep(3)
    m = mstore.get(st, mid)
    walk.note("update", status=m["status"], text=(m["data"].get("update") or {}).get("update"))
    start = datetime.fromisoformat(m["start"]).timestamp()
    time.sleep(max(0.0, start - 100 - time.time()))   # the colleague opens the meeting just before the Peer's tick joins
    scene = play_scene(st, walk, mid, sc, question, watch)   # the running Peer joins on its own at the start time
    for _ in range(200):
        if mstore.get(st, mid)["status"] in ("briefed", "failed", "ended"):
            break
        time.sleep(3)
    m = mstore.get(st, mid)
    walk.note("after", status=m["status"], brief_file=m["data"].get("brief_file"), dm=m["data"].get("brief_dm"))
    return walk.save({"meeting_id": mid, "scene": sc, "question": question, "colleague": scene}, "-live")
