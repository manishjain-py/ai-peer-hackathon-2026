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

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/142.0.0.0 Safari/537.36")


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


def client_url(channel: str | None = None, thread_ts: str | None = None) -> str:
    team = secret("SLACK_TEAM_ID") or ""
    url = f"https://app.slack.com/client/{team}"
    if channel:
        url += f"/{channel}"
        if thread_ts:
            url += f"/thread/{channel}-{thread_ts}"
    return url


def login(timeout_s: int = 600) -> bool:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        ctx = _context(p, headless=False)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto("https://learnlikemagic.slack.com/")
        print("Sign in to Slack in the window that opened (as yourself). It closes by itself when done.", flush=True)
        deadline = time.time() + timeout_s
        ok = False
        while time.time() < deadline:
            if "app.slack.com/client" in page.url:
                ok = True
                time.sleep(3)
                break
            time.sleep(1)
        ctx.close()
        print("Signed in: the Peer can take screenshots now." if ok else "Not signed in (timed out).")
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
