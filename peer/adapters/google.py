"""Google adapter (WP3): the owner's Gmail, Calendar and Drive/Docs, on polling (no AI).

Login (DESIGN D5): an **Internal** OAuth client (Desktop app) of the owner's Workspace, file
~/.ai-peer/google-client.json (docs/build/setup/google.md). One login per account, each a Google
consent page in a browser on this Mac (login_hint), then a check of who signed in:
- the Peer, the owner's account: gmail.readonly, gmail.compose, calendar.events, drive.readonly
- the test world's seed account (`mail.seed_account`): gmail.send only, for the scenario script (peer/seeds.py)
Both also ask `openid email` (the account check). Never full-mail or admin scopes.
Tokens: ~/.ai-peer/google-token-<account>.json (chmod 600), never in a repo or an owner folder.

Verbs: sense (Gmail history.list + Calendar syncToken), search (Gmail + Drive), get (a mail, an
event, a Doc exported as markdown), act (draft_reply, send_draft, discard_draft, accept_invite).
The executor/brief calls act only after the owner's tap (D9: emails and invites ask first).
**Hard block:** until the owner turns on google.act_on_real_items, act runs only on seeded
items: a random token the seed script writes to ~/.ai-peer/google-seeds.jsonl and puts in each
mail's X-AI-Peer-Seed header or an invite's UID. A scripted click counts as the owner's tap, so
this block is what keeps a test from touching real mail or invites.
"""
from __future__ import annotations

import base64
import hashlib
import html
import http.server
import json
import os
import re
import secrets
import subprocess
import threading
import time
import urllib.parse
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import getaddresses, parseaddr
from pathlib import Path
from typing import Any

import httpx

from ..events import Event, now_iso
from ..settings import PEER_HOME, get_settings
from .base import Adapter, Blocked, NotOffered  # Blocked: the hard block's refusal (port-check: "blocked")

CLIENT_FILE = PEER_HOME / "google-client.json"
SEED_LEDGER = PEER_HOME / "google-seeds.jsonl"
AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me"
CAL = "https://www.googleapis.com/calendar/v3/calendars/primary"
DRIVE = "https://www.googleapis.com/drive/v3"

_S = "https://www.googleapis.com/auth/"
ID_SCOPES = ["openid", "email"]
PEER_SCOPES = [_S + "gmail.readonly", _S + "gmail.compose", _S + "calendar.events", _S + "drive.readonly"]
SEED_SCOPES = [_S + "gmail.send"]
NEVER = {"https://mail.google.com/", _S + "gmail.modify", _S + "gmail.settings.sharing", _S + "gmail.settings.basic",
         _S + "calendar", _S + "drive", _S + "admin.directory.user"}
ACTS = ("draft_reply", "send_draft", "discard_draft", "accept_invite")
MAIL_HEADERS = ["From", "To", "Cc", "Reply-To", "Subject", "Date", "Message-ID", "References", "X-AI-Peer-Seed",
                "List-Unsubscribe", "Precedence"]


class GoogleError(Exception):
    def __init__(self, status: int, msg: str):
        super().__init__(f"google {status}: {msg}")
        self.status = status


