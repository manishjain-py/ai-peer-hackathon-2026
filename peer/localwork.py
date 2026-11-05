"""Local work (F7, DESIGN D11): what the owner is coding right now, from their own machine.

Two inputs, summaries only, never code:
- Session-end hooks (Claude Code SessionEnd, Codex SessionEnd) run ~/.ai-peer/bin/session-end, which
  only saves the hook's JSON into ~/.ai-peer/spool/session-end/ and exits 0 at once (it never slows
  or breaks a session; where the script is missing, the hook command does nothing).
- An hourly scan of the folders the owner chose (setting local.folders), inside the Peer.
For each git checkout: repo, branch, unpushed commits (subjects), uncommitted files (count and
folders), when it last changed. Read-only: `git --no-optional-locks`, never fetch, never write.
Result: local/<repo>.md in the owner's memory, plus an activity entry.
"""
from __future__ import annotations

import json
import logging
import os
import shutil
import subprocess
import time
from datetime import datetime, timedelta
from pathlib import Path

from .activity import ActivityLog
from .memory.layout import Memory, slug
from .settings import PEER_HOME, PKG, Settings
from .store import Store

log = logging.getLogger("peer.local")
SPOOL = PEER_HOME / "spool" / "session-end"
HOOK_BIN = PEER_HOME / "bin" / "session-end"
HOOK_SRC = PKG / "local_hook.sh"
HOOK_COMMAND = 'test -x "$HOME/.ai-peer/bin/session-end" && "$HOME/.ai-peer/bin/session-end" {tool} || true'


def git(path: Path, *args: str, timeout: int = 10) -> str | None:
    try:
        r = subprocess.run(["git", "--no-optional-locks", "-C", str(path), *args], capture_output=True, text=True,
                           timeout=timeout, env={**os.environ, "GIT_OPTIONAL_LOCKS": "0", "GIT_TERMINAL_PROMPT": "0"})
    except (OSError, subprocess.TimeoutExpired):
        return None
    return r.stdout.strip() if r.returncode == 0 else None


def folders(st: Settings) -> list[Path]:
    return [Path(f).expanduser() for f in (st.get("local.folders") or [])]


def checkouts(st: Settings) -> list[Path]:
    """Git checkouts in the chosen folders: the folder itself, or its direct sub-folders."""
    out = []
    for f in folders(st):
        if (f / ".git").exists():
            out.append(f)
        elif f.is_dir():
            out += sorted(d for d in f.iterdir() if d.is_dir() and (d / ".git").exists())
    return out


def allowed(st: Settings, path: Path) -> bool:
    p = path.resolve()
    return any(p == f.resolve() or f.resolve() in p.parents for f in folders(st))


def inspect(path: Path) -> dict | None:
    top = git(path, "rev-parse", "--show-toplevel")
    if not top:
        return None
    top_p = Path(top)
    branch = git(top_p, "rev-parse", "--abbrev-ref", "HEAD") or "?"
    remote = git(top_p, "remote", "get-url", "origin") or ""
    repo = remote.rstrip("/").removesuffix(".git").split(":")[-1].split("github.com/")[-1] if remote else top_p.name
    upstream = git(top_p, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}")
    rng = ["@{u}..HEAD"] if upstream else ["HEAD", "--not", "--remotes"]
    log_out = git(top_p, "log", "--format=%h%x09%cI%x09%s", "-n", "20", *rng) if remote or upstream else git(top_p, "log", "--format=%h%x09%cI%x09%s", "-n", "5")
    unpushed = [dict(zip(("sha", "at", "subject"), ln.split("\t", 2))) for ln in (log_out or "").splitlines() if ln.count("\t") >= 2]
    status = git(top_p, "status", "--porcelain=v1", "--untracked-files=normal") or ""
    changed = [ln[3:] for ln in status.splitlines() if len(ln) > 3]
    dirs = sorted({c.split("/")[0] if "/" in c else "." for c in changed})
    last = git(top_p, "log", "-1", "--format=%cI%x09%s") or ""
    last_at, _, last_subject = last.partition("\t")
    return {"path": str(top_p), "repo": repo, "branch": branch, "upstream": upstream, "unpushed": unpushed,
            "changed": len(changed), "changed_dirs": dirs[:6], "last_commit_at": last_at, "last_subject": last_subject[:120]}


