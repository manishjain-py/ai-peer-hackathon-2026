"""port-check (stub for WP1; WP5 completes it): list the adapters, exercise each verb
(act in dry run), print a table. A company port runs this after writing its adapters."""
from __future__ import annotations

import json
import time

from .settings import Settings


def _try(fn):
    t0 = time.time()
    try:
        out = fn()
        return "ok", out, time.time() - t0
    except NotImplementedError:
        return "n/a", None, 0.0
    except Exception as e:  # noqa: BLE001
        return "FAIL", str(e)[:70], time.time() - t0


def port_check(st: Settings) -> list[dict]:
    from .adapters.directory import DirectoryAdapter
    from .adapters.fake import FakeAdapter
    from .adapters.github import GitHubAdapter
    from .memory.discovery import load_world

    profile = json.loads(st.profile_path().read_text())
    adapters = [DirectoryAdapter(st.profile_path(), load_world().get("colleagues", [])),
                GitHubAdapter([r["repo"] for r in profile["owns"]["repos"]]), FakeAdapter()]
    try:
        from .adapters.slack import SlackAdapter
        adapters.append(SlackAdapter())
    except Exception as e:  # noqa: BLE001
        print(f"slack: cannot start ({str(e)[:80]})")
    rows = []
    probes = {"directory": "Telugu", "github": "Telugu", "fake": "hello", "slack": "Telugu"}
    for ad in adapters:
        row = {"adapter": ad.name, "capabilities": sorted(ad.capabilities)}
        st_, out, dt = _try(lambda: ad.sense(None))
        row["sense"] = f"{st_} ({len(out[0])} events)" if st_ == "ok" else st_
        st_, out, dt = _try(lambda: ad.search(probes.get(ad.name, "test")))
        row["search"] = f"{st_} ({len(out)} hits)" if st_ == "ok" else f"{st_} {out or ''}".strip()
        ref = out[0]["ref"] if st_ == "ok" and out else None
        if ref:
            st_, out, dt = _try(lambda: ad.get(ref))
            row["get"] = st_
        else:
            row["get"] = "n/a (nothing to get)"
        acts = [c.split(":", 1)[1] for c in ad.capabilities if c.startswith("act:")]
        if acts:
            st_, out, dt = _try(lambda: ad.act(acts[0], "port-check", {"channel": "port-check", "text": "port-check"},
                                             "port-check", dry_run=True))
            row["act"] = f"{st_} (dry run: {acts[0]})"
        else:
            row["act"] = "none offered (read-only)"
        rows.append(row)
    print(f"{'adapter':<10} {'sense':<22} {'search':<22} {'get':<20} act")
    for r in rows:
        print(f"{r['adapter']:<10} {r['sense']:<22} {r['search']:<22} {r['get']:<20} {r['act']}")
    return rows
