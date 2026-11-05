"""The page frame in the concept film's look: paper, ink, mint, green; Manrope; cards with radius 20;
a sidebar with the Peer's mark, the owner's pages and the sources it may read.

Other packages add a page with `NAV.append(...)` (additive) and wrap their HTML with `page()`.
"""
from __future__ import annotations

import html
import json
from datetime import datetime

from ..settings import get_settings

# (path, label, icon). WP3 adds its brief here: NAV.insert(0, ("/brief", "Your brief", "home")).
NAV: list[tuple[str, str, str]] = [
    ("/setup", "Create my Peer", "plus"),
    ("/learned", "What I learned", "file"),
    ("/settings", "Roles and settings", "switch"),
    ("/activity", "Activity", "clock"),
]

ICONS = {
    "home": "m3 11 9-8 9 8 M6 9v12h12V9 M10 21v-7h4v7",
    "file": "M5 3h10l4 4v14H5ZM14 3v5h5 M8 12h8 M8 16h6",
    "clock": "M12 6v6l4 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    "plus": "M12 4v16 M4 12h16",
    "switch": "M7 7h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 7Z M7 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5",
    "message": "M4 4h16v13H8l-4 4Z",
    "arrow": "M4 12h16m-6-6 6 6-6 6",
    "check": "m5 12 5 5L20 6",
}


def icon(name: str, size: int = 20) -> str:
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{ICONS.get(name, ICONS["file"])}"/></svg>')


def peer_mark(size: int = 40, dark: bool = False) -> str:
    bg, fg = ("#193c38", "#b7f4cf") if dark else ("#b7f4cf", "#173c33")
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 100 100" aria-hidden="true"><rect x="2" y="2" width="96" height="96" rx="31" fill="{bg}"/>'
            f'<path d="M28 58V42a13 13 0 0 1 26 0v16M46 58V42a13 13 0 0 1 26 0v16" fill="none" stroke="{fg}" stroke-width="9" stroke-linecap="round"/>'
            f'<circle cx="35" cy="72" r="3" fill="{fg}"/><circle cx="65" cy="72" r="3" fill="{fg}"/></svg>')


CSS = """
:root{--paper:#f6f4ee;--ink:#152b31;--muted:#617272;--mint:#b7f4cf;--green:#167353;--line:#d7dfd9;--card:#fffef9;
--cardline:#d7e2d7;--side:#f1f4ed;--soft:#edf5ec;--amber:#876626;--amberbg:#fff6e3;--amberline:#e8d5b1;--warn:#ab682b}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.55 Manrope,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
a{color:var(--green)}
.shell{display:flex;min-height:100vh}
.side{width:236px;flex-shrink:0;background:var(--side);border-right:1px solid var(--line);padding:26px 18px;display:flex;flex-direction:column;
min-height:100vh}
.brand{display:flex;align-items:center;gap:11px;font-size:21px;font-weight:800;letter-spacing:-.5px}
.slabel{margin:34px 0 6px;font-size:11px;font-weight:750;color:var(--muted);letter-spacing:1.8px;text-transform:uppercase}
.nav a{display:flex;align-items:center;gap:11px;padding:10px 11px;margin-top:4px;border-radius:11px;color:var(--muted);text-decoration:none;font-weight:600}
.nav a.on{background:#deebdd;color:var(--green);font-weight:750}
.src{display:flex;align-items:flex-start;gap:9px;margin-top:9px;color:var(--muted);font-size:14px;line-height:1.3}.src .dot{margin-top:5px}
.src small{display:block;font-size:12px;color:#8f9d94}
.dot{width:7px;height:7px;border-radius:4px;background:#a2b6a5;flex-shrink:0}.dot.on{background:#5c9c6d}
.asof{margin-top:20px;font-size:13px;color:var(--muted)}.asof b{color:var(--ink)}
.me{margin-top:auto;display:flex;align-items:center;gap:10px}
.av{width:34px;height:34px;border-radius:11px;background:#d5e3e8;display:flex;align-items:center;justify-content:center;font-weight:750}
.me small{display:block;color:var(--muted);font-weight:500;font-size:12px}
main{flex:1;min-width:0;padding:34px 44px 70px;max-width:1080px}
.label{font-size:12px;letter-spacing:2px;font-weight:750;color:var(--green);text-transform:uppercase}
h1{font-size:34px;letter-spacing:-1px;margin:6px 0 4px;font-weight:800}
.lead{color:var(--muted);font-size:17px;margin:0 0 22px}
h2{font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:var(--muted);margin:30px 0 10px;font-weight:750}
.card{background:var(--card);border:1px solid var(--cardline);border-radius:20px;padding:18px 22px;margin:0 0 12px;box-shadow:0 10px 30px #173c3408}
.pill{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:9px;background:#e8f1e9;color:var(--green);font-size:13px;font-weight:650}
.pill.grey{background:#eceee9;color:var(--muted)}.pill.amber{background:var(--amberbg);color:var(--amber)}
.btn{display:inline-flex;align-items:center;gap:10px;border:0;border-radius:13px;background:var(--green);color:#fff;font:inherit;font-weight:750;
padding:12px 20px;cursor:pointer;text-decoration:none}
.btn.big{font-size:22px;padding:20px 32px;border-radius:17px;box-shadow:0 17px 50px #226c4d25}
.btn.ghost{background:transparent;color:var(--green);border:1px solid var(--cardline)}
.btn:disabled{opacity:.55;cursor:default}
.note{background:var(--amberbg);border:1px solid var(--amberline);border-radius:12px;padding:12px 16px;color:var(--amber);font-weight:650}
.muted{color:var(--muted)} .small{font-size:13px}
.ai{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)}
input[type=text],textarea{font:inherit;color:var(--ink);background:#fff;border:1px solid var(--cardline);border-radius:10px;padding:8px 11px;width:100%}
.toggle{position:relative;width:52px;height:30px;flex-shrink:0;border-radius:30px;background:#cbd5d0;border:0;cursor:pointer;padding:0}
.toggle i{position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:20px;background:#fff;box-shadow:0 2px 6px #0002;transition:.18s}
.toggle.on{background:var(--green)}.toggle.on i{left:25px}
@media (max-width:820px){.shell{display:block}.side{position:static;width:auto;height:auto}.me{margin-top:18px}main{padding:22px 16px 60px}}
"""

