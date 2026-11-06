"""port-check (WP5): check every adapter listed under `adapters:` in the settings against the contract
(peer/adapters/base.py, DESIGN §2) and print one table. A company port runs it after writing its adapters:

    .venv/bin/python -m peer port-check [--adapter NAME]

Per adapter: its capabilities, check(), then sense, search, get and act. Each cell is ok, n/a (not
offered), blocked (ok) (a hard block refused the dry-run act), or FAIL, with the seconds it took.
Exit code 1 on any FAIL.

Nothing is written to any system: sense, search and get are read-only by contract, and act runs only
with dry_run=True, on the adapter's own fixed sample (dry_run_sample(), or `sample:` in its entry).
Local work (peer/localwork.py) is a plug-in, not an adapter, and is not checked here: its intake deletes
the shared spool files and its scan writes memory.
"""
from __future__ import annotations

import importlib
import importlib.util
import json
import re
import time
from dataclasses import dataclass

from .adapters.base import Adapter, Blocked, NotOffered
from .events import Event
from .settings import Settings

CAP = re.compile(r"^(sense|search|get|act:[a-z][a-z0-9_]*)$")
VERBS = ("sense", "search", "get")


@dataclass
class Cell:
    status: str              # ok | n/a | blocked | FAIL | - (not run)
    note: str = ""
    secs: float | None = None

    def text(self) -> str:
        if self.status == "FAIL":
            return "FAIL" + (f" {self.secs:.1f}s" if self.secs is not None else "")
        s = "blocked (ok)" if self.status == "blocked" else self.status
        if self.note:
            s += f" {self.note}"
        if self.secs is not None:
            s += f" {self.secs:.1f}s"
        return s


def _err(e: BaseException) -> str:
    return f"{type(e).__name__}: {str(e)[:160]}"


def _query(st: Settings, entry: dict) -> str:
    if entry.get("query"):
        return str(entry["query"])
    try:
        p = json.loads(st.profile_path().read_text())
        return p.get("preferred_name") or p["name"].split()[0]
    except Exception:  # noqa: BLE001
        return "test"


def _blocked(e: BaseException, entry: dict) -> bool:
    names = set(entry.get("blocked_by") or [])
    return isinstance(e, Blocked) or any(c.__name__ in names for c in type(e).__mro__)


