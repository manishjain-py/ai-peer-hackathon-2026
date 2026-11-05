"""Self-tuning (F5) and the owner's scope (F3): rules.md is the owner's preferences in plain English.

- "less of this", "stop telling me about CI failures on drafts", or a 🔕/👎 reaction in the owner's DM:
  the brain's apply_feedback playbook turns it into a plain-English rule (added to rules.md) and,
  when it is about things the Peer pushes, a mute filter (tuning.json) the program checks before it
  tells the owner anything. The Peer confirms in one line. Undo on the settings page or "undo" in DM.
- Scope text from the settings page is mirrored into rules.md, so every brain run follows it.
"""
from __future__ import annotations

import json
import re
import uuid
from datetime import datetime
from pathlib import Path

from .activity import ActivityLog
from .brain.runner import run_agent
from .brain.schemas import APPLY_FEEDBACK
from .settings import Settings

FEEDBACK_HEAD = "## From your feedback"
SCOPE_HEAD = "## Scope you set"
NEGATIVE_REACTIONS = {"-1", "thumbsdown", "no_bell", "mute", "x", "no_entry_sign", "zzz", "see_no_evil"}
MUTE_FIELDS = ("source", "kind", "conclusion", "draft", "repo", "text_contains")


def _rules(st: Settings) -> Path:
    return st.owner_dir / "rules.md"


def _tuning_file(st: Settings) -> Path:
    return st.owner_dir / "tuning.json"


def mutes(st: Settings) -> list[dict]:
    p = _tuning_file(st)
    try:
        return json.loads(p.read_text()).get("mutes", []) if p.exists() else []
    except ValueError:
        return []


def _save_mutes(st: Settings, items: list[dict]) -> None:
    _tuning_file(st).write_text(json.dumps({"mutes": items}, indent=1, ensure_ascii=False))


def _set_section(text: str, head: str, lines: list[str]) -> str:
    """Replace (or add) one '## ' section of rules.md."""
    pat = re.compile(rf"\n{re.escape(head)}\n[\s\S]*?(?=\n## |\Z)")
    block = f"\n{head}\n\n" + "\n".join(lines) + "\n"
    if pat.search(text):
        return pat.sub(lambda m: block, text)
    return text.rstrip("\n") + "\n" + block


def _feedback_lines(text: str) -> list[str]:
    m = re.search(rf"\n{re.escape(FEEDBACK_HEAD)}\n([\s\S]*?)(?=\n## |\Z)", text)
    return [ln for ln in (m.group(1).splitlines() if m else []) if ln.startswith("- ")]


def sync_scope(st: Settings) -> None:
    from .web.app import ROLES
    p = _rules(st)
    if not p.exists():
        return
    lines = []
    for key, label, _what, default in ROLES:
        on = bool(st.get(f"roles.{key}", True))
        lines.append(f"- {label} ({'on' if on else 'OFF: do not do this'}): {st.get(f'scope.{key}') or default}")
    p.write_text(_set_section(p.read_text(), SCOPE_HEAD, lines))


def is_muted(st: Settings, item: dict) -> dict | None:
    """The first mute whose every set field matches the item, else None. No AI: plain matching."""
    for m in mutes(st):
        f = m.get("filter") or {}
        ok = True
        for k in MUTE_FIELDS:
            want = f.get(k)
            if want is None or want == "":
                continue
            if k == "text_contains":
                hay = f"{item.get('title', '')} {item.get('text', '')}".lower()
                ok = str(want).lower() in hay
            elif k == "draft":
                ok = bool(item.get("draft")) == bool(want)
            elif k == "repo":
                ok = str(want).lower() in str(item.get("repo", "")).lower()
            else:
                ok = str(item.get(k, "")).lower() == str(want).lower()
            if not ok:
                break
        if ok and any(f.get(k) not in (None, "") for k in MUTE_FIELDS):
            return m
    return None


def apply_feedback(st: Settings, text: str, about: dict | None, who: str, via: str = "DM") -> dict:
    """Owner feedback -> a rule in rules.md (+ a mute filter). Returns {is_feedback, confirm, rule, mute}."""
    rules_now = _rules(st).read_text() if _rules(st).exists() else ""
    req = {"playbook": "apply_feedback", "from_owner": True, "feedback": text, "about": about,
           "current_feedback_rules": _feedback_lines(rules_now), "today": datetime.now().strftime("%Y-%m-%d")}
    res = run_agent("apply_feedback " + json.dumps(req, ensure_ascii=False), APPLY_FEEDBACK, label="tune")
    if not res.ok:
        return {"is_feedback": False, "confirm": f"Sorry, I couldn't process that just now ({(res.error or '')[:80]}). Try again in a minute?",
                "error": res.error}
    out = res.output or {}
    if not out.get("is_feedback"):
        return {"is_feedback": False, "confirm": out.get("confirm") or ""}
    date = datetime.now().strftime("%-d %b %Y")
    mid = uuid.uuid4().hex[:6]
    rule = (out.get("rule") or text).strip().rstrip(".") + "."
    line = f"- {rule} (you said “{text.strip()[:120]}” on {date}; id {mid})"
    p = _rules(st)
    cur = p.read_text() if p.exists() else "# Rules\n"
    p.write_text(_set_section(cur, FEEDBACK_HEAD, _feedback_lines(cur) + [line]))
    mute = out.get("mute")
    if mute and any(mute.get(k) not in (None, "") for k in MUTE_FIELDS):
        items = mutes(st)
        items.append({"id": mid, "rule": rule, "said": text, "at": datetime.now().astimezone().isoformat(timespec="seconds"),
                      "filter": {k: mute.get(k) for k in MUTE_FIELDS}})
        _save_mutes(st, items)
    else:
        mute = None
    confirm = (out.get("confirm") or f"Got it: {rule}").strip()
    ActivityLog(st.log_path).add("tuned", f"Learned from {who}: {rule}", who_asked=who, where=via,
                                 said=confirm + (f"\nFilter: {json.dumps(mute, ensure_ascii=False)}" if mute else ""),
                                 outcome="done", sources=[{"title": "rules.md", "url": f"file://{p}", "date": datetime.now().strftime('%Y-%m-%d')}],
                                 extra={"feedback": text, "about": about, "rule_id": mid})
    return {"is_feedback": True, "confirm": confirm, "rule": rule, "mute": mute, "id": mid}


def undo(st: Settings, rule_id: str | None = None, who: str = "the owner") -> str | None:
    """Remove a feedback rule (the newest if no id) and its mute. Returns the rule removed."""
    p = _rules(st)
    cur = p.read_text() if p.exists() else ""
    lines = _feedback_lines(cur)
    if not lines:
        return None
    target = next((ln for ln in lines if rule_id and f"id {rule_id})" in ln), None) if rule_id else lines[-1]
    if not target:
        return None
    rid = re.search(r"id ([0-9a-f]{6})\)", target)
    p.write_text(_set_section(cur, FEEDBACK_HEAD, [ln for ln in lines if ln != target] or ["- (none yet)"]))
    if rid:
        _save_mutes(st, [m for m in mutes(st) if m.get("id") != rid.group(1)])
    ActivityLog(st.log_path).add("tuned", f"{who} undid a rule: {target[2:120]}", who_asked=who, outcome="done")
    return target[2:]
