"""AI Peer command line. Run from the repo root:  .venv/bin/python -m peer <command>

  discover [--no-ai]          build the memory from the profile + GitHub
  watch                       run the Peer (Slack Socket Mode); Ctrl-C to stop
  scenario <name> [--dry-run] play a scene (s1-online, s1-away) against the running Peer
  away | online | auto        the manual "I'm away" switch (auto = Slack presence + hours)
  set <key> <value>           change a setting, e.g. `set brain.backend codex`
  status                      presence, roles, backend, adapters
  port-check                  list adapters, exercise each verb (act in dry run), print a table
  web [--port N]              the activity log page (http://127.0.0.1:8787)
"""
from __future__ import annotations

import argparse
import json
import logging
import sys

import yaml

from .settings import get_settings


def _slack():
    from .adapters.slack import SlackAdapter
    st = get_settings()
    return SlackAdapter(watch_channels=st.get("slack.watch_channels") or None)


def cmd_discover(a) -> None:
    from .memory.discovery import discover
    discover(get_settings(), ai=not a.no_ai)


def cmd_watch(a) -> None:
    from .watcher import Watcher
    st = get_settings()
    w = Watcher(st, _slack())
    print(f"AI Peer watching for {w.owner['name']} (brain: {st.get('brain.backend')}); "
          f"{len(w.people)} colleagues found in Slack. Ctrl-C to stop.", flush=True)
    try:
        w.run_forever()
    except KeyboardInterrupt:
        print("stopped")


def cmd_scenario(a) -> None:
    from .scenarios import player
    st = get_settings()
    path = player.dry_run(st, a.name) if a.dry_run else player.live(st, a.name)
    print(f"walk saved: {path}")


def cmd_presence(mode: str):
    def run(a) -> None:
        st = get_settings()
        st.set("presence.manual", mode)
        print(f"presence switch: {mode}")
    return run


def cmd_set(a) -> None:
    st = get_settings()
    val = yaml.safe_load(a.value)
    st.set(a.key, val)
    print(f"{a.key} = {json.dumps(val)}")


def cmd_status(a) -> None:
    from .presence import Presence
    st = get_settings()
    profile = json.loads(st.profile_path().read_text())
    chat, owner_id = None, None
    try:
        chat = _slack()
        u = chat.lookup_email(profile["slack_email"])
        owner_id = u["id"] if u else None
    except Exception as e:  # noqa: BLE001
        print(f"slack: not available ({str(e)[:80]})")
    p = Presence(st, chat, owner_id, profile).state(fresh=True)
    print(f"owner: {profile['name']} ({owner_id or 'not found in Slack'})")
    print(f"presence: {p['status']} ({p['reason']}); local time {p['local_time']} in {p['where']}")
    print(f"brain: {st.get('brain.backend')}  roles: {st.get('roles')}")
    print(f"memory: {st.owner_dir}")


def cmd_port_check(a) -> None:
    from .portcheck import port_check
    port_check(get_settings())


def cmd_web(a) -> None:
    import uvicorn
    st = get_settings()
    uvicorn.run("peer.web.app:app", host=st.get("web.host", "127.0.0.1"), port=a.port or int(st.get("web.port", 8787)),
                log_level="warning")


def main(argv: list[str] | None = None) -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s", datefmt="%H:%M:%S")
    logging.getLogger("slack_sdk").setLevel(logging.WARNING)
    ap = argparse.ArgumentParser(prog="peer", description="AI Peer")
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("discover"); p.add_argument("--no-ai", action="store_true"); p.set_defaults(fn=cmd_discover)
    p = sub.add_parser("watch"); p.set_defaults(fn=cmd_watch)
    p = sub.add_parser("scenario"); p.add_argument("name"); p.add_argument("--dry-run", action="store_true"); p.set_defaults(fn=cmd_scenario)
    for mode in ("away", "online", "auto"):
        sub.add_parser(mode).set_defaults(fn=cmd_presence(mode))
    p = sub.add_parser("set"); p.add_argument("key"); p.add_argument("value"); p.set_defaults(fn=cmd_set)
    sub.add_parser("status").set_defaults(fn=cmd_status)
    sub.add_parser("port-check").set_defaults(fn=cmd_port_check)
    p = sub.add_parser("web"); p.add_argument("--port", type=int); p.set_defaults(fn=cmd_web)
    a = ap.parse_args(argv)
    a.fn(a)


if __name__ == "__main__":
    main(sys.argv[1:])