def _today(iso: str) -> bool:
    try:
        return datetime.fromisoformat(iso).astimezone().date() == datetime.now().astimezone().date()
    except ValueError:
        return False


def active(info: dict, sessions: list[dict]) -> bool:
    return bool(info["unpushed"] or info["changed"] or _today(info["last_commit_at"]) or sessions)


def _line(info: dict, home: str) -> str:
    where = info["path"].replace(home, "~")
    parts = [f"branch `{info['branch']}` in {where}"]
    if info["unpushed"]:
        subj = "; ".join(f"“{u['subject'][:80]}”" for u in info["unpushed"][:4])
        parts.append(f"{len(info['unpushed'])} unpushed commit{'s' if len(info['unpushed']) != 1 else ''}"
                     + ("" if info["upstream"] else " (branch not on GitHub yet)") + f": {subj}")
    if info["changed"]:
        parts.append(f"{info['changed']} uncommitted file{'s' if info['changed'] != 1 else ''} in {', '.join(info['changed_dirs'])}")
    if not info["unpushed"] and not info["changed"]:
        parts.append("everything pushed")
    if info["last_commit_at"]:
        parts.append(f"last commit {info['last_commit_at'][:16].replace('T', ' ')} (“{info['last_subject'][:80]}”)")
    return "- " + "; ".join(parts)


def write_notes(st: Settings, infos: list[dict], sessions: dict[str, list[dict]], why: str) -> list[str]:
    """One local/<repo>.md per repository, every active checkout (worktree) as a line."""
    mem = Memory(st.owner_dir)
    home = str(Path.home())
    by_repo: dict[str, list[dict]] = {}
    for i in infos:
        by_repo.setdefault(i["repo"], []).append(i)
    written = []
    date = datetime.now().strftime("%Y-%m-%d")
    for repo, items in by_repo.items():
        name = slug(repo.split("/")[-1])
        lines = [f"# Local work: {repo}", "", f"Seen on {datetime.now():%-d %b %Y, %H:%M} (local time), from the owner's machine.", ""]
        lines += [_line(i, home) for i in items]
        sess = [s for i in items for s in sessions.get(i["path"], [])]
        if sess:
            lines += ["", "## Coding sessions that ended", ""]
            lines += [f"- {s['tool']} session ended {s['at_local']} on branch `{s['branch']}`" for s in sess[-6:]]
        unpushed = [i for i in items if i["unpushed"]]
        summary = ("Today: " if any(_today(i["last_commit_at"]) for i in items) else "") + "; ".join(
            f"{len(i['unpushed'])} unpushed on {i['branch']}" if i["unpushed"] else f"{i['changed']} uncommitted on {i['branch']}"
            if i["changed"] else f"{i['branch']} pushed" for i in items)[:150]
        mem.write_note(f"local/{name}.md", f"Local work: {repo.split('/')[-1]}", "\n".join(lines), kind="local",
                       summary=summary, sources=[{"title": f"local scan ({why})", "url": "file://" + items[0]["path"], "date": date}],
                       meta={"repo": repo, "unpushed": sum(len(i["unpushed"]) for i in unpushed)})
        written.append(name)
    if written:
        mem.rebuild_index()
    return written


