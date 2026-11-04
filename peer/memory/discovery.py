"""First discovery (WP1): build the memory from the directory profile plus GitHub.

Profile -> me.md, people/. GitHub (read-only) -> services/ (owned services and repos with
recent PRs and CI), sources/ (verbatim tracker copies), projects/ (one per tracker, with an
AI "status in brief" from the brain's summarize_tracker playbook). Then keywords.json (for
the watcher's cheap relevance rules) and INDEX.md. F1 (WP2) puts a page on top of this.
"""
from __future__ import annotations

import json
import re
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
from typing import Callable

import yaml

from ..adapters.directory import DirectoryAdapter
from ..adapters.github import GitHubAdapter
from ..brain.runner import run_agent
from ..brain.schemas import SUMMARIZE_TRACKER
from ..settings import PKG, Settings
from ..store import Store
from .layout import Memory, slug

MAX_SOURCE_BYTES = 120_000
Progress = Callable[[str], None]


def _date(iso: str | None) -> str:
    return (iso or "")[:10]


def load_world() -> dict:
    return yaml.safe_load((PKG / "scenarios" / "world.yaml").read_text())


def _expand(gh: GitHubAdapter, repo: str, pattern: str) -> list[str]:
    """Expand a path pattern with '*' as one folder segment."""
    parts = pattern.split("/")
    paths = [""]
    for i, part in enumerate(parts):
        last = i == len(parts) - 1
        nxt = []
        for base in paths:
            if part == "*":
                for item in gh.list_dir(repo, base):
                    if item["type"] == "dir":
                        nxt.append(item["path"])
            else:
                p = f"{base}/{part}" if base else part
                if last:
                    nxt.append(p)
                else:
                    nxt.append(p)
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
    t = re.sub(r":\s*(state|tracker|the state|status)$", "", t, flags=re.I)
    return t


