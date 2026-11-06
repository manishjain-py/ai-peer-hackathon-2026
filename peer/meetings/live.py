"""During the meeting (S3 "During"): the Peer's bot in the call, from join to leave, then the brief.

- Joins as "<first>'s AI Peer"; its intro plays on join (Recall's automatic_audio_output) and goes to the
  meeting chat: an AI assistant covering for the owner, who can't join.
- Reads only its own bot's stream and drops its own lines. A speaker's finals are merged until they stop
  talking (a final, then no partial for `merge_s`): one utterance can come as two finals.
- "update" -> the approved clip (or, with none approved, a line that says so); "question" -> the holding
  line at once and the warm session's answer (how sure, the date of what it knows, sources; "I'll flag
  that" when it has nothing solid; never a commitment); "maybe" -> the warm session decides (PASS or an
  answer); everything else -> notes only. Content is data: a request in the meeting becomes a follow-up.
- Clips go out one at a time (Recall mixes a second clip on top of one playing).
- The webhook answers at once and the work runs on other threads; every step is in the activity log (F4).
- The tunnel, the listener and the warm session stop when the bot leaves (the tunnel by its PID).
"""
from __future__ import annotations

import base64
import json
import logging
import queue
import re
import threading
import time
from pathlib import Path

from ..activity import ActivityLog
from ..adapters.meetings import MeetingRefused, MeetingsAdapter
from ..adapters.voice import VoiceAdapter, duration_s
from ..brain.warm import WarmSession, parse_answer, prime_text, question_text
from ..events import now_iso
from ..settings import Settings
from . import factpack, store as mstore
from .addressed import classify
from .cover import first_name
from .listener import Listener, Tunnel

log = logging.getLogger("peer.meetings.live")
OUTPUT_LATENCY_S = 1.5      # spike: a clip is heard about 1.5 s after output_audio is called
LEAD_IN = re.compile(r"\b(?:question|one|thing|something)\s+(?:for|to)\s+(?:the\s+|our\s+)?(?:ai\s+)?(?:\w+'?s\s+)?"
                     r"(?:ai\s+)?(?:assistant|ai|peer|pier|bot)\s*[.!?]*$", re.I)