def scan(st: Settings, why: str = "hourly scan") -> dict:
    """The hourly scan of the chosen folders (plus any sessions spooled since the last scan)."""
    sessions = ingest_spool(st, write=False)
    infos = []
    for path in checkouts(st):
        info = inspect(path)
        if info and active(info, sessions.get(info["path"], [])):
            infos.append(info)
    written = write_notes(st, infos, sessions, why)
    if written:
        ActivityLog(st.log_path).add(
            "local_work", f"Noted local work in {len(written)} repo{'s' if len(written) != 1 else ''} ({why})", outcome="done",
            said="\n".join(_line(i, str(Path.home())) for i in infos)[:1500],
            sources=[{"title": f"local/{n}.md", "url": f"file://{st.owner_dir / 'local' / (n + '.md')}", "date": datetime.now().strftime('%Y-%m-%d')} for n in written])
    Store(st.db_path).set_kv("local_last_scan", time.time())
    return {"checkouts": len(checkouts(st)), "active": len(infos), "written": written}


def ingest_spool(st: Settings, write: bool = True) -> dict[str, list[dict]]:
    """Read session-end records this owner has not seen; keep those inside the chosen folders."""
    store = Store(st.db_path)
    seen = set(store.get_kv("local_spool_seen", []) or [])
    out: dict[str, list[dict]] = {}
    infos = []
    if not SPOOL.exists():
        return out
    for f in sorted(SPOOL.glob("*.json")):
        if f.name in seen:
            continue
        seen.add(f.name)
        try:
            rec = json.loads(f.read_text())
        except ValueError:
            continue
        payload = rec.get("payload") or {}
        cwd = payload.get("cwd") or payload.get("workdir") or ""
        if not cwd or not allowed(st, Path(cwd)):
            continue
        info = inspect(Path(cwd))
        if not info:
            continue
        at = rec.get("at", "")
        try:
            at_local = datetime.fromisoformat(at.replace("Z", "+00:00")).astimezone().strftime("%-d %b %H:%M")
        except ValueError:
            at_local = at
        out.setdefault(info["path"], []).append({"tool": {"claude": "Claude Code", "codex": "Codex"}.get(rec.get("tool"), rec.get("tool", "?")),
                                                 "at_local": at_local, "branch": info["branch"]})
        infos.append(info)
    # prune old spool names from the seen set (files older than 7 days are deleted by the owner's Peer)
    cutoff = time.time() - 7 * 86400
    for f in SPOOL.glob("*.json"):
        try:
            if f.stat().st_mtime < cutoff:
                f.unlink()
                seen.discard(f.name)
        except OSError:
            pass
    store.set_kv("local_spool_seen", sorted(seen)[-2000:])
    if write and infos:
        uniq = {i["path"]: i for i in infos}
        written = write_notes(st, list(uniq.values()), out, "a coding session ended")
        ActivityLog(st.log_path).add(
            "local_work", f"A coding session ended: noted {', '.join(written)}", outcome="done",
            said="\n".join(_line(i, str(Path.home())) for i in uniq.values())[:1500],
            sources=[{"title": f"local/{n}.md", "url": f"file://{st.owner_dir / 'local' / (n + '.md')}", "date": datetime.now().strftime('%Y-%m-%d')} for n in written])
    return out


def install_hook_script() -> Path:
    """Copy the hook script to ~/.ai-peer/bin/session-end (not synced to other Macs, so they skip it)."""
    HOOK_BIN.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(HOOK_SRC, HOOK_BIN)
    HOOK_BIN.chmod(0o755)
    SPOOL.mkdir(parents=True, exist_ok=True)
    return HOOK_BIN


def claude_settings_snippet() -> dict:
    return {"hooks": {"SessionEnd": [{"hooks": [{"type": "command", "command": HOOK_COMMAND.format(tool="claude"), "timeout": 5}]}]}}


def due(st: Settings) -> bool:
    last = Store(st.db_path).get_kv("local_last_scan", 0) or 0
    return time.time() - float(last) >= 60 * float(st.get("local.scan_minutes", 60))


def since(minutes: int) -> datetime:
    return datetime.now() - timedelta(minutes=minutes)
