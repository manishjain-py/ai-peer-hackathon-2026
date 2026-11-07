"""WP3 spike: prove the Google premise on the owner's Workspace (DESIGN D5), after the two logins.

Reads Gmail (profile, history.list), Calendar (a sync token, then an incremental call) and one Doc
(Drive export as markdown) on the Peer's login; then the seed account sends one test mail from a
colleague alias and one emailed invite (.ics) from another, to the owner only, and the spike checks
how they arrived (From kept or rewritten; the invite in the calendar; both recognised as seeded).
Prints counts, ids and yes/no only: never a real subject or text.
"""
from __future__ import annotations

import time

from . import seeds
from .adapters.google import CAL, GMAIL, GoogleAdapter, Token, owner_email
from .events import now_iso
from .settings import Settings


def _wait(fn, wait_s: int, every: int = 5):
    for _ in range(max(1, wait_s // every)):
        r = fn()
        if r:
            return r
        time.sleep(every)
    return None


def run(st: Settings, alias: str = "ananya", inviter: str = "kabir", wait_s: int = 150, sends: bool = True) -> dict:
    out: dict = {"at": now_iso()}
    owner = owner_email(st)
    g = GoogleAdapter(st=st)
    out["peer_scopes"] = sorted(s.rsplit("/", 1)[-1] for s in g.api.token.data.get("scopes", []))
    prof = g.api.call("GET", f"{GMAIL}/profile")
    out["gmail_account_matches"] = prof.get("emailAddress", "").lower() == owner
    out["gmail_messages_total"] = prof.get("messagesTotal")
    msgs = g.api.call("GET", f"{GMAIL}/messages", params={"maxResults": 5, "labelIds": "INBOX"}).get("messages", [])
    out["gmail_inbox_sample_ids"] = [m["id"] for m in msgs]
    if msgs:
        hid = int(g.api.call("GET", f"{GMAIL}/messages/{msgs[-1]['id']}", params={"format": "minimal"})["historyId"])
        h = g.api.call("GET", f"{GMAIL}/history", params={"startHistoryId": str(hid - 1), "historyTypes": "messageAdded",
                                                          "maxResults": 100})
        out["gmail_history_list_records"] = len(h.get("history", []))
    cur, _ = g._sense_calendar({})
    out["calendar_sync_token"] = bool(cur.get("calendar"))
    _, changes = g._sense_calendar(dict(cur))
    out["calendar_incremental_changes"] = len(changes)
    out["calendar_next_14_days"] = len(g.upcoming(14))
    docs = g.recent_docs(days=365, n=5)
    out["docs_recent_count"] = len(docs)
    if docs:
        d = g.get(f"google:doc:{docs[0]['id']}")
        out["doc_export_id"] = docs[0]["id"]
        out["doc_export_markdown_bytes"] = len((d.get("text") or "").encode())
    seed_acct = seeds.seed_account()
    out["seed_account_scopes"] = sorted(s.rsplit("/", 1)[-1] for s in Token(seed_acct).data.get("scopes", []))
    if not sends:
        return out
    people = seeds.colleagues()
    e = seeds.send_one(st, alias, "AI Peer test: alias check", "A test mail from the AI Peer's scenario script "
                       "(a seeded test item). You can delete it.")
    out["alias_sent_id"] = e.get("sent_id")
    mid = (e.get("message_id") or "").strip("<>")

    def find() -> str | None:
        for q in (f"rfc822msgid:{mid}", 'subject:"AI Peer test: alias check" newer_than:1d'):
            r = g.api.call("GET", f"{GMAIL}/messages", params={"q": q, "maxResults": 1}).get("messages", [])
            if r:
                return r[0]["id"]
        return None
    got = _wait(find, wait_s)
    out["alias_mail_arrived"] = bool(got)
    if got:
        ev = g.mail_event(g.message_meta(got))
        out["alias_mail_id"] = got
        out["alias_from_kept"] = ev.extra["from"] == people[alias]["email"].lower()
        out["alias_from_if_rewritten"] = None if out["alias_from_kept"] else ev.extra["from"]
        out["alias_mail_recognised_as_seeded"] = ev.extra["seeded"]
    e2 = seeds.send_one(st, inviter, "AI Peer test: invite check", "A test invitation from the AI Peer's scenario script "
                        "(a seeded test item).", invite={"in_days": 3, "at": "12:00", "minutes": 15})
    uid = e2["ical_uid"]
    out["invite_sent_id"] = e2.get("sent_id")
    item = _wait(lambda: (g.api.call("GET", f"{CAL}/events", params={"iCalUID": uid}).get("items") or [None])[0], wait_s)
    out["invite_in_calendar"] = bool(item)
    if item:
        me = next((a for a in item.get("attendees", []) if a.get("self")), {})
        out["invite_event_id"] = item["id"]
        out["invite_organizer_is_alias"] = (item.get("organizer") or {}).get("email", "").lower() == people[inviter]["email"].lower()
        out["invite_my_response"] = me.get("responseStatus")
        out["invite_recognised_as_seeded"] = bool(g.get(f"google:event:{item['id']}")["seeded"])
    return out