def check_one(st: Settings, key: str, entry: dict) -> dict:
    """One adapter's row: {adapter, state, cells{caps, check, sense, search, get, act}, details[], capabilities[]}."""
    row = {"adapter": key, "state": "checked", "cells": {}, "details": [], "capabilities": []}
    cells, details = row["cells"], row["details"]

    def fail_row(state: str, why: str) -> dict:
        row["state"] = state
        details.append(why)
        return row

    if entry.get("enabled", True) is False:
        row["state"] = "off (enabled: false in its adapters entry)"
        return row
    module, cls_name = entry.get("module"), entry.get("class")
    if not module or not cls_name:
        return fail_row("FAIL", "its adapters entry needs `module:` and `class:`")
    try:
        spec = importlib.util.find_spec(module)
    except ModuleNotFoundError:
        spec = None
    if spec is None:
        if entry.get("pending"):
            row["state"] = f"not on main yet ({entry['pending']})"
            return row
        return fail_row("FAIL", f"no module {module}")
    try:
        cls = getattr(importlib.import_module(module), cls_name)
    except Exception as e:  # noqa: BLE001
        return fail_row("FAIL", f"import {module}.{cls_name}: {_err(e)}")
    if not (isinstance(cls, type) and issubclass(cls, Adapter)):
        return fail_row("FAIL", f"{module}.{cls_name} must subclass peer.adapters.base.Adapter")
    t0 = time.time()
    try:
        ad = cls.from_settings(st)
    except Exception as e:  # noqa: BLE001
        return fail_row("FAIL", f"cannot start ({time.time() - t0:.1f}s): {_err(e)}")

    # capabilities
    caps = sorted(ad.capabilities or [])
    row["capabilities"] = caps
    bad = [c for c in caps if not isinstance(c, str) or not CAP.match(c)]
    if bad:
        cells["caps"] = Cell("FAIL")
        details.append(f"caps: not a capability: {bad} (use sense, search, get, act:<action>)")
    else:
        cells["caps"] = Cell("ok", str(len(caps)))

    # check()
    t0 = time.time()
    try:
        h = ad.check()
        ok = bool(h.get("ok"))
        cells["check"] = Cell("ok" if ok else "FAIL", secs=time.time() - t0)
        if h.get("detail"):
            details.append(f"check: {str(h['detail'])[:160]}")
    except Exception as e:  # noqa: BLE001
        cells["check"] = Cell("FAIL", secs=time.time() - t0)
        details.append(f"check: {_err(e)}")

    def run(verb: str, fn, judge) -> object:
        """Run one verb; judge(out) -> (status, note). Returns the output (None if it did not run or failed)."""
        if verb not in caps:
            cells[verb] = Cell("n/a", "(not declared)")
            return None
        t0 = time.time()
        try:
            out = fn()
        except NotOffered:
            cells[verb] = Cell("FAIL", secs=time.time() - t0)
            details.append(f"{verb}: declared in capabilities but raised NotOffered")
            return None
        except Exception as e:  # noqa: BLE001
            cells[verb] = Cell("FAIL", secs=time.time() - t0)
            details.append(f"{verb}: {_err(e)}")
            return None
        status, note = judge(out)
        cells[verb] = Cell(status, note if status != "FAIL" else "", time.time() - t0)
        if status == "FAIL":
            details.append(f"{verb}: {note}")
            return None
        return out

    def judge_sense(out) -> tuple[str, str]:
        if not (isinstance(out, tuple) and len(out) == 2 and isinstance(out[0], list)):
            return "FAIL", "must return (events: list[Event], next_cursor: str | None)"
        evs, cur = out
        if cur is not None and not isinstance(cur, str):
            return "FAIL", f"next_cursor must be a string or None, got {type(cur).__name__}"
        for e in evs:
            if not isinstance(e, Event):
                return "FAIL", f"an event is a {type(e).__name__}, not peer.events.Event"
            missing = [f for f in ("id", "source", "kind", "at", "ref") if not getattr(e, f, None)]
            if missing or not isinstance(e.text, str):
                return "FAIL", f"event {str(e.id)[:60]} lacks {missing or ['text']}"
        return "ok", f"{len(evs)} ev"

    def judge_search(out) -> tuple[str, str]:
        if not isinstance(out, list):
            return "FAIL", "must return a list of {ref, snippet, url, ...}"
        for h in out:
            if not (isinstance(h, dict) and isinstance(h.get("ref"), str) and h["ref"]):
                return "FAIL", "every hit needs a string `ref` (get() takes it back)"
        return "ok", f"{len(out)} hits"

    sensed = run("sense", lambda: ad.sense(None), judge_sense)
    query = _query(st, entry)
    hits = run("search", lambda: ad.search(query), judge_search)
    if "search" in caps:
        details.append(f"search: query {query!r}")

    # get(): a ref the adapter gave itself (the first search hit, else the first sensed event)
    ref = (hits[0]["ref"] if hits else None) or (sensed[0][0].ref if sensed and sensed[0] else None)
    if "get" in caps and not ref:
        cells["get"] = Cell("n/a", "(nothing to get)")
    else:
        run("get", lambda: ad.get(ref),
            lambda out: ("ok", "" if out else "(empty)") if isinstance(out, dict) else ("FAIL", "must return a dict"))

    # act(): the adapter's own fixed sample, dry run only
    acts = [c.split(":", 1)[1] for c in caps if c.startswith("act:")]
    if not acts:
        cells["act"] = Cell("n/a", "(no act)")
        return row
    sample = ad.dry_run_sample() or entry.get("sample")
    if not sample:
        cells["act"] = Cell("FAIL")
        details.append("act: no dry-run sample: add dry_run_sample() to the adapter or `sample:` to its adapters entry")
        return row
    action, payload = sample.get("action"), dict(sample.get("payload") or {})
    target = sample.get("target", "")
    if not ad.offers(str(action)):
        cells["act"] = Cell("FAIL")
        details.append(f"act: the sample's action {action!r} is not in capabilities")
        return row
    if sample.get("target_from_search"):   # a live target: the first hit of a fixed query with a fixed prefix
        try:
            found = [h["ref"] for h in ad.search(str(sample["target_from_search"]))
                     if str(h.get("ref", "")).startswith(str(sample.get("target_prefix", "")))]
        except Exception as e:  # noqa: BLE001
            cells["act"] = Cell("FAIL")
            details.append(f"act: finding a target: {_err(e)}")
            return row
        if not found:
            cells["act"] = Cell("n/a", "(nothing to act on)")
            return row
        target = found[0]
    t0 = time.time()
    try:
        out = ad.act(str(action), str(target), payload, f"port-check:{key}:{action}", dry_run=True)
    except NotOffered:
        cells["act"] = Cell("FAIL", secs=time.time() - t0)
        details.append(f"act: {action} is declared but raised NotOffered")
        return row
    except Exception as e:  # noqa: BLE001
        if _blocked(e, entry):
            cells["act"] = Cell("blocked", action, time.time() - t0)
            details.append(f"act: {action} refused by a hard block: {str(e)[:140]}")
        else:
            cells["act"] = Cell("FAIL", secs=time.time() - t0)
            details.append(f"act: {action}: {_err(e)}")
        return row
    if isinstance(out, dict) and out.get("ok"):
        cells["act"] = Cell("ok", action, time.time() - t0)
    else:
        cells["act"] = Cell("FAIL", secs=time.time() - t0)
        details.append(f"act: {action} must return a dict with ok: true, got {str(out)[:100]}")
    return row


