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
    fake.users["UOWNER"] = {"id": "UOWNER", "name": "Manish", "real_name": "Manish Jain", "tz": "Asia/Kolkata"}
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


# -- live --------------------------------------------------------------------------------------------
def live(st: Settings, name: str, click_timeout_s: int = 900) -> Path:
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
    st.set("presence.manual", sc.get("presence", "auto"))
    walk.note("start (live)", presence=sc.get("presence"), channel=sc["channel"])
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
                walk.note(f"waiting for the owner to click {step['click']['button'].title()} in the DM "
                          f"(up to {click_timeout_s // 60} min)")
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
                else:
                    walk.note(f"FAIL: no {', '.join(k for k in exp if k != 'within_s')} within {within}s")
        perm = bot.chat_getPermalink(channel=channel_id, message_ts=root_ts)["permalink"] if root_ts else None
        walk.note("done", thread=perm)
        return walk.save()
    finally:
        st.set("presence.manual", prev)
