"""Slack adapter: Socket Mode (no public URL), bot posts as "Manish's AI Peer".

Tokens (in ~/.ai-peer/.env): SLACK_BOT_TOKEN (xoxb, posts as the labelled bot),
SLACK_APP_TOKEN (xapp, Socket Mode), SLACK_USER_TOKEN (xoxp, search:read only: the Peer
can never post as the owner). Slack content is searched live, not bulk-copied.
"""
from __future__ import annotations

import json
import logging
import threading
from typing import Any, Callable

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from slack_sdk.http_retry.builtin_handlers import RateLimitErrorRetryHandler
from slack_sdk.socket_mode import SocketModeClient
from slack_sdk.socket_mode.request import SocketModeRequest
from slack_sdk.socket_mode.response import SocketModeResponse

from ..events import Event
from ..settings import secret
from .base import Adapter

log = logging.getLogger("peer.slack")

ACTS = ("post_reply", "post_message", "dm", "update_message", "react", "open_modal")
SKIP_SUBTYPES = {"message_changed", "message_deleted", "channel_join", "channel_leave", "bot_message",
                 "channel_topic", "channel_purpose", "channel_name", "group_join", "group_leave",
                 "pinned_item", "unpinned_item", "ekm_access_denied", "tombstone"}


def ts_to_iso(ts: str) -> str:
    from datetime import datetime, timezone
    return datetime.fromtimestamp(float(ts), timezone.utc).isoformat(timespec="seconds")


