"""AI Peer command line. Run from the repo root:  .venv/bin/python -m peer <command>

  discover [--no-ai]          build the memory from the profile + GitHub
  watch                       run the Peer (Slack Socket Mode); Ctrl-C to stop
  start | stop                the same in the background (pid file + log in ~/.ai-peer/<owner>/)
  scenario <name> [--dry-run] play a scene (s1-online, s1-away) against the running Peer
  away | online | auto        the manual "I'm away" switch (auto = Slack presence + hours)
  set <key> <value>           change a setting, e.g. `set brain.backend codex`
  status                      presence, roles, backend, adapters
  port-check                  list adapters, exercise each verb (act in dry run), print a table
  web [--port N]              the activity log page (http://127.0.0.1:8787)
  world manifest|auth|setup   test world in Slack: the scenario app, colleague logins, channels
  browser login|shot|click    the Peer's own Chrome profile for walk screenshots and clicks
  refresh [--nightly] [--rewind SLUG]   fresh memory (F6): check trackers now, or the nightly re-read
  local scan|ingest|install|hook-config  local work (F7): scan chosen folders, read hook records, set up the hook
  tune "<feedback>"           self-tuning (F5): apply owner feedback as if said in the DM
  jobs --once                 one pass of the background jobs (GitHub poll, local work)
  google login peer|seed      WP3: sign in to Google (a consent page on this Mac); status | spike | poll
  seed <scenario>|clean       WP3: the S2 overnight from the colleague aliases (to the owner only); clean removes it
  brief [--dry-run] [--no-ai] [--post]   WP3 (S2): build the brief now (page); --post also DMs it (live owner only)
"""
from __future__ import annotations

import argparse
import json
import logging
import sys

from pathlib import Path

import yaml

from .settings import get_settings


def _slack():
    from .adapters.slack import SlackAdapter
    st = get_settings()
    return SlackAdapter(watch_channels=st.get("slack.watch_channels") or None)


def cmd_discover(a) -> None:
    from .memory.discovery import discover
    discover(get_settings(), ai=not a.no_ai)


def _web_thread(st) -> None:
    import threading
    import uvicorn
    cfg = uvicorn.Config("peer.web.app:app", host=st.get("web.host", "127.0.0.1"), port=int(st.get("web.port", 8787)),
                         log_level="warning")
    threading.Thread(target=uvicorn.Server(cfg).run, daemon=True).start()


def cmd_watch(a) -> None:
    from .watcher import Watcher
    st = get_settings()
    w = Watcher(st, _slack())
    _web_thread(st)
    print(f"Activity page: http://{st.get('web.host', '127.0.0.1')}:{st.get('web.port', 8787)}", flush=True)
    print(f"AI Peer watching for {w.owner['name']} (brain: {st.get('brain.backend')}); "
          f"{len(w.people)} colleagues found in Slack. Ctrl-C to stop.", flush=True)
    try:
        w.run_forever()
    except KeyboardInterrupt:
        print("stopped")


def _pidfile():
    st = get_settings()
    return st.owner_dir / "watch.pid", st.owner_dir / "watch.log"


def cmd_start(a) -> None:
    import os
    import subprocess
    pid_f, log_f = _pidfile()
    if pid_f.exists():
        try:
            os.kill(int(pid_f.read_text()), 0)
            print(f"already running (pid {pid_f.read_text().strip()}); log: {log_f}")
            return
        except (OSError, ValueError):
            pid_f.unlink()
    with open(log_f, "a") as log:
        proc = subprocess.Popen([sys.executable, "-m", "peer", "watch"], stdout=log, stderr=subprocess.STDOUT,
                                stdin=subprocess.DEVNULL, start_new_session=True, cwd=str(Path(__file__).resolve().parent.parent))
    pid_f.write_text(str(proc.pid))
    print(f"started (pid {proc.pid}); log: {log_f}; page: http://127.0.0.1:{get_settings().get('web.port', 8787)}")


