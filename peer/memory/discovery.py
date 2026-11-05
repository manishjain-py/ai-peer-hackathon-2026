"""Discovery (F1): build the owner's memory from their sources, one visible step per source.

Steps, in order: profile -> team -> repos and services (GitHub, read-only) -> projects (the
brain reads each tracker) -> Slack channels -> people -> docs -> calendar -> ready. Each step
reports lines and learned facts to a SetupRun, which the setup page polls (setup.json in the
owner's folder) and the CLI prints. Facts land in memory files with their source and date.

Other packages add a step with register_step() (additive): WP3's `google` adapter replaces the
"docs" and "calendar" placeholders, which say "not connected yet" until it lands.
Discovery stores only the owner and the test world's colleagues, never other Slack members.
"""
from __future__ import annotations

import importlib.util
import json
import re
import threading
import time
import traceback
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Callable

import yaml

from ..adapters.directory import DirectoryAdapter
from ..adapters.github import GitHubAdapter
from ..brain.runner import run_agent
from ..brain.schemas import SUMMARIZE_TRACKER
from ..events import now_iso
from ..settings import PKG, Settings, secret
from ..store import Store
from .layout import Memory, slug

MAX_SOURCE_BYTES = 120_000
Progress = Callable[[str], None]


def _date(iso: str | None) -> str:
    return (iso or "")[:10]


def today() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def load_world() -> dict:
    return yaml.safe_load((PKG / "scenarios" / "world.yaml").read_text())


def google_connected() -> bool:
    """True once WP3's google adapter exists and has a login."""
    if importlib.util.find_spec("peer.adapters.google") is None:
        return False
    try:
        from ..adapters import google  # type: ignore[attr-defined]
        return bool(getattr(google, "connected", lambda: False)())
    except Exception:  # noqa: BLE001
        return False


def _expand(gh: GitHubAdapter, repo: str, pattern: str) -> list[str]:
    """Expand a path pattern with '*' as one folder segment."""
    parts = pattern.split("/")
    paths = [""]
    for part in parts:
        nxt = []
        for base in paths:
            if part == "*":
                nxt += [i["path"] for i in gh.list_dir(repo, base) if i["type"] == "dir"]
            else:
                nxt.append(f"{base}/{part}" if base else part)
        paths = nxt
    found = []
    for p in paths:
        folder = p.rsplit("/", 1)[0] if "/" in p else ""
        names = {i["name"] for i in gh.list_dir(repo, folder) if i["type"] == "file"}
        if p.rsplit("/", 1)[-1] in names:
            found.append(p)
    return found


def _title_of(text: str, fallback: str) -> str:
    m = re.search(r"^#\s+(.+)$", text, re.M)
    if not m:
        return fallback
    t = m.group(1).strip()
    t = re.sub(r"\s*[:—-]+\s*(current state|state|tracker|the state|status)$", "", t, flags=re.I)
    if len(t) > 48 or ";" in t or t.lower().startswith(("current", "new direction", "read-only")):
        return fallback
    return t


# -- progress -----------------------------------------------------------------------------------
class SetupRun:
    """Live progress of one discovery: steps, lines, learned facts. Saved to <owner>/setup.json."""

    def __init__(self, st: Settings, steps: list["Step"], echo: Progress | None = print):
        self.path = st.owner_dir / "setup.json"
        self.echo = echo
        self._lock = threading.Lock()
        self.data = {"state": "running", "started": now_iso(), "finished": None, "error": None,
                     "steps": [{"key": s.key, "label": s.label, "status": "waiting", "detail": "", "lines": []} for s in steps],
                     "learned": []}
        self.save()

    def save(self) -> None:
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.data, ensure_ascii=False, indent=1))
        tmp.replace(self.path)

    def _step(self, key: str) -> dict:
        return next(s for s in self.data["steps"] if s["key"] == key)

    def status(self, key: str, status: str, detail: str | None = None) -> None:
        with self._lock:
            s = self._step(key)
            s["status"] = status
            if detail is not None:
                s["detail"] = detail
            s.setdefault("t0" if status == "running" else "t1", time.time())
            self.save()

    def line(self, key: str, text: str) -> None:
        with self._lock:
            self._step(key)["lines"].append(text)
            self.save()
        if self.echo:
            self.echo(text)

    def learned(self, label: str, value: str, detail: str = "", source: str = "") -> None:
        with self._lock:
            self.data["learned"].append({"label": label, "value": value, "detail": detail, "source": source})
            self.save()

    def finish(self, state: str, error: str | None = None) -> None:
        with self._lock:
            self.data.update(state=state, finished=now_iso(), error=error)
            self.save()


