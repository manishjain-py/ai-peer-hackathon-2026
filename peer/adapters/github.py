"""GitHub adapter: read-only. Repos, files (trackers, docs), PRs, issues, CI runs.

Read-only is enforced in code: the client has only a GET method. (The token in
~/.ai-peer/.env may carry write scopes; the Peer never uses them.)
"""
from __future__ import annotations

import base64
import os
import subprocess
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

from ..events import Event, now_iso
from ..settings import secret
from .base import Adapter

API = "https://api.github.com"


def _token() -> str | None:
    tok = secret("GITHUB_TOKEN")
    if tok:
        return tok
    try:  # dev fallback: the gh CLI login (still GET-only here)
        return subprocess.run(["gh", "auth", "token"], capture_output=True, text=True, timeout=10).stdout.strip() or None
    except Exception:
        return None


class ReadOnlyGitHub:
    """A GitHub client that can only GET."""

    def __init__(self, token: str | None = None):
        self._client = httpx.Client(
            base_url=API, timeout=30,
            headers={"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28",
                     "User-Agent": "ai-peer", **({"Authorization": f"Bearer {token}"} if token else {})})
        self._etags: dict[str, tuple[str, Any]] = {}

    def get(self, path: str, params: dict | None = None, raw: bool = False) -> Any:
        key = path + "?" + "&".join(f"{k}={v}" for k, v in sorted((params or {}).items()))
        headers = {}
        if raw:
            headers["Accept"] = "application/vnd.github.raw"
        cached = self._etags.get(key)
        if cached:
            headers["If-None-Match"] = cached[0]
        r = self._client.get(path, params=params, headers=headers)
        if r.status_code == 304 and cached:
            return cached[1]       # costs no rate limit
        r.raise_for_status()
        body = r.text if raw else r.json()
        if r.headers.get("ETag"):
            self._etags[key] = (r.headers["ETag"], body)
        return body

    def rate(self) -> dict:
        return self.get("/rate_limit")["resources"]["core"]


def _parse_ref(ref: str) -> tuple[str, str]:
    # github:<kind>:<rest>
    _, kind, rest = ref.split(":", 2)
    return kind, rest


class GitHubAdapter(Adapter):
    name = "github"
    capabilities = frozenset({"sense", "search", "get"})   # no act: read-only

    def __init__(self, repos: list[str]):
        self.repos = repos
        self.gh = ReadOnlyGitHub(_token())

    @classmethod
    def from_settings(cls, st) -> "GitHubAdapter":
        import json
        profile = json.loads(st.profile_path().read_text())
        return cls([r["repo"] for r in profile.get("owns", {}).get("repos", [])])

    # helpers used by discovery -------------------------------------------------
    def repo(self, repo: str) -> dict:
        return self.gh.get(f"/repos/{repo}")

    def list_dir(self, repo: str, path: str = "", ref: str | None = None) -> list[dict]:
        try:
            out = self.gh.get(f"/repos/{repo}/contents/{path}", params={"ref": ref} if ref else None)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return []
            raise
        return out if isinstance(out, list) else [out]

    def file_text(self, repo: str, path: str, ref: str | None = None) -> str | None:
        try:
            return self.gh.get(f"/repos/{repo}/contents/{path}", params={"ref": ref} if ref else None, raw=True)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            raise

    def last_commit(self, repo: str, path: str) -> dict | None:
        out = self.gh.get(f"/repos/{repo}/commits", params={"path": path, "per_page": 1})
        return out[0] if out else None

    def pulls(self, repo: str, state: str = "all", n: int = 15) -> list[dict]:
        return self.gh.get(f"/repos/{repo}/pulls", params={"state": state, "sort": "updated",
                                                            "direction": "desc", "per_page": n})

    def runs(self, repo: str, n: int = 10, branch: str | None = None) -> list[dict]:
        params: dict = {"per_page": n}
        if branch:
            params["branch"] = branch
        return self.gh.get(f"/repos/{repo}/actions/runs", params=params).get("workflow_runs", [])

    def blob_url(self, repo: str, path: str, ref: str = "main") -> str:
        return f"https://github.com/{repo}/blob/{ref}/{path}"

    # contract ---------------------------------------------------------------------
    def sense(self, cursor: str | None) -> tuple[list[Event], str | None]:
        since = cursor or (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(timespec="seconds")
        events: list[Event] = []
        for repo in self.repos:
            for pr in self.pulls(repo, n=20):
                if pr["updated_at"] <= since:
                    continue
                state = "merged" if pr.get("merged_at") else pr["state"]
                events.append(Event(
                    id=f"github:pr:{repo}#{pr['number']}:{pr['updated_at']}", source="github", kind="pr",
                    at=pr["updated_at"], actor=pr["user"]["login"], ref=f"github:pr:{repo}#{pr['number']}",
                    thread_ref=f"github:pr:{repo}#{pr['number']}",
                    text=f"PR #{pr['number']} {pr['title']} ({state}{', draft' if pr.get('draft') else ''})",
                    url=pr["html_url"], extra={"repo": repo, "state": state, "draft": pr.get("draft")}))
            for run in self.runs(repo, n=10):
                if (run.get("updated_at") or "") <= since or run.get("status") != "completed":
                    continue
                events.append(Event(
                    id=f"github:run:{repo}:{run['id']}", source="github", kind="ci", at=run["updated_at"],
                    actor=(run.get("actor") or {}).get("login"), ref=f"github:run:{repo}:{run['id']}",
                    thread_ref=None,
                    text=f"CI {run.get('name')} on {run.get('head_branch')}: {run.get('conclusion')}",
                    url=run["html_url"], extra={"repo": repo, "conclusion": run.get("conclusion"),
                                                "branch": run.get("head_branch")}))
        return events, now_iso()

    def search(self, query: str, filters: dict | None = None) -> list[dict]:
        repos = (filters or {}).get("repos") or self.repos
        q = query + "".join(f" repo:{r}" for r in repos)
        res = self.gh.get("/search/code", params={"q": q, "per_page": 10})
        return [{"ref": f"github:file:{i['repository']['full_name']}:{i['path']}",
                 "snippet": i["path"], "url": i["html_url"], "title": i["name"]} for i in res.get("items", [])]

    def get(self, ref: str) -> dict:
        kind, rest = _parse_ref(ref)
        if kind == "file":
            repo, path = rest.split(":", 1)
            text = self.file_text(repo, path)
            return {"ref": ref, "repo": repo, "path": path, "text": text, "url": self.blob_url(repo, path)}
        if kind == "pr":
            repo, num = rest.split("#", 1)
            pr = self.gh.get(f"/repos/{repo}/pulls/{num}")
            return {"ref": ref, "title": pr["title"], "body": pr.get("body"), "state": pr["state"],
                    "merged_at": pr.get("merged_at"), "url": pr["html_url"], "user": pr["user"]["login"]}
        if kind == "run":
            repo, run_id = rest.rsplit(":", 1)
            run = self.gh.get(f"/repos/{repo}/actions/runs/{run_id}")
            return {"ref": ref, "name": run.get("name"), "conclusion": run.get("conclusion"),
                    "branch": run.get("head_branch"), "url": run["html_url"]}
        raise ValueError(ref)

    def check(self) -> dict[str, Any]:
        try:
            core = self.gh.rate()
            return {"ok": True, "detail": f"rate {core['remaining']}/{core['limit']}"}
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "detail": str(e)[:120]}
