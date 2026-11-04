"""run_agent(prompt, schema): one short, fresh brain run on Claude Code or Codex (DESIGN §3, D6).

The run reads the memory folder with file tools only and returns JSON. It never posts or
sends anything: the executor does, after the approval gate. Flags come from spikes 1a/1b
(docs/build/evidence/wp1/spikes.md): nothing of the owner's global config leaks in.
"""
from __future__ import annotations

import base64
import copy
import json
import logging
import os
import shutil
import subprocess
import tempfile
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from ..events import now_iso
from ..settings import get_settings

log = logging.getLogger("peer.brain")

READ_ONLY_TOOLS = "Read,Grep,Glob,Skill"


@dataclass
class AgentResult:
    ok: bool
    output: dict | None
    backend: str
    duration_s: float
    error: str | None = None
    usage: dict[str, Any] = field(default_factory=dict)


def strict_schema(schema: dict) -> dict:
    """Codex needs strict schemas: every object closed, every property required."""
    s = copy.deepcopy(schema)

    def walk(node: Any) -> None:
        if isinstance(node, dict):
            if node.get("type") == "object" or "properties" in node:
                node.setdefault("additionalProperties", False)
                node["required"] = list(node.get("properties", {}).keys())
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(s)
    return s


def _claude_bin() -> str:
    st = get_settings()
    p = st.path("brain.claude_bin")
    if p.exists():
        return str(p)
    return shutil.which("claude") or "claude"


def _codex_auth_ok() -> tuple[bool, str]:
    """Refuse to run Codex on a copied login near its expiry (a refresh could rotate the owner's main login)."""
    home = get_settings().path("brain.codex_home")
    auth = home / "auth.json"
    if not auth.exists():
        return False, f"no Codex login in {home} (run: CODEX_HOME={home} codex login)"
    if not (home / "AUTH_IS_COPY").exists():
        return True, ""
    try:
        tok = json.loads(auth.read_text())["tokens"]["access_token"].split(".")[1]
        tok += "=" * (-len(tok) % 4)
        exp = json.loads(base64.urlsafe_b64decode(tok))["exp"]
    except Exception:  # noqa: BLE001
        return False, "cannot read the copied Codex login"
    hours = (exp - time.time()) / 3600
    if hours < 24:
        return False, f"copied Codex login expires in {hours:.0f} h; give the Peer its own login"
    return True, ""


def _record(entry: dict) -> None:
    try:
        path = get_settings().owner_dir / "brain-runs.jsonl"
        with path.open("a") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except OSError:
        pass