def setup_state(st: Settings) -> dict | None:
    p = st.owner_dir / "setup.json"
    try:
        return json.loads(p.read_text()) if p.exists() else None
    except ValueError:
        return None


# -- the context steps share ----------------------------------------------------------------------
class Ctx:
    def __init__(self, st: Settings, run: SetupRun, ai: bool):
        self.st, self.run, self.ai = st, run, ai
        self.mem = Memory(st.owner_dir)
        self.store = Store(st.db_path)
        self.world = load_world()
        self.directory = DirectoryAdapter(st.profile_path(), extra_people=self.world.get("colleagues", []))
        self.profile = self.directory.profile()
        self.first = self.profile.get("preferred_name") or self.profile["name"].split()[0]
        self.keywords: set[str] = {self.first.lower(), self.profile["name"].lower()}
        self.trackers: list[dict] = []
        self.projects: list[dict] = []
        self.summaries: dict[str, dict] = {}
        self.slack = None
        self.owner_slack: str | None = None
        self.channels: list[dict] = []
        self.key = ""

    def line(self, text: str) -> None:
        self.run.line(self.key, text)

    def colleagues(self) -> list[dict]:
        """Teammates from the directory: the profile's own list plus the test world's colleagues."""
        seen, out = set(), []
        for c in [*self.profile.get("teammates", []), *self.world.get("colleagues", [])]:
            if c.get("person_id") and c["person_id"] not in seen:
                seen.add(c["person_id"])
                out.append(c)
        return out


@dataclass
class Step:
    key: str
    label: str
    fn: Callable[[Ctx], str]          # returns a one-line detail; raise NotConnected to show "not connected yet"


class NotConnected(Exception):
    pass


# -- steps -----------------------------------------------------------------------------------------
def step_profile(c: Ctx) -> str:
    p = c.profile
    c.mem.ensure(owner_name=c.first)
    owns = p.get("owns", {})
    wh = p.get("working_hours") or {}
    body = "\n".join([
        f"# {p['name']}", "",
        f"- Role: {p['title']}, {p['company']}",
        f"- Team: {p.get('team', '')}",
        f"- Time zone: {p['tz']} ({p.get('location', '')})",
        f"- Working hours: {wh.get('start')} to {wh.get('end')}, {', '.join(wh.get('days', []))}" if wh else "- Working hours: not recorded",
        f"- Email: {p['email']}; GitHub: {p.get('github')}",
        f"- About: {p.get('about', '')}", "",
        "## Owns", "",
        *[f"- Repo `{r['repo']}`: {r['what']}" for r in owns.get("repos", [])],
        *[f"- Service `{s['name']}` ({s['repo']}/{s['path']}): {s['what']}" for s in owns.get("services", [])],
        "", "## Interests", "", *[f"- {i}" for i in p.get("interests", [])],
    ])
    c.mem.write_note("me.md", p["name"], body, kind="person",
                     summary=f"who {c.first} is: role, team, time zone, what {c.first} owns, interests",
                     sources=[{"title": "Company directory profile", "url": "directory:person:" + p["person_id"], "date": today()}])
    c.store.upsert_person(p["person_id"], name=p["name"], email=p["email"], github=p.get("github"), tz=p["tz"],
                          role=p["title"], extra={"is_owner": True})
    c.line(f"{p['name']}: {p['title']}, {p['company']} ({p['tz']})")
    c.run.learned("You", p["name"], f"{p['title']} · {p['company']}", "Company directory")
    return f"{p['title']}, {p['company']}"


