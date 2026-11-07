"""Browser helper for walks and demo recordings (test tooling, not the product).

The Peer's own Chrome profile (~/.ai-peer/browser/<owner>), never the owner's everyday
Chrome. The owner signs in to Slack in it once (`peer browser login`, a window he opens
himself); after that it runs headless: screenshots of threads and DMs, the owner's Send click
during a walk, and screen videos for checkpoints and backup recordings.
"""
from __future__ import annotations

import time
from pathlib import Path

from .settings import get_settings, secret

def _chrome_major() -> str:
    """The installed Chrome's major version: a stale one in the UA makes Slack warn, then
    (from 9 Nov 2026) refuse the browser."""
    try:
        import plistlib
        with open("/Applications/Google Chrome.app/Contents/Info.plist", "rb") as f:
            return str(plistlib.load(f)["CFBundleShortVersionString"]).split(".")[0]
    except Exception:  # noqa: BLE001
        return "156"


# headless Chrome says "HeadlessChrome" in its UA; send the normal one instead
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) "
      f"Chrome/{_chrome_major()}.0.0.0 Safari/537.36")


def profile_dir() -> Path:
    d = get_settings().owner_dir.parent / "browser" / get_settings().owner
    d.mkdir(parents=True, exist_ok=True)
    return d


def _context(p, headless: bool = True, video_dir: Path | None = None, size=(1280, 860)):
    kw = dict(user_data_dir=str(profile_dir()), channel="chrome", headless=headless, user_agent=UA,
              viewport={"width": size[0], "height": size[1]}, color_scheme="light")
    if video_dir:
        kw.update(record_video_dir=str(video_dir), record_video_size={"width": size[0], "height": size[1]})
    return p.chromium.launch_persistent_context(**kw)


def workspace_url() -> str:
    """Where the Peer's profile signs in to Slack (setting slack.workspace_url, e.g. https://<workspace>.slack.com/).

    Required: the sign-in check below treats any app.slack.com/client page as signed in, so a generic default
    could report "signed in" before Slack redirects to its sign-in page."""
    url = str(get_settings().get("slack.workspace_url") or "").strip()
    if not url:
        raise SystemExit("set slack.workspace_url first, e.g. `peer set slack.workspace_url https://<workspace>.slack.com/`")
    return url


def client_url(channel: str | None = None, thread_ts: str | None = None) -> str:
    team = secret("SLACK_TEAM_ID") or ""
    url = f"https://app.slack.com/client/{team}"
    if channel:
        url += f"/{channel}"
        if thread_ts:
            url += f"/thread/{channel}-{thread_ts}"
    return url


def _open_in_browser(page) -> None:
    """Slack's 'launch the app?' page: stay in the browser."""
    try:
        link = page.locator("text=/use Slack in your browser|open this link in your browser/i")
        if link.count():
            link.first.click()
    except Exception:  # noqa: BLE001
        pass


def login(timeout_s: int = 1800, shots: Path | None = None) -> bool:
    """A Chrome window on the Peer's own profile; the owner signs in himself (email, Slack's
    robot check if it shows one, the emailed code). It closes by itself once he is in.
    30 minutes: on 6 Nov 15 ran short while the steps were relayed and the window looked for."""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        ctx = _context(p, headless=False)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto(workspace_url())
        page.bring_to_front()
        print("Sign in to Slack in the window that opened (as yourself). It closes by itself when done.", flush=True)
        print("It is its own Chrome window, with the bar \"Chrome is being controlled by automated test software\". "
              f"Type only into the Slack page, not the address bar. It waits {timeout_s // 60} minutes.", flush=True)
        deadline = time.time() + timeout_s
        ok = False
        while time.time() < deadline and not ok:
            for pg in list(ctx.pages):
                try:
                    if "app.slack.com/client" in pg.url:
                        page, ok = pg, True
                        break
                    _open_in_browser(pg)
                except Exception:  # noqa: BLE001
                    pass
            time.sleep(1)
        if ok:
            time.sleep(6)
        if shots:
            try:
                page.screenshot(path=str(shots / "login-2-after-code.png"))
            except Exception:  # noqa: BLE001
                pass
        ctx.close()
        print("Signed in: the Peer can take screenshots now." if ok else "Not signed in (timed out).", flush=True)
        return ok


def _settle(page, extra_s: float = 2.5) -> None:
    try:
        page.wait_for_selector("[data-qa='message_container'], .c-virtual_list__item", timeout=25000)
    except Exception:  # noqa: BLE001
        pass
    time.sleep(extra_s)


def shot(channel: str, out: Path, thread_ts: str | None = None, headless: bool = True) -> Path:
    from playwright.sync_api import sync_playwright
    out.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        ctx = _context(p, headless=headless)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto(client_url(channel, thread_ts))
        _settle(page)
        page.screenshot(path=str(out))
        ctx.close()
    return out


def click_latest(dm_channel: str, label: str = "Send", out: Path | None = None) -> bool:
    """Click the newest button with this label in the owner's DM with the Peer."""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        ctx = _context(p)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto(client_url(dm_channel))
        _settle(page)
        buttons = page.get_by_role("button", name=label, exact=True)
        n = buttons.count()
        if n == 0:
            if out:
                page.screenshot(path=str(out))
            ctx.close()
            return False
        if out:
            page.screenshot(path=str(out))
        buttons.nth(n - 1).click()
        time.sleep(4)
        ctx.close()
        return True


