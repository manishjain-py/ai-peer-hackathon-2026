"""The S2 scenario script's seeds (test world only, DESIGN D4).

An overnight of mail, invites and company news from the invented colleagues, sent by the seed
account (world.yaml `mail.seed_account`: the colleagues' mailbox, its own Google login with
gmail.send only) from their aliases, **to the owner's address only**: every recipient is checked
before a send. Each seed carries a random token (the X-AI-Peer-Seed header, or the invite's UID)
recorded in ~/.ai-peer/google-seeds.jsonl. That ledger labels what was seeded and is the list the
Peer's hard block checks (act only on seeded items).

`peer seed clean` removes what it can: seeded calendar events and the Peer's drafts to the
colleagues are deleted. Seeded mail stays in the inbox (the Peer's login cannot delete mail, on
purpose); it all comes from the five aliases, so the printed Gmail search finds every piece.
Dry runs inject the same items into the fake Google instead (nothing is sent).
"""
from __future__ import annotations

import json
import secrets
import time
import urllib.parse
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import formatdate, getaddresses, make_msgid
from zoneinfo import ZoneInfo

import yaml

from .adapters.google import (CAL, GMAIL, GoogleAPI, add_seed, b64url, ledger, owner_email)
from .memory.discovery import load_world
from .settings import PKG, Settings


def scenario(name: str) -> dict:
    return yaml.safe_load((PKG / "scenarios" / f"{name}.yaml").read_text())


def seed_account() -> str:
    return (load_world().get("mail") or {})["seed_account"].lower()


def colleagues() -> dict[str, dict]:
    return {c["person_id"]: c for c in load_world()["colleagues"]}


def only_to_owner(msg: EmailMessage, owner: str) -> None:
    rcpts = [a.lower() for _, a in getaddresses(msg.get_all("To", []) + msg.get_all("Cc", []) + msg.get_all("Bcc", []))]
    if not rcpts or any(a != owner for a in rcpts):
        raise SystemExit(f"refused: a seed may go only to {owner} (got {rcpts})")


def _ical(s: str) -> str:
    return s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def _fold(line: str) -> str:
    out, cur = [], line
    while len(cur.encode()) > 73:
        out.append(cur[:73])
        cur = " " + cur[73:]
    out.append(cur)
    return "\r\n".join(out)


def mail_mime(sender: dict, owner: str, owner_name: str, subject: str, body: str, token: str) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = f"{sender['name']} <{sender['email']}>"
    msg["To"] = f"{owner_name} <{owner}>"
    msg["Subject"] = subject
    msg["Date"] = formatdate(localtime=False)
    msg["Message-ID"] = make_msgid(domain=sender["email"].split("@")[1])
    msg["X-AI-Peer-Seed"] = token
    msg.set_content(body)
    return msg


def invite_text(sender: dict, summary: str, start: datetime, description: str, tz: str) -> tuple[str, str]:
    """The invitation email's subject and text (Gmail delivers it to the inbox as well as adding the event)."""
    when = start.astimezone(ZoneInfo(tz)).strftime("%a %-d %b, %-I:%M %p")
    return (f"Invitation: {summary} @ {when}",
            f"{sender['name']} invited you to \"{summary}\" on {when} ({tz}).\n\n{description}\n")


def invite_mime(sender: dict, owner: str, owner_name: str, summary: str, start: datetime, end: datetime,
                description: str, uid: str, token: str, tz: str) -> EmailMessage:
    now = datetime.now(timezone.utc)
    lines = ["BEGIN:VCALENDAR", "PRODID:-//AI Peer//test world//EN", "VERSION:2.0", "CALSCALE:GREGORIAN", "METHOD:REQUEST",
             "BEGIN:VEVENT", f"UID:{uid}", f"DTSTAMP:{now:%Y%m%dT%H%M%SZ}", f"DTSTART:{start:%Y%m%dT%H%M%SZ}",
             f"DTEND:{end:%Y%m%dT%H%M%SZ}", f"SUMMARY:{_ical(summary)}", f"DESCRIPTION:{_ical(description)}",
             f"ORGANIZER;CN={sender['name']}:mailto:{sender['email']}",
             f"ATTENDEE;CN={owner_name};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:{owner}",
             "SEQUENCE:0", "STATUS:CONFIRMED", "TRANSP:OPAQUE", "END:VEVENT", "END:VCALENDAR"]
    ics = "\r\n".join(_fold(x) for x in lines) + "\r\n"
    msg = mail_mime(sender, owner, owner_name, *invite_text(sender, summary, start, description, tz), token)
    msg.add_alternative(ics, subtype="calendar", params={"method": "REQUEST"})
    msg.add_attachment(ics.encode(), maintype="application", subtype="ics", filename="invite.ics")
    return msg


def _when(item: dict, tz: str) -> tuple[datetime, datetime]:
    z = ZoneInfo(tz)
    h, m = (int(x) for x in str(item.get("at", "11:00")).split(":"))
    day = datetime.now(z) + timedelta(days=int(item.get("in_days", 1)))
    start = day.replace(hour=h, minute=m, second=0, microsecond=0)
    return start.astimezone(timezone.utc), (start + timedelta(minutes=int(item.get("minutes", 30)))).astimezone(timezone.utc)