def step_team(c: Ctx) -> str:
    team = c.profile.get("team") or "your team"
    mates = c.colleagues()
    for m in mates:
        c.line(f"{m['name']}: {m.get('title', '')}")
    c.run.learned("Your team", team, f"{len(mates)} teammates: " + ", ".join(m["name"].split()[0] for m in mates[:6]), "Company directory")
    return f"{team}: {len(mates)} teammates"


def step_github(c: Ctx) -> str:
    p = c.profile
    owns = p.get("owns", {})
    repos = [r["repo"] for r in owns.get("repos", [])]
    gh = GitHubAdapter(repos)
    for r in owns.get("repos", []):
        repo = r["repo"]
        info = gh.repo(repo)
        branch = info.get("default_branch", "main")
        pulls = gh.pulls(repo, n=15)
        runs = gh.runs(repo, n=10, branch=branch)
        found = []
        for pat in r.get("trackers", []):
            found += _expand(gh, repo, pat)
        c.line(f"{repo}: {len(pulls)} recent pull requests, {len(runs)} CI runs on {branch}, {len(found)} project trackers")
        c.keywords.add(repo.split("/")[-1].lower())
        write_repo_note(c.mem, r, info, pulls, runs, found)
        for path in found:
            c.trackers.append({"repo": repo, "path": path, "branch": branch, "pulls": pulls})
    for s in owns.get("services", []):
        c.keywords.add(s["name"].lower())
        url = f"https://github.com/{s['repo']}/tree/main/{s['path']}"
        c.mem.write_note(f"services/{s['name']}.md", s["name"],
                         f"# Service `{s['name']}`\n\n- What: {s['what']}\n- Code: `{s['repo']}` at `{s['path']}/` ({url})\n"
                         f"- Owner: {p['name']}\n- Recent PRs and CI: see services/repo-{s['repo'].split('/')[-1]}.md",
                         kind="service", summary=s["what"][:100],
                         sources=[{"title": f"{s['name']} code", "url": url, "date": today()}])
    c.line(f"Services: {', '.join(s['name'] for s in owns.get('services', [])) or 'none listed'}")
    for t in c.trackers:
        copy_tracker(c, gh, t)
    c.run.learned("Your work", f"{len(repos)} repo{'s' if len(repos) != 1 else ''}, {len(owns.get('services', []))} services",
                  ", ".join(s["name"] for s in owns.get("services", [])[:5]), "GitHub (read-only)")
    return (f"{len(repos)} repo{'s' if len(repos) != 1 else ''}, {len(owns.get('services', []))} services, "
            f"{len(c.trackers)} project trackers")


def write_repo_note(mem: Memory, r: dict, info: dict, pulls: list[dict], runs: list[dict], found: list[str]) -> None:
    repo = r["repo"]
    branch = info.get("default_branch", "main")
    pr_lines = []
    for pr in pulls:
        state = "merged" if pr.get("merged_at") else pr["state"]
        when = _date(pr.get("merged_at") or pr.get("updated_at"))
        pr_lines.append(f"- [PR #{pr['number']}]({pr['html_url']}) {pr['title']} ({state}"
                        f"{', draft' if pr.get('draft') else ''}; {when}; by {pr['user']['login']})")
    run_lines = [f"- [{x.get('name')}]({x['html_url']}) on {x.get('head_branch')}: "
                 f"{x.get('conclusion') or x.get('status')} ({_date(x.get('updated_at'))})" for x in runs]
    name = repo.split("/")[-1]
    mem.write_note(
        f"services/repo-{name}.md", f"Repo {name}",
        f"# Repo `{repo}`\n\n- What: {r['what']}\n- Default branch `{branch}`; last push {_date(info.get('pushed_at'))}."
        f" Link: {info['html_url']}\n\n## Recent pull requests (as of {today()})\n\n"
        + ("\n".join(pr_lines) or "- none") + f"\n\n## CI on {branch} (latest runs)\n\n" + ("\n".join(run_lines) or "- none")
        + "\n\n## Trackers\n\n" + ("\n".join(f"- {p}" for p in found) or "- none"),
        kind="repo", summary=f"{r['what'][:90]}; recent PRs and CI",
        sources=[{"title": f"{repo} on GitHub", "url": info["html_url"], "date": _date(info.get("pushed_at"))}],
        meta={"repo": repo})