class SlackRecorder:
    """One headless Slack page in its own thread, driven by commands from the walk:
    goto(channel, thread_ts) / click(label) / shot(path) / stop() -> the video file (mp4 if ffmpeg exists)."""

    def __init__(self, video_dir: Path | None = None, size=(1280, 860)):
        import queue
        import threading
        self.q: "queue.Queue" = queue.Queue()
        self.done = threading.Event()
        self.result: dict = {}
        self.video_dir = video_dir
        self.size = size
        self.t = threading.Thread(target=self._run, daemon=True)
        self.t.start()

    def _run(self) -> None:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            ctx = _context(p, headless=True, video_dir=self.video_dir, size=self.size)
            page = ctx.pages[0] if ctx.pages else ctx.new_page()
            while True:
                cmd, arg, reply = self.q.get()
                try:
                    if cmd == "goto":
                        page.goto(client_url(*arg))
                        _settle(page, 2.0)
                        reply["ok"] = True
                    elif cmd == "click":
                        b = page.get_by_role("button", name=arg, exact=True)
                        n = b.count()
                        if n:
                            b.nth(n - 1).scroll_into_view_if_needed()
                            time.sleep(1.0)
                            b.nth(n - 1).click()
                        reply["ok"] = bool(n)
                    elif cmd == "shot":
                        page.screenshot(path=str(arg))
                        reply["ok"] = True
                    elif cmd == "wait":
                        time.sleep(arg)
                        reply["ok"] = True
                    elif cmd == "stop":
                        video = page.video.path() if page.video else None
                        ctx.close()
                        reply["video"] = str(video) if video else None
                        reply["ok"] = True
                        break
                except Exception as e:  # noqa: BLE001
                    reply["ok"] = False
                    reply["error"] = str(e)[:200]
                finally:
                    reply["_done"].set()

    def _call(self, cmd: str, arg=None, timeout: float = 90) -> dict:
        import threading
        reply = {"_done": threading.Event()}
        self.q.put((cmd, arg, reply))
        reply["_done"].wait(timeout)
        reply.pop("_done", None)
        return reply

    def goto(self, channel: str, thread_ts: str | None = None) -> dict:
        return self._call("goto", (channel, thread_ts))

    def click(self, label: str) -> dict:
        return self._call("click", label)

    def shot(self, path: Path) -> dict:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        return self._call("shot", path)

    def wait(self, s: float) -> dict:
        return self._call("wait", s, timeout=s + 30)

    def stop(self, mp4: Path | None = None) -> str | None:
        r = self._call("stop", None, timeout=120)
        video = r.get("video")
        if video and mp4:
            import subprocess
            mp4.parent.mkdir(parents=True, exist_ok=True)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-c:v", "libx264", "-pix_fmt", "yuv420p",
                            "-movflags", "+faststart", str(mp4)], check=False)
            return str(mp4) if mp4.exists() else video
        return video


def login_headless(email: str, code_file: Path, timeout_s: int = 900, shots: Path | None = None) -> bool:
    """Sign the Peer's profile in to Slack with no window: enter the email, wait for the code
    Slack mails to it (a helper writes just the code to code_file), type it in."""
    import re
    from playwright.sync_api import sync_playwright
    code_file = Path(code_file)
    code_file.unlink(missing_ok=True)
    with sync_playwright() as p:
        ctx = _context(p, headless=True)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto(workspace_url())
        page.wait_for_selector("[data-qa=email_field]", timeout=30000)
        page.fill("[data-qa=email_field]", email)
        page.click("[data-qa=submit_button]")
        # Slack shows either its code page or, to some browsers, a robot check (reCAPTCHA): then
        # no code is mailed, and a person must sign in through `peer browser login`.
        state = None
        for _ in range(20):
            time.sleep(1)
            robot = page.locator("iframe[title='reCAPTCHA']")
            if robot.count() and robot.first.is_visible():
                state = "robot check"
                break
            if page.locator("text=/check your email|sent a .*code|enter the code/i").count():
                state = "code page"
                break
        if shots:
            page.screenshot(path=str(shots / "login-1-code-page.png"))
        if state != "code page":
            ctx.close()
            print(f"No code was sent: Slack showed {state or 'no code page'}. "
                  "Sign in through `peer browser login` (a window you sign in to yourself).", flush=True)
            return False
        print(f"Code requested for {email}; waiting for {code_file}", flush=True)
        deadline = time.time() + timeout_s
        code = None
        while time.time() < deadline and not code:
            if code_file.exists():
                raw = re.sub(r"[^A-Za-z0-9]", "", code_file.read_text())
                if len(raw) == 6:
                    code = raw.upper()
            time.sleep(2)
        if not code:
            ctx.close()
            print("No code arrived.")
            return False
        boxes = page.locator("input[aria-label*='digit' i], input[maxlength='1'], [data-qa*='confirmation_code'] input")
        if boxes.count():
            boxes.first.click()
        page.keyboard.type(code, delay=120)
        ok = False
        for _ in range(40):
            if "app.slack.com/client" in page.url:
                ok = True
                break
            link = page.locator("text=/use Slack in your browser|open this link in your browser/i")
            if link.count():
                link.first.click()
            time.sleep(1.5)
        if not ok:
            page.goto(client_url())
            time.sleep(6)
            ok = "app.slack.com/client" in page.url
        if shots:
            page.screenshot(path=str(shots / "login-2-after-code.png"))
        code_file.unlink(missing_ok=True)
        ctx.close()
        print("Signed in." if ok else f"Not signed in (ended on {page.url[:80]}).")
        return ok
