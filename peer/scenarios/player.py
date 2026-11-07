"""Scenario player: plays a scene's colleague posts and checks what the Peer does.

Live: the watcher (`peer watch`) must be running; colleagues post with their own user tokens
(SLACK_AS_<PERSON_ID> in ~/.ai-peer/.env) or, without one, through the scenario bot
(SLACK_SCENARIO_BOT_TOKEN, custom name and icon). Dry run: everything in one process on the
fake adapter, with the real brain; nothing leaves the machine.
Each walk writes a transcript to ~/.ai-peer/<owner>/walks/.
"""
from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

from ..events import now_iso
from ..settings import PKG, Settings, secret

SCEN = PKG / "scenarios"


def load(name: str) -> dict:
    return yaml.safe_load((SCEN / f"{name}.yaml").read_text())


class Walk:
    def __init__(self, st: Settings, scenario: dict):
        self.st = st
        self.sc = scenario
        self.log: list[dict[str, Any]] = []
        self.started = time.time()

    def note(self, what: str, **kw: Any) -> None:
        entry = {"t": round(time.time() - self.started, 1), "at": now_iso(), "what": what, **kw}
        self.log.append(entry)
        print(f"[{entry['t']:>6}s] {what}" + (f": {json.dumps(kw, ensure_ascii=False)[:300]}" if kw else ""), flush=True)

    def save(self, suffix: str = "") -> Path:
        d = self.st.owner_dir / "walks"
        d.mkdir(exist_ok=True)
        path = d / f"{self.sc['name']}{suffix}-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"
        path.write_text(json.dumps({"scenario": self.sc, "log": self.log}, indent=1, ensure_ascii=False))
        return path


# -- dry run --------------------------------------------------------------------------------------
def dry_run(st: Settings, name: str) -> Path:
    from ..adapters.fake import FakeAdapter
    from ..memory.discovery import load_world
    from ..watcher import Watcher

    sc = load(name)
    walk = Walk(st, sc)
    world = load_world()
    fake = FakeAdapter()
    fake.owner_id = "UOWNER"
    fake.users["UOWNER"] = {"id": "UOWNER", "name": "Manish", "real_name": "Manish", "tz": "Asia/Kolkata"}
    for c in world["colleagues"]:
        fake.users[f"U{c['person_id'].upper()}"] = {"id": f"U{c['person_id'].upper()}", "person_id": c["person_id"],
                                                    "name": c["name"], "real_name": c["name"], "tz": c["tz"]}
    # a separate store and log so dry runs never mix with the live ones
    dry = st.owner_dir / "dryrun"
    dry.mkdir(exist_ok=True)
    orig_db, orig_log = type(st).db_path, type(st).log_path
    type(st).db_path = property(lambda self: dry / "peer.db")
    type(st).log_path = property(lambda self: dry / "log.jsonl")
    prev = st.get("presence.manual")
    try:
        st.set("presence.manual", sc.get("presence", "auto"))
        w = Watcher(st, fake, dry_run=True, synchronous=True)
        if sc.get("google") == "fake":   # WP3 S2: a fake Google (mail, invites) for the dry run
            from ..brief import dry_google
            dry_google(st, fresh=True)
        walk.note("start (dry run)", presence=w.presence.state(fresh=True))
        root_ts = None
        for step in sc["steps"]:
            if "post" in step:
                p = step["post"]
                uid = f"U{p['as'].upper()}"
                e = fake.inject(channel=sc["channel"], user=uid, text=p["text"],
                                thread_ts=root_ts if p.get("in_thread") else None)
                root_ts = root_ts or e.extra["ts"]
                walk.note(f"{fake.users[uid]['name']} posts in #{sc['channel']}", text=p["text"])
                n0 = len(fake.acts)
                t0 = time.time()
                w.on_event(e)
                for a in fake.acts[n0:]:
                    walk.note(f"Peer act: {a['action']}", after_s=round(time.time() - t0, 1),
                              text=(a["payload"].get("text") or "")[:1500], has_buttons=bool(a["payload"].get("blocks")))
            if any(k in step for k in ("dm", "github", "set", "refresh", "local", "reaction")):
                n0 = len(fake.acts)
                t0 = time.time()
                _wp2_step(st, w, fake, walk, step)
                for a in fake.acts[n0:]:
                    walk.note(f"Peer act: {a['action']}", after_s=round(time.time() - t0, 1),
                              text=(a["payload"].get("text") or "")[:1500])
            if any(k in step for k in ("seed", "poll", "brief", "brief_click", "real_mail")):   # WP3 S2
                from ..brief import dry_step
                n0 = len(fake.acts)
                t0 = time.time()
                dry_step(st, w, fake, walk, step)
                for a in fake.acts[n0:]:
                    blocks = a["payload"].get("blocks") or []
                    walk.note(f"Peer act: {a['action']}", after_s=round(time.time() - t0, 1),
                              text=(a["payload"].get("text") or "")[:600], has_buttons=any(
                                  b.get("accessory") or b.get("type") == "actions" for b in blocks),
                              blocks_text=[(b.get("text") or {}).get("text") for b in blocks if b.get("text")][:24])
            if "click" in step:
                drafts = w.store.actions_by_status("pending_approval")
                if not drafts:
                    walk.note("FAIL: no draft to click")
                    continue
                key = drafts[-1]["idem_key"]
                n0 = len(fake.acts)
                w.executor.on_interactive({"type": "block_actions", "user": {"id": "UOWNER"}, "trigger_id": "dry",
                                           "actions": [{"action_id": f"peer_{step['click']['button']}", "value": key}]})
                time.sleep(2)
                walk.note(f"owner clicks {step['click']['button']}")
                for a in fake.acts[n0:]:
                    walk.note(f"Peer act: {a['action']}", text=(a["payload"].get("text") or "")[:1500])
        return walk.save("-dryrun")
    finally:
        st.set("presence.manual", prev)
        type(st).db_path, type(st).log_path = orig_db, orig_log
        from ..brief import end_dry_google
        end_dry_google()