def cmd_stop(a) -> None:
    import os
    import signal
    pid_f, _ = _pidfile()
    if not pid_f.exists():
        print("not running")
        return
    pid = int(pid_f.read_text())
    try:
        os.kill(pid, signal.SIGTERM)
        print(f"stopped pid {pid}")
    except OSError:
        print(f"pid {pid} was not running")
    pid_f.unlink()


def cmd_scenario(a) -> None:
    from .scenarios import player
    st = get_settings()
    path = player.dry_run(st, a.name) if a.dry_run else player.live(st, a.name, record=a.record, auto_click=a.auto_click)
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


def cmd_world(a) -> None:
    from .scenarios import slack_world
    if a.what == "manifest":
        print(slack_world.MANIFEST)
    elif a.what == "auth":
        slack_world.world_auth()
    elif a.what == "setup":
        slack_world.world_setup()
    elif a.what == "code":
        slack_world.world_code(a.url or input("address: "))


def cmd_browser(a) -> None:
    from pathlib import Path
    from . import browser
    if a.what == "login":
        shots = get_settings().owner_dir / "walks"
        shots.mkdir(exist_ok=True)
        browser.login(shots=shots)
    elif a.what == "login-headless":
        st = get_settings()
        email = json.loads(st.profile_path().read_text())["slack_email"]
        shots = st.owner_dir / "walks"
        shots.mkdir(exist_ok=True)
        browser.login_headless(email, st.owner_dir.parent / "slack-login-code.txt", shots=shots)
    elif a.what == "shot":
        print(browser.shot(a.channel, Path(a.out), thread_ts=a.thread))
    elif a.what == "click":
        print("clicked" if browser.click_latest(a.channel, a.label) else "no such button")


def cmd_web(a) -> None:
    import uvicorn
    st = get_settings()
    uvicorn.run("peer.web.app:app", host=st.get("web.host", "127.0.0.1"), port=a.port or int(st.get("web.port", 8787)),
                log_level="warning")


def cmd_refresh(a) -> None:
    from . import fresh
    st = get_settings()
    if a.rewind:
        print(json.dumps(fresh.rewind(st, a.rewind, ai=not a.no_ai), ensure_ascii=False))
    elif a.nightly:
        print(json.dumps(fresh.nightly(st, ai=not a.no_ai), ensure_ascii=False))
    else:
        print(json.dumps(fresh.check_trackers(st, ai=not a.no_ai, only=a.only), ensure_ascii=False))


def cmd_local(a) -> None:
    from . import localwork
    st = get_settings()
    if a.what == "scan":
        print(json.dumps(localwork.scan(st, why="scan on request"), ensure_ascii=False))
    elif a.what == "ingest":
        print(json.dumps(localwork.ingest_spool(st), ensure_ascii=False, default=str))
    elif a.what == "install":
        print(f"hook script: {localwork.install_hook_script()}")
    elif a.what == "hook-config":
        print("Claude Code (~/.claude/settings.json), merge into \"hooks\":")
        print(json.dumps(localwork.claude_settings_snippet(), indent=2))
        print("Command for Codex's SessionEnd hook:", localwork.HOOK_COMMAND.format(tool="codex"))


def cmd_tune(a) -> None:
    from .tuning import apply_feedback
    st = get_settings()
    from .notify import Store
    about = Store(st.db_path).get_kv("last_told_item")
    out = apply_feedback(st, " ".join(a.text), about, "the owner", via="command line")
    print(json.dumps(out, ensure_ascii=False))


def cmd_jobs(a) -> None:
    from .adapters.fake import FakeAdapter
    from .jobs import Jobs
    from .watcher import Watcher
    st = get_settings()
    w = Watcher(st, FakeAdapter(), dry_run=True, synchronous=True)   # no Slack connection: pushes go nowhere
    j = Jobs(w)
    print(json.dumps(j.poll_github(), ensure_ascii=False))