def copy_tracker(c: Ctx, gh: GitHubAdapter, t: dict, ref: str | None = None) -> dict:
    """Copy a tracker (and its sibling docs) into sources/; remember it as a project to summarize."""
    repo, path, branch = t["repo"], t["path"], t["branch"]
    folder = path.rsplit("/", 1)[0] if "/" in path else ""
    proj_slug = slug(folder.rsplit("/", 1)[-1] if folder else repo.split("/")[-1] + "-" + Path(path).stem)
    commit = t.get("commit") or gh.last_commit(repo, path) or {}
    text = gh.file_text(repo, path, ref=ref or commit.get("sha")) or ""
    cdate = ((commit.get("commit") or {}).get("committer") or {}).get("date", "")
    name = repo.split("/")[-1]
    c.mem.write_source(f"github/{name}/{path}", text[:MAX_SOURCE_BYTES],
                       {"source": gh.blob_url(repo, path, branch), "repo": repo, "path": path,
                        "commit": (commit.get("sha") or "")[:10], "commit_date": cdate, "fetched": now_iso()})
    siblings = []
    if folder.startswith(("docs/feature-development/", "docs/projects/")):
        for item in gh.list_dir(repo, folder):
            n = item["name"]
            if item["type"] != "file" or not n.endswith(".md") or n == Path(path).name or n.startswith("HANDOFF") \
                    or n in ("AGENTS.md", "CLAUDE.md"):
                continue
            body = gh.file_text(repo, item["path"]) or ""
            c.mem.write_source(f"github/{name}/{item['path']}", body[:MAX_SOURCE_BYTES],
                               {"source": gh.blob_url(repo, item["path"], branch), "repo": repo, "path": item["path"],
                                "fetched": now_iso()})
            siblings.append({"title": n, "url": gh.blob_url(repo, item["path"], branch), "path": item["path"]})
    title = _title_of(text, proj_slug.replace("-", " ").title())
    proj = {"slug": proj_slug, "title": title, "repo": repo, "path": path, "branch": branch, "commit": commit,
            "cdate": cdate, "siblings": siblings, "pulls": t.get("pulls", []), "source_rel": f"sources/github/{name}/{path}"}
    c.projects.append(proj)
    c.keywords.update({proj_slug.replace("-", " "), title.lower()})
    c.line(f"Copied the {title} tracker (last changed {cdate[:10] or 'unknown'})")
    return proj


def summarize_project(st: Settings, p: dict, effort: str | None = None) -> tuple[dict | None, str | None]:
    req = {"playbook": "summarize_tracker", "path": p["source_rel"], "project": p["title"], "repo": p["repo"]}
    res = run_agent("summarize_tracker " + json.dumps(req, ensure_ascii=False), SUMMARIZE_TRACKER,
                    label=f"summarize:{p['slug']}", effort=effort or st.get("brain.summary_effort"), timeout=600)
    return res.output, res.error


