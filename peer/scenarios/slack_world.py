"""Test-world setup in Slack (not part of the product): the invented colleagues.

Option A (real member accounts): each colleague authorizes the test-only "LLM Scenario" app
once, so the scenario script can post as them. `peer world-auth` runs a one-page HTTPS
callback on localhost (self-signed: click through the browser warning, or paste the URL),
stores SLACK_AS_<ID> in ~/.ai-peer/.env, never printing it. `peer world-setup` then creates
the world's channels as a colleague, adds the colleagues, the owner and the Peer bot, and
sets each colleague's title. No real member (e.g. preethi) is ever added or messaged.
"""
from __future__ import annotations

import http.server
import json
import os
import ssl
import subprocess
import threading
import urllib.parse
from pathlib import Path

import httpx
import yaml

from ..settings import ENV_FILE, PEER_HOME, PKG, secret

REDIRECT = "https://localhost:8765/slack/oauth/callback"
USER_SCOPES = "chat:write,channels:write,channels:read,users.profile:write,users:read,users:read.email"

MANIFEST = f"""display_information:
  name: LLM Scenario
  description: Test only. Lets the AI Peer's scenario script post as the invented Learn Like Magic colleagues.
  background_color: "#6b746f"
oauth_config:
  redirect_urls:
    - {REDIRECT}
  scopes:
    user:
{chr(10).join('      - ' + s for s in USER_SCOPES.split(','))}
settings:
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
"""


def _world() -> dict:
    return yaml.safe_load((PKG / "scenarios" / "world.yaml").read_text())


def _save_secret(name: str, value: str) -> None:
    lines = ENV_FILE.read_text().splitlines() if ENV_FILE.exists() else []
    lines = [ln for ln in lines if not ln.startswith(f"{name}=")] + [f"{name}={value}"]
    ENV_FILE.write_text("\n".join(lines) + "\n")
    os.chmod(ENV_FILE, 0o600)


def _cert() -> tuple[str, str]:
    d = PEER_HOME / "localhost-cert"
    d.mkdir(exist_ok=True)
    crt, key = d / "cert.pem", d / "key.pem"
    if not crt.exists():
        subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "30", "-subj", "/CN=localhost",
                        "-keyout", str(key), "-out", str(crt)], check=True, capture_output=True)
    return str(crt), str(key)


def authorize_url() -> str:
    cid = secret("SLACK_SCENARIO_CLIENT_ID", required=True)
    team = secret("SLACK_TEAM_ID") or ""
    q = {"client_id": cid, "user_scope": USER_SCOPES, "redirect_uri": REDIRECT, **({"team": team} if team else {})}
    return "https://slack.com/oauth/v2/authorize?" + urllib.parse.urlencode(q)


def exchange(code: str) -> str:
    r = httpx.post("https://slack.com/api/oauth.v2.access", data={
        "client_id": secret("SLACK_SCENARIO_CLIENT_ID", required=True),
        "client_secret": secret("SLACK_SCENARIO_CLIENT_SECRET", required=True),
        "code": code, "redirect_uri": REDIRECT}, timeout=30).json()
    if not r.get("ok"):
        return f"Slack said: {r.get('error')}"
    tok = r["authed_user"]["access_token"]
    who = httpx.get("https://slack.com/api/users.info", params={"user": r["authed_user"]["id"]},
                    headers={"Authorization": f"Bearer {tok}"}, timeout=30).json().get("user", {})
    email = (who.get("profile") or {}).get("email", "")
    person = next((c for c in _world()["colleagues"] if c["email"].lower() == email.lower()), None)
    if not person:
        return f"{email or 'this account'} is not one of the invented colleagues: token not kept."
    _save_secret(f"SLACK_AS_{person['person_id'].upper()}", tok)
    return f"Done: {person['name']} can now be played by the scenario script."


def world_auth(timeout_min: int = 90) -> None:
    """Serve the HTTPS callback until every colleague has a token (runs fine in the background)."""
    import time
    crt, key = _cert()
    url = authorize_url()

    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):  # noqa: N802
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            msg = exchange(q["code"][0]) if "code" in q else f"No code in this link ({q.get('error', ['?'])[0]})."
            print(msg, flush=True)
            body = f"<html><body style='font:18px sans-serif;padding:40px'><p>{msg}</p><p>You can close this window.</p></body></html>"
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(body.encode())

        def log_message(self, *a):  # quiet
            pass

    srv = http.server.HTTPServer(("127.0.0.1", 8765), H)
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(crt, key)
    srv.socket = ctx.wrap_socket(srv.socket, server_side=True)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    (PEER_HOME / "world-auth-link.txt").write_text(url + "\n")
    print("Authorize link (also in ~/.ai-peer/world-auth-link.txt):\n" + url + "\n", flush=True)
    deadline = time.time() + timeout_min * 60
    last = None
    while time.time() < deadline:
        missing = [c["name"] for c in _world()["colleagues"] if not secret(f"SLACK_AS_{c['person_id'].upper()}")]
        if missing != last:
            print("Still to authorize: " + (", ".join(missing) or "nobody"), flush=True)
            last = missing
        if not missing:
            break
        time.sleep(5)
    srv.shutdown()


def world_code(url: str) -> None:
    """Fallback: the address the browser landed on (it holds ?code=...)."""
    q = urllib.parse.parse_qs(urllib.parse.urlparse(url.strip()).query)
    print(exchange(q["code"][0]) if "code" in q else "That address has no code in it.")


def world_setup() -> None:
    from slack_sdk import WebClient
    from slack_sdk.errors import SlackApiError

    w = _world()
    bot = WebClient(token=secret("SLACK_BOT_TOKEN", required=True))
    peer_bot = bot.auth_test()["user_id"]
    owner = bot.users_lookupByEmail(email=json.loads((PKG / "world" / "profiles" / f"{w['owner']}.json").read_text())["slack_email"])["user"]["id"]
    clients = {c["person_id"]: WebClient(token=t) for c in w["colleagues"] if (t := secret(f"SLACK_AS_{c['person_id'].upper()}"))}
    if not clients:
        raise SystemExit("no colleague tokens yet: run `peer world-auth` first")
    ids = {pid: cl.auth_test()["user_id"] for pid, cl in clients.items()}
    first = next(iter(clients.values()))
    existing = {c["name"]: c for c in bot.conversations_list(types="public_channel", limit=200)["channels"]}
    for ch in w["channels"]:
        name = ch["name"]
        if name == "general":
            continue
        if name in existing:
            cid = existing[name]["id"]
        else:
            cid = first.conversations_create(name=name)["channel"]["id"]
            first.conversations_setPurpose(channel=cid, purpose=ch.get("purpose", ""))
            print(f"created #{name}")
        for pid, cl in clients.items():
            try:
                cl.conversations_join(channel=cid)
            except SlackApiError:
                pass
        try:
            first.conversations_invite(channel=cid, users=",".join([peer_bot, owner]))
        except SlackApiError as e:
            if e.response.get("error") not in ("already_in_channel",):
                print(f"#{name}: invite: {e.response.get('error')}")
        print(f"#{name}: colleagues, the owner and the Peer are in")
    for c in w["colleagues"]:
        cl = clients.get(c["person_id"])
        if cl:
            try:
                cl.users_profile_set(profile={"title": c["title"], "real_name": c["name"], "display_name": c["name"].split()[0]})
            except SlackApiError as e:
                print(f"{c['name']}: profile: {e.response.get('error')}")
    print("World ready:", ", ".join(c["name"] for c in w["colleagues"] if c["person_id"] in clients))