def _run_claude(prompt: str, schema: dict, timeout: int, effort: str | None = None) -> AgentResult:
    st = get_settings()
    cmd = [
        _claude_bin(), "-p", f"/peer-brain {prompt}",
        "--output-format", "stream-json", "--verbose",
        "--json-schema", json.dumps(schema),
        "--setting-sources", "project",
        "--settings", json.dumps({"autoMemoryEnabled": False, "disableAllHooks": True}),
        "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}',
        "--tools", READ_ONLY_TOOLS, "--allowedTools", READ_ONLY_TOOLS,
        "--permission-mode", "dontAsk",
        "--model", st.get("brain.claude_model", "opus"),
        "--no-session-persistence",
    ]
    effort = effort or st.get("brain.claude_effort")
    if effort:
        cmd += ["--effort", str(effort)]
    env = {k: v for k, v in os.environ.items() if k not in ("ANTHROPIC_API_KEY", "CLAUDECODE")}
    env.update({"CLAUDE_NO_IDLE_PING": "1", "DISABLE_AUTOUPDATER": "1"})
    t0 = time.time()
    try:
        proc = subprocess.run(cmd, cwd=st.owner_dir, env=env, stdin=subprocess.DEVNULL,
                              capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return AgentResult(False, None, "claude", time.time() - t0, f"timeout after {timeout}s")
    usage: dict[str, Any] = {}
    output = None
    error = None
    for line in proc.stdout.splitlines():
        if not line.startswith("{"):
            continue
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        if ev.get("type") == "rate_limit_event":
            info = ev.get("rate_limit_info", {})
            usage["rate_limit_status"] = info.get("status")
            win = (info.get("unifiedWindows") or {}).get("seven_day") or {}
            if "utilization" in win:
                usage["weekly_utilization"] = win["utilization"]
        if ev.get("type") == "result":
            usage.update({"cost_usd_list": ev.get("total_cost_usd"), "duration_api_ms": ev.get("duration_api_ms"),
                          "num_turns": ev.get("num_turns")})
            if ev.get("is_error") or ev.get("subtype") != "success":
                error = f"{ev.get('subtype')}: {str(ev.get('result'))[:300]}"
            output = ev.get("structured_output")
    if output is None and not error:
        error = f"exit {proc.returncode}; no structured output; stderr: {proc.stderr[-300:]}"
    return AgentResult(output is not None and not error, output, "claude", time.time() - t0, error, usage)


def _run_codex(prompt: str, schema: dict, timeout: int, effort: str | None = None) -> AgentResult:
    st = get_settings()
    ok, why = _codex_auth_ok()
    if not ok:
        return AgentResult(False, None, "codex", 0.0, why)
    home = st.path("brain.codex_home")
    (home / "home").mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp(prefix="peer-codex-"))
    schema_file, out_file = tmp / "schema.json", tmp / "out.json"
    schema_file.write_text(json.dumps(strict_schema(schema)))
    cmd = [st.get("brain.codex_bin", "codex"), "exec", f"$peer-brain {prompt}",
           "--output-schema", str(schema_file), "--sandbox", "read-only", "--ephemeral",
           "--skip-git-repo-check", "-C", str(st.owner_dir), "-o", str(out_file), "--json"]
    if st.get("brain.codex_model"):
        cmd += ["-m", st.get("brain.codex_model")]
    if effort:
        cmd += ["-c", f'model_reasoning_effort="{effort}"']   # max and xhigh both work on 0.153.4
    env = {k: v for k, v in os.environ.items() if k not in ("OPENAI_API_KEY",)}
    env.update({"HOME": str(home / "home"), "CODEX_HOME": str(home)})
    t0 = time.time()
    try:
        proc = subprocess.run(cmd, cwd=st.owner_dir, env=env, stdin=subprocess.DEVNULL,
                              capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return AgentResult(False, None, "codex", time.time() - t0, f"timeout after {timeout}s")
    usage: dict[str, Any] = {}
    error = None
    for line in proc.stdout.splitlines():
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        if ev.get("type") == "turn.completed":
            usage.update(ev.get("usage", {}))
        if ev.get("type") in ("turn.failed", "error"):
            error = str(ev.get("error") or ev.get("message"))[:300]
    output = None
    if out_file.exists():
        try:
            output = json.loads(out_file.read_text())
        except json.JSONDecodeError as e:
            error = error or f"bad JSON from codex: {e}"
    if output is None and not error:
        error = f"exit {proc.returncode}; no output; stderr: {proc.stderr[-300:]}"
    shutil.rmtree(tmp, ignore_errors=True)
    return AgentResult(output is not None and not error, output, "codex", time.time() - t0, error, usage)


BACKENDS = {"claude": _run_claude, "codex": _run_codex}


def run_agent(prompt: str, schema: dict, *, backend: str | None = None, label: str = "",
              timeout: int | None = None, fallback: bool | None = None, effort: str | None = None) -> AgentResult:
    st = get_settings()
    primary = backend or st.get("brain.backend", "claude")
    timeout = timeout or int(st.get("brain.timeout_s", 240))
    fallback = st.get("brain.fallback", True) if fallback is None else fallback
    run_id = uuid.uuid4().hex[:8]
    res = BACKENDS[primary](prompt, schema, timeout, effort)
    _record({"at": now_iso(), "run": run_id, "label": label, "backend": res.backend, "ok": res.ok,
             "duration_s": round(res.duration_s, 1), "error": res.error, **res.usage})
    if not res.ok and fallback:
        other = "codex" if primary == "claude" else "claude"
        log.warning("brain %s failed (%s); falling back to %s", primary, res.error, other)
        res2 = BACKENDS[other](prompt, schema, timeout, effort)
        _record({"at": now_iso(), "run": run_id, "label": label + " (fallback)", "backend": res2.backend,
                 "ok": res2.ok, "duration_s": round(res2.duration_s, 1), "error": res2.error, **res2.usage})
        if res2.ok:
            return res2
    return res