def previous_summary(mem: Memory, slug_: str) -> tuple[dict | None, dict]:
    """The status in brief already in a project file (so a run without the brain keeps it), and its front matter."""
    path = mem.root / "projects" / f"{slug_}.md"
    if not path.exists():
        return None, {}
    front = mem.read_front(path)
    body = path.read_text(errors="replace")
    m = re.search(r"## Status in brief \(as of ([^)]*)\)\n\n([\s\S]*?)(?=\n## |\Z)", body)
    if not m:
        return None, front
    vals: dict = {}
    for ln in m.group(2).splitlines():
        ln = re.sub(r"\s*\(corrected by [^)]*\)\s*$", "", ln)
        mm = re.match(r"- (Driver|Phase|Done|Next|Dates|Ship target|Waiting on the owner|Other names): (.*)", ln)
        if mm:
            vals[mm.group(1)] = mm.group(2)
        elif ln.startswith("- ") and "one_line" not in vals and not ln.startswith("- Newer than this status"):
            vals["one_line"] = ln[2:]
    split_ = lambda v: [x.strip() for x in (v or "").split(";") if x.strip()]  # noqa: E731
    dates = [{"what": a.strip(), "date": b.strip()} for a, _, b in (d.rpartition(":") for d in split_(vals.get("Dates")))
             if a and vals.get("Dates") != "none recorded"]
    ship = vals.get("Ship target")
    return ({"one_line": vals.get("one_line", ""), "driver": vals.get("Driver", ""), "phase": vals.get("Phase", ""),
             "done": split_(vals.get("Done")), "next": split_(vals.get("Next")), "dates": dates,
             "ship_target": None if not ship or ship.startswith("none recorded") else ship,
             "waiting_on_owner": [] if vals.get("Waiting on the owner") == "nothing recorded" else split_(vals.get("Waiting on the owner")),
             "aliases": [a.strip() for a in (vals.get("Other names") or "").split(",") if a.strip() not in ("", "-")],
             "as_of": m.group(1)}, front)


def summary_is_stale(meta: dict, sha: str, cdate: str) -> bool:
    """Is a project's status in brief older than its tracker? By commit when known, else by date."""
    if meta.get("summary_commit") and sha:
        return not sha.startswith(str(meta["summary_commit"])[:10])
    try:
        return datetime.fromisoformat(str(meta.get("summary_at")).replace("Z", "+00:00")) < \
            datetime.fromisoformat(str(cdate).replace("Z", "+00:00"))
    except ValueError:
        return True


