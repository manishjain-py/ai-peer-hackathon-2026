"""S2: the daily brief and heads-ups (PRD S2).

Every working morning at brief.at (owner's local time) and on "brief me" in the owner's DM: one
brief, in the Slack DM and on the page (/brief). Sections:
  away    what happened while you were away (including what the Peer answered for you)
  email   email still waiting on you
  events  events and opportunities that fit your interests (role "Find opportunities")
  news    company news and changes that touch your work (announcements + real GitHub, read-only)
Each item: why it matters and one action (open, draft a reply, accept the invite). The owner's tap
is the ask (D9): "Draft reply" makes a Gmail draft and shows it, "Send email" sends it (a second
tap), "Accept" answers the invite. The google adapter's hard block keeps every act on seeded
items until the owner lifts google.act_on_real_items.

Heads-ups: an urgent item (a direct question that can't wait, something breaking) is told at once
through notify.tell_owner (the owner's mutes apply) and left out of the brief's sections.
Plain code polls, picks candidates and spots urgency (no AI per event); one brain run writes the
brief, one more drafts a reply when the owner asks. Seeded-only view: until the owner turns on
google.show_real_items, only seeded Google items are used or shown anywhere; real ones are counted.
"""
from __future__ import annotations

import json
import logging
import re
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace
from typing import Any
from zoneinfo import ZoneInfo

from .activity import ActivityLog
from .adapters.google import Blocked, FakeGoogleAdapter, GoogleAdapter, connected, owner_email
from .brain.runner import run_agent
from .brain.schemas import BUILD_BRIEF, DRAFT_EMAIL
from .events import Event, now_iso
from .notify import send_brief, tell_owner
from .settings import Settings
from .store import Store

log = logging.getLogger("peer.brief")

SECTIONS = [("away", "While you were away"), ("email", "Email still waiting on you"),
            ("events", "Events and opportunities for you"), ("news", "Company news and changes to your work")]
ACCENT = {"away": "green", "email": "blue", "events": "plum", "news": "amber"}
AWAY_KINDS = {"answered_in_thread", "answered_follow_up", "drafted_for_owner", "told_owner", "held_back", "failed",
              "email_drafted", "email_sent", "invite_accepted"}
URGENT = re.compile(r"\b(urgent|asap|immediately|right away|blocker|blocking|blocked|outage|today|tonight|eod|"
                    r"before \d{1,2}(:\d{2})?\s?(am|pm))\b", re.I)
BREAKING = re.compile(r"\b(outage|is down|went down|broken|failing|failed|rejected|crash(ed|ing)?)\b", re.I)
EVENTISH = re.compile(r"\b(event|meetup|webinar|conference|summit|workshop|call for (speakers|papers)|hackathon)\b", re.I)
BUTTONS = {"draft_reply": ("brief_draft", "Draft reply"), "accept_invite": ("brief_accept", "Accept")}
CLICKS = {"brief_draft": "draft_reply", "brief_accept": "accept_invite", "brief_send": "send_email", "brief_discard": "discard_draft"}

_lock = threading.RLock()
_override: Any = None   # the fake Google of a dry run in this process


# -- where things live -----------------------------------------------------------------------------------
def brief_dir(st: Settings, dry: bool) -> Path:
    d = st.owner_dir / ("dryrun/briefs" if dry else "briefs")
    d.mkdir(parents=True, exist_ok=True)
    return d


def _paths(st: Settings, dry: bool) -> tuple[Path, Path]:
    return ((st.owner_dir / "dryrun" / "peer.db", st.owner_dir / "dryrun" / "log.jsonl") if dry
            else (st.owner_dir / "peer.db", st.owner_dir / "log.jsonl"))


def fake_state(st: Settings) -> Path:
    return st.owner_dir / "dryrun" / "fake-google.json"


def page_url(st: Settings, dry: bool = False) -> str:
    return f"http://{st.get('web.host', '127.0.0.1')}:{st.get('web.port', 8787)}/brief" + ("?dry=1" if dry else "")


def profile(st: Settings) -> dict:
    return json.loads(st.profile_path().read_text())


def get_google(st: Settings, dry: bool = False):
    """The owner's Google: the dry run's fake, the persisted fake for a dry brief, or the real adapter."""
    if dry:
        if _override is not None:
            return _override
        return FakeGoogleAdapter(owner_email(st), fake_state(st), st=st)
    if not connected():
        return None
    return GoogleAdapter(st=st)


def dry_google(st: Settings, fresh: bool = True) -> FakeGoogleAdapter:
    global _override
    p = fake_state(st)
    p.parent.mkdir(parents=True, exist_ok=True)
    if fresh and p.exists():
        p.unlink()
    _override = FakeGoogleAdapter(owner_email(st), p, st=st)
    return _override


def end_dry_google() -> None:
    global _override
    _override = None


def visible(st: Settings, e: Event) -> bool:
    return bool(e.extra.get("seeded")) or bool(st.get("google.show_real_items", False))


def _local(iso: str | None, tz: str, fmt: str = "%a %-d %b, %-I:%M %p") -> str:
    if not iso:
        return ""
    try:
        return datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(ZoneInfo(tz)).strftime(fmt)
    except ValueError:
        return iso


