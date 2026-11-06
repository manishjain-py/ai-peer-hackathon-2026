"""The warm session (D7): one long-lived brain process for a meeting's length.

The one exception to D6's fresh runs. It keeps `_run_claude`'s isolation (the pinned binary, project
settings only, hooks and auto-memory off, no MCP servers, read-only tools, dontAsk, no session
persistence, no ANTHROPIC_API_KEY or CLAUDECODE in the environment) and adds
`--input-format stream-json --include-partial-messages`: the process stays up, is primed once with a
compact fact pack, and answers one question at a time in plain text (a `--json-schema` answer would
arrive only at the end of the turn). Claude only; a Codex owner gets fresh runs (slower).

The answer comes back in a small line format the program parses:
    SAY: <what to say aloud>
    CERTAINTY: high|medium|low
    AS_OF: <date>
    FLAG: yes|no
    SOURCES: <title> | <url> | <date> ;; ...
"""
from __future__ import annotations

import json
import logging
import os
import queue
import re
import subprocess
import threading
import time
from typing import Any, Callable

from ..events import now_iso
from ..settings import PKG, get_settings
from .runner import _claude_bin, _record

log = logging.getLogger("peer.warm")

TOOLS = "Read,Grep,Glob"
SKILL_FILE = PKG / "brain" / "skills" / "peer-brain" / "SKILL.md"
SENTENCE_END = re.compile(r"[.!?](?=\s|$)")


def playbook(name: str) -> str:
    """One playbook's section of the peer-brain skill (the skill stays the one home of the playbooks)."""
    text = SKILL_FILE.read_text()
    m = re.search(rf"^### {re.escape(name)}\n(.*?)(?=^### |\Z)", text, flags=re.S | re.M)
    return m.group(1).strip() if m else ""


def prime_text(owner_first: str, pack: str) -> str:
    return (f"You are the brain of {owner_first}'s AI Peer, a labelled AI teammate, in a live meeting. "
            f"Playbook answer_live (from the peer-brain skill):\n\n{playbook('answer_live')}\n\n"
            f"# Fact pack (built just before the meeting)\n\n{pack}\n\nReply only READY.")


def question_text(speaker: str, words: str, maybe: bool = False) -> str:
    if maybe:
        return f'Said in the meeting by {speaker} (maybe for the Peer): "{words}"'
    return f'Said in the meeting by {speaker}, put to the Peer: "{words}"'


def parse_answer(text: str) -> dict:
    """The line format above -> {say, certainty, as_of, flag, sources}. Lenient: a bare answer is all SAY."""
    out: dict[str, Any] = {"say": "", "certainty": "low", "as_of": "", "flag": False, "sources": []}
    fields = {"SAY", "CERTAINTY", "AS_OF", "FLAG", "SOURCES"}
    cur = None
    buf: dict[str, list[str]] = {}
    for raw in (text or "").splitlines():
        m = re.match(r"\s*\**\s*([A-Z_]+)\s*\**\s*:\s*(.*)$", raw)
        if m and m.group(1) in fields:
            cur = m.group(1)
            buf.setdefault(cur, []).append(m.group(2))
        elif cur:
            buf[cur].append(raw)
    if not buf:
        out["say"] = (text or "").strip()
        return out
    out["say"] = " ".join(x.strip() for x in buf.get("SAY", []) if x.strip())
    c = " ".join(buf.get("CERTAINTY", [])).strip().lower()
    out["certainty"] = next((w for w in ("high", "medium", "low") if w in c), "low")
    out["as_of"] = " ".join(buf.get("AS_OF", [])).strip()
    out["flag"] = " ".join(buf.get("FLAG", [])).strip().lower().startswith("y")
    for part in " ".join(buf.get("SOURCES", [])).split(";;"):
        bits = [b.strip() for b in part.split("|")]
        if bits and bits[0] and bits[0].lower() not in ("none", "-", "n/a"):
            out["sources"].append({"title": bits[0], "url": bits[1] if len(bits) > 1 else "",
                                   "date": bits[2] if len(bits) > 2 else ""})
    return out