def write_project_note(mem: Memory, p: dict, sm: dict | None, fresh_summary: bool = True) -> set[str]:
    """The project's memory file: status in brief (from the brain), related PRs, sources. Returns aliases.
    fresh_summary=False: `sm` is the previous status (the brain did not run); the file then says the
    tracker is newer than its status, so the brain reads the fresh copy in sources/."""
    c = p["commit"] or {}
    prev_front = mem.read_front(mem.root / "projects" / f"{p['slug']}.md") if (mem.root / "projects" / f"{p['slug']}.md").exists() else {}
    if sm and fresh_summary:
        summary_meta = {"summary_at": now_iso(), "summary_commit": c.get("sha") or ""}
    else:   # the status was written earlier: keep when, and for which commit (never claim the new one)
        summary_meta = {"summary_at": prev_front.get("summary_at") or prev_front.get("updated") or "",
                        "summary_commit": prev_front.get("summary_commit") or ""}
    stale = bool(sm) and not fresh_summary and summary_is_stale(summary_meta, c.get("sha") or "", p["cdate"])
    cmsg = ((c.get("commit") or {}).get("message") or "").splitlines()[0][:100] if c else ""
    tracker_url = f"https://github.com/{p['repo']}/blob/{p['branch']}/{p['path']}"
    terms = {p["slug"].replace("-", " ")} | {a.lower() for a in (sm or {}).get("aliases", [])}
    related = [pr for pr in p["pulls"] if any(t and t in (pr["title"] + " " + pr["head"]["ref"]).lower() for t in terms)]
    lines = [f"# {p['title']}", "",
             f"- Repo: `{p['repo']}`; tracker: [{p['path']}]({tracker_url})",
             f"- Tracker last changed: {p['cdate'][:16].replace('T', ' ')} UTC (commit {(c.get('sha') or '')[:10]}: {cmsg})", ""]
    if sm:
        lines += [f"## Status in brief (as of {sm.get('as_of')})", ""]
        if stale:
            lines += [f"- Newer than this status: the tracker changed at {p['cdate'][:16].replace('T', ' ')} UTC (commit "
                      f"{(c.get('sha') or '')[:7]}). Its copy in `{p['source_rel']}` is current: read it for anything newer than "
                      f"{sm.get('as_of')}, and prefer it where they differ."]
        lines += [f"- {sm.get('one_line')}",
                  f"- Driver: {sm.get('driver')}",
                  f"- Phase: {sm.get('phase')}",
                  "- Done: " + "; ".join(sm.get("done", [])),
                  "- Next: " + "; ".join(sm.get("next", [])),
                  "- Dates: " + ("; ".join(f"{d['what']}: {d['date']}" for d in sm.get("dates", [])) or "none recorded"),
                  f"- Ship target: {sm.get('ship_target') or 'none recorded in the tracker'}",
                  "- Waiting on the owner: " + ("; ".join(sm.get("waiting_on_owner", [])) or "nothing recorded"),
                  f"- Other names: {', '.join(sm.get('aliases', [])) or '-'}", ""]
    if related:
        lines += ["## Related pull requests", ""]
        for pr in related[:6]:
            state = "merged" if pr.get("merged_at") else pr["state"]
            lines.append(f"- [PR #{pr['number']}]({pr['html_url']}) {pr['title']} ({state}; {_date(pr.get('merged_at') or pr.get('updated_at'))})")
        lines.append("")
    lines += ["## Sources", "", f"- [{Path(p['path']).name} (tracker)]({tracker_url}): {p['cdate'][:10]}"]
    lines += [f"- [{s['title']}]({s['url']})" for s in p["siblings"]]
    lines += ["", f"Verbatim copies: `{p['source_rel']}`" + (f" and its siblings in `{Path(p['source_rel']).parent}/`" if p["siblings"] else "")]
    mem.write_note(f"projects/{p['slug']}.md", p["title"], "\n".join(lines), kind="project",
                   summary=(sm or {}).get("one_line", f"tracker in {p['repo']}")[:140],
                   sources=[{"title": f"{p['title']} tracker", "url": tracker_url, "date": p["cdate"][:10]}],
                   meta={"repo": p["repo"], "tracker": p["path"], "branch": p["branch"],
                         "tracker_commit": c.get("sha") or "", "tracker_date": p["cdate"], **summary_meta,
                         "aliases": (sm or {}).get("aliases", [])})
    return {a.lower() for a in (sm or {}).get("aliases", [])}


def step_projects(c: Ctx) -> str:
    if not c.projects:
        return "no trackers found"
    if c.ai:
        c.line(f"Reading {len(c.projects)} trackers with the brain ({c.st.get('brain.backend')}, effort {c.st.get('brain.summary_effort')})")
        with ThreadPoolExecutor(max_workers=4) as pool:
            for p, (out, err) in zip(c.projects, pool.map(lambda p: summarize_project(c.st, p), c.projects)):
                if out:
                    c.summaries[p["slug"]] = out
                    c.line(f"{p['title']}: {out.get('one_line', '')[:140]}")
                    c.run.learned("Project", p["title"], out.get("one_line", "")[:120], f"{p['title']} tracker, {p['cdate'][:10]}")
                else:
                    c.line(f"{p['title']}: the brain could not read it ({(err or '')[:80]})")
    for p in c.projects:
        sm = c.summaries.get(p["slug"])
        fresh_sm = sm is not None
        if sm is None:   # no brain (or it failed): keep the status the memory already had
            sm = previous_summary(c.mem, p["slug"])[0]
        c.keywords.update(write_project_note(c.mem, p, sm, fresh_summary=fresh_sm))
    return f"{len(c.projects)} projects, {len(c.summaries)} with a status in brief"


def _slack():
    if not secret("SLACK_BOT_TOKEN"):
        raise NotConnected("no Slack bot token")
    from ..adapters.slack import SlackAdapter
    return SlackAdapter()


