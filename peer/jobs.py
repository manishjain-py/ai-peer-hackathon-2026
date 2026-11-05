"""The Peer's background jobs, inside the running Peer (no cron, no launchd):

- every minute: session-end records from the hooks (F7)
- every local.scan_minutes (60): the scan of the chosen folders (F7)
- every github.poll_minutes (15): GitHub events (read-only). A CI failure on the owner's repos is
  told to the owner through notify.tell_owner (the owner's mutes apply, F5); PR and CI changes
  re-write the repo notes and a tracker commit updates its project (F6)
- once a night at memory.nightly_at (owner's local time): the nightly re-read (F6)
"""
from __future__ import annotations

import logging
import threading
import time
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from .adapters.github import GitHubAdapter
from .events import now_iso
from .notify import tell_owner

log = logging.getLogger("peer.jobs")


def ci_item(ev, draft_branches: dict[str, dict]) -> dict:
    repo, branch = ev.extra.get("repo"), ev.extra.get("branch")
    pr = draft_branches.get(f"{repo}:{branch}")
    title = f"CI failed on {branch} in {repo.split('/')[-1]}" + (f" (draft PR #{pr['number']})" if pr and pr.get("draft") else
                                                              f" (PR #{pr['number']})" if pr else "")
    return {"source": "github", "kind": "ci", "conclusion": ev.extra.get("conclusion"), "repo": repo, "branch": branch,
            "draft": bool(pr and pr.get("draft")), "title": title, "text": ev.text, "url": ev.url, "ref": ev.id, "at": ev.at}


class Jobs:
    def __init__(self, watcher):
        self.w = watcher
        self.st = watcher.st
        self._stop = threading.Event()

    def start(self) -> None:
        threading.Thread(target=self.loop, daemon=True, name="peer-jobs").start()

    def loop(self) -> None:
        time.sleep(20)
        while not self._stop.is_set():
            self.tick()
            self._stop.wait(60)

    def _safe(self, name: str, fn) -> None:
        try:
            fn()
        except Exception:  # noqa: BLE001
            log.exception("job %s failed", name)

    def tick(self) -> None:
        from . import localwork
        self._safe("spool", lambda: localwork.ingest_spool(self.st))
        if self.st.get("local.folders") and localwork.due(self.st):
            self._safe("local scan", lambda: localwork.scan(self.st))
        if self._due("github_poll", 60 * float(self.st.get("github.poll_minutes", 15))):
            self._safe("github", self.poll_github)
        if self._nightly_due():
            from .fresh import nightly
            self._safe("nightly", lambda: nightly(self.st))

    def _due(self, key: str, every_s: float) -> bool:
        last = float(self.w.store.get_kv(f"job:{key}", 0) or 0)
        if time.time() - last < every_s:
            return False
        self.w.store.set_kv(f"job:{key}", time.time())
        return True

    def _nightly_due(self) -> bool:
        tz = ZoneInfo(self.w.profile.get("tz", "UTC"))
        now = datetime.now(tz)
        at = str(self.st.get("memory.nightly_at", "02:30"))
        try:
            h, m = (int(x) for x in at.split(":"))
        except ValueError:
            return False
        start = now.replace(hour=h, minute=m, second=0, microsecond=0)
        if not (start <= now < start + timedelta(hours=3)):   # only in the night window: a daytime start never runs it
            return False
        day = now.strftime("%Y-%m-%d")
        if self.w.store.get_kv("job:nightly_day") == day:
            return False
        self.w.store.set_kv("job:nightly_day", day)
        return True

    def poll_github(self) -> dict:
        from .fresh import check_trackers, refresh_repos
        repos = [r["repo"] for r in self.w.profile.get("owns", {}).get("repos", [])]
        gh = GitHubAdapter(repos)
        cursor = self.w.store.cursor("github")
        if not cursor:                       # first start: no backlog of old events
            self.w.store.set_cursor("github", now_iso())
            return {"events": 0}
        events, nxt = gh.sense(cursor)
        self.w.store.set_cursor("github", nxt)
        new = [e for e in events if self.w.store.add_event(e)]
        told = 0
        fails = [e for e in new if e.kind == "ci" and e.extra.get("conclusion") == "failure"]
        if fails:
            drafts = {}
            for repo in {e.extra.get("repo") for e in fails}:
                for pr in gh.pulls(repo, state="open", n=50):
                    drafts[f"{repo}:{pr['head']['ref']}"] = pr
            for e in fails:
                r = self.push(ci_item(e, drafts), "A CI run failed on your repo. Open it to see which step broke.")
                told += r.get("did") == "told"
        if new:
            refresh_repos(self.st)
        updated = check_trackers(self.st, ai=False)   # no AI on the poll: re-copy and flag; the nightly pass re-summarises
        return {"events": len(new), "told": told, "trackers_updated": len(updated)}

    def push(self, item: dict, why: str) -> dict:
        return tell_owner(self.st, self.w.chat, self.w.owner_chat_id, item, why, dry_run=self.w.dry_run, store=self.w.store)