def cmd_sample_heads_up(a) -> None:
    """Walk helper (F5, live): push one labelled sample CI failure to the owner through the same door as
    the Peer's poll (notify.tell_owner: the owner's mutes apply). Web API only, no Socket Mode."""
    import time
    from .notify import tell_owner
    from .store import Store
    st = get_settings()
    chat = _slack()
    profile = json.loads(st.profile_path().read_text())
    owner = chat.lookup_email(profile["slack_email"])["id"]
    repo = (profile.get("owns", {}).get("repos") or [{"repo": "your/repo"}])[0]["repo"]
    branch = a.branch or ("walk-sample-draft" if a.draft else "main")
    item = {"source": "github", "kind": "ci", "conclusion": "failure", "repo": repo, "branch": branch, "draft": a.draft,
            "title": f"CI failed on {branch} in {repo.split('/')[-1]}" + (" (draft PR" if a.draft else " (") + ", walk sample)",
            "text": "walk sample", "url": "", "ref": f"sample:ci:{branch}:{time.time():.0f}", "at": ""}
    print(json.dumps(tell_owner(st, chat, owner, item, "A sample CI failure for a walk (not a real run).",
                                store=Store(st.db_path)), ensure_ascii=False))


def _live_owner(st) -> bool:
    from .settings import DEFAULTS_FILE
    return st.owner == yaml.safe_load(DEFAULTS_FILE.read_text())["owner"]["id"]


def cmd_google(a) -> None:
    from .adapters import google as G
    st = get_settings()
    if a.what == "login":
        from .seeds import seed_account
        if a.account in ("peer", "owner"):
            email, scopes = G.owner_email(st), G.PEER_SCOPES
        elif a.account == "seed":
            email, scopes = seed_account(), G.SEED_SCOPES
        else:
            raise SystemExit("peer google login peer|seed")
        print(json.dumps(G.login(email, scopes, open_browser=not a.no_open), indent=1))
    elif a.what == "status":
        from .seeds import seed_account
        print(json.dumps({"client_file": G.CLIENT_FILE.exists(), "peer_login": G.token_path(G.owner_email(st)).exists(),
                          "seed_login": G.token_path(seed_account()).exists(), "seeds_in_ledger": len(G.ledger()["by_token"]),
                          "show_real_items": st.get("google.show_real_items"), "act_on_real_items": st.get("google.act_on_real_items")},
                         indent=1))
    elif a.what == "spike":
        from .google_spike import run
        print(json.dumps(run(st, sends=not a.no_send), indent=1))
    elif a.what == "poll":   # counts only, its own cursor: never tells anyone, never moves the Peer's cursor
        from .store import Store
        store = Store(st.db_path)
        g = G.GoogleAdapter(st=st)
        evs, nxt = g.sense(store.cursor("google:cli"))
        store.set_cursor("google:cli", nxt)
        print(json.dumps({"events": len(evs), "seeded": sum(1 for e in evs if e.extra.get("seeded")),
                          "kinds": sorted({e.kind for e in evs})}, indent=1))


def cmd_seed(a) -> None:
    from . import seeds
    st = get_settings()
    if a.name == "clean":
        print(json.dumps(seeds.clean(st), indent=1))
    else:
        print(json.dumps(seeds.play(st, a.name, only=a.only), indent=1, ensure_ascii=False))


def cmd_brief(a) -> None:
    from types import SimpleNamespace
    from . import brief as B
    from .activity import ActivityLog
    from .store import Store
    st = get_settings()
    if a.post and (a.dry_run or not _live_owner(st)):
        raise SystemExit("refused: --post is for the live owner only (no Slack posts from a test owner or a dry run)")
    db, logp = B._paths(st, a.dry_run)
    p = B.profile(st)
    ctx = SimpleNamespace(st=st, store=Store(db), activity=ActivityLog(logp), dry_run=a.dry_run, chat=None, owner_chat_id=None,
                          owner={"first": p.get("preferred_name") or p["name"].split()[0], "name": p["name"]})
    if a.post:
        ctx.chat = _slack()
        ctx.owner_chat_id = ctx.chat.lookup_email(p["slack_email"])["id"]
    b = B.run_brief(ctx, why="command", ai=not a.no_ai, post=a.post)
    print(json.dumps({"id": b.get("id"), "headline": b.get("headline"), "counts": b.get("counts"), "dm": b.get("dm"),
                      "backend": b.get("backend"), "brain_s": b.get("brain_s"), "error": b.get("error"),
                      "page": B.page_url(st, a.dry_run)}, indent=1, ensure_ascii=False))