def port_check(st: Settings, only: str | None = None) -> list[dict]:
    entries = st.get("adapters") or {}
    if only:
        if only not in entries:
            print(f"port-check: no adapter {only!r} under `adapters:` in the settings (listed: {', '.join(entries) or 'none'})")
            return [{"adapter": only, "state": "FAIL", "cells": {}, "details": ["not listed"], "capabilities": []}]
        entries = {only: entries[only]}
    print(f"port-check: owner {st.owner}, {len(entries)} adapter{'s' if len(entries) != 1 else ''} listed in {st.file}\n")
    rows = [check_one(st, k, v or {}) for k, v in entries.items()]
    cols = ("caps", "check", "sense", "search", "get", "act")
    table = [["adapter", *cols]]
    for r in rows:
        if r["cells"]:
            table.append([r["adapter"], *[r["cells"].get(c, Cell("-")).text() for c in cols]])
        else:
            table.append([r["adapter"], r["state"]])
    full = [t for t in table if len(t) == len(table[0])]
    width = [max(len(t[i]) for t in full) for i in range(len(table[0]))]
    for t in table:
        if len(t) == 2 and t is not table[0]:
            print(f"{t[0]:<{width[0]}}  {t[1]}")
        else:
            print("  ".join(f"{c:<{width[i]}}" for i, c in enumerate(t)).rstrip())
    print()
    for r in rows:
        if r["capabilities"]:
            acts = [c[4:] for c in r["capabilities"] if c.startswith("act:")]
            plain = [c for c in r["capabilities"] if not c.startswith("act:")]
            print(f"{r['adapter']}: offers {', '.join(plain) or 'no reads'}" + (f"; act: {', '.join(acts)}" if acts else ""))
        elif r["details"]:
            print(f"{r['adapter']}:")
        for d in r["details"]:
            print(f"  {d}")
    fails = [r for r in rows if r["state"] == "FAIL" or any(c.status == "FAIL" for c in r["cells"].values())]
    checked = [r for r in rows if r["cells"]]
    waiting = [r for r in rows if r["state"].startswith("not on main yet")]
    print(f"\nresult: {len(checked)} checked, {len(waiting)} not on main yet, {len(fails)} with a FAIL"
          + (f" ({', '.join(r['adapter'] for r in fails)})" if fails else ""))
    return rows


def any_fail(rows: list[dict]) -> bool:
    return any(r["state"] == "FAIL" or any(c.status == "FAIL" for c in r["cells"].values()) for r in rows)