class MeetingSession:
    def __init__(self, st: Settings, mid: str, *, chat=None, owner_chat_id: str | None = None, dry_run: bool = False,
                 merge_s: float = 1.0):
        self.st, self.mid, self.chat, self.owner_chat_id, self.dry_run = st, mid, chat, owner_chat_id, dry_run
        self.merge_s = merge_s
        self.m = mstore.get(st, mid)
        self.first = first_name(st)
        self.act = ActivityLog(st.log_path)
        self.rec = MeetingsAdapter(st)
        self.voice = VoiceAdapter(st)
        self.run_dir = st.owner_dir / "meeting-runs" / mid
        self.run_dir.mkdir(parents=True, exist_ok=True)
        self.bot_name = str(st.get("meetings.bot_name", "{first}'s AI Peer")).format(first=self.first)
        self.bot_id: str | None = None
        self.lines: list[dict] = []            # everyone else's finals, in order (the notes)
        self.peer_log: list[dict] = []         # what the Peer said or played
        self.pending: dict[str, list[str]] = {}
        self.last_partial: dict[str, float] = {}
        self.last_final: dict[str, float] = {}
        self.waited: set[str] = set()
        self.work: queue.Queue = queue.Queue()
        self.speak_lock = threading.Lock()
        self.busy_until = 0.0
        self.last_update_at = 0.0
        self.ended = threading.Event()
        self.ws: WarmSession | None = None
        self.tunnel: Tunnel | None = None
        self.listener: Listener | None = None
        self.topics = self._topics()
        self.joined_at: float | None = None

    # -- helpers ----------------------------------------------------------------------------------------
    def _topics(self) -> list[str]:
        p = self.st.owner_dir / "keywords.json"
        return json.loads(p.read_text()) if p.exists() else []

    def note(self, kind: str, summary: str, **kw) -> dict:
        kw.setdefault("where", self.m["label"])
        kw.setdefault("ref", f"meeting:{self.mid}")
        extra = kw.pop("extra", {}) or {}
        return self.act.add(kind, summary, extra={"meeting_id": self.mid, **extra}, **kw)

    def lines_text(self) -> dict[str, str]:
        f = self.first
        return {
            "intro": (f"Hi everyone, I'm {f}'s AI Peer, an AI assistant. {f} can't join this meeting, so I'm here to take "
                      f"notes and share {f}'s update. If you have a question for {f}, ask me, and I'll answer what I can or "
                      f"flag it for {f}."),
            "chat": (f"{f}'s AI Peer here: an AI assistant covering for {f}, who can't join. I take notes for {f}, play "
                     f"{f}'s approved update when asked, and answer what I can, with how sure I am. Nothing I say commits {f}."),
            "hold": f"Good question. Let me check {f}'s notes.",
            "flag": f"I don't have that in {f}'s records. I'll flag it for {f}.",
            "no_update": f"{f} hasn't shared an update for this meeting. I'm taking notes, and {f} will follow up.",
        }

    # -- speaking: one clip at a time --------------------------------------------------------------------------
    def play(self, kind: str, clip: Path, *, text: str = "") -> dict:
        d = duration_s(clip)
        with self.speak_lock:
            wait = self.busy_until - time.time()
            if wait > 0:
                time.sleep(wait)
            t = time.time()
            r = self.rec.act("speak", self.bot_id, {"clip": str(clip)}, f"speak:{self.mid}:{kind}:{t:.0f}")
            self.busy_until = t + d + 0.3
        entry = {"kind": kind, "at": now_iso(), "t": t, "clip_s": round(d, 2), "text": text, "ok": r.get("ok"),
                 "api_s": r.get("api_s")}
        self.peer_log.append(entry)
        return entry

    # -- events (the listener's worker thread) -----------------------------------------------------------------------
    def on_event(self, ev: dict, arrived: float) -> None:
        d = ev.get("data") or {}
        if (d.get("bot") or {}).get("id") != self.bot_id:
            return                       # only the Peer's own bot's stream
        inner = d.get("data") or {}
        who = (inner.get("participant") or {}).get("name") or "someone"
        kind = ev.get("event")
        if who == self.bot_name:
            return                       # the Peer's own speech: never a trigger
        if kind == "participant_events.chat_message":
            text = ((inner.get("data") or {}).get("text") or "").strip()
            if text:
                self.lines.append({"at": now_iso(), "t": arrived, "speaker": who, "text": text, "via": "chat"})
            return
        if kind == "transcript.partial_data":
            self.last_partial[who] = arrived
            return
        if kind != "transcript.data":
            return
        text = " ".join(w.get("text", "") for w in inner.get("words") or []).strip()
        if not text:
            return
        self.lines.append({"at": now_iso(), "t": arrived, "speaker": who, "text": text})
        self.pending.setdefault(who, []).append(text)
        self.last_final[who] = arrived
        threading.Timer(self.merge_s, self._utterance_done, args=(who, arrived)).start()

    def _utterance_done(self, who: str, final_at: float) -> None:
        if self.last_final.get(who) != final_at or self.last_partial.get(who, 0) > final_at:
            return                       # a newer final came, or they are still talking
        text = " ".join(self.pending.get(who, []))
        if LEAD_IN.search(text) and who not in self.waited:
            self.waited.add(who)          # wait up to 4 s for the question itself (it comes as its own final)
            threading.Timer(4.0, self._lead_in_timeout, args=(who, final_at)).start()
            return
        self.pending.pop(who, None)
        self.waited.discard(who)
        intent, why = classify(text, self.first, self.topics)
        if intent != "none":
            self.work.put((intent, text, who, final_at))

    def _lead_in_timeout(self, who: str, final_at: float) -> None:
        if self.last_final.get(who) == final_at and who in self.waited:
            self.last_partial.pop(who, None)
            self._utterance_done(who, final_at)   # nothing more came: go with the lead-in alone

    def _worker(self) -> None:
        while not self.ended.is_set():
            try:
                intent, text, who, at = self.work.get(timeout=0.5)
            except queue.Empty:
                continue
            try:
                if intent == "update":
                    self.play_update(who, text)
                else:
                    self.answer(intent, text, who, at)
            except Exception:  # noqa: BLE001
                log.exception("meeting work failed")

    # -- the two things it says --------------------------------------------------------------------------------------
    def play_update(self, who: str, text: str) -> None:
        if time.time() - self.last_update_at < 30:
            return
        self.last_update_at = time.time()
        m = mstore.get(self.st, self.mid)
        clip = m["data"].get("update_clip")
        if m["status"] in ("live",) and m["data"].get("approved_at") and clip and Path(clip).exists():
            upd = m["data"].get("update") or {}
            e = self.play("update", Path(clip), text=upd.get("update", ""))
            self.note("meeting_update_played", f"Played {self.first}'s approved update in {self.m['title']}", who_asked=who,
                      said=upd.get("update"), sources=upd.get("sources"), outcome="done",
                      extra={"asked": text, "clip_s": e["clip_s"]})
        else:
            words = self.lines_text()["no_update"]
            e = self.play("no_update", self.voice.render(words, "peer"), text=words)
            self.note("meeting_update_missing", f"Said {self.first} has no approved update for {self.m['title']}", who_asked=who,
                      said=words, outcome="done", needs_review=True, extra={"asked": text, "clip_s": e["clip_s"]})

    def answer(self, intent: str, text: str, who: str, final_at: float) -> None:
        maybe = intent == "maybe"
        out: dict = {}
        t0 = time.time()
        th = threading.Thread(target=lambda: out.update(self.ws.ask(question_text(who, text, maybe=maybe), timeout=45)), daemon=True)
        th.start()
        if not maybe:
            self.play("hold", self.clips["hold"], text=self.lines_text()["hold"])
        th.join(timeout=50)
        raw = (out.get("text") or "").strip()
        if maybe and raw.upper().startswith("PASS"):
            log.info("passed on a maybe line")
            return
        a = parse_answer(raw) if out.get("ok") else {"say": "", "certainty": "low", "as_of": "", "flag": True, "sources": []}
        say = a["say"] or self.lines_text()["flag"]
        flagged = a["flag"] or not a["say"]
        clip = self.voice.render(say, "peer", live=True) if a["say"] else self.clips["flag"]
        e = self.play("answer", clip, text=say)
        timing = {"final_to_answer_call_s": round(e["t"] - final_at, 2), "brain_s": round(out.get("say_ready_s") or 0, 2),
                  "total_s": round(time.time() - t0, 2)}
        e.update(question=text, asker=who, certainty=a["certainty"], as_of=a["as_of"], flagged=flagged, sources=a["sources"],
                 maybe=maybe, **timing)
        self.note("meeting_answered", f"Answered {who} in {self.m['title']}" + (" and flagged it for " + self.first if flagged else ""),
                  who_asked=who, said=say, sources=a["sources"], outcome="done", needs_review=flagged,
                  extra={"question": text, "certainty": a["certainty"], "as_of": a["as_of"], "flagged": flagged,
                         "clip_s": e["clip_s"], "maybe": maybe, **timing})
        if flagged:
            self.note("meeting_flagged", f"Flagged for {self.first}: {text[:120]}", who_asked=who, outcome="pending_approval",
                      needs_review=True, extra={"question": text})

    # -- the whole meeting ------------------------------------------------------------------------------------------
    def run(self) -> dict:
        st, m = self.st, self.m
        url = mstore.link(st, self.mid)
        if not st.get("roles.cover_meetings", True):
            self.note("held_back", f"Did not join {m['title']} (Cover meetings is off)", outcome="skipped")
            mstore.update(st, self.mid, status="cancelled")
            return {"did": "held_back"}
        ok, why = self.rec.allowed(url)
        if not ok:
            self.note("refused", f"Would not join {m['title']}: {why}", outcome="skipped")
            mstore.update(st, self.mid, status="refused")
            return {"did": "refused", "why": why}
        if not mstore.claim(st, self.mid, ("drafted", "approved", "skipped", "requested"), "live"):
            return {"did": "nothing", "why": f"meeting is {mstore.get(st, self.mid)['status']}"}
        txt = self.lines_text()
        try:
            self.clips = {k: self.voice.render(txt[k], "holding" if k == "hold" else "peer") for k in ("intro", "hold", "flag")}
            upd = (mstore.get(st, self.mid)["data"].get("update") or {}) if mstore.get(st, self.mid)["data"].get("approved_at") else {}
            meeting = {**m, "update_text": upd.get("update")}
            self.ws = WarmSession(label=f"meeting-{self.mid}")
            pr = self.ws.start(prime_text(self.first, factpack.build(st, meeting)))
            if not pr.get("ok"):
                raise RuntimeError(f"the warm session did not start: {pr.get('error')}")
            self.listener = Listener(self.on_event, port=int(st.get("meetings.listener_port", 8795)),
                                     raw_log=self.run_dir / "events.jsonl")
            self.listener.start()
            self.tunnel = Tunnel(self.listener.port, self.run_dir / "tunnel.log")
            hook = self.tunnel.start() + self.listener.path
            (self.run_dir / "pids.json").write_text(json.dumps({"tunnel": self.tunnel.pid, "warm": self.ws.proc.pid if self.ws.proc else None}))
            threading.Thread(target=self._worker, daemon=True, name=f"meeting-work-{self.mid}").start()
            intro_b64 = base64.b64encode(self.clips["intro"].read_bytes()).decode()
            b = self.rec.act("join", "", {"meeting_url": url, "bot_name": self.bot_name, "realtime_url": hook,
                                          "audio_b64": intro_b64, "metadata": {"meeting_id": self.mid, "owner": st.owner}},
                             f"join:{self.mid}")
            self.bot_id = b["id"]
            mstore.update(st, self.mid, bot_id=self.bot_id, joined_requested_at=now_iso())
            self.note("meeting_joining", f"Joining {m['title']} as {self.bot_name}", outcome="done", extra={"bot_id": self.bot_id})
            s = self.rec.wait_status(self.bot_id, {"in_call_recording"}, timeout=180)
            if s["status"] != "in_call_recording":
                raise RuntimeError(f"the bot did not get into the call ({s['status']}, {s.get('sub_code')})")
            self.joined_at = time.time()
            self.busy_until = self.joined_at + duration_s(self.clips["intro"]) + OUTPUT_LATENCY_S
            self.peer_log.append({"kind": "intro", "at": now_iso(), "t": self.joined_at, "text": txt["intro"],
                                  "clip_s": round(duration_s(self.clips["intro"]), 2), "ok": True})
            chat = self.rec.act("chat", self.bot_id, {"text": txt["chat"]}, f"chat:{self.mid}")
            self.note("meeting_joined", f"Joined {m['title']} as {self.bot_name} and introduced itself", said=txt["intro"],
                      outcome="done", extra={"bot_id": self.bot_id, "chat_posted": bool(chat.get("ok")),
                                             "clip_s": round(duration_s(self.clips["intro"]), 2)})
            deadline = time.time() + 60 * int(st.get("meetings.max_minutes", 10)) + 60
            while time.time() < deadline:
                time.sleep(4)
                s = self.rec.bot(self.bot_id)
                if s["status"] in ("call_ended", "done", "fatal", "recording_done"):
                    break
            status = "ended"
        except (MeetingRefused, RuntimeError, OSError) as e:
            log.exception("meeting session failed")
            self.note("failed", f"The meeting session for {m['title']} failed: {e}", outcome="failed")
            status = "failed"
        finally:
            self.ended.set()
            if self.bot_id:
                try:
                    self.rec.act("leave", self.bot_id, {}, f"leave:{self.mid}")
                except Exception:  # noqa: BLE001
                    pass
            self.stop()
        mstore.update(st, self.mid, status=status, left_at=now_iso(), answers=sum(1 for e in self.peer_log if e["kind"] == "answer"))
        self.note("meeting_left", f"Left {m['title']}", outcome="done" if status == "ended" else "failed",
                  extra={"lines_heard": len(self.lines), "peer_spoke": len(self.peer_log)})
        (self.run_dir / "session.json").write_text(json.dumps({"lines": self.lines, "peer_log": self.peer_log}, indent=1,
                                                              ensure_ascii=False, default=str))
        if status != "ended" or not self.bot_id:
            return {"did": status}
        from .after import finish
        return finish(self)

    def stop(self) -> None:
        if self.ws:
            self.ws.close()
        if self.tunnel:
            self.tunnel.stop()
        if self.listener:
            self.listener.stop()
