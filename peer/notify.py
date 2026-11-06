"""Telling the owner something (a heads-up in their DM), through the owner's rules.

tell_owner() is the one door for pushes: it checks the "Watch my work" role and the owner's
mutes (F5) first; a held-back item is logged, never pushed. Each pushed DM remembers its item,
so "less of this" (or a 🔕 reaction) knows what it was about. WP3's heads-ups use the same door.
"""
from __future__ import annotations

import logging

from .activity import ActivityLog
from .settings import Settings
from .store import Store

log = logging.getLogger("peer.notify")


def tell_owner(st: Settings, chat, owner_chat_id: str | None, item: dict, why: str, *, dry_run: bool = False,
               store: Store | None = None) -> dict:
    """item: {source, kind, title, text, url, repo, branch, conclusion, draft, ref}. Returns {did, ...}."""
    from .tuning import is_muted
    store = store or Store(st.db_path)
    act = ActivityLog(st.log_path)
    src = [{"title": item.get("title", "item"), "url": item.get("url") or "", "date": (item.get("at") or "")[:10]}]
    if not st.get("roles.watch_my_work", True):
        act.add("held_back", f"Held back: {item.get('title')} (Watch my work is off)", where="DM", outcome="skipped",
                sources=src, ref=item.get("ref"), extra={"item": item})
        return {"did": "held_back", "why": "watch_my_work off"}
    m = is_muted(st, item)
    if m:
        act.add("held_back", f"Held back: {item.get('title')}", where="DM", outcome="skipped", sources=src, ref=item.get("ref"),
                said=f"Not pushed, per your rule: {m.get('rule')}", extra={"item": item, "rule_id": m.get("id")})
        return {"did": "held_back", "rule": m.get("rule")}
    key = f"tell:{item.get('ref') or item.get('url')}"
    if store.action(key):
        return {"did": "already_told"}
    link = f" <{item['url']}|open>" if str(item.get("url") or "").startswith("http") else ""
    text = (f":robot_face: *Heads-up* · {item.get('title')}{link}\n{why}\n"
            f"_Your AI Peer. Reply *less of this* (or react :no_bell:) and I'll tune it._")
    r = chat.act("dm", owner_chat_id, {"text": text}, key, dry_run=dry_run) if chat else {"ok": True, "dry_run": True}
    store.put_action(key, "dm", owner_chat_id or "", {"text": text, "item": item}, "done", result=r)
    if r.get("ts"):
        store.set_kv(f"dm_item:{r['ts']}", item)
    store.set_kv("last_told_item", item)
    act.add("told_owner", f"Told you: {item.get('title')}", where="DM", said=text, outcome="dry_run" if dry_run else "done",
            sources=src, ref=key, url=item.get("url"), extra={"item": item})
    return {"did": "told", "ts": r.get("ts")}


# -- WP4 (S3): the meetings door: the update card and the meeting brief, gated on "Cover meetings" ---------------
MEETING_BUTTONS = (("peer_mtg_approve", "Approve update", "primary"), ("peer_mtg_edit", "Edit", None), ("peer_mtg_skip", "Skip", None))


def send_meeting_dm(st: Settings, chat, owner_chat_id: str | None, text: str, blocks: list | None, key: str, *,
                    kind: str, summary: str, dry_run: bool = False, store: Store | None = None, sources: list | None = None,
                    needs_review: bool = False, meeting_id: str | None = None, said: str | None = None) -> dict:
    """One door for every meeting DM (the update card with Approve update / Edit / Skip, the "Cover for me" offer,
    the brief): the Cover meetings role, idempotency, the log. Mutes are for heads-ups, so they do not apply here."""
    store = store or Store(st.db_path)
    act = ActivityLog(st.log_path)
    if not st.get("roles.cover_meetings", True):
        act.add("held_back", f"Held back: {summary} (Cover meetings is off)", where="DM", outcome="skipped", ref=key)
        return {"did": "held_back", "why": "cover_meetings off"}
    done = store.action(key)
    if done:
        return {"did": "already_sent", **(done.get("result") or {})}
    payload = {"text": text, **({"blocks": blocks} if blocks else {})}
    r = chat.act("dm", owner_chat_id, payload, key, dry_run=dry_run) if chat else {"ok": True, "dry_run": True}
    store.put_action(key, "dm", owner_chat_id or "", {"text": text, "meeting_id": meeting_id}, "done", result=r)
    act.add(kind, summary, where="DM", said=said or text, outcome="pending_approval" if needs_review else ("dry_run" if dry_run else "done"),
            sources=sources or [], ref=key, extra={"meeting_id": meeting_id})
    return {"did": "sent", "channel": r.get("channel"), "ts": r.get("ts")}