class WarmSession:
    def __init__(self, *, effort: str | None = None, model: str | None = None, tools: str = TOOLS,
                 label: str = "meeting"):
        st = get_settings()
        self.st = st
        self.effort = effort or st.get("meetings.live_effort") or st.get("brain.claude_effort", "high")
        self.model = model or st.get("meetings.live_model") or st.get("brain.claude_model", "opus")
        self.tools = tools
        self.label = label
        self.proc: subprocess.Popen | None = None
        self.q: queue.Queue = queue.Queue()
        self.stderr_tail: list[str] = []
        self._lock = threading.Lock()
        self.turns = 0

    # -- process ------------------------------------------------------------------------------
    def start(self, prime: str, timeout: float = 180) -> dict:
        cmd = [
            _claude_bin(), "-p",
            "--input-format", "stream-json", "--output-format", "stream-json", "--verbose",
            "--include-partial-messages",
            "--setting-sources", "project",
            "--settings", json.dumps({"autoMemoryEnabled": False, "disableAllHooks": True}),
            "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}',
            "--tools", self.tools, "--allowedTools", self.tools,
            "--permission-mode", "dontAsk",
            "--model", str(self.model),
            "--no-session-persistence",
        ]
        if self.effort:
            cmd += ["--effort", str(self.effort)]
        env = {k: v for k, v in os.environ.items() if k not in ("ANTHROPIC_API_KEY", "CLAUDECODE")}
        env.update({"CLAUDE_NO_IDLE_PING": "1", "DISABLE_AUTOUPDATER": "1"})
        self.proc = subprocess.Popen(cmd, cwd=self.st.owner_dir, env=env, stdin=subprocess.PIPE,
                                     stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        threading.Thread(target=self._read_out, daemon=True, name="warm-out").start()
        threading.Thread(target=self._read_err, daemon=True, name="warm-err").start()
        r = self.ask(prime, timeout=timeout, kind="prime")
        log.info("warm session up (pid %s, %s, effort %s) in %.1fs", self.proc.pid, self.model, self.effort, r["total_s"])
        return r

    def _read_out(self) -> None:
        assert self.proc and self.proc.stdout
        for line in self.proc.stdout:
            line = line.strip()
            if not line.startswith("{"):
                continue
            try:
                self.q.put(json.loads(line))
            except json.JSONDecodeError:
                continue
        self.q.put({"type": "_eof"})

    def _read_err(self) -> None:
        assert self.proc and self.proc.stderr
        for line in self.proc.stderr:
            self.stderr_tail = (self.stderr_tail + [line.rstrip()])[-20:]

    def alive(self) -> bool:
        return bool(self.proc and self.proc.poll() is None)

    def close(self) -> None:
        if not self.proc:
            return
        try:
            if self.proc.stdin:
                self.proc.stdin.close()
            self.proc.wait(timeout=10)
        except Exception:  # noqa: BLE001
            self.proc.kill()
        self.proc = None

    # -- one question at a time -----------------------------------------------------------------------
    def ask(self, text: str, *, timeout: float = 90, kind: str = "question",
            on_say: Callable[[str], None] | None = None) -> dict:
        """Send one user turn; return {text, first_token_s, first_sentence_s, say_ready_s, total_s, tools, ok}.
        on_say(say_text) fires once, as soon as the SAY part is complete (before the metadata lines)."""
        if not self.alive():
            return {"ok": False, "error": "warm session is not running", "text": "", "total_s": 0.0}
        with self._lock:
            while not self.q.empty():   # nothing stale from an earlier turn
                self.q.get_nowait()
            t0 = time.time()
            msg = {"type": "user", "message": {"role": "user", "content": text}}
            assert self.proc and self.proc.stdin
            self.proc.stdin.write(json.dumps(msg, ensure_ascii=False) + "\n")
            self.proc.stdin.flush()
            acc = ""
            first_token = first_sentence = say_ready = None
            tools: list[str] = []
            result: dict = {}
            fired = False
            deadline = t0 + timeout
            while True:
                try:
                    ev = self.q.get(timeout=max(0.1, deadline - time.time()))
                except queue.Empty:
                    return {"ok": False, "error": f"timeout after {timeout}s", "text": acc, "total_s": time.time() - t0,
                            "tools": tools}
                et = ev.get("type")
                if et == "_eof":
                    return {"ok": False, "error": "warm session ended: " + " | ".join(self.stderr_tail[-3:]),
                            "text": acc, "total_s": time.time() - t0, "tools": tools}
                if et == "stream_event":
                    inner = ev.get("event") or {}
                    if inner.get("type") == "content_block_start" and (inner.get("content_block") or {}).get("type") == "tool_use":
                        tools.append(inner["content_block"].get("name", "tool"))
                        acc = ""          # text before a tool call is thinking aloud, not the answer
                        first_token = first_sentence = None
                    if inner.get("type") == "content_block_delta" and (inner.get("delta") or {}).get("type") == "text_delta":
                        acc += inner["delta"]["text"]
                        now = time.time() - t0
                        if first_token is None:
                            first_token = now
                        say = acc.split("SAY:", 1)[-1]
                        if first_sentence is None and SENTENCE_END.search(say.split("\nCERTAINTY", 1)[0]):
                            first_sentence = now
                        if say_ready is None and re.search(r"\n\s*\**\s*CERTAINTY\s*\**\s*:", acc):
                            say_ready = now
                            if on_say and not fired:
                                fired = True
                                on_say(parse_answer(acc)["say"])
                elif et == "result":
                    result = ev
                    break
            total = time.time() - t0
            self.turns += 1
            text_out = str(result.get("result") or acc)
            if on_say and not fired:
                on_say(parse_answer(text_out)["say"])
            usage = result.get("usage") or {}
            _record({"at": now_iso(), "run": f"warm-{self.label}-{self.turns}", "label": f"warm:{kind}", "backend": "claude",
                     "ok": result.get("subtype") == "success", "duration_s": round(total, 1),
                     "model": self.model, "effort": self.effort, "tools": tools,
                     "cost_usd_list": result.get("total_cost_usd"), "duration_api_ms": result.get("duration_api_ms"),
                     "input_tokens": usage.get("input_tokens"), "cache_read": usage.get("cache_read_input_tokens"),
                     "output_tokens": usage.get("output_tokens")})
            return {"ok": result.get("subtype") == "success", "text": text_out,
                    "first_token_s": first_token, "first_sentence_s": first_sentence,
                    "say_ready_s": say_ready or total, "total_s": total, "tools": tools,
                    "cost_usd_list": result.get("total_cost_usd")}