# -- the poll and heads-ups (no AI) -------------------------------------------------------------------------
def urgency(e: Event, owner: str) -> str | None:
    x = e.extra
    if e.kind == "email":
        if x.get("bulk") or x.get("seed_kind") in ("announcement", "event"):
            return None
        text = e.text or ""
        direct = owner in (x.get("to") or [])
        if direct and "?" in text and URGENT.search(text):
            return f"{x.get('from_name')} asked you directly, and it can't wait"
        if direct and BREAKING.search(x.get("subject", "")) and URGENT.search(text):
            return f"{x.get('from_name')} says something is breaking"
    if e.kind == "invite" and x.get("start"):
        try:
            start = datetime.fromisoformat(str(x["start"]).replace("Z", "+00:00"))
            if start.tzinfo and timedelta(0) < start - datetime.now(timezone.utc) < timedelta(hours=2):
                return f"{x.get('organizer_name')} invited you to something that starts within two hours"
        except ValueError:
            pass
    return None


def poll_google(ctx) -> dict:
    """One poll of Gmail and Calendar: store new items, tell the owner about urgent ones at once."""
    st = ctx.st
    g = get_google(st, dry=ctx.dry_run)
    if g is None:
        return {"skipped": "google not connected"}
    events, nxt = g.sense(ctx.store.cursor("google"))
    ctx.store.set_cursor("google", nxt)
    owner = owner_email(st)
    new, hidden, told, seeded = 0, 0, 0, 0
    for e in events:
        if not visible(st, e):   # seeded-only view: keep only the fact that something arrived, never its content
            e = Event(id=e.id, source=e.source, kind=e.kind, at=e.at, actor=None, ref=e.ref, thread_ref=None,
                      text="", url=None, extra={"seeded": False, "hidden": True})
        if not ctx.store.add_event(e):
            continue
        new += 1
        if e.extra.get("hidden"):
            hidden += 1
            continue
        seeded += bool(e.extra.get("seeded"))
        why = urgency(e, owner)
        if why:
            x = e.extra
            item = {"source": "google", "kind": e.kind, "title": f"{x.get('from_name') or x.get('organizer_name')}: "
                    f"{x.get('subject') or x.get('summary')}", "text": (e.text or "")[:300], "url": e.url, "ref": e.ref,
                    "at": e.at, "urgent": True}
            r = tell_owner(st, ctx.chat, ctx.owner_chat_id, item,
                           f"{why}. I'm telling you now instead of waiting for your next brief.", dry_run=ctx.dry_run,
                           store=ctx.store)
            told += r.get("did") == "told"
    return {"events": new, "hidden_real": hidden, "seeded": seeded, "told": told}


# -- gathering candidates (no AI) ---------------------------------------------------------------------------
def interests(st: Settings) -> list[str]:
    me = st.owner_dir / "me.md"
    out: list[str] = []
    if me.exists():
        on = False
        for line in me.read_text().splitlines():
            if line.startswith("## "):
                on = line.strip().lower() == "## interests"
                continue
            if on and line.startswith("- "):
                out.append(re.sub(r"\s*\((corrected|as of)[^)]*\)\s*$", "", line[2:]).strip())
    return out or list(profile(st).get("interests", []))


def last_brief(st: Settings, dry: bool) -> dict | None:
    p = brief_dir(st, dry) / "latest.json"
    try:
        return json.loads(p.read_text()) if p.exists() else None
    except ValueError:
        return None


def _since(st: Settings, dry: bool) -> str:
    now = datetime.now(timezone.utc)
    floor = now - timedelta(hours=float(st.get("brief.lookback_hours", 18)))
    prev = last_brief(st, dry)
    if prev and prev.get("at"):
        at = datetime.fromisoformat(prev["at"])
        if now - at < timedelta(days=3):
            return min(at, now - timedelta(hours=1)).isoformat(timespec="seconds")
    return floor.isoformat(timespec="seconds")


def _mail_cand(e: Event, section: str, tz: str) -> dict:
    x = e.extra
    cat = {"email": "Email", "events": "Event", "news": "Company news"}[section]
    return {"section": section, "kind": "email", "source": "google", "category": f"{cat} · {x.get('from_name')}",
            "title": x.get("subject"), "from": x.get("from_name"), "snippet": (e.text or "").split("\n", 1)[-1][:300],
            "at": e.at, "when": _local(e.at, tz), "url": e.url, "ref": e.ref, "seeded": bool(x.get("seeded")),
            "actions": ["draft_reply", "open"] if section == "email" else ["open"]}