def step_slack(c: Ctx) -> str:
    """Channels the owner is in (names, purposes, which teammates are there). Read-only; no joins, no posts."""
    c.slack = _slack()
    u = c.slack.lookup_email(c.profile.get("slack_email") or c.profile["email"])
    if not u:
        raise NotConnected(f"{c.profile.get('slack_email')} not found in Slack")
    c.owner_slack = u["id"]
    c.store.set_kv("owner_chat_id", u["id"])
    c.store.upsert_person(c.profile["person_id"], slack_id=u["id"])
    known = {c.owner_slack: c.first}
    for m in c.colleagues():
        lu = c.slack.lookup_email(m["email"]) if m.get("email") else None
        if lu:
            known[lu["id"]] = m["name"]
            m["slack_id"] = lu["id"]
    bot = c.slack.bot
    chans, cursor = [], None
    while True:
        r = bot.users_conversations(user=c.owner_slack, types="public_channel", exclude_archived=True, limit=200, cursor=cursor)
        chans += r.get("channels", [])
        cursor = (r.get("response_metadata") or {}).get("next_cursor")
        if not cursor:
            break
    for ch in sorted(chans, key=lambda x: x["name"]):
        info = bot.conversations_info(channel=ch["id"])["channel"]
        members = bot.conversations_members(channel=ch["id"], limit=500).get("members", [])
        mates = [known[m] for m in members if m in known and m != c.owner_slack]   # only known people, never other members
        purpose = (info.get("purpose") or {}).get("value", "") or (info.get("topic") or {}).get("value", "")
        peer_in = c.slack.bot_user_id in members
        c.channels.append({"id": ch["id"], "name": ch["name"], "purpose": purpose, "mates": mates, "peer_in": peer_in})
        url = f"{c.slack.team_url}archives/{ch['id']}"
        c.mem.write_note(f"channels/{ch['name']}.md", f"#{ch['name']}",
                         f"# #{ch['name']}\n\n- Purpose: {purpose or 'not set'}\n- {c.first} is a member\n"
                         f"- Teammates here: {', '.join(mates) or 'none of the known teammates'}\n"
                         f"- The Peer {'is in this channel and can answer here' if peer_in else 'is not in this channel'}\n"
                         f"- Link: {url}",
                         kind="channel", summary=f"{purpose[:80] or 'Slack channel'}; teammates: {', '.join(x.split()[0] for x in mates) or '-'}",
                         sources=[{"title": f"#{ch['name']} in Slack", "url": url, "date": today()}])
        c.line(f"#{ch['name']}: {purpose[:70] or 'no purpose set'}" + (f" ({len(mates)} teammates)" if mates else ""))
    c.run.learned("Slack", f"{len(c.channels)} channels", " ".join("#" + x["name"] for x in c.channels[:7]), "Slack")
    return f"{len(c.channels)} channels you are in"


def step_people(c: Ctx) -> str:
    mates = c.colleagues()
    for m in mates:
        shared = [x["name"] for x in c.channels if m["name"] in x["mates"]]
        lines = [f"# {m['name']}", "", f"- Role: {m.get('title', '')}",
                 f"- Where: {m.get('city', '')} ({m.get('tz', '')})", f"- About: {m.get('about', '')}",
                 f"- Email: {m.get('email', '')}"]
        srcs = [{"title": "Company directory", "url": f"directory:person:{m['person_id']}", "date": today()}]
        if m.get("slack_id"):
            lines.append(f"- In Slack; shares {', '.join('#' + s for s in shared) or 'no channels'} with {c.first}")
            srcs.append({"title": "Slack", "url": f"slack:user:{m['slack_id']}", "date": today()})
        c.mem.write_note(f"people/{m['person_id']}.md", m["name"], "\n".join(lines), kind="person",
                         summary=f"{m.get('title', '')}, {m.get('city', '')}", sources=srcs)
        c.store.upsert_person(m["person_id"], name=m["name"], email=m.get("email"), tz=m.get("tz"), role=m.get("title"),
                              slack_id=m.get("slack_id"))
        c.line(f"{m['name']}, {m.get('title', '')}" + (f": {len(shared)} shared channels" if shared else ""))
    c.run.learned("People", f"{len(mates)} people you work with", ", ".join(f"{m['name'].split()[0]} ({m.get('title', '')})" for m in mates[:3]), "Directory + Slack")
    return f"{len(mates)} people"