def b64url(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode().rstrip("=")


def _unb64(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def token_path(email: str) -> Path:
    return PEER_HOME / f"google-token-{email.split('@')[0].lower()}.json"


def _write_private(path: Path, data: dict) -> None:
    tmp = path.with_suffix(".tmp")
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump(data, f, indent=1)
    os.chmod(tmp, 0o600)
    tmp.replace(path)


def _client() -> dict:
    if not CLIENT_FILE.exists():
        raise GoogleError(0, f"no OAuth client at {CLIENT_FILE} (docs/build/setup/google.md)")
    d = json.loads(CLIENT_FILE.read_text())
    c = d.get("installed") or d.get("web") or {}
    if not c.get("client_id") or not c.get("client_secret"):
        raise GoogleError(0, "the client file has no client_id/client_secret")
    return {"client_id": c["client_id"], "client_secret": c["client_secret"]}


def _claims(id_token: str) -> dict:
    """The ID token's payload. It came straight from Google's token endpoint over TLS, so it is
    read, not re-verified."""
    try:
        return json.loads(_unb64(id_token.split(".")[1]))
    except Exception:  # noqa: BLE001
        return {}


def owner_email(st=None) -> str:
    st = st or get_settings()
    return json.loads(st.profile_path().read_text())["email"].lower()


def connected(email: str | None = None) -> bool:
    """True when the Peer's login exists (used by the setup page's sidebar and discovery)."""
    try:
        return token_path(email or owner_email()).exists() and CLIENT_FILE.exists()
    except Exception:  # noqa: BLE001
        return False


# -- login (the consent page, once per account) ---------------------------------------------------------
def login(email: str, scopes: list[str], open_browser: bool = True, timeout_s: int = 900) -> dict:
    """The Desktop-app loopback flow with PKCE: a consent page for `email`, then the account check.
    Saves the token only when the signed-in account is `email` and no forbidden scope was granted."""
    client = _client()
    verifier = b64url(secrets.token_bytes(48))
    challenge = b64url(hashlib.sha256(verifier.encode()).digest())
    state = secrets.token_urlsafe(16)
    got: dict[str, str | None] = {}

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):  # noqa: N802
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            if q.get("state", [""])[0] != state:
                self.send_response(400)
                self.end_headers()
                return
            got["code"] = q.get("code", [None])[0]
            got["error"] = q.get("error", [None])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            msg = "Signed in. You can close this tab." if got["code"] else f"Not signed in ({html.escape(str(got['error']))})."
            self.wfile.write(f"<html><body style='font:18px sans-serif;padding:40px'><b>AI Peer</b>: {msg}</body></html>".encode())

        def log_message(self, *a):  # quiet
            pass

    srv = http.server.HTTPServer(("127.0.0.1", 0), Handler)
    srv.timeout = 2
    redirect = f"http://127.0.0.1:{srv.server_address[1]}"
    params = {"client_id": client["client_id"], "redirect_uri": redirect, "response_type": "code",
              "scope": " ".join(ID_SCOPES + scopes), "access_type": "offline", "prompt": "consent",
              "login_hint": email, "hd": email.split("@")[1], "code_challenge": challenge,
              "code_challenge_method": "S256", "state": state}
    url = AUTH_URL + "?" + urllib.parse.urlencode(params)
    (PEER_HOME / "google-login-url.txt").write_text(url + "\n")
    print(f"Consent page for {email} (also in {PEER_HOME / 'google-login-url.txt'}):\n{url}\n", flush=True)
    if open_browser:
        subprocess.run(["open", url], check=False)
    deadline = time.time() + timeout_s
    while not got and time.time() < deadline:
        srv.handle_request()
    srv.server_close()
    if not got.get("code"):
        raise GoogleError(0, f"no sign-in ({got.get('error') or 'timed out'})")
    r = httpx.post(TOKEN_URL, data={"code": got["code"], "client_id": client["client_id"],
                                    "client_secret": client["client_secret"], "redirect_uri": redirect,
                                    "grant_type": "authorization_code", "code_verifier": verifier}, timeout=30)
    if r.status_code != 200:
        raise GoogleError(r.status_code, f"token exchange failed: {r.json().get('error')}")
    tok = r.json()
    claims = _claims(tok.get("id_token", ""))
    who = (claims.get("email") or "").lower()
    if who != email.lower() or not claims.get("email_verified"):
        raise GoogleError(0, f"signed in as {who or 'an unknown account'}, not {email}: token not saved")
    granted = set((tok.get("scope") or "").split())
    if granted & NEVER:
        raise GoogleError(0, f"refused: forbidden scopes granted {sorted(granted & NEVER)}")
    missing = set(scopes) - granted
    if missing:
        raise GoogleError(0, f"some boxes were left unticked on the consent page: {sorted(missing)}; run the login again")
    if not tok.get("refresh_token"):
        raise GoogleError(0, "no refresh token returned; run the login again")
    data = {"email": who, "hd": claims.get("hd"), "client_id": client["client_id"], "refresh_token": tok["refresh_token"],
            "access_token": tok["access_token"], "expires_at": time.time() + int(tok.get("expires_in", 3600)),
            "scopes": sorted(granted), "signed_in_at": now_iso()}
    _write_private(token_path(who), data)
    out = {"email": who, "hd": claims.get("hd"), "scopes": sorted(s.replace(_S, "") for s in granted),
           "token_file": str(token_path(who))}
    if _S + "gmail.readonly" in granted:   # the Peer's login: Gmail's own view of the account too
        prof = GoogleAPI(who).call("GET", f"{GMAIL}/profile")
        if prof.get("emailAddress", "").lower() != who:
            token_path(who).unlink()
            raise GoogleError(0, "Gmail's profile does not match the signed-in account: token removed")
        out["gmail_profile"] = "matches"
    return out


class Token:
    def __init__(self, email: str):
        self.email = email
        self.path = token_path(email)
        if not self.path.exists():
            raise GoogleError(0, f"{email} is not signed in (peer google login)")
        self.data = json.loads(self.path.read_text())
        self._lock = threading.Lock()

    def access(self, force: bool = False) -> str:
        with self._lock:
            if not force and self.data.get("access_token") and self.data.get("expires_at", 0) > time.time() + 90:
                return self.data["access_token"]
            c = _client()
            r = httpx.post(TOKEN_URL, data={"client_id": c["client_id"], "client_secret": c["client_secret"],
                                            "refresh_token": self.data["refresh_token"], "grant_type": "refresh_token"},
                           timeout=30)
            if r.status_code != 200:
                raise GoogleError(r.status_code, f"token refresh failed for {self.email}: {r.json().get('error')}")
            j = r.json()
            self.data.update(access_token=j["access_token"], expires_at=time.time() + int(j.get("expires_in", 3600)))
            _write_private(self.path, self.data)
            return self.data["access_token"]


class GoogleAPI:
    def __init__(self, email: str):
        self.email = email
        self.token = Token(email)
        self.http = httpx.Client(timeout=40)

    def call(self, method: str, url: str, **kw) -> Any:
        r = None
        for attempt in range(3):
            headers = {"Authorization": f"Bearer {self.token.access(force=attempt > 0 and r is not None and r.status_code == 401)}"}
            r = self.http.request(method, url, headers=headers, **kw)
            if r.status_code == 401 and attempt == 0:
                continue
            if r.status_code in (429, 500, 502, 503) and attempt < 2:
                time.sleep(2 + 3 * attempt)
                continue
            break
        if r.status_code >= 400:
            try:
                err = r.json().get("error", {})
                msg = err.get("message") if isinstance(err, dict) else str(err)
            except ValueError:
                msg = r.text[:120]
            raise GoogleError(r.status_code, (msg or "")[:200])
        if not r.content:
            return {}
        return r.json() if "json" in r.headers.get("content-type", "") else r.text


# -- the seed ledger (what the scenario script sent; the hard block's list) ----------------------------
_ledger_cache: dict[str, Any] = {"mtime": None, "by_token": {}, "by_uid": {}, "senders": set(), "removed": set()}


def ledger() -> dict:
    try:
        mtime = SEED_LEDGER.stat().st_mtime
    except OSError:
        return {"by_token": {}, "by_uid": {}, "senders": set(), "removed": set()}
    if mtime != _ledger_cache["mtime"]:
        by_token, by_uid, senders, removed = {}, {}, set(), set()
        for line in SEED_LEDGER.read_text().splitlines():
            try:
                e = json.loads(line)
            except ValueError:
                continue
            if e.get("removed"):
                removed.add(e.get("token"))
                continue
            by_token[e["token"]] = e
            if e.get("ical_uid"):
                by_uid[e["ical_uid"]] = e
            if e.get("from"):
                senders.add(e["from"].lower())
        for tok in removed:   # cleaned seeds are no longer act-able
            gone = by_token.pop(tok, None)
            if gone and gone.get("ical_uid"):
                by_uid.pop(gone["ical_uid"], None)
        _ledger_cache.update(mtime=mtime, by_token=by_token, by_uid=by_uid, senders=senders, removed=removed)
    return _ledger_cache


def add_seed(entry: dict) -> None:
    with SEED_LEDGER.open("a") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def seed_for_mail(headers: dict[str, str]) -> dict | None:
    """A received mail is seeded when its X-AI-Peer-Seed token is in the ledger and it comes from that seed's sender."""
    tok = (headers.get("x-ai-peer-seed") or "").strip()
    e = ledger()["by_token"].get(tok) if tok else None
    if not e:
        return None
    frm = parseaddr(headers.get("from", ""))[1].lower()
    return e if frm == (e.get("from") or "").lower() else None


def seed_for_event(ical_uid: str | None) -> dict | None:
    return ledger()["by_uid"].get(ical_uid) if ical_uid else None


# -- shapes shared by the real adapter and the fake ---------------------------------------------------------
def mail_url(owner: str, thread_id: str) -> str:
    return f"https://mail.google.com/mail/u/{owner}/#inbox/{thread_id}"


def make_mail_event(owner: str, mid: str, thread_id: str, headers: dict[str, str], snippet: str, at: str,
                    labels: list[str] | None = None, seed: dict | None = None) -> Event:
    frm_name, frm = parseaddr(headers.get("from", ""))
    to = [a.lower() for _, a in getaddresses([headers.get("to", "")]) if a]
    cc = [a.lower() for _, a in getaddresses([headers.get("cc", "")]) if a]
    subject = headers.get("subject") or "(no subject)"
    bulk = bool(headers.get("list-unsubscribe")) or headers.get("precedence", "").lower() in ("bulk", "list", "junk")
    return Event(id=f"google:mail:{mid}", source="google", kind="email", at=at, actor=frm.lower(),
                 ref=f"google:mail:{mid}", thread_ref=f"google:thread:{thread_id}",
                 text=f"{subject}\n{html.unescape(snippet or '')}", url=mail_url(owner, thread_id),
                 extra={"subject": subject, "from_name": frm_name or frm, "from": frm.lower(), "to": to, "cc": cc,
                        "thread_id": thread_id, "labels": labels or [], "bulk": bulk,
                        "direct": owner.lower() in to, "only_to_owner": to == [owner.lower()] and not cc,
                        "seeded": bool(seed), "seed": seed.get("token") if seed else None,
                        "seed_kind": seed.get("kind") if seed else None})


def make_calendar_event(it: dict, seed: dict | None = None) -> Event | None:
    if it.get("status") == "cancelled":
        return None
    me = next((a for a in it.get("attendees", []) if a.get("self")), None)
    org = it.get("organizer") or {}
    kind = "invite" if me and me.get("responseStatus") == "needsAction" and not org.get("self") else "event"
    start = (it.get("start") or {}).get("dateTime") or (it.get("start") or {}).get("date")
    end = (it.get("end") or {}).get("dateTime") or (it.get("end") or {}).get("date")
    summary = it.get("summary") or "(no title)"
    return Event(id=f"google:event:{it['id']}:{it.get('updated', '')}", source="google", kind=kind,
                 at=it.get("updated") or now_iso(), actor=(org.get("email") or "").lower(), ref=f"google:event:{it['id']}",
                 thread_ref=None, text=f"{summary} · {start}", url=it.get("htmlLink"),
                 extra={"summary": summary, "start": start, "end": end, "organizer": (org.get("email") or "").lower(),
                        "organizer_name": org.get("displayName") or org.get("email"),
                        "response": me.get("responseStatus") if me else None, "ical_uid": it.get("iCalUID"),
                        "event_id": it["id"], "location": it.get("location"),
                        "description": (it.get("description") or "")[:600],
                        "seeded": bool(seed), "seed": seed.get("token") if seed else None})


def _plain_text(payload: dict) -> str:
    """The text/plain body of a Gmail message (falls back to text/html with tags stripped)."""
    plain, htm = [], []

    def walk(p: dict) -> None:
        mt = p.get("mimeType", "")
        data = (p.get("body") or {}).get("data")
        if data and mt == "text/plain":
            plain.append(_unb64(data).decode("utf-8", "replace"))
        elif data and mt == "text/html":
            htm.append(_unb64(data).decode("utf-8", "replace"))
        for sub in p.get("parts") or []:
            walk(sub)

    walk(payload)
    if plain:
        return "\n".join(plain)
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", "\n".join(htm), flags=re.S | re.I)
    return html.unescape(re.sub(r"<[^>]+>", " ", text))


class GoogleAdapter(Adapter):
    name = "google"
    capabilities = frozenset({"sense", "search", "get", *(f"act:{a}" for a in ACTS)})

    def __init__(self, email: str | None = None, st=None):
        self.st = st or get_settings()
        self.email = (email or owner_email(self.st)).lower()
        self.api = GoogleAPI(self.email)

    @classmethod
    def from_settings(cls, st) -> "GoogleAdapter":
        """port-check: the owner's Peer login (`peer google login peer` first)."""
        return cls(st=st)

    # -- sense -------------------------------------------------------------------------------------
    def sense(self, cursor: str | None) -> tuple[list[Event], str | None]:
        cur = json.loads(cursor) if cursor else {}
        events: list[Event] = []
        cur, evs = self._sense_gmail(cur)
        events += evs
        cur, evs = self._sense_calendar(cur)
        events += evs
        return events, json.dumps(cur)

    def _sense_gmail(self, cur: dict) -> tuple[dict, list[Event]]:
        hid = cur.get("gmail")
        if not hid:   # first run: start from now, no backlog
            cur["gmail"] = str(self.api.call("GET", f"{GMAIL}/profile")["historyId"])
            return cur, []
        ids: list[str] = []
        newest, page = hid, None
        try:
            while True:
                params = {"startHistoryId": hid, "historyTypes": "messageAdded", "labelId": "INBOX", "maxResults": 100}
                if page:
                    params["pageToken"] = page
                r = self.api.call("GET", f"{GMAIL}/history", params=params)
                for h in r.get("history", []):
                    for m in h.get("messagesAdded", []):
                        labels = m["message"].get("labelIds", [])
                        if "INBOX" in labels and "DRAFT" not in labels and "SENT" not in labels:
                            ids.append(m["message"]["id"])
                newest = str(r.get("historyId", newest))
                page = r.get("nextPageToken")
                if not page:
                    break
        except GoogleError as e:
            if e.status == 404:   # the cursor is too old: restart from now
                cur["gmail"] = str(self.api.call("GET", f"{GMAIL}/profile")["historyId"])
                return cur, []
            raise
        cur["gmail"] = newest
        out = []
        for mid in dict.fromkeys(ids):
            try:
                out.append(self.mail_event(self.message_meta(mid)))
            except GoogleError as e:
                if e.status != 404:   # deleted since
                    raise
        return cur, out

    def message_meta(self, mid: str) -> dict:
        params = [("format", "metadata"), *[("metadataHeaders", h) for h in MAIL_HEADERS]]
        return self.api.call("GET", f"{GMAIL}/messages/{mid}", params=params)

    def mail_event(self, m: dict) -> Event:
        headers = {h["name"].lower(): h["value"] for h in (m.get("payload") or {}).get("headers", [])}
        at = datetime.fromtimestamp(int(m.get("internalDate", "0")) / 1000, timezone.utc).isoformat(timespec="seconds")
        return make_mail_event(self.email, m["id"], m["threadId"], headers, m.get("snippet", ""), at,
                               m.get("labelIds", []), seed_for_mail(headers))

    def _sense_calendar(self, cur: dict) -> tuple[dict, list[Event]]:
        tok = cur.get("calendar")
        page = None
        if not tok:   # first run: page through once for a sync token, no backlog
            while True:
                r = self.api.call("GET", f"{CAL}/events", params={"maxResults": 2500, **({"pageToken": page} if page else {})})
                page = r.get("nextPageToken")
                if not page:
                    cur["calendar"] = r.get("nextSyncToken")
                    return cur, []
        out: list[Event] = []
        try:
            while True:
                r = self.api.call("GET", f"{CAL}/events", params={"maxResults": 2500, "syncToken": tok,
                                                                  **({"pageToken": page} if page else {})})
                for it in r.get("items", []):
                    e = make_calendar_event(it, seed_for_event(it.get("iCalUID")))
                    if e:
                        out.append(e)
                page = r.get("nextPageToken")
                if not page:
                    cur["calendar"] = r.get("nextSyncToken") or tok
                    break
        except GoogleError as e:
            if e.status == 410:   # the sync token expired: start over from now
                cur.pop("calendar", None)
                return self._sense_calendar(cur)
            raise
        return cur, out

    # -- search / get ---------------------------------------------------------------------------------
    def search(self, query: str, filters: dict | None = None) -> list[dict]:
        out = []
        r = self.api.call("GET", f"{GMAIL}/messages", params={"q": query, "maxResults": 8})
        for m in r.get("messages", []):
            e = self.mail_event(self.message_meta(m["id"]))
            out.append({"ref": e.ref, "snippet": e.text[:200], "url": e.url, "title": e.extra["subject"], "at": e.at,
                        "seeded": e.extra["seeded"]})
        q = "fullText contains '" + query.replace("\\", "\\\\").replace("'", "\\'") + "' and trashed=false"
        r = self.api.call("GET", f"{DRIVE}/files", params={"q": q, "pageSize": 8,
                                                           "fields": "files(id,name,mimeType,modifiedTime,webViewLink)"})
        for f in r.get("files", []):
            out.append({"ref": f"google:doc:{f['id']}", "snippet": f["name"], "url": f.get("webViewLink"),
                        "title": f["name"], "at": f.get("modifiedTime"), "seeded": False})
        return out

    def get(self, ref: str) -> dict:
        _, kind, rid = ref.split(":", 2)
        if kind == "mail":
            m = self.api.call("GET", f"{GMAIL}/messages/{rid}", params={"format": "full"})
            h = {x["name"].lower(): x["value"] for x in (m.get("payload") or {}).get("headers", [])}
            e = self.mail_event(m)
            return {"ref": ref, "subject": e.extra["subject"], "from": e.extra["from"], "from_name": e.extra["from_name"],
                    "reply_to": parseaddr(h.get("reply-to", ""))[1].lower() or e.extra["from"], "to": e.extra["to"],
                    "cc": e.extra["cc"], "date": h.get("date"), "message_id": h.get("message-id"),
                    "references": h.get("references", ""), "thread_id": m["threadId"], "text": _plain_text(m.get("payload") or {}),
                    "url": e.url, "seeded": e.extra["seeded"], "at": e.at}
        if kind == "event":
            it = self.api.call("GET", f"{CAL}/events/{rid}")
            e = make_calendar_event(it, seed_for_event(it.get("iCalUID")))
            return {"ref": ref, **(e.extra if e else {}), "url": it.get("htmlLink"), "seeded": bool(e and e.extra["seeded"]),
                    "attendees": it.get("attendees", []), "status": it.get("status")}
        if kind == "doc":
            meta = self.api.call("GET", f"{DRIVE}/files/{rid}", params={"fields": "id,name,modifiedTime,webViewLink"})
            text = self.api.call("GET", f"{DRIVE}/files/{rid}/export", params={"mimeType": "text/markdown"})
            return {"ref": ref, "title": meta.get("name"), "modified": meta.get("modifiedTime"), "url": meta.get("webViewLink"),
                    "text": text if isinstance(text, str) else json.dumps(text)}
        raise ValueError(ref)

    # helpers for discovery and the spike -------------------------------------------------------------------
    def recent_docs(self, days: int = 90, n: int = 25) -> list[dict]:
        since = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%S")
        r = self.api.call("GET", f"{DRIVE}/files", params={
            "q": f"mimeType='application/vnd.google-apps.document' and trashed=false and modifiedTime > '{since}'",
            "orderBy": "modifiedTime desc", "pageSize": n,
            "fields": "files(id,name,modifiedTime,webViewLink,owners(displayName,emailAddress),shared)"})
        return r.get("files", [])

    def upcoming(self, days: int = 14) -> list[Event]:
        now = datetime.now(timezone.utc)
        r = self.api.call("GET", f"{CAL}/events", params={"timeMin": now.isoformat(), "timeMax": (now + timedelta(days=days)).isoformat(),
                                                          "singleEvents": "true", "orderBy": "startTime", "maxResults": 250})
        return [e for e in (make_calendar_event(it, seed_for_event(it.get("iCalUID"))) for it in r.get("items", [])) if e]

    # -- act (after the owner's tap; the hard block first) --------------------------------------------------
    def guard(self, action: str, target: str, payload: dict) -> None:
        """D9 + tests: until the owner lifts google.act_on_real_items, act only on seeded items."""
        if self.st.get("google.act_on_real_items", False):
            return
        if action == "draft_reply":
            ok = self.get(target)["seeded"]
        elif action in ("send_draft", "discard_draft"):
            d = self.api.call("GET", f"{GMAIL}/drafts/{target}", params={"format": "metadata"})
            h = {x["name"].lower(): x["value"] for x in (d.get("message", {}).get("payload") or {}).get("headers", [])}
            rcpts = [a.lower() for _, a in getaddresses([h.get("to", ""), h.get("cc", ""), h.get("bcc", "")]) if a]
            ok = bool(rcpts) and all(a in ledger()["senders"] for a in rcpts)
        elif action == "accept_invite":
            ok = self.get(target)["seeded"]
        else:
            ok = False
        if not ok:
            raise Blocked(f"{action} refused: not a seeded test item, and google.act_on_real_items is off")

    def act(self, action: str, target: str, payload: dict, idempotency_key: str, dry_run: bool = False) -> dict:
        if not self.offers(action):
            raise NotOffered(f"google.act:{action}")
        self.guard(action, target, payload)
        if dry_run:
            return {"ok": True, "dry_run": True, "action": action, "target": target}
        if action == "draft_reply":
            m = self.get(target)
            msg = reply_mime(self.email, payload.get("from_name") or "", m, payload["body"])
            r = self.api.call("POST", f"{GMAIL}/drafts", json={"message": {"raw": b64url(msg.as_bytes()), "threadId": m["thread_id"]}})
            return {"ok": True, "draft_id": r["id"], "to": [m["reply_to"]], "thread_id": m["thread_id"],
                    "url": f"https://mail.google.com/mail/u/{self.email}/#drafts?compose={r['message']['id']}"}
        if action == "send_draft":
            r = self.api.call("POST", f"{GMAIL}/drafts/send", json={"id": target})
            return {"ok": True, "message_id": r.get("id"), "thread_id": r.get("threadId"),
                    "url": mail_url(self.email, r.get("threadId", ""))}
        if action == "discard_draft":
            self.api.call("DELETE", f"{GMAIL}/drafts/{target}")
            return {"ok": True}
        if action == "accept_invite":
            rid = target.split(":", 2)[2]
            it = self.api.call("GET", f"{CAL}/events/{rid}")
            atts = it.get("attendees", [])
            me = next((a for a in atts if a.get("self")), None)
            if not me:
                raise RuntimeError("you are not an attendee of this event")
            me["responseStatus"] = "accepted"
            r = self.api.call("PATCH", f"{CAL}/events/{rid}", params={"sendUpdates": "all"}, json={"attendees": atts})
            return {"ok": True, "response": "accepted", "url": r.get("htmlLink"), "summary": r.get("summary")}
        raise ValueError(action)

    def delete_event(self, rid: str) -> None:
        """Seed clean-up only: remove a seeded event from the owner's calendar, telling nobody."""
        self.api.call("DELETE", f"{CAL}/events/{rid}", params={"sendUpdates": "none"})

    def check(self) -> dict[str, Any]:
        try:
            p = self.api.call("GET", f"{GMAIL}/profile")
            return {"ok": p.get("emailAddress", "").lower() == self.email, "detail": "gmail profile matches" if
                    p.get("emailAddress", "").lower() == self.email else "gmail profile does not match"}
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "detail": str(e)[:120]}