def gather(st: Settings, store: Store, log_path: Path, since: str, dry: bool) -> tuple[dict[str, list[dict]], dict]:
    p = profile(st)
    tz = p.get("tz", "UTC")
    cands: dict[str, list[dict]] = {k: [] for k, _ in SECTIONS}
    counts = {"hidden_real": 0}
    # 1. while you were away: the Peer's own activity log
    by_thread: dict[str, dict] = {}
    for a in ActivityLog(log_path).entries(3000):
        if a.get("at", "") < since or a.get("kind") not in AWAY_KINDS or a.get("outcome") == "dry_run" and not dry:
            continue
        if a["kind"] == "drafted_for_owner":
            pend = store.action(a.get("ref") or "")
            if not pend or pend["status"] != "pending_approval":
                continue
        key = a.get("url") or a.get("ref") or a["id"]
        c = by_thread.get(key)
        if c and a["kind"] in ("answered_follow_up", "answered_in_thread"):
            c["count"] += 1
            c["snippet"] = (a.get("said") or "")[:300]
            continue
        cat = {"answered_in_thread": f"Slack · {a.get('where')}", "answered_follow_up": f"Slack · {a.get('where')}",
               "drafted_for_owner": "Waiting on your OK", "told_owner": "Heads-up sent", "held_back": "Held back (your rule)",
               "failed": "Problem", "email_drafted": "Email draft", "email_sent": "Email sent",
               "invite_accepted": "Invite accepted"}[a["kind"]]
        by_thread[key] = {"section": "away", "kind": a["kind"], "source": "peer", "category": cat, "title": a.get("summary"),
                          "from": a.get("who_asked"), "snippet": (a.get("said") or "")[:300], "at": a["at"],
                          "when": _local(a["at"], tz), "url": a.get("url"), "ref": a.get("ref"),
                          "needs_review": bool(a.get("needs_review")), "seeded": True, "count": 1, "actions": ["open"]}
    cands["away"] = list(by_thread.values())[-8:]
    # 2. Google: mail and invites from the poll
    email_floor = (datetime.now(timezone.utc) - timedelta(days=float(st.get("brief.email_days", 3)))).isoformat(timespec="seconds")
    rows = store.conn().execute("SELECT * FROM events WHERE source='google' AND at>=? ORDER BY at",
                                (min(since, email_floor),)).fetchall()
    latest_invite: dict[str, Event] = {}
    for r in rows:
        e = Store._row_event(r)
        if e.extra.get("hidden") or not visible(st, e):
            counts["hidden_real"] += 1
            continue
        x = e.extra
        if e.kind == "email":
            if store.action(f"tell:{e.ref}") or store.get_kv(f"replied:{e.ref}"):
                continue   # told at once as a heads-up, or answered
            kind = x.get("seed_kind")
            if kind == "announcement" or (not kind and x.get("bulk") and not EVENTISH.search(x.get("subject", ""))):
                if e.at >= since:
                    cands["news"].append(_mail_cand(e, "news", tz))
            elif kind == "event" or (not kind and EVENTISH.search(x.get("subject", ""))):
                if e.at >= since and st.get("roles.find_opportunities", True):
                    cands["events"].append(_mail_cand(e, "events", tz))
            elif not x.get("bulk"):
                cands["email"].append(_mail_cand(e, "email", tz))
        elif e.kind in ("invite", "event") and x.get("event_id"):
            latest_invite[x["event_id"]] = e
    if st.get("roles.find_opportunities", True):
        for e in latest_invite.values():
            x = e.extra
            if e.kind != "invite" or x.get("response") != "needsAction" or (x.get("start") or "") < now_iso()[:10]:
                continue
            cands["events"].append({"section": "events", "kind": "invite", "source": "google",
                                    "category": f"Invite · {x.get('organizer_name')}", "title": x.get("summary"),
                                    "from": x.get("organizer_name"), "snippet": f"{_local(x.get('start'), tz)}. {x.get('description', '')}"[:300],
                                    "at": e.at, "when": _local(x.get("start"), tz), "url": e.url, "ref": e.ref,
                                    "seeded": bool(x.get("seeded")), "actions": ["accept_invite", "open"]})
    # 3. real GitHub (read-only): failing CI on the main branch, open pull requests waiting on the owner
    if not dry or st.get("brief.github_in_dry_runs", True):
        try:
            cands["news"] += github_cands(st, p, since, tz)
        except Exception as ex:  # noqa: BLE001
            log.warning("github for the brief failed: %s", ex)
    n = 0
    for k, _ in SECTIONS:
        for c in cands[k]:
            n += 1
            c["id"] = f"{k[0]}{n}"
    return cands, counts


def github_cands(st: Settings, p: dict, since: str, tz: str) -> list[dict]:
    from .adapters.github import GitHubAdapter
    repos = [r["repo"] for r in p.get("owns", {}).get("repos", [])]
    gh = GitHubAdapter(repos)
    out: list[dict] = []
    for repo in repos:
        short = repo.split("/")[-1]
        latest: dict[str, dict] = {}
        for run in gh.runs(repo, n=30, branch="main"):
            if run.get("status") == "completed" and run.get("name") not in latest:
                latest[run.get("name")] = run
        for name, run in latest.items():
            if run.get("conclusion") == "failure":
                out.append({"section": "news", "kind": "ci", "source": "github", "category": f"GitHub · CI on main in {short}",
                            "title": f"{name} is failing on main", "from": (run.get("actor") or {}).get("login"),
                            "snippet": f"Latest run {_local(run.get('updated_at'), tz)}: {run.get('display_title', '')}"[:300],
                            "at": run.get("updated_at"), "when": _local(run.get("updated_at"), tz), "url": run.get("html_url"),
                            "ref": f"github:run:{repo}:{run['id']}", "seeded": True, "actions": ["open"]})
        prs = [pr for pr in gh.pulls(repo, state="open", n=30) if not pr.get("draft")]
        for pr in prs[:3]:
            out.append({"section": "news", "kind": "pr", "source": "github", "category": f"GitHub · PR #{pr['number']} in {short}",
                        "title": pr["title"], "from": pr["user"]["login"],
                        "snippet": f"Open since {_local(pr.get('created_at'), tz, '%-d %b')}; updated {_local(pr.get('updated_at'), tz)}",
                        "at": pr.get("updated_at"), "when": _local(pr.get("updated_at"), tz), "url": pr["html_url"],
                        "ref": f"github:pr:{repo}#{pr['number']}", "seeded": True, "actions": ["open"]})
    return out


