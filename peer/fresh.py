"""Fresh memory (F6): new events update the affected memory files; a nightly pass re-reads key docs.

- Trackers: each project file records its tracker's commit. check_trackers() asks GitHub (read-only)
  for the newest commit of each tracker; a new one re-copies the tracker into sources/, the brain
  re-writes the status in brief, and the project file is re-written (the owner's corrections kept).
- Repos: refresh_repos() re-writes the repo notes (recent PRs, CI) with plain code, no AI.
- Threads the Peer answered become threads/*.md (question, answer, sources, date).
- nightly(): the profile, every repo note, every tracker (re-copied even when unchanged).
Every update is logged in the activity log with its source and date.
"""
from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from types import SimpleNamespace

from .activity import ActivityLog
from .adapters.github import GitHubAdapter
from .memory.discovery import (Ctx, copy_tracker, step_profile, summarize_project, today, write_project_note,
                               write_repo_note)
from .memory.facts import split
from .memory.layout import Memory
from .settings import Settings

log = logging.getLogger("peer.fresh")


def _projects(st: Settings) -> list[tuple[Path, dict]]:
    out = []
    for p in sorted((st.owner_dir / "projects").glob("*.md")):
        front, _ = split(p.read_text(errors="replace"))
        if front.get("repo") and front.get("tracker"):
            out.append((p, front))
    return out


def _recorded_commit(st: Settings, front: dict) -> str:
    if front.get("tracker_commit"):
        return front["tracker_commit"]
    src = st.owner_dir / "sources" / "github" / front["repo"].split("/")[-1] / front["tracker"]
    if src.exists():
        m = re.search(r"<!-- commit: ([0-9a-f]+) -->", src.read_text(errors="replace")[:600])
        if m:
            return m.group(1)
    return ""


def _mini_ctx(st: Settings) -> SimpleNamespace:
    return SimpleNamespace(st=st, mem=Memory(st.owner_dir), keywords=set(), projects=[], line=lambda t: log.info(t))


def update_project(st: Settings, gh: GitHubAdapter, front: dict, commit: dict, pulls: list[dict], ai: bool = True,
                   why: str = "the tracker changed") -> dict:
    ctx = _mini_ctx(st)
    t = {"repo": front["repo"], "path": front["tracker"], "branch": front.get("branch") or "main", "pulls": pulls, "commit": commit}
    proj = copy_tracker(ctx, gh, t)
    sm, err = summarize_project(st, proj) if ai else (None, None)
    if ai and not sm:
        log.warning("summary failed for %s: %s", proj["slug"], err)
    if not sm:   # keep the previous status in brief rather than dropping it
        sm = _previous_summary(st, proj["slug"])
    write_project_note(ctx.mem, proj, sm)
    _add_keywords(st, ctx.keywords | {a.lower() for a in (sm or {}).get("aliases", [])})
    ctx.mem.rebuild_index()
    c = commit.get("commit") or {}
    msg = (c.get("message") or "").splitlines()[0][:120]
    url = f"https://github.com/{front['repo']}/commit/{commit.get('sha', '')}"
    ActivityLog(st.log_path).add(
        "memory_updated", f"Updated {proj['title']}: {why}", where=f"memory: projects/{proj['slug']}.md", outcome="done",
        said=(f"New status in brief: {sm.get('one_line')}" if sm else "Re-copied the tracker.") + f"\nCommit: {msg}",
        sources=[{"title": f"{proj['title']} tracker", "url": f"https://github.com/{front['repo']}/blob/{t['branch']}/{front['tracker']}",
                  "date": (c.get("committer") or {}).get("date", "")[:10]}, {"title": f"commit {commit.get('sha', '')[:7]}", "url": url,
                                                                            "date": (c.get("committer") or {}).get("date", "")[:10]}],
        extra={"project": proj["slug"], "commit": commit.get("sha")})
    return {"project": proj["slug"], "title": proj["title"], "one_line": (sm or {}).get("one_line"), "changed": why == "the tracker changed"}


def _previous_summary(st: Settings, slug: str) -> dict | None:
    p = st.owner_dir / "projects" / f"{slug}.md"
    if not p.exists():
        return None
    _, body = split(p.read_text(errors="replace"))
    m = re.search(r"## Status in brief \(as of ([^)]*)\)\n\n([\s\S]*?)(?=\n## |\Z)", body)
    if not m:
        return None
    vals = {}
    for ln in m.group(2).splitlines():
        mm = re.match(r"- (Driver|Phase|Done|Next|Dates|Ship target|Waiting on the owner|Other names): (.*)", ln)
        if mm:
            vals[mm.group(1)] = mm.group(2)
        elif ln.startswith("- ") and "one_line" not in vals:
            vals["one_line"] = ln[2:]
    return {"one_line": vals.get("one_line", ""), "driver": vals.get("Driver", ""), "phase": vals.get("Phase", ""),
            "done": [vals.get("Done", "")], "next": [vals.get("Next", "")], "dates": [], "ship_target": vals.get("Ship target"),
            "waiting_on_owner": [vals.get("Waiting on the owner", "")], "aliases": [a.strip() for a in vals.get("Other names", "").split(",") if a.strip() not in ("", "-")],
            "as_of": m.group(1)}


def _add_keywords(st: Settings, words: set[str]) -> None:
    p = st.owner_dir / "keywords.json"
    cur = set(json.loads(p.read_text())) if p.exists() else set()
    new = sorted(cur | {w for w in words if w and len(w) > 2})
    if len(new) != len(cur):
        p.write_text(json.dumps(new, indent=1, ensure_ascii=False))