def _wp2_step(st: Settings, w, fake, walk: Walk, step: dict) -> None:
    """WP2 dry-run steps: the owner's DM or reaction (F5), a GitHub event (F5), a setting (F3),
    a freshness check (F6), a local scan (F7)."""
    from ..events import Event
    if "set" in step:
        for k, v in step["set"].items():
            st.set(k, v)
            walk.note(f"setting {k} = {v}")
    if "dm" in step:
        e = fake.inject(channel="DOWNER", user="UOWNER", text=step["dm"], kind="dm",
                        thread_ts=fake.acts[-1]["ts"] if step.get("in_thread") and fake.acts else None)
        walk.note("owner DMs the Peer", text=step["dm"])
        w.on_event(e)
    if "reaction" in step:
        dms = [a for a in fake.acts if a["action"] == "dm"]
        ts = dms[-1]["ts"] if dms else "0"
        e = Event(id=f"fake:reaction:{ts}:{step['reaction']}", source="fake", kind="reaction", at=now_iso(), actor="UOWNER",
                  ref=f"fake:msg:DOWNER:{ts}", thread_ref=None, text=f":{step['reaction']}:", url=None,
                  extra={"channel": "DOWNER", "ts": ts, "reaction": step["reaction"], "channel_name": "DM"})
        walk.note(f"owner reacts :{step['reaction']}: to the Peer's last DM")
        w.on_event(e)
    if "github" in step:
        from ..jobs import Jobs
        g = step["github"]
        item = {"source": "github", "kind": g.get("kind", "ci"), "conclusion": g.get("conclusion", "failure"),
                "repo": g.get("repo", ""), "branch": g.get("branch", ""), "draft": bool(g.get("draft")),
                "title": g["title"], "text": g.get("text", g["title"]), "url": g.get("url", ""),
                "ref": f"fake:github:{g['title']}:{time.time():.3f}", "at": now_iso()}
        r = Jobs(w).push(item, g.get("why", "A CI run failed on your repo."))
        walk.note(f"GitHub event: {g['title']}", result=r.get("did"), rule=r.get("rule"))
    if "refresh" in step:
        from .. import fresh
        r = fresh.check_trackers(st, only=step["refresh"] if step["refresh"] not in (True, "all") else None)
        walk.note("freshness check", updated=[(u["title"], u.get("one_line")) for u in r])
    if "local" in step:
        from .. import localwork
        walk.note("local scan", **localwork.scan(st, why="scan in a walk"))