class SlackAdapter(Adapter):
    name = "slack"
    capabilities = frozenset({"sense", "search", "get", *(f"act:{a}" for a in ACTS)})

    def __init__(self, bot_token: str | None = None, app_token: str | None = None,
                 user_token: str | None = None, watch_channels: list[str] | None = None):
        bot_token = bot_token or secret("SLACK_BOT_TOKEN", required=True)
        self.app_token = app_token or secret("SLACK_APP_TOKEN")
        user_token = user_token or secret("SLACK_USER_TOKEN")
        self.bot = WebClient(token=bot_token)
        self.bot.retry_handlers.append(RateLimitErrorRetryHandler(max_retry_count=3))
        self.user = WebClient(token=user_token) if user_token else None
        auth = self.bot.auth_test()
        self.bot_user_id: str = auth["user_id"]
        self.bot_id: str | None = auth.get("bot_id")
        self.team_id: str = auth["team_id"]
        self.team_url: str = auth["url"]          # https://<workspace>.slack.com/
        self.watch_channels = watch_channels or []
        self._users: dict[str, dict] = {}
        self._channels: dict[str, dict] = {}
        self._lock = threading.Lock()
        self.socket: SocketModeClient | None = None

    @classmethod
    def from_settings(cls, st) -> "SlackAdapter":
        return cls(watch_channels=st.get("slack.watch_channels") or None)

    def dry_run_sample(self) -> dict:
        """port-check: a thread reply in dry run (act returns before any Slack call)."""
        return {"action": "post_reply", "target": "C0PORTCHECK",
                "payload": {"channel": "C0PORTCHECK", "thread_ts": "1700000000.000100", "text": "port-check (dry run)"}}

    # -- live sensing (Socket Mode) ----------------------------------------------
    def listen(self, on_event: Callable[[Event], None], on_interactive: Callable[[dict], dict | None]) -> SocketModeClient:
        if not self.app_token:
            raise RuntimeError("SLACK_APP_TOKEN is missing from ~/.ai-peer/.env")
        client = SocketModeClient(app_token=self.app_token, web_client=self.bot, auto_reconnect_enabled=True)

        def handler(c: SocketModeClient, req: SocketModeRequest) -> None:
            try:
                if req.type == "events_api":
                    c.send_socket_mode_response(SocketModeResponse(envelope_id=req.envelope_id))
                    ev = (req.payload or {}).get("event", {})
                    e = self.normalize(ev)
                    if e:
                        on_event(e)
                elif req.type == "interactive":
                    body = None
                    try:
                        body = on_interactive(req.payload)
                    finally:
                        c.send_socket_mode_response(SocketModeResponse(envelope_id=req.envelope_id, payload=body))
                else:
                    c.send_socket_mode_response(SocketModeResponse(envelope_id=req.envelope_id))
            except Exception:  # noqa: BLE001
                log.exception("socket handler failed")

        client.socket_mode_request_listeners.append(handler)
        client.connect()
        self.socket = client
        return client

    def normalize(self, ev: dict) -> Event | None:
        if ev.get("type") == "reaction_added":   # WP2 F5 (needs the reaction_added bot event)
            item = ev.get("item") or {}
            if item.get("type") != "message" or not ev.get("user") or ev["user"] == self.bot_user_id:
                return None
            ch, ts = item["channel"], item["ts"]
            return Event(id=f"slack:reaction:{ch}:{ts}:{ev['user']}:{ev.get('reaction')}", source="slack", kind="reaction",
                         at=ts_to_iso(ev.get("event_ts") or ts), actor=ev["user"], ref=f"slack:msg:{ch}:{ts}", thread_ref=None,
                         text=f":{ev.get('reaction')}:", url=self.permalink(ch, ts),
                         extra={"channel": ch, "ts": ts, "reaction": ev.get("reaction"), "item_user": ev.get("item_user"),
                                "channel_name": "DM" if ch.startswith("D") else self.channel_name(ch)})
        if ev.get("type") not in ("message", "app_mention"):
            return None
        if ev.get("subtype") in SKIP_SUBTYPES:
            return None
        uid = ev.get("user")
        if not uid or uid == self.bot_user_id or (self.bot_id and ev.get("bot_id") == self.bot_id):
            return None  # never react to itself or to bot-only posts
        if self.user_info(uid).get("is_bot"):
            return None  # a bot user. (A person's post sent through an app carries that app's bot_id:
            #              it is still the person's message.)
        channel, ts = ev["channel"], ev["ts"]
        thread_ts = ev.get("thread_ts")
        ctype = ev.get("channel_type") or ("im" if channel.startswith("D") else "channel")
        text = ev.get("text") or ""
        kind = "dm" if ctype == "im" else ("mention" if f"<@{self.bot_user_id}>" in text else "message")
        user = self.user_info(ev["user"])
        return Event(
            id=f"slack:msg:{channel}:{ts}", source="slack", kind=kind, at=ts_to_iso(ts), actor=ev["user"],
            ref=f"slack:msg:{channel}:{ts}", thread_ref=f"slack:thread:{channel}:{thread_ts or ts}",
            text=text, url=self.permalink(channel, ts, thread_ts),
            extra={"channel": channel, "ts": ts, "thread_ts": thread_ts, "channel_type": ctype,
                   "user": ev["user"], "user_name": user.get("name"), "user_real_name": user.get("real_name"),
                   "user_tz": user.get("tz"), "user_title": user.get("title"),
                   "channel_name": self.channel_name(channel) if ctype != "im" else "DM"})

    # -- contract -------------------------------------------------------------------
    def sense(self, cursor: str | None) -> tuple[list[Event], str | None]:
        """Polling catch-up (used at start and by port-check); the live path is listen()."""
        cur = json.loads(cursor) if cursor else {}
        events: list[Event] = []
        for ch in self.member_channels():
            oldest = cur.get(ch["id"], "0")
            resp = self.bot.conversations_history(channel=ch["id"], oldest=oldest, limit=50)
            msgs = sorted(resp.get("messages", []), key=lambda m: float(m["ts"]))
            for m in msgs:
                if m["ts"] == oldest:
                    continue
                m.setdefault("channel", ch["id"])
                m.setdefault("type", "message")
                e = self.normalize(m)
                if e:
                    events.append(e)
                cur[ch["id"]] = m["ts"]
        return events, json.dumps(cur)

    def search(self, query: str, filters: dict | None = None) -> list[dict]:
        if not self.user:
            return []
        res = self.user.search_messages(query=query, count=20, sort="timestamp")
        out = []
        for m in res.get("messages", {}).get("matches", []):
            out.append({"ref": f"slack:msg:{m['channel']['id']}:{m['ts']}", "snippet": m.get("text", "")[:300],
                        "url": m.get("permalink"), "title": f"#{m['channel'].get('name')}", "at": ts_to_iso(m["ts"]),
                        "user": m.get("username")})
        return out

    def get(self, ref: str) -> dict:
        _, kind, rest = ref.split(":", 2)
        channel, ts = rest.split(":", 1)
        if kind == "thread":
            msgs = self.bot.conversations_replies(channel=channel, ts=ts, limit=100).get("messages", [])
            return {"ref": ref, "messages": msgs, "url": self.permalink(channel, ts)}
        resp = self.bot.conversations_history(channel=channel, latest=ts, inclusive=True, limit=1)
        msgs = resp.get("messages", [])
        if not msgs or msgs[0]["ts"] != ts:   # a thread reply: look it up through replies
            msgs = [m for m in self.bot.conversations_replies(channel=channel, ts=ts).get("messages", [])
                    if m["ts"] == ts]
        return {"ref": ref, "message": msgs[0] if msgs else None, "url": self.permalink(channel, ts)}

    def act(self, action: str, target: str, payload: dict, idempotency_key: str,
            dry_run: bool = False) -> dict:
        if not self.offers(action):
            raise ValueError(f"slack does not offer {action}")
        if dry_run:
            return {"ok": True, "dry_run": True, "action": action, "target": target}
        p = dict(payload)
        if action in ("post_reply", "post_message"):
            r = self.bot.chat_postMessage(channel=p["channel"], text=p["text"], blocks=p.get("blocks"),
                                          thread_ts=p.get("thread_ts") if action == "post_reply" else None,
                                          unfurl_links=False, unfurl_media=False)
            return {"ok": True, "channel": r["channel"], "ts": r["ts"],
                    "permalink": self.permalink(r["channel"], r["ts"], p.get("thread_ts"))}
        if action == "dm":
            ch = self.dm_channel(target)
            r = self.bot.chat_postMessage(channel=ch, text=p["text"], blocks=p.get("blocks"),
                                          unfurl_links=False, unfurl_media=False)
            return {"ok": True, "channel": r["channel"], "ts": r["ts"], "permalink": self.permalink(r["channel"], r["ts"])}
        if action == "update_message":
            r = self.bot.chat_update(channel=p["channel"], ts=p["ts"], text=p["text"], blocks=p.get("blocks"))
            return {"ok": True, "channel": r["channel"], "ts": r["ts"]}
        if action == "react":
            try:
                self.bot.reactions_add(channel=p["channel"], timestamp=p["ts"], name=p["name"])
            except SlackApiError as e:
                if e.response.get("error") != "already_reacted":
                    raise
            return {"ok": True}
        if action == "open_modal":
            r = self.bot.views_open(trigger_id=p["trigger_id"], view=p["view"])
            return {"ok": True, "view_id": r["view"]["id"]}
        raise ValueError(action)

    def check(self) -> dict[str, Any]:
        detail = f"bot {self.bot_user_id} in {self.team_url}"
        if self.user:
            try:
                self.user.auth_test()
                detail += "; user token ok"
            except SlackApiError as e:
                detail += f"; user token {e.response.get('error')}"
        return {"ok": True, "detail": detail}

    # -- helpers (presence, people, channels, links) --------------------------------
    def user_info(self, user_id: str) -> dict:
        with self._lock:
            if user_id in self._users:
                return self._users[user_id]
        try:
            u = self.bot.users_info(user=user_id)["user"]
        except SlackApiError:
            return {"id": user_id, "name": user_id}
        prof = u.get("profile", {})
        info = {"id": user_id, "name": prof.get("display_name") or u.get("real_name") or u.get("name"),
                "real_name": u.get("real_name"), "tz": u.get("tz"), "tz_label": u.get("tz_label"),
                "email": prof.get("email"), "title": prof.get("title"), "is_bot": u.get("is_bot", False)}
        with self._lock:
            self._users[user_id] = info
        return info

    def lookup_email(self, email: str) -> dict | None:
        try:
            return self.bot.users_lookupByEmail(email=email)["user"]
        except SlackApiError:
            return None

    def get_presence(self, user_id: str) -> str:
        return self.bot.users_getPresence(user=user_id).get("presence", "away")

    def get_status(self, user_id: str) -> dict:
        prof = self.bot.users_profile_get(user=user_id).get("profile", {})
        return {"text": prof.get("status_text", ""), "emoji": prof.get("status_emoji", ""),
                "expiration": prof.get("status_expiration", 0)}

    def channel_name(self, channel_id: str) -> str:
        with self._lock:
            if channel_id in self._channels:
                return self._channels[channel_id].get("name", channel_id)
        try:
            ch = self.bot.conversations_info(channel=channel_id)["channel"]
        except SlackApiError:
            return channel_id
        with self._lock:
            self._channels[channel_id] = ch
        return ch.get("name", channel_id)

    def member_channels(self) -> list[dict]:
        out, cursor = [], None
        while True:
            r = self.bot.users_conversations(types="public_channel,private_channel", limit=200, cursor=cursor)
            out += r.get("channels", [])
            cursor = r.get("response_metadata", {}).get("next_cursor")
            if not cursor:
                break
        if self.watch_channels:
            out = [c for c in out if c["name"] in self.watch_channels or c["id"] in self.watch_channels]
        return out

    def join_public_channels(self) -> list[str]:
        joined, cursor = [], None
        while True:
            r = self.bot.conversations_list(types="public_channel", exclude_archived=True, limit=200, cursor=cursor)
            for ch in r.get("channels", []):
                if not ch.get("is_member"):
                    self.bot.conversations_join(channel=ch["id"])
                    joined.append(ch["name"])
            cursor = r.get("response_metadata", {}).get("next_cursor")
            if not cursor:
                break
        return joined

    def dm_channel(self, user_id: str) -> str:
        return self.bot.conversations_open(users=user_id)["channel"]["id"]

    def permalink(self, channel: str, ts: str, thread_ts: str | None = None) -> str:
        url = f"{self.team_url}archives/{channel}/p{ts.replace('.', '')}"
        if thread_ts and thread_ts != ts:
            url += f"?thread_ts={thread_ts}&cid={channel}"
        return url