def reply_mime(owner: str, owner_name: str, m: dict, body: str) -> EmailMessage:
    """A reply in the same thread, to the original sender only (no Cc)."""
    msg = EmailMessage()
    msg["From"] = f"{owner_name} <{owner}>" if owner_name else owner
    msg["To"] = m["reply_to"]
    subj = m.get("subject") or ""
    msg["Subject"] = subj if subj.lower().startswith("re:") else f"Re: {subj}"
    if m.get("message_id"):
        msg["In-Reply-To"] = m["message_id"]
        msg["References"] = f"{m.get('references', '')} {m['message_id']}".strip()
    msg.set_content(body)
    return msg


# -- the fake, for dry runs: the same shapes, nothing leaves the machine ----------------------------------------------
class FakeGoogleAdapter(Adapter):
    """Injected mail and invites, recorded acts; the same hard block. State persists to a JSON file so
    a dry-run brief's page can act on it later (`peer web` on a test owner, /brief?dry=1)."""
    name = "google"
    capabilities = frozenset({"sense", "search", "get", *(f"act:{a}" for a in ACTS)})

    def __init__(self, owner: str, state_path: Path | None = None, st=None):
        self.email = owner.lower()
        self.st = st or get_settings()
        self.path = state_path
        self.state = {"mails": {}, "events": {}, "drafts": {}, "queue": [], "acts": []}
        if state_path and state_path.exists():
            self.state = json.loads(state_path.read_text())

    def save(self) -> None:
        if self.path:
            self.path.write_text(json.dumps(self.state, ensure_ascii=False, indent=1))

    def inject_mail(self, frm: str, frm_name: str, subject: str, body: str, *, seeded: bool = True,
                    seed_kind: str = "mail", to: list[str] | None = None, bulk: bool = False) -> Event:
        n = len(self.state["mails"]) + 1
        mid, tid = f"fake{n:04d}", f"fthread{n:04d}"
        headers = {"from": f"{frm_name} <{frm}>", "to": ", ".join(to or [self.email]), "subject": subject,
                   "message-id": f"<{mid}@fake.local>"}
        if bulk:
            headers["list-unsubscribe"] = "<mailto:unsubscribe@example.com>"
        seed = {"token": f"fake-{mid}", "kind": seed_kind, "from": frm} if seeded else None
        e = make_mail_event(self.email, mid, tid, headers, body[:180], now_iso(), ["INBOX"], seed)
        self.state["mails"][mid] = {"headers": headers, "body": body, "thread_id": tid, "seed": seed, "event": json.loads(e.to_json())}
        self.state["queue"].append(json.loads(e.to_json()))
        self.save()
        return e

    def inject_invite(self, organizer: str, name: str, summary: str, start: str, end: str, description: str = "",
                      *, seeded: bool = True) -> Event:
        n = len(self.state["events"]) + 1
        rid = f"fevent{n:04d}"
        it = {"id": rid, "iCalUID": f"{rid}@fake.local", "summary": summary, "description": description,
              "start": {"dateTime": start}, "end": {"dateTime": end}, "updated": now_iso(), "status": "confirmed",
              "htmlLink": f"https://calendar.google.com/calendar/event?eid={rid}",
              "organizer": {"email": organizer, "displayName": name},
              "attendees": [{"email": organizer, "displayName": name, "organizer": True, "responseStatus": "accepted"},
                            {"email": self.email, "self": True, "responseStatus": "needsAction"}]}
        seed = {"token": f"fake-{rid}", "kind": "invite", "from": organizer} if seeded else None
        e = make_calendar_event(it, seed)
        self.state["events"][rid] = {"item": it, "seed": seed}
        self.state["queue"].append(json.loads(e.to_json()))
        self.save()
        return e

    def sense(self, cursor: str | None) -> tuple[list[Event], str | None]:
        start = int(cursor or 0)
        return [Event.from_dict(d) for d in self.state["queue"][start:]], str(len(self.state["queue"]))

    def search(self, query: str, filters: dict | None = None) -> list[dict]:
        q = query.lower()
        return [{"ref": f"google:mail:{k}", "snippet": v["body"][:200], "url": None, "title": v["headers"]["subject"],
                 "seeded": bool(v["seed"])} for k, v in self.state["mails"].items() if q in (v["headers"]["subject"] + v["body"]).lower()]

    def get(self, ref: str) -> dict:
        _, kind, rid = ref.split(":", 2)
        if kind == "mail":
            v = self.state["mails"][rid]
            ev = v["event"]["extra"]
            return {"ref": ref, "subject": ev["subject"], "from": ev["from"], "from_name": ev["from_name"], "reply_to": ev["from"],
                    "to": ev["to"], "cc": [], "message_id": v["headers"]["message-id"], "references": "",
                    "thread_id": v["thread_id"], "text": v["body"], "url": v["event"]["url"], "seeded": bool(v["seed"]),
                    "at": v["event"]["at"]}
        if kind == "event":
            v = self.state["events"][rid]
            e = make_calendar_event(v["item"], v["seed"])
            return {"ref": ref, **e.extra, "url": v["item"]["htmlLink"], "seeded": bool(v["seed"]), "attendees": v["item"]["attendees"]}
        raise ValueError(ref)

    def guard(self, action: str, target: str, payload: dict) -> None:
        if self.st.get("google.act_on_real_items", False):
            return
        if action in ("draft_reply", "accept_invite"):
            ok = self.get(target)["seeded"]
        elif action in ("send_draft", "discard_draft"):
            d = self.state["drafts"].get(target)
            ok = bool(d) and self.get(d["for_ref"])["seeded"]
        else:
            ok = False
        if not ok:
            raise Blocked(f"{action} refused: not a seeded test item, and google.act_on_real_items is off")

    def act(self, action: str, target: str, payload: dict, idempotency_key: str, dry_run: bool = False) -> dict:
        if not self.offers(action):
            raise NotOffered(f"google.act:{action}")
        self.guard(action, target, payload)
        self.state["acts"].append({"action": action, "target": target, "key": idempotency_key, "at": now_iso()})
        out: dict[str, Any] = {"ok": True, "dry_run": True}
        if action == "draft_reply":
            m = self.get(target)
            did = f"fdraft{len(self.state['drafts']) + 1:03d}"
            self.state["drafts"][did] = {"for_ref": target, "to": [m["reply_to"]], "body": payload["body"], "status": "draft"}
            out.update(draft_id=did, to=[m["reply_to"]], thread_id=m["thread_id"], url=f"https://mail.google.com/fake/drafts/{did}")
        elif action in ("send_draft", "discard_draft"):
            self.state["drafts"][target]["status"] = "sent" if action == "send_draft" else "discarded"
            out.update(url=f"https://mail.google.com/fake/sent/{target}")
        elif action == "accept_invite":
            rid = target.split(":", 2)[2]
            for a in self.state["events"][rid]["item"]["attendees"]:
                if a.get("self"):
                    a["responseStatus"] = "accepted"
            out.update(response="accepted", summary=self.state["events"][rid]["item"]["summary"])
        self.save()
        return out