def main(argv: list[str] | None = None) -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s", datefmt="%H:%M:%S")
    logging.getLogger("slack_sdk").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    ap = argparse.ArgumentParser(prog="peer", description="AI Peer")
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("discover"); p.add_argument("--no-ai", action="store_true"); p.set_defaults(fn=cmd_discover)
    p = sub.add_parser("watch"); p.set_defaults(fn=cmd_watch)
    sub.add_parser("start", help="run watch in the background (pid file, log)").set_defaults(fn=cmd_start)
    sub.add_parser("stop", help="stop the background watch (by its pid file)").set_defaults(fn=cmd_stop)
    p = sub.add_parser("scenario"); p.add_argument("name"); p.add_argument("--dry-run", action="store_true")
    p.add_argument("--record", action="store_true", help="screenshots + video through the Peer's browser profile")
    p.add_argument("--auto-click", action="store_true", help="click the owner's buttons through that profile")
    p.set_defaults(fn=cmd_scenario)
    for mode in ("away", "online", "auto"):
        sub.add_parser(mode).set_defaults(fn=cmd_presence(mode))
    p = sub.add_parser("set"); p.add_argument("key"); p.add_argument("value"); p.set_defaults(fn=cmd_set)
    sub.add_parser("status").set_defaults(fn=cmd_status)
    sub.add_parser("port-check").set_defaults(fn=cmd_port_check)
    p = sub.add_parser("web"); p.add_argument("--port", type=int); p.set_defaults(fn=cmd_web)
    p = sub.add_parser("browser", help="the Peer's own Chrome profile: login | shot | click")
    p.add_argument("what", choices=["login", "login-headless", "shot", "click"]); p.add_argument("--channel"); p.add_argument("--thread")
    p.add_argument("--out", default="shot.png"); p.add_argument("--label", default="Send"); p.set_defaults(fn=cmd_browser)
    p = sub.add_parser("world", help="test world in Slack: manifest | auth | setup")
    p.add_argument("what", choices=["manifest", "auth", "setup", "code"]); p.add_argument("url", nargs="?")
    p.set_defaults(fn=cmd_world)
    p = sub.add_parser("refresh"); p.add_argument("--nightly", action="store_true"); p.add_argument("--rewind")
    p.add_argument("--only"); p.add_argument("--no-ai", action="store_true"); p.set_defaults(fn=cmd_refresh)
    p = sub.add_parser("local"); p.add_argument("what", choices=["scan", "ingest", "install", "hook-config"]); p.set_defaults(fn=cmd_local)
    p = sub.add_parser("tune"); p.add_argument("text", nargs="+"); p.set_defaults(fn=cmd_tune)
    p = sub.add_parser("jobs"); p.add_argument("--once", action="store_true"); p.set_defaults(fn=cmd_jobs)
    p = sub.add_parser("sample-heads-up", help="walk helper: one labelled sample CI failure to the owner (mutes apply)")
    p.add_argument("--draft", action="store_true"); p.add_argument("--branch"); p.set_defaults(fn=cmd_sample_heads_up)
    p = sub.add_parser("google", help="WP3: Google login | status | spike | poll")
    p.add_argument("what", choices=["login", "status", "spike", "poll"]); p.add_argument("account", nargs="?")
    p.add_argument("--no-open", action="store_true"); p.add_argument("--no-send", action="store_true"); p.set_defaults(fn=cmd_google)
    p = sub.add_parser("seed", help="WP3: seed the S2 overnight (or: clean)"); p.add_argument("name"); p.add_argument("--only")
    p.set_defaults(fn=cmd_seed)
    p = sub.add_parser("brief", help="WP3 (S2): build the brief now")
    p.add_argument("--dry-run", action="store_true"); p.add_argument("--no-ai", action="store_true"); p.add_argument("--post", action="store_true")
    p.set_defaults(fn=cmd_brief)
    a = ap.parse_args(argv)
    a.fn(a)


if __name__ == "__main__":
    main(sys.argv[1:])