# -- building the brief (one brain run) ---------------------------------------------------------------------
def _action(kind: str, c: dict) -> dict:
    if kind in BUTTONS:
        return {"kind": kind, "label": BUTTONS[kind][1]}
    return {"kind": "open", "label": "Open", "url": c.get("url")}


def _fallback_why(c: dict) -> str:
    """Plain reasons when the brain is not used (or failed): one per kind, never raw message text."""
    if c["section"] == "away":
        return {"told_owner": "It couldn't wait, so I told you at once.",
                "drafted_for_owner": "A reply I drafted is waiting for your Send, Edit or Skip.",
                "answered_in_thread": "I answered for you while you were away; check what I said.",
                "answered_follow_up": "I answered a follow-up for you; check what I said.",
                "email_drafted": "Your draft is in Gmail, waiting for your OK.", "email_sent": "Sent after your OK.",
                "invite_accepted": "Accepted after your OK.", "held_back": "Held back, per your rule.",
                "failed": "Something I tried did not work; see the activity log."}.get(c["kind"], "Happened while you were away.")
    if c["kind"] == "invite":
        return f"{c.get('from')} invited you for {c.get('when')}."
    if c["section"] == "events":
        return f"{c.get('from')} shared an event; open it to see if it fits."
    if c["kind"] == "ci":
        return "Your main branch is red; fixes and releases wait on it."
    if c["kind"] == "pr":
        return "Open and waiting on your review or merge."
    if c["section"] == "news":
        return f"Company news from {c.get('from')}."
    return f"{c.get('from')} is waiting on your answer."


def greeting(local: datetime, first: str) -> str:
    part = "morning" if local.hour < 12 else "afternoon" if local.hour < 17 else "evening"
    return f"Good {part}, {first}."


def build_brief(st: Settings, *, store: Store, log_path: Path, dry: bool, ai: bool = True, why: str = "asked") -> dict:
    p = profile(st)
    tz = p.get("tz", "UTC")
    first = p.get("preferred_name") or p["name"].split()[0]
    now = datetime.now(timezone.utc)
    local = now.astimezone(ZoneInfo(tz))
    since = _since(st, dry)
    cands, counts = gather(st, store, log_path, since, dry)
    flat = [c for k, _ in SECTIONS for c in cands[k]]
    max_items = int(st.get("brief.max_items", 10))
    picked: list[tuple[dict, str, str, str]] = []
    left_out: list[dict] = []
    headline, backend, brain_s, err = "", None, None, None
    if flat and ai:
        slim = {k: [{f: c.get(f) for f in ("id", "kind", "category", "title", "from", "snippet", "when", "actions", "needs_review")}
                    for c in cands[k]] for k, _ in SECTIONS}
        req = {"playbook": "build_brief", "from_owner": False,
               "owner": {"name": p["name"], "first": first, "local_time": local.strftime("%-I:%M %p, %a %-d %b"),
                         "where": p.get("location", tz), "interests": interests(st)},
               "since": since, "candidates": slim, "max_items": max_items}
        res = run_agent("build_brief " + json.dumps(req, ensure_ascii=False), BUILD_BRIEF, label=f"brief:{why}",
                        effort=st.get("brief.effort") or None)
        backend, brain_s = res.backend, round(res.duration_s, 1)
        if res.ok:
            byid = {c["id"]: c for c in flat}
            seen = set()
            for it in res.output.get("items", []):
                c = byid.get(it.get("id"))
                if not c or c["id"] in seen:
                    continue
                seen.add(c["id"])
                act = it["action"] if it["action"] in c["actions"] else c["actions"][0]
                picked.append((c, it.get("title") or c["title"], it.get("why") or _fallback_why(c), act))
            for c in flat:   # never drop what needs the owner's review or a waiting question
                if c["id"] not in seen and (c.get("needs_review") or (c["section"] == "email" and c.get("seeded"))):
                    picked.append((c, c["title"], _fallback_why(c), c["actions"][0]))
            headline = res.output.get("headline", "")
            left_out = [x for x in res.output.get("left_out", []) if x.get("id") in byid]
        else:
            err = res.error
    if flat and not picked:
        picked = [(c, c["title"], _fallback_why(c), c["actions"][0]) for c in flat[:max_items]]
    n_need = sum(1 for c, *_ in picked if c["section"] in ("email",) or c.get("needs_review"))
    if not headline:
        headline = (f"{n_need} {'thing needs' if n_need == 1 else 'things need'} you; {len(picked)} items in all." if picked
                    else "Nothing needs you right now.")
    sections = []
    for key, title in SECTIONS:
        items = []
        for c, t, w, a in picked:
            if c["section"] != key:
                continue
            items.append({"id": c["id"], "section": key, "kind": c["kind"], "source": c["source"], "category": c["category"],
                          "title": t, "why": w, "action": _action(a, c), "url": c.get("url"), "ref": c.get("ref"),
                          "when": c.get("when"), "from": c.get("from"), "seeded": c.get("seeded"), "state": None})
        sections.append({"key": key, "title": title, "accent": ACCENT[key], "items": items})
    b = {"id": f"b{now:%Y%m%dT%H%M%SZ}", "at": now.isoformat(timespec="seconds"), "why": why, "dry": dry,
         "greeting": greeting(local, first), "headline": headline, "local_time": local.strftime("%-I:%M %p"),
         "date": local.strftime("%a %-d %b"), "where": p.get("location", tz), "since": since, "sections": sections,
         "left_out": [{"id": x["id"], "title": next((c["title"] for c in flat if c["id"] == x["id"]), ""), "reason": x["reason"]}
                      for x in left_out],
         "counts": {**counts, "candidates": len(flat), "items": len(picked)},
         "seeded_only": not st.get("google.show_real_items", False), "backend": backend, "brain_s": brain_s, "error": err,
         "dm": None}
    save_brief(st, b)
    return b


