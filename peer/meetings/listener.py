"""The meeting's webhook listener and its cloudflared quick tunnel (DESIGN defaults: a tunnel when a
webhook needs a public URL).

The listener serves one thing: POST /<random token>/recall/ with a Recall real-time event. It answers
204 at once and hands the event to a worker thread (Recall sends events one at a time and retries a
failed one every second, at most 60 times, then stops sending to that endpoint for the rest of the
meeting). Every other path is a 404. It binds 127.0.0.1 on its own port; the tunnel points only at it,
never at the owner's pages (they have no login and control the Peer). Both stop by their PIDs.
"""
from __future__ import annotations

import json
import logging
import queue
import re
import secrets
import socket
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Callable

log = logging.getLogger("peer.meetings.listener")

RECALL_EVENTS = {"transcript.data", "transcript.partial_data", "participant_events.join", "participant_events.leave",
                 "participant_events.chat_message", "participant_events.speech_on", "participant_events.speech_off",
                 "participant_events.update"}


def free_port(preferred: int) -> int:
    for port in [preferred] + list(range(preferred + 1, preferred + 20)):
        with socket.socket() as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError("no free port for the meeting listener")


class Listener:
    def __init__(self, on_event: Callable[[dict, float], None], port: int = 8795, raw_log: Path | None = None):
        self.on_event = on_event
        self.port = free_port(port)
        self.token = secrets.token_urlsafe(24)
        self.path = f"/{self.token}/recall/"
        self.raw_log = raw_log
        self.q: queue.Queue = queue.Queue()
        self.received = 0
        self.rejected = 0
        self._server: ThreadingHTTPServer | None = None
        self._stop = threading.Event()

    def start(self) -> None:
        listener = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *a):   # quiet: never log paths (the token is in them)
                pass

            def _deny(self, code: int = 404) -> None:
                listener.rejected += 1
                self.send_response(code)
                self.send_header("Content-Length", "0")
                self.end_headers()

            def do_GET(self):   # noqa: N802
                self._deny()

            do_PUT = do_DELETE = do_PATCH = do_HEAD = do_GET   # noqa: N815

            def do_POST(self):   # noqa: N802
                if self.path.split("?", 1)[0] != listener.path:
                    return self._deny()
                n = int(self.headers.get("Content-Length") or 0)
                if n <= 0 or n > 2_000_000:
                    return self._deny(400)
                body = self.rfile.read(n)
                arrived = time.time()
                self.send_response(204)
                self.send_header("Content-Length", "0")
                self.end_headers()
                try:
                    ev = json.loads(body)
                except ValueError:
                    return
                if isinstance(ev, dict) and ev.get("event") in RECALL_EVENTS:
                    listener.received += 1
                    listener.q.put((ev, arrived))

        self._server = ThreadingHTTPServer(("127.0.0.1", self.port), Handler)
        self._server.daemon_threads = True
        threading.Thread(target=self._server.serve_forever, daemon=True, name="meeting-listener").start()
        threading.Thread(target=self._work, daemon=True, name="meeting-events").start()
        log.info("meeting listener on 127.0.0.1:%s", self.port)

    def _work(self) -> None:
        while not self._stop.is_set():
            try:
                ev, arrived = self.q.get(timeout=0.5)
            except queue.Empty:
                continue
            if self.raw_log:
                try:
                    with self.raw_log.open("a") as f:
                        f.write(json.dumps({"arrived": arrived, "event": ev}, ensure_ascii=False) + "\n")
                except OSError:
                    pass
            try:
                self.on_event(ev, arrived)
            except Exception:  # noqa: BLE001
                log.exception("meeting event handler failed")

    def stop(self) -> None:
        self._stop.set()
        if self._server:
            self._server.shutdown()
            self._server.server_close()
            self._server = None


class Tunnel:
    """A cloudflared quick tunnel to the listener's port only (no account, a random trycloudflare.com name)."""

    URL = re.compile(r"https://[a-z0-9-]+\.trycloudflare\.com")

    def __init__(self, port: int, log_path: Path, binary: str = "cloudflared"):
        self.port = port
        self.log_path = log_path
        self.binary = binary
        self.proc: subprocess.Popen | None = None
        self.url: str | None = None

    @property
    def pid(self) -> int | None:
        return self.proc.pid if self.proc else None

    def start(self, timeout: float = 45) -> str:
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        logf = self.log_path.open("w")
        self.proc = subprocess.Popen([self.binary, "tunnel", "--no-autoupdate", "--url", f"http://127.0.0.1:{self.port}"],
                                     stdout=logf, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL)
        deadline = time.time() + timeout
        while time.time() < deadline:
            if self.proc.poll() is not None:
                raise RuntimeError(f"cloudflared exited ({self.proc.returncode}); see {self.log_path}")
            m = self.URL.search(self.log_path.read_text(errors="replace"))
            if m and "Registered tunnel connection" in self.log_path.read_text(errors="replace"):
                self.url = m.group(0)
                return self.url
            time.sleep(0.5)
        self.stop()
        raise RuntimeError("cloudflared gave no tunnel URL in time")

    def stop(self) -> None:
        if self.proc and self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.proc.kill()
        self.proc = None