def step_docs(c: Ctx) -> str:
    raise NotConnected("Docs come from Google; not connected yet")


def step_calendar(c: Ctx) -> str:
    raise NotConnected("Calendar comes from Google; not connected yet")


def step_finish(c: Ctx) -> str:
    kw = sorted(k for k in c.keywords if k and len(k) > 2)
    (c.st.owner_dir / "keywords.json").write_text(json.dumps(kw, indent=1, ensure_ascii=False))
    c.mem.rebuild_index()
    n = len(list((c.st.owner_dir).glob("**/*.md")))
    c.line(f"Memory ready: {n} files, {len(kw)} topic words. Your Peer is ready.")
    return f"{n} memory files"


STEPS: list[Step] = [
    Step("profile", "Your profile", step_profile),
    Step("team", "Your team", step_team),
    Step("github", "Repos and services you own", step_github),
    Step("projects", "Your projects and their status", step_projects),
    Step("slack", "Slack channels", step_slack),
    Step("people", "People you work with", step_people),
    Step("docs", "Docs", step_docs),
    Step("calendar", "Calendar", step_calendar),
    Step("finish", "Ready", step_finish),
]


def register_step(step: Step, before: str = "finish", replace: str | None = None) -> None:
    """Add (or replace) a discovery step. WP3: register_step(Step("docs", "Docs", fn), replace="docs")."""
    keys = [s.key for s in STEPS]
    if replace and replace in keys:
        STEPS[keys.index(replace)] = step
    else:
        STEPS.insert(keys.index(before) if before in keys else len(STEPS), step)


_running = threading.Lock()


def discover(st: Settings, progress: Progress | None = print, ai: bool = True) -> dict:
    """Run every step in order. Raises RuntimeError if a discovery is already running for this process."""
    if not _running.acquire(blocking=False):
        raise RuntimeError("a discovery is already running")
    try:
        steps = list(STEPS)
        run = SetupRun(st, steps, echo=progress)
        c = Ctx(st, run, ai)
        for s in steps:
            c.key = s.key
            run.status(s.key, "running")
            try:
                detail = s.fn(c)
                run.status(s.key, "done", detail)
            except NotConnected as e:
                run.status(s.key, "not_connected", str(e))
                if progress:
                    progress(f"{s.label}: {e}")
            except Exception as e:  # noqa: BLE001  (one source failing must not stop the others)
                run.line(s.key, f"Problem: {str(e)[:160]}")
                run.status(s.key, "failed", str(e)[:160])
                if s.key in ("profile",):
                    run.finish("failed", traceback.format_exc()[-400:])
                    raise
        run.finish("done")
        from ..activity import ActivityLog
        ActivityLog(st.log_path).add("setup", f"Set up {c.first}'s Peer: " + "; ".join(
            f"{x['label']}: {x['detail']}" for x in run.data["steps"] if x["status"] == "done" and x["key"] != "finish"),
            who_asked=c.first, where="setup page", outcome="done",
            sources=[{"title": "Company directory profile", "url": "directory:person:" + c.profile["person_id"], "date": today()}])
        return {"projects": len(c.projects), "summaries": len(c.summaries), "keywords": sorted(c.keywords)}
    finally:
        _running.release()


def discover_in_background(st: Settings, ai: bool = True) -> bool:
    """Start discovery on a thread (the setup page's button). False if one is already running."""
    if _running.locked():
        return False
    threading.Thread(target=lambda: _safe(st, ai), daemon=True, name="discovery").start()
    time.sleep(0.2)
    return True


def _safe(st: Settings, ai: bool) -> None:
    try:
        discover(st, progress=None, ai=ai)
    except Exception:  # noqa: BLE001
        pass


from . import google_steps  # noqa: E402,F401  (WP3: the Docs and Calendar steps, through register_step)