FONT = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">')


def profile() -> dict:
    st = get_settings()
    try:
        return json.loads(st.profile_path().read_text())
    except (OSError, ValueError):
        return {"name": "You", "preferred_name": "You"}


def first_name(p: dict | None = None) -> str:
    p = p or profile()
    return p.get("preferred_name") or (p.get("name") or "You").split()[0]


def sources_status() -> list[tuple[str, bool]]:
    """The sources the Peer may read, and whether each is connected (sidebar)."""
    st = get_settings()
    from ..settings import secret
    from ..memory.discovery import google_connected
    local_on = bool(st.get("local.folders")) or (st.owner_dir / "local").exists() and any((st.owner_dir / "local").glob("*.md"))
    return [("Company directory", st.profile_path().exists()), ("Slack", bool(secret("SLACK_BOT_TOKEN"))),
            ("GitHub", True), ("Docs and calendar", google_connected()), ("Local work", local_on)]


def memory_as_of() -> str | None:
    st = get_settings()
    me = st.owner_dir / "me.md"
    if not me.exists():
        return None
    return datetime.fromtimestamp(max(p.stat().st_mtime for p in st.owner_dir.glob("**/*.md"))).strftime("%-d %b %Y, %-I:%M %p")


def page(title: str, body: str, active: str = "", refresh: int | None = None, script: str = "") -> str:
    p = profile()
    name = first_name(p)
    nav = "".join(f'<a href="{href}" class="{"on" if href == active else ""}">{icon(ic, 19)}{html.escape(label)}</a>'
                  for href, label, ic in NAV)
    srcs = "".join(f'<div class="src"><span class="dot {"on" if on else ""}"></span><span>{html.escape(s)}'
                   f'{"" if on else "<small>not connected yet</small>"}</span></div>' for s, on in sources_status())
    asof = memory_as_of()
    asof_html = f'<div class="asof">Context as of<br><b>{asof}</b></div>' if asof else '<div class="asof">No memory yet</div>'
    meta = f'<meta http-equiv="refresh" content="{refresh}">' if refresh else ""
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)} · {html.escape(name)}'s AI Peer</title>{meta}{FONT}<style>{CSS}</style></head><body><div class="shell">
<aside class="side"><div class="brand">{peer_mark(36)}AI Peer</div>
<div class="slabel">Your workspace</div><nav class="nav">{nav}</nav>
<div class="slabel">Sources you allowed</div>{srcs}{asof_html}
<div class="me"><div class="av">{html.escape(name[:1])}</div><div><b>{html.escape(name)}</b><small>Personal workspace</small></div></div></aside>
<main>{body}</main></div>{('<script>' + script + '</script>') if script else ''}</body></html>"""