def save_brief(st: Settings, b: dict) -> None:
    with _lock:
        d = brief_dir(st, b.get("dry", False))
        txt = json.dumps(b, ensure_ascii=False, indent=1)
        (d / f"{b['id']}.json").write_text(txt)
        (d / "latest.json").write_text(txt)


def load_brief(st: Settings, brief_id: str | None = None, dry: bool | None = None) -> dict | None:
    for d in ([dry] if dry is not None else [False, True]):
        p = brief_dir(st, d) / (f"{brief_id}.json" if brief_id else "latest.json")
        if p.exists():
            return json.loads(p.read_text())
    return None


# -- the Slack DM -----------------------------------------------------------------------------------------------
def _esc(s: Any) -> str:
    return str(s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def state_line(it: dict) -> str:
    s = it.get("state") or {}
    return {"drafted": ":memo: Draft saved in your Gmail drafts; it's in the thread below, waiting for your OK",
            "sent": ":white_check_mark: Sent from your Gmail after your OK",
            "discarded": ":wastebasket: Draft discarded",
            "accepted": ":white_check_mark: Accepted; the organizer gets your reply",
            "blocked": ":no_entry: Not done: the test guard allows this only on seeded test items",
            "failed": ":warning: That didn't work: " + str(s.get("why", ""))[:120]}.get(s.get("status"), "")


def render_slack(b: dict, url: str) -> tuple[str, list[dict]]:
    n = sum(len(s["items"]) for s in b["sections"])
    blocks: list[dict] = [
        {"type": "section", "text": {"type": "mrkdwn", "text": f":sunrise: *{_esc(b['greeting'])}* {_esc(b['headline'])}"}},
        {"type": "context", "elements": [{"type": "mrkdwn", "text":
            f":robot_face: Your AI Peer's brief · {_esc(b['local_time'])}, {_esc(b['date'])} · {n} items · <{url}|open it on your page>"}]}]
    num = 0
    for sec in b["sections"]:
        if not sec["items"]:
            continue
        blocks += [{"type": "divider"}, {"type": "section", "text": {"type": "mrkdwn", "text": f"*{_esc(sec['title'])}*"}}]
        for it in sec["items"]:
            num += 1
            u = it.get("url") or ""
            title = f"<{u}|{_esc(it['title'])}>" if u.startswith("http") else f"*{_esc(it['title'])}*"
            line = f"*{num}.* {title}\n_{_esc(it['category'])}_ · {_esc(it['why'])}"
            sl = state_line(it)
            if sl:
                line += f"\n{sl}"
            blk: dict = {"type": "section", "block_id": f"bi_{it['id']}", "text": {"type": "mrkdwn", "text": line[:2900]}}
            a = it["action"]["kind"]
            if a in BUTTONS and not it.get("state"):
                aid, label = BUTTONS[a]
                blk["accessory"] = {"type": "button", "action_id": aid, "value": f"{b['id']}|{it['id']}",
                                    "text": {"type": "plain_text", "text": label}}
            elif a == "open" and u.startswith("http"):
                blk["accessory"] = {"type": "button", "action_id": "brief_open", "url": u, "value": f"{b['id']}|{it['id']}",
                                    "text": {"type": "plain_text", "text": "Open"}}
            blocks.append(blk)
    if b.get("seeded_only") and b["counts"].get("hidden_real"):
        blocks.append({"type": "context", "elements": [{"type": "mrkdwn", "text":
            f"Seeded-only view: {b['counts']['hidden_real']} real Google items are counted, not shown."}]})
    blocks.append({"type": "context", "elements": [{"type": "mrkdwn", "text":
        "_I draft a reply or accept an invite only when you tap; sending asks you again. "
        "Say *brief me* any time, or *less of this* to tune me._"}]})
    return f"{b['greeting']} {b['headline']}", blocks


def draft_blocks(b: dict, it: dict) -> tuple[str, list[dict]]:
    s = it["state"]
    who = it.get("from") or "them"
    quoted = "\n".join("> " + _esc(x) if x.strip() else ">" for x in s.get("body", "").splitlines())
    head = f":memo: *Draft reply to {_esc(who)}* (in your <{s.get('url')}|Gmail drafts>):"
    blocks: list[dict] = [{"type": "section", "text": {"type": "mrkdwn", "text": f"{head}\n{quoted}"[:2950]}}]
    if s.get("note"):
        blocks.append({"type": "context", "elements": [{"type": "mrkdwn", "text": f":raised_hand: Before sending: {_esc(s['note'])}"}]})
    if s["status"] == "drafted":
        v = f"{b['id']}|{it['id']}"
        blocks.append({"type": "actions", "block_id": f"bd_{it['id']}", "elements": [
            {"type": "button", "action_id": "brief_send", "style": "primary", "value": v, "text": {"type": "plain_text", "text": "Send email"}},
            {"type": "button", "action_id": "brief_discard", "value": v, "text": {"type": "plain_text", "text": "Discard"}}]})
    else:
        blocks.append({"type": "context", "elements": [{"type": "mrkdwn", "text": state_line(it)}]})
    return f"Draft reply to {who}", blocks


def run_brief(ctx, why: str = "asked", ai: bool = True, post: bool = True) -> dict:
    """Build the brief and post it to the owner's DM (through notify.send_brief: the Daily brief role applies)."""
    st = ctx.st
    if not st.get("roles.daily_brief", True):
        ctx.activity.add("held_back", "Held back the brief (Daily brief is off)", where="DM", outcome="skipped")
        return {"held_back": "daily_brief off"}
    b = build_brief(st, store=ctx.store, log_path=ctx.activity.path, dry=ctx.dry_run, ai=ai, why=why)
    if post and ctx.chat is not None and ctx.owner_chat_id:
        text, blocks = render_slack(b, page_url(st, ctx.dry_run))
        srcs = [{"title": it["title"], "url": it.get("url") or "", "date": (b["at"])[:10]}
                for s in b["sections"] for it in s["items"]][:6]
        r = send_brief(st, ctx.chat, ctx.owner_chat_id, text, blocks, f"brief:{b['id']}", dry_run=ctx.dry_run,
                       store=ctx.store, summary=f"Sent your brief: {b['headline']}", sources=srcs, url=page_url(st, ctx.dry_run))
        if r.get("ts"):
            b["dm"] = {"channel": r.get("channel"), "ts": r["ts"]}
            save_brief(st, b)
    else:
        ctx.activity.add("brief_sent", f"Built your brief (page only): {b['headline']}", where="page",
                         outcome="dry_run" if ctx.dry_run else "done", url=page_url(st, ctx.dry_run), ref=f"brief:{b['id']}")
    return b


def brief_me(w, e: Event) -> dict:
    ch = e.extra["channel"]
    w.activity.add("owner_instruction", f"{w.owner['first']} said “brief me”", who_asked=w.owner["first"], where="DM",
                   said="Building your brief now.", outcome="done", ref=e.id)
    if not w.st.get("roles.daily_brief", True):
        w.chat.act("post_reply", ch, {"channel": ch, "thread_ts": None, "text":
                   "Your daily brief is off. Turn on *Daily brief* in Roles and settings and ask me again."}, f"brief-off:{e.id}",
                   dry_run=w.dry_run)
        return {"held_back": "daily_brief off"}
    w.chat.act("post_reply", ch, {"channel": ch, "thread_ts": None, "text": "On it: your brief in about a minute."},
               f"brief-ack:{e.id}", dry_run=w.dry_run)
    return run_brief(w, why="asked")


def brief_due(ctx) -> bool:
    st = ctx.st
    if not st.get("roles.daily_brief", True):
        return False
    p = profile(st)
    now = datetime.now(ZoneInfo(p.get("tz", "UTC")))
    days = (p.get("working_hours") or {}).get("days") or ["Mon", "Tue", "Wed", "Thu", "Fri"]
    if now.strftime("%a") not in days:
        return False
    try:
        h, m = (int(x) for x in str(st.get("brief.at", "09:00")).split(":"))
    except ValueError:
        return False
    start = now.replace(hour=h, minute=m, second=0, microsecond=0)
    if not (start <= now < start + timedelta(hours=4)):   # only in the morning window: a late start never sends it
        return False
    day = now.strftime("%Y-%m-%d")
    if ctx.store.get_kv("job:brief_day") == day:
        return False
    ctx.store.set_kv("job:brief_day", day)
    return True


# -- the owner's taps (Slack buttons and the page) ---------------------------------------------------------------
def on_click(ex, payload: dict) -> dict | None:
    """From executor.on_interactive (the owner's click already checked)."""
    act = (payload.get("actions") or [{}])[0]
    action = CLICKS.get(act.get("action_id", ""))
    if not action or "|" not in (act.get("value") or ""):
        return None
    brief_id, item_id = act["value"].split("|", 1)
    return do_action(ex.st, brief_id, item_id, action, chat=ex.chat, dry_run=ex.dry_run, who=ex.owner["first"], via="DM")


def _draft_body(st: Settings, it: dict, mail: dict) -> tuple[str, str | None]:
    p = profile(st)
    first = p.get("preferred_name") or p["name"].split()[0]
    from .memory.discovery import load_world
    role = next((c.get("title", "") for c in load_world().get("colleagues", []) if c.get("email", "").lower() == mail["from"]), "")
    req = {"playbook": "draft_email", "from_owner": True, "owner": {"name": p["name"], "first": first},
           "mail": {"from": mail.get("from_name"), "role": role, "subject": mail.get("subject"), "text": (mail.get("text") or "")[:4000]},
           "thread_note": "The owner tapped Draft reply in the daily brief."}
    res = run_agent("draft_email " + json.dumps(req, ensure_ascii=False), DRAFT_EMAIL, label=f"draft:{it['ref']}",
                    effort=st.get("brief.effort") or None)
    if res.ok and res.output.get("body"):
        return res.output["body"].strip(), res.output.get("owner_note")
    return (f"Hi {str(mail.get('from_name') or '').split()[0]},\n\nThanks for this. [your answer]\n\n{first}",
            f"The brain could not draft this ({res.error}); fill in your answer.")


def do_action(st: Settings, brief_id: str, item_id: str, action: str, *, chat=None, dry_run: bool = False,
              who: str = "the owner", via: str = "DM") -> dict:
    """Draft a reply, send it, discard it, or accept an invite, for one brief item. Hard-blocked to seeded items."""
    with _lock:
        b = load_brief(st, brief_id)
        if not b:
            return {"ok": False, "message": "That brief is gone."}
        it = next((x for s in b["sections"] for x in s["items"] if x["id"] == item_id), None)
        if not it:
            return {"ok": False, "message": "That item is not in the brief."}
        dry = bool(b.get("dry"))
        db, logp = _paths(st, dry)
        store, act = Store(db), ActivityLog(logp)
        key = f"brief:{brief_id}:{item_id}:{action}"
        prev = store.action(key)
        if prev and prev["status"] in ("working", "done"):
            return {"ok": True, "status": (it.get("state") or {}).get("status"), "message": "Already done.", "item": it}
        st0 = (it.get("state") or {}).get("status")
        if action in ("send_email", "discard_draft") and st0 != "drafted":
            return {"ok": False, "message": "There's no draft waiting for that.", "item": it}
        if action in ("draft_reply", "accept_invite") and st0 in ("drafted", "sent", "accepted"):
            return {"ok": True, "status": st0, "message": "Already done.", "item": it}
        store.put_action(key, action, it.get("ref") or "", {"brief": brief_id, "item": item_id, "via": via}, "working")
    g = get_google(st, dry=dry)
    src = [{"title": it["title"], "url": it.get("url") or "", "date": now_iso()[:10]}]
    state: dict = dict(it.get("state") or {})
    try:
        if g is None:
            raise RuntimeError("Google is not connected")
        if action == "draft_reply":
            g.guard("draft_reply", it["ref"], {})   # the hard block before any brain run
            mail = g.get(it["ref"])
            body, note = _draft_body(st, it, mail)
            first = profile(st).get("preferred_name") or "the owner"
            body += f"\n\n--\nDrafted by {first}'s AI Peer; {first} read it before sending."
            r = g.act("draft_reply", it["ref"], {"body": body, "from_name": profile(st)["name"]}, key)
            state = {"status": "drafted", "draft_id": r["draft_id"], "to": r.get("to"), "body": body, "note": note,
                     "url": r.get("url"), "at": now_iso()}
            act.add("email_drafted", f"Drafted a reply to {it.get('from')} for {who} to check", who_asked=who, where=via,
                    said=body, sources=src, outcome="pending_approval", needs_review=True, ref=key, url=r.get("url"))
            msg = f"Draft reply to {it.get('from')} saved in your Gmail drafts."
        elif action == "send_email":
            r = g.act("send_draft", state["draft_id"], {"for_ref": it["ref"]}, key)
            state.update(status="sent", sent_at=now_iso(), sent_url=r.get("url"))
            store.set_kv(f"replied:{it['ref']}", now_iso())
            act.add("email_sent", f"Sent {who}'s reply to {it.get('from')} after {who}'s OK", who_asked=who, where=via,
                    said=state.get("body"), sources=src, outcome="done", ref=key, url=r.get("url"))
            msg = f"Sent to {it.get('from')}."
        elif action == "discard_draft":
            g.act("discard_draft", state["draft_id"], {"for_ref": it["ref"]}, key)
            state.update(status="discarded")
            act.add("resolved", f"{who} discarded the draft to {it.get('from')}", who_asked=who, where=via, outcome="skipped", ref=key)
            msg = "Draft discarded."
        elif action == "accept_invite":
            r = g.act("accept_invite", it["ref"], {}, key)
            state = {"status": "accepted", "at": now_iso()}
            act.add("invite_accepted", f"Accepted “{it['title']}” for {who} after {who}'s OK", who_asked=who, where=via,
                    outcome="done", sources=src, ref=key, url=r.get("url") or it.get("url"))
            msg = f"Accepted. {it.get('from')} gets your reply."
        else:
            raise ValueError(action)
    except Blocked as ex:
        state = {**state, "status": "blocked", "why": str(ex), "at": now_iso()}
        act.add("blocked", f"Did not {action.replace('_', ' ')} on “{it['title']}”: not a seeded test item (the test guard)",
                who_asked=who, where=via, outcome="skipped", ref=key, extra={"rule": "google.act_on_real_items is off"})
        msg = "Not done: the test guard allows this only on seeded test items."
    except Exception as ex:  # noqa: BLE001
        log.exception("brief action %s failed", key)
        state = {**state, "status": "failed", "why": str(ex)[:200], "at": now_iso()}
        act.add("failed", f"Could not {action.replace('_', ' ')}: {str(ex)[:120]}", who_asked=who, where=via, outcome="failed", ref=key)
        msg = f"That didn't work: {str(ex)[:120]}"
    with _lock:
        b = load_brief(st, brief_id, dry) or b
        it2 = next(x for s in b["sections"] for x in s["items"] if x["id"] == item_id)
        it2["state"] = state
        save_brief(st, b)
        store.put_action(key, action, it.get("ref") or "", {"brief": brief_id, "item": item_id, "via": via}, "done", result=state)
    if chat is not None and b.get("dm"):
        _update_dm(st, chat, b, it2, action, key, dry_run)
    return {"ok": state.get("status") not in ("blocked", "failed"), "status": state.get("status"), "message": msg, "item": it2}


def _update_dm(st: Settings, chat, b: dict, it: dict, action: str, key: str, dry_run: bool) -> None:
    ch, ts = b["dm"]["channel"], b["dm"]["ts"]
    try:
        text, blocks = render_slack(b, page_url(st, b.get("dry", False)))
        chat.act("update_message", ch, {"channel": ch, "ts": ts, "text": text, "blocks": blocks}, key + ":brief", dry_run=dry_run)
        s = it.get("state") or {}
        if action == "draft_reply" and s.get("status") == "drafted":
            t, bl = draft_blocks(b, it)
            r = chat.act("post_reply", ch, {"channel": ch, "thread_ts": ts, "text": t, "blocks": bl}, key + ":draft", dry_run=dry_run)
            with _lock:
                b2 = load_brief(st, b["id"], b.get("dry", False))
                for s2 in b2["sections"]:
                    for x in s2["items"]:
                        if x["id"] == it["id"] and x.get("state"):
                            x["state"]["dm_ts"] = r.get("ts")
                save_brief(st, b2)
        elif action in ("send_email", "discard_draft") and s.get("dm_ts"):
            t, bl = draft_blocks(b, it)
            chat.act("update_message", ch, {"channel": ch, "ts": s["dm_ts"], "text": t, "blocks": bl}, key + ":draftupd", dry_run=dry_run)
        elif s.get("status") in ("blocked", "failed", "accepted"):
            chat.act("post_reply", ch, {"channel": ch, "thread_ts": ts, "text": f"{it['title']}: {state_line(it)}"}, key + ":note",
                     dry_run=dry_run)
    except Exception:  # noqa: BLE001
        log.exception("updating the brief DM failed")


# -- dry runs (the scenario player) --------------------------------------------------------------------------------
def dry_step(st: Settings, w, fake, walk, step: dict) -> None:
    from . import seeds
    g = _override
    if "seed" in step:
        res = seeds.play(st, step["seed"], fake=g)
        walk.note("seeded the overnight into the fake Google", n=len(res),
                  kinds=sorted({r.get("kind") or r["type"] for r in res}))
    if "real_mail" in step:
        m = step["real_mail"]
        g.inject_mail(m["from"], m.get("name", m["from"]), m["subject"], m.get("body", ""), seeded=False)
        walk.note("a real-looking mail arrives (not seeded)", subject=m["subject"])
    if "poll" in step:
        walk.note("the Peer polls Google", **poll_google(w))
    if "brief" in step:
        opts = step["brief"] if isinstance(step["brief"], dict) else {}
        if opts.get("via") == "dm":   # the owner says "brief me" in the DM: the watcher's real path
            e = fake.inject(channel="DOWNER", user="UOWNER", text=opts.get("text", "brief me"), kind="dm")
            walk.note("owner DMs the Peer", text=opts.get("text", "brief me"))
            w.on_event(e)
            b = load_brief(st, dry=True) or {}
        else:
            b = run_brief(w, why=opts.get("why", "morning"), ai=opts.get("ai", True))
        walk.note("brief built", headline=b.get("headline"), items=b.get("counts"), backend=b.get("backend"), brain_s=b.get("brain_s"),
                  left_out=b.get("left_out"), error=b.get("error"))
    if "brief_click" in step:
        c = step["brief_click"]
        b = load_brief(st, dry=True)
        it = None
        for s in (b or {}).get("sections", []):
            for x in s["items"]:
                if c.get("real") and not x.get("seeded") and x["source"] == "google":
                    it = it or x
                elif not c.get("real") and c.get("from", "").lower() in str(x.get("from", "")).lower() and (
                        c["action"] in ("send_email", "discard_draft") or x["action"]["kind"] == c["action"]):
                    it = it or x
        if not it:
            walk.note(f"FAIL: no brief item for {c}")
            return
        aid = {v: k for k, v in CLICKS.items()}[c["action"]]
        payload = {"type": "block_actions", "user": {"id": w.owner_chat_id}, "trigger_id": "dry",
                   "actions": [{"action_id": aid, "value": f"{b['id']}|{it['id']}"}]}
        r = on_click(SimpleNamespace(st=st, chat=w.chat, dry_run=True, owner=w.owner), payload)
        label = {"draft_reply": "Draft reply", "accept_invite": "Accept", "send_email": "Send email", "discard_draft": "Discard"}
        walk.note(f"owner taps {label.get(c['action'], c['action'])} on “{it['title']}”",
                  result=(r or {}).get("status"), message=(r or {}).get("message"))