def play(st: Settings, name: str = "s2-overnight", fake=None, only: str | None = None) -> list[dict]:
    """Seed the scenario's overnight. Live: sends through the seed account; dry: injects into `fake`."""
    sc = scenario(name)
    profile = json.loads(st.profile_path().read_text())
    owner, owner_name, tz = owner_email(st), profile["name"], profile.get("tz", "UTC")
    people = colleagues()
    run = f"{name}-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}"
    api = None if fake else GoogleAPI(seed_account())
    out: list[dict] = []
    items = [*({**m, "_type": "mail"} for m in sc.get("mail", [])), *({**m, "_type": "invite"} for m in sc.get("invites", []))]
    for it in items:
        if only and it.get("kind") != only:
            continue
        who = people[it["as"]]
        token = secrets.token_hex(12)
        kind = it.get("kind", "mail")
        if it["_type"] == "invite":
            start, end = _when(it, tz)
            uid = f"aipeer-seed-{token}@{who['email'].split('@')[1]}"
            if fake:
                e = fake.inject_invite(who["email"], who["name"], it["summary"], start.isoformat(), end.isoformat(),
                                       it.get("description", ""))
                # as in Gmail: the invitation also arrives as an email, with the same seed
                fake.inject_mail(who["email"], who["name"], *invite_text(who, it["summary"], start, it.get("description", ""), tz),
                                 seed_kind="invite")
                out.append({"type": "invite", "as": it["as"], "summary": it["summary"], "ref": e.ref})
                continue
            msg = invite_mime(who, owner, owner_name, it["summary"], start, end, it.get("description", ""), uid, token, tz)
            entry = {"kind": "invite", "ical_uid": uid, "subject": it["summary"], "start": start.isoformat()}
        else:
            if fake:
                e = fake.inject_mail(who["email"], who["name"], it["subject"], it["body"], seed_kind=kind)
                out.append({"type": "mail", "kind": kind, "as": it["as"], "subject": it["subject"], "ref": e.ref})
                continue
            msg = mail_mime(who, owner, owner_name, it["subject"], it["body"], token)
            entry = {"kind": kind, "subject": it["subject"]}
        only_to_owner(msg, owner)
        add_seed({"at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "run": run, "scenario": name,
                  "token": token, "from": who["email"].lower(), "to": owner, "message_id": msg["Message-ID"], **entry})
        r = api.call("POST", f"{GMAIL}/messages/send", json={"raw": b64url(msg.as_bytes())})
        out.append({"type": it["_type"], "kind": entry["kind"], "as": it["as"], "sent_id": r.get("id"), "token": token})
        print(f"seeded {entry['kind']} from {who['name']}", flush=True)
        time.sleep(1.2)
    return out


def send_one(st: Settings, person: str, subject: str, body: str, kind: str = "spike", invite: dict | None = None) -> dict:
    """One seed (the spike's alias and invite proofs). Returns the ledger entry."""
    profile = json.loads(st.profile_path().read_text())
    owner, owner_name, tz = owner_email(st), profile["name"], profile.get("tz", "UTC")
    who = colleagues()[person]
    token = secrets.token_hex(12)
    entry = {"at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "run": f"spike-{int(time.time())}",
             "scenario": "spike", "token": token, "from": who["email"].lower(), "to": owner, "kind": kind, "subject": subject}
    if invite:
        start, end = _when(invite, tz)
        uid = f"aipeer-seed-{token}@{who['email'].split('@')[1]}"
        msg = invite_mime(who, owner, owner_name, subject, start, end, body, uid, token, tz)
        entry.update(kind="invite", ical_uid=uid, start=start.isoformat())
    else:
        msg = mail_mime(who, owner, owner_name, subject, body, token)
    only_to_owner(msg, owner)
    entry["message_id"] = msg["Message-ID"]
    add_seed(entry)
    r = GoogleAPI(seed_account()).call("POST", f"{GMAIL}/messages/send", json={"raw": b64url(msg.as_bytes())})
    entry["sent_id"] = r.get("id")
    return entry


def clean(st: Settings) -> dict:
    """Delete seeded calendar events and the Peer's drafts to the colleagues; print the search for seeded mail."""
    from .adapters.google import GoogleAdapter
    g = GoogleAdapter(st=st)
    led = ledger()
    events = 0
    for uid in list(led["by_uid"]):
        for it in g.api.call("GET", f"{CAL}/events", params={"iCalUID": uid}).get("items", []):
            if it.get("status") != "cancelled":
                g.delete_event(it["id"])
                events += 1
    drafts = 0
    senders = led["senders"]
    for d in g.api.call("GET", f"{GMAIL}/drafts", params={"maxResults": 100}).get("drafts", []):
        full = g.api.call("GET", f"{GMAIL}/drafts/{d['id']}", params={"format": "metadata"})
        h = {x["name"].lower(): x["value"] for x in (full.get("message", {}).get("payload") or {}).get("headers", [])}
        rcpts = [a.lower() for _, a in getaddresses([h.get("to", ""), h.get("cc", "")]) if a]
        if rcpts and all(a in senders for a in rcpts):
            g.api.call("DELETE", f"{GMAIL}/drafts/{d['id']}")
            drafts += 1
    for tok in list(led["by_token"]):
        add_seed({"removed": True, "token": tok, "at": datetime.now(timezone.utc).isoformat(timespec="seconds")})
    aliases = sorted({c["email"] for c in colleagues().values()})
    q = "from:(" + " OR ".join(aliases) + ")"
    url = f"https://mail.google.com/mail/u/{owner_email(st)}/#search/" + urllib.parse.quote(q)
    return {"events_deleted": events, "drafts_deleted": drafts, "ledger_entries_closed": len(led["by_token"]),
            "seeded_mail_search": q, "open_in_gmail": url}
