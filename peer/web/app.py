"""The owner's web page (D10). WP1: the activity log (F4), minimal. WP2 adds setup, "what I
learned", roles and settings, in the concept film's look.

Run: .venv/bin/python -m peer web   ->  http://127.0.0.1:8787
"""
from __future__ import annotations

import html
import json
import re
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse

from ..activity import ActivityLog
from ..settings import get_settings

app = FastAPI(title="AI Peer")

LINK = re.compile(r"<(https?://[^|>]+)\|([^>]+)>")
BOLD = re.compile(r"\*([^*\n]+)\*")
ITAL = re.compile(r"(?<![\w])_([^_\n]+)_(?![\w])")

KIND_LABEL = {
    "answered_in_thread": "Answered for you", "answered_follow_up": "Answered a follow-up",
    "drafted_for_owner": "Draft for you", "sent_after_approval": "Sent after your OK",
    "skipped_by_owner": "You skipped", "stood_down": "Stood down", "noticed": "Noticed",
    "owner_instruction": "Your instruction", "failed": "Problem", "started": "Started", "resolved": "Resolved",
}


def mrkdwn(text: str | None) -> str:
    if not text:
        return ""
    t = html.escape(text, quote=False)
    t = LINK.sub(lambda m: f'<a href="{html.escape(m.group(1))}" target="_blank">{m.group(2)}</a>', t)
    t = re.sub(r"&lt;(https?://[^&]+)&gt;", lambda m: f'<a href="{m.group(1)}" target="_blank">{m.group(1)}</a>', t)
    t = BOLD.sub(r"<b>\1</b>", t)
    t = ITAL.sub(r"<i>\1</i>", t)
    t = re.sub(r":robot_face:", "🤖", t)
    t = re.sub(r":[a-z_]+:", "", t)
    return t.replace("\n", "<br>")


def _local(iso: str, tz: str) -> str:
    try:
        return datetime.fromisoformat(iso).astimezone(ZoneInfo(tz)).strftime("%d %b, %-I:%M %p")
    except Exception:  # noqa: BLE001
        return iso


def _entries() -> list[dict]:
    st = get_settings()
    entries = ActivityLog(st.log_path).entries()
    closed = {e["ref"] for e in entries if e["kind"] in ("sent_after_approval", "skipped_by_owner", "resolved") and e.get("ref")}
    for e in entries:
        e["open"] = e.get("outcome") == "pending_approval" and e.get("ref") not in closed
    return entries


@app.get("/")
def root():
    return RedirectResponse("/activity")


@app.get("/api/activity")
def api_activity():
    return JSONResponse(_entries())


@app.get("/activity", response_class=HTMLResponse)
def activity(all: int = 0):
    st = get_settings()
    profile = json.loads(st.profile_path().read_text())
    tz = profile.get("tz", "UTC")
    entries = [e for e in _entries() if all or e["kind"] not in ("noticed", "started")]
    entries.reverse()
    review = [e for e in entries if e["open"] or (e.get("needs_review") and e["kind"] != "drafted_for_owner")]
    rest = [e for e in entries if e not in review]

    def card(e: dict) -> str:
        srcs = "".join(f'<li><a href="{html.escape(s.get("url", ""))}" target="_blank">{html.escape(s.get("title", "source"))}</a>'
                       f'<span class="d"> {html.escape(s.get("date", ""))}</span></li>' for s in e.get("sources", []))
        said = f'<details><summary>What the Peer said</summary><div class="said">{mrkdwn(e.get("said"))}</div></details>' if e.get("said") else ""
        q = e.get("extra", {}).get("question")
        question = f'<div class="q">“{html.escape(q)}”</div>' if q else ""
        note = e.get("extra", {}).get("owner_note")
        needs = f'<div class="needs">✋ {html.escape(note)}</div>' if note and e.get("needs_review") else ""
        link = f' · <a href="{html.escape(e["url"])}" target="_blank">open in Slack</a>' if e.get("url", "").startswith("http") else ""
        outcome = "waiting for you" if e["open"] else ("handled" if e.get("outcome") == "pending_approval" else e.get("outcome", ""))
        return (f'<div class="card {"open" if e["open"] else ""}"><div class="top"><span class="kind">{KIND_LABEL.get(e["kind"], e["kind"])}</span>'
                f'<span class="when">{_local(e["at"], tz)}</span><span class="badge {html.escape(outcome.replace(" ", "-"))}">{html.escape(outcome)}</span></div>'
                f'<div class="sum">{html.escape(e["summary"])}</div>'
                f'<div class="meta">Asked by {html.escape(e.get("who_asked") or "-")} · {html.escape(e.get("where") or "-")}{link}</div>'
                f'{question}{needs}{said}{("<ul class=src>" + srcs + "</ul>") if srcs else ""}</div>')

    body = ""
    if review:
        body += '<h2>Needs your review</h2>' + "".join(card(e) for e in review)
    body += '<h2>Everything the Peer did</h2>' + ("".join(card(e) for e in rest) or '<p class="empty">Nothing yet.</p>')
    name = profile.get("preferred_name") or profile["name"]
    return f"""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(name)}'s AI Peer · Activity</title><meta http-equiv="refresh" content="15">
<style>
:root{{--bg:#f6f4ef;--card:#fff;--ink:#1d2421;--muted:#6b746f;--accent:#1f5f46;--warn:#b5651d;--line:#e4e0d6}}
@media (prefers-color-scheme: dark){{:root{{--bg:#141816;--card:#1d2321;--ink:#e8ece9;--muted:#9aa49f;--accent:#5fc49a;--warn:#e0a060;--line:#2c3431}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}}
main{{max-width:860px;margin:0 auto;padding:24px 16px 60px}} h1{{font-size:22px;margin:0 0 4px}} .sub{{color:var(--muted);margin:0 0 20px}}
h2{{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:28px 0 10px}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:0 0 10px}}
.card.open{{border-color:var(--warn);box-shadow:0 0 0 2px color-mix(in srgb,var(--warn) 25%,transparent)}}
.top{{display:flex;gap:10px;align-items:center;font-size:13px}} .kind{{font-weight:600;color:var(--accent)}} .when{{color:var(--muted)}}
.badge{{margin-left:auto;font-size:12px;padding:1px 8px;border-radius:99px;background:var(--line)}} .badge.waiting-for-you{{background:var(--warn);color:#fff}}
.sum{{margin:6px 0 2px;font-weight:500}} .meta{{color:var(--muted);font-size:13px}} .q{{margin:8px 0;padding-left:10px;border-left:3px solid var(--line);color:var(--muted)}}
.needs{{margin:8px 0;color:var(--warn)}} details{{margin-top:8px}} summary{{cursor:pointer;color:var(--accent);font-size:14px}}
.said{{margin-top:8px;padding:10px 12px;background:var(--bg);border-radius:8px;font-size:14px}} .src{{margin:8px 0 0;padding-left:18px;font-size:13px}}
.d{{color:var(--muted)}} a{{color:var(--accent)}} .empty{{color:var(--muted)}}
</style></head><body><main>
<h1>🤖 {html.escape(name)}'s AI Peer</h1><p class="sub">Activity log: every action, who asked, what it said, its sources. Refreshes every 15 s.
<a href="?all=1">Show everything</a></p>{body}</main></body></html>"""