# -- live --------------------------------------------------------------------------------------------
def live(st: Settings, name: str, click_timeout_s: int = 900, record: bool = False, auto_click: bool = False) -> Path:
    from slack_sdk import WebClient
    from ..memory.discovery import load_world

    sc = load(name)
    walk = Walk(st, sc)
    world = load_world()
    bot = WebClient(token=secret("SLACK_BOT_TOKEN", required=True))
    me = bot.auth_test()
    peer_bot_id = me.get("bot_id")
    people = {c["person_id"]: c for c in world["colleagues"]}
    channel_id = next((c["id"] for c in bot.conversations_list(types="public_channel", limit=200)["channels"]
                       if c["name"] == sc["channel"]), None)
    if not channel_id:
        raise SystemExit(f"channel #{sc['channel']} not found")
    owner_email = json.loads(st.profile_path().read_text())["slack_email"]
    owner_id = bot.users_lookupByEmail(email=owner_email)["user"]["id"]
    dm = bot.conversations_open(users=owner_id)["channel"]["id"]

    def poster(person_id: str):
        tok = secret(f"SLACK_AS_{person_id.upper()}")
        if tok:
            return WebClient(token=tok), {}
        tok = secret("SLACK_SCENARIO_BOT_TOKEN")
        if not tok:
            raise SystemExit(f"no way to post as {person_id}: add SLACK_AS_{person_id.upper()} or SLACK_SCENARIO_BOT_TOKEN")
        c = people[person_id]
        return WebClient(token=tok), {"username": c["name"], "icon_url": c.get("icon_url")}

    prev = st.get("presence.manual")
    if sc.get("presence") != "keep":   # "keep": the walk uses the switch as the owner left it (WP2's away-switch walk)
        st.set("presence.manual", sc.get("presence", "auto"))
    walk.note("start (live)", presence=sc.get("presence") if sc.get("presence") != "keep" else f"kept: {prev}", channel=sc["channel"])
    wdir = st.owner_dir / "walks" / f"{sc['name']}-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}"
    rec = None
    shots = 0
    if record or auto_click:
        from ..browser import SlackRecorder
        rec = SlackRecorder(video_dir=wdir / "raw" if record else None)
        rec.goto(channel_id)

    def snap(label: str) -> None:
        nonlocal shots
        if rec and record:
            shots += 1
            out = wdir / f"{shots:02d}-{label}.png"
            rec.shot(out)
            walk.note("screenshot", file=str(out))
    root_ts = None
    last_ts = f"{time.time():.6f}"
    try:
        for step in sc["steps"]:
            if "post" in step:
                p = step["post"]
                client, extra = poster(p["as"])
                r = client.chat_postMessage(channel=channel_id, text=p["text"],
                                            thread_ts=root_ts if p.get("in_thread") else None, **extra)
                root_ts = root_ts or r["ts"]
                last_ts = r["ts"]
                walk.note(f"{people[p['as']]['name']} posts in #{sc['channel']}", ts=r["ts"], text=p["text"])
            if "click" in step:
                label = step["click"]["button"].title()
                if rec and auto_click:
                    rec.goto(dm)
                    r = rec.click(label)
                    walk.note(f"owner's {label} clicked in the Peer's browser profile", ok=r.get("ok"), error=r.get("error"))
                else:
                    walk.note(f"waiting for the owner to click {label} in the DM (up to {click_timeout_s // 60} min)")
            exp = step.get("expect") or {}
            within = int(exp.get("within_s", 120)) + (click_timeout_s if "click" in step else 0)
            deadline = time.time() + within
            t0 = time.time()
            got = None
            while time.time() < deadline and not got:
                time.sleep(3)
                if exp.get("thread_reply"):
                    msgs = bot.conversations_replies(channel=channel_id, ts=root_ts, limit=100).get("messages", [])
                    new = [m for m in msgs if m.get("bot_id") == peer_bot_id and float(m["ts"]) > float(last_ts)]
                    if new:
                        got = {"kind": "thread_reply", "ts": new[-1]["ts"], "text": new[-1].get("text", "")}
                        last_ts = new[-1]["ts"]
                if exp.get("owner_dm") or exp.get("owner_dm_buttons"):
                    hist = bot.conversations_history(channel=dm, oldest=f"{walk.started:.6f}", limit=20).get("messages", [])
                    for m in hist:
                        has_buttons = any(b.get("type") == "actions" for b in m.get("blocks", []))
                        if m.get("bot_id") == peer_bot_id and (has_buttons or not exp.get("owner_dm_buttons")):
                            got = {"kind": "owner_dm", "ts": m["ts"], "text": m.get("text", ""), "buttons": has_buttons,
                                   "blocks_text": [b.get("text", {}).get("text") for b in m.get("blocks", []) if b.get("text")]}
                            break
            if exp:
                if got:
                    walk.note(f"PASS {got['kind']}", after_s=round(time.time() - t0, 1), **{k: v for k, v in got.items() if k != "kind"})
                    if rec:
                        if got["kind"] == "thread_reply":
                            rec.goto(channel_id, root_ts)
                            rec.wait(3)
                            snap("thread")
                        else:
                            rec.goto(dm)
                            rec.wait(3)
                            snap("owner-dm")
                else:
                    walk.note(f"FAIL: no {', '.join(k for k in exp if k != 'within_s')} within {within}s")
        perm = bot.chat_getPermalink(channel=channel_id, message_ts=root_ts)["permalink"] if root_ts else None
        if rec:
            rec.goto(channel_id)
            rec.wait(2)
            snap("channel")
            rec.goto(dm)
            rec.wait(3)
            snap("owner-dm-end")
            video = rec.stop(mp4=wdir / "walk.mp4" if record else None)
            if video:
                walk.note("video", file=video)
        walk.note("done", thread=perm, root_ts=root_ts, channel_id=channel_id, dm=dm)
        return walk.save()
    finally:
        st.set("presence.manual", prev)