def discover(st: Settings, progress: Progress = print, ai: bool = True) -> dict:
    mem = Memory(st.owner_dir)
    store = Store(st.db_path)
    world = load_world()
    directory = DirectoryAdapter(st.profile_path(), extra_people=world.get("colleagues", []))
    profile = directory.profile()
    mem.ensure(owner_name=profile.get("preferred_name") or profile.get("name"))
    progress(f"Profile: {profile['name']}, {profile['title']} at {profile['company']} ({profile['tz']})")

    # -- me.md + people -----------------------------------------------------------
    owns = profile.get("owns", {})
    me_body = "\n".join([
        f"# {profile['name']}", "",
        f"- Role: {profile['title']}, {profile['company']} ({profile.get('team', '')})",
        f"- Time zone: {profile['tz']} ({profile.get('location', '')}); working hours "
        f"{profile['working_hours']['start']} to {profile['working_hours']['end']}, {', '.join(profile['working_hours']['days'])}",
        f"- Email: {profile['email']}; GitHub: {profile.get('github')}",
        f"- About: {profile.get('about', '')}", "",
        "## Owns", "",
        *[f"- Repo `{r['repo']}`: {r['what']}" for r in owns.get("repos", [])],
        *[f"- Service `{s['name']}` ({s['repo']}/{s['path']}): {s['what']}" for s in owns.get("services", [])],
        "", "## Interests", "", *[f"- {i}" for i in profile.get("interests", [])],
    ])
    mem.write_note("me.md", profile["name"], me_body, kind="person",
                   summary=f"who {profile.get('preferred_name')} is: role, time zone, what he owns",
                   sources=[{"title": "Directory profile", "url": "directory:person:" + profile["person_id"],
                             "date": datetime.now().strftime("%Y-%m-%d")}])
    store.upsert_person(profile["person_id"], name=profile["name"], email=profile["email"],
                        github=profile.get("github"), tz=profile["tz"], role=profile["title"],
                        extra={"is_owner": True})
    for c in world.get("colleagues", []):
        mem.write_note(f"people/{c['person_id']}.md", c["name"],
                       f"# {c['name']}\n\n- {c['title']}, {c.get('city', '')} ({c['tz']})\n- {c.get('about', '')}\n- Email: {c['email']}",
                       kind="person", summary=f"{c['title']}, {c.get('city', '')}",
                       sources=[{"title": "Directory", "url": f"directory:person:{c['person_id']}",
                                 "date": datetime.now().strftime("%Y-%m-%d")}])
        store.upsert_person(c["person_id"], name=c["name"], email=c["email"], tz=c["tz"], role=c["title"])
    progress(f"People: {len(world.get('colleagues', []))} teammates")

    # -- GitHub -------------------------------------------------------------------------
    repos = [r["repo"] for r in owns.get("repos", [])]
    gh = GitHubAdapter(repos)
    keywords: set[str] = {profile.get("preferred_name", "").lower(), profile["name"].lower()}
    trackers: list[dict] = []
    for r in owns.get("repos", []):
        repo = r["repo"]
        info = gh.repo(repo)
        branch = info.get("default_branch", "main")
        pulls = gh.pulls(repo, n=15)
        runs = gh.runs(repo, n=10, branch=branch)
        found = []
        for pat in r.get("trackers", []):
            found += _expand(gh, repo, pat)
        progress(f"Repo {repo}: {len(pulls)} recent PRs, {len(runs)} CI runs on {branch}, {len(found)} trackers")
        keywords.add(repo.split("/")[-1].lower())
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
            f"# Repo `{repo}`\n\n{r['what']}\n\nDefault branch `{branch}`; last push {_date(info.get('pushed_at'))}."
            f" Link: {info['html_url']}\n\n## Recent pull requests (as of {datetime.now():%Y-%m-%d})\n\n"
            + ("\n".join(pr_lines) or "- none") + f"\n\n## CI on {branch} (latest runs)\n\n" + ("\n".join(run_lines) or "- none")
            + "\n\n## Trackers\n\n" + ("\n".join(f"- {p}" for p in found) or "- none"),
            kind="repo", summary=f"{r['what'][:90]}; recent PRs and CI",
            sources=[{"title": f"{repo} on GitHub", "url": info["html_url"], "date": _date(info.get("pushed_at"))}],
            meta={"repo": repo})
        for p in found:
            trackers.append({"repo": repo, "path": p, "branch": branch, "pulls": pulls})

    for s in owns.get("services", []):
        keywords.add(s["name"].lower())
        url = f"https://github.com/{s['repo']}/tree/main/{s['path']}"
        mem.write_note(f"services/{s['name']}.md", s["name"],
                       f"# Service `{s['name']}`\n\n{s['what']}\n\n- Code: `{s['repo']}` at `{s['path']}/` ({url})\n"
                       f"- Owner: {profile['name']}\n- Recent PRs and CI: see services/repo-{s['repo'].split('/')[-1]}.md",
                       kind="service", summary=s["what"][:100],
                       sources=[{"title": f"{s['name']} code", "url": url, "date": datetime.now().strftime('%Y-%m-%d')}])

    # -- trackers -> sources/ copies + projects/ -------------------------------------------
    projects = []
    for t in trackers:
        repo, path, branch = t["repo"], t["path"], t["branch"]
        folder = path.rsplit("/", 1)[0] if "/" in path else ""
        proj_slug = slug(folder.rsplit("/", 1)[-1] if folder else repo.split("/")[-1] + "-" + Path(path).stem)
        text = gh.file_text(repo, path) or ""
        commit = gh.last_commit(repo, path) or {}
        cdate = ((commit.get("commit") or {}).get("committer") or {}).get("date", "")
        header = {"source": gh.blob_url(repo, path, branch), "repo": repo, "path": path,
                  "commit": (commit.get("sha") or "")[:10], "commit_date": cdate, "fetched": datetime.now().isoformat(timespec="seconds")}
        name = repo.split("/")[-1]
        mem.write_source(f"github/{name}/{path}", text[:MAX_SOURCE_BYTES], header)
        siblings = []
        if folder.startswith("docs/feature-development/") or folder.startswith("docs/projects/"):
            for item in gh.list_dir(repo, folder):
                n = item["name"]
                if item["type"] != "file" or not n.endswith(".md") or n == Path(path).name or n.startswith("HANDOFF") \
                        or n in ("AGENTS.md", "CLAUDE.md"):
                    continue
                body = gh.file_text(repo, item["path"]) or ""
                mem.write_source(f"github/{name}/{item['path']}", body[:MAX_SOURCE_BYTES],
                                 {"source": gh.blob_url(repo, item["path"], branch), "repo": repo, "path": item["path"],
                                  "fetched": datetime.now().isoformat(timespec="seconds")})
                siblings.append({"title": n, "url": gh.blob_url(repo, item["path"], branch), "path": item["path"]})
        title = _title_of(text, proj_slug.replace("-", " ").title())
        projects.append({"slug": proj_slug, "title": title, "repo": repo, "path": path, "branch": branch,
                         "commit": commit, "cdate": cdate, "siblings": siblings, "pulls": t["pulls"],
                         "source_rel": f"sources/github/{name}/{path}"})
        keywords.update({proj_slug.replace("-", " "), title.lower()})
    progress(f"Trackers copied: {len(projects)} projects")

    summaries: dict[str, dict] = {}
    if ai and projects:
        progress(f"Reading {len(projects)} trackers with the brain ({st.get('brain.backend')})...")

        def summarize(p: dict) -> tuple[str, dict | None, str | None]:
            req = {"playbook": "summarize_tracker", "path": p["source_rel"], "project": p["title"], "repo": p["repo"]}
            res = run_agent("summarize_tracker " + json.dumps(req, ensure_ascii=False), SUMMARIZE_TRACKER,
                            label=f"summarize:{p['slug']}")
            return p["slug"], res.output, res.error

        with ThreadPoolExecutor(max_workers=4) as pool:
            for s, out, err in pool.map(summarize, projects):
                if out:
                    summaries[s] = out
                    progress(f"  {s}: {out.get('one_line', '')[:100]}")
                else:
                    progress(f"  {s}: brain failed ({err})")

    for p in projects:
        sm = summaries.get(p["slug"])
        c = p["commit"]
        cmsg = ((c.get("commit") or {}).get("message") or "").splitlines()[0][:100] if c else ""
        tracker_url = f"https://github.com/{p['repo']}/blob/{p['branch']}/{p['path']}"
        terms = {p["slug"].replace("-", " ")} | {a.lower() for a in (sm or {}).get("aliases", [])}
        related = [pr for pr in p["pulls"] if any(t and t in (pr["title"] + " " + pr["head"]["ref"]).lower() for t in terms)]
        lines = [f"# {p['title']}", "",
                 f"- Repo: `{p['repo']}`; tracker: [{p['path']}]({tracker_url})",
                 f"- Tracker last changed: {p['cdate'][:16].replace('T', ' ')} UTC (commit {(c.get('sha') or '')[:10]}: {cmsg})", ""]
        if sm:
            keywords.update(a.lower() for a in sm.get("aliases", []))
            lines += [f"## Status in brief (as of {sm.get('as_of')})", "",
                      f"- {sm.get('one_line')}",
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
                       meta={"repo": p["repo"], "tracker": p["path"], "aliases": (sm or {}).get("aliases", [])})

    kw = sorted(k for k in keywords if k and len(k) > 2)
    (st.owner_dir / "keywords.json").write_text(json.dumps(kw, indent=1, ensure_ascii=False))
    mem.rebuild_index()
    progress(f"Memory ready: {len(projects)} projects, {len(owns.get('services', []))} services, "
             f"{len(world.get('colleagues', []))} people; {len(kw)} topic keywords. Your Peer is ready.")
    return {"projects": len(projects), "summaries": len(summaries), "keywords": kw}