def check_trackers(st: Settings, ai: bool = True, force: bool = False, only: str | None = None) -> list[dict]:
    """Compare each project's recorded tracker commit with GitHub's newest; update the changed ones."""
    projects = _projects(st)
    if only:
        projects = [(p, f) for p, f in projects if p.stem == only]
    gh = GitHubAdapter(sorted({f["repo"] for _, f in projects}))
    pulls_cache: dict[str, list] = {}
    updated = []
    for path, front in projects:
        try:
            commit = gh.last_commit(front["repo"], front["tracker"]) or {}
            sha, recorded = commit.get("sha", ""), _recorded_commit(st, front)
            if not sha:
                continue
            changed = not recorded or not sha.startswith(recorded[:10])
            if not changed and not force:
                continue
            pulls = pulls_cache.setdefault(front["repo"], gh.pulls(front["repo"], n=15))
            updated.append(update_project(st, gh, front, commit, pulls, ai=ai and changed,
                                          why="the tracker changed" if changed else "nightly re-read"))
        except Exception as e:  # noqa: BLE001
            log.warning("tracker check failed for %s: %s", path.name, e)
    return updated


def rewind(st: Settings, slug: str, ai: bool = True) -> dict:
    """Walk helper (F6): put a project's memory back to its tracker's previous commit, as if the
    memory were built before the newest change. The next check_trackers() then finds that change."""
    front = next(f for p, f in _projects(st) if p.stem == slug)
    gh = GitHubAdapter([front["repo"]])
    commits = gh.gh.get(f"/repos/{front['repo']}/commits", params={"path": front["tracker"], "per_page": 2})
    if len(commits) < 2:
        raise RuntimeError("no earlier commit to rewind to")
    return update_project(st, gh, front, commits[1], gh.pulls(front["repo"], n=15), ai=ai,
                          why=f"rewound to the previous tracker commit (walk set-up; newest is {commits[0]['sha'][:7]})")


def refresh_repos(st: Settings) -> int:
    prof = json.loads(st.profile_path().read_text())
    mem = Memory(st.owner_dir)
    trackers = {}
    for _, f in _projects(st):
        trackers.setdefault(f["repo"], []).append(f["tracker"])
    n = 0
    for r in prof.get("owns", {}).get("repos", []):
        try:
            gh = GitHubAdapter([r["repo"]])
            info = gh.repo(r["repo"])
            write_repo_note(mem, r, info, gh.pulls(r["repo"], n=15), gh.runs(r["repo"], n=10, branch=info.get("default_branch")),
                            sorted(trackers.get(r["repo"], [])))
            n += 1
        except Exception as e:  # noqa: BLE001
            log.warning("repo refresh failed for %s: %s", r["repo"], e)
    return n


def note_thread(st: Settings, e, result: dict, did: dict) -> None:
    """A thread the Peer answered or drafted for becomes threads/<channel>-<ts>.md."""
    if not result or not result.get("relevant"):
        return
    ch = e.extra.get("channel_name") or "dm"
    ts = (e.extra.get("thread_ts") or e.extra.get("ts") or "").replace(".", "")
    rel = f"threads/{ch}-{ts}.md"
    mem = Memory(st.owner_dir)
    path = st.owner_dir / rel
    prev = split(path.read_text())[1] if path.exists() else f"# Thread in #{ch}\n\n- Link: {e.url}\n"
    entry = (f"\n- {e.at[:16].replace('T', ' ')} UTC: {e.extra.get('user_real_name') or e.extra.get('user_name') or 'someone'} asked: "
             f"“{(e.text or '')[:300]}”\n- The Peer {did.get('did', 'replied')} (certainty {result.get('certainty')}, as of {result.get('as_of')}): "
             f"{(result.get('reply') or '')[:600]}")
    mem.write_note(rel, f"Thread in #{ch}", prev.rstrip() + "\n" + entry, kind="thread",
                   summary=f"#{ch}: {(e.text or '')[:90]}", sources=[{"title": f"Slack thread in #{ch}", "url": e.url or "", "date": e.at[:10]}])
    mem.rebuild_index()


def nightly(st: Settings, ai: bool = True) -> dict:
    """Re-read key docs: the profile, the repo notes, every tracker (re-summarised only if changed)."""
    ctx = Ctx.__new__(Ctx)
    ctx.st, ctx.mem = st, Memory(st.owner_dir)
    from .store import Store
    from .adapters.directory import DirectoryAdapter
    from .memory.discovery import load_world
    ctx.store = Store(st.db_path)
    ctx.world = load_world()
    ctx.directory = DirectoryAdapter(st.profile_path(), extra_people=ctx.world.get("colleagues", []))
    ctx.profile = ctx.directory.profile()
    ctx.first = ctx.profile.get("preferred_name") or ctx.profile["name"].split()[0]
    ctx.key = "profile"
    ctx.run = SimpleNamespace(line=lambda k, t: None, learned=lambda *a, **k: None)
    step_profile(ctx)
    repos = refresh_repos(st)
    changed = [c for c in check_trackers(st, ai=ai, force=True) if c.get("changed", True)]
    ctx.mem.rebuild_index()
    ActivityLog(st.log_path).add("nightly", f"Nightly refresh: profile, {repos} repo notes, trackers checked "
                                 f"({len(changed)} changed)", outcome="done",
                                 said="\n".join(f"{c['title']}: {c.get('one_line') or ''}" for c in changed) or "No tracker changed.",
                                 sources=[{"title": "Company directory profile", "url": "", "date": today()}])
    return {"repos": repos, "changed": changed}
