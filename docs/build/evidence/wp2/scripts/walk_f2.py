"""F2 walk: on "What I learned", correct one fact through the page's own Correct button.
Usage: walk_f2.py <base url> <out dir> <card title> <fact starts with> <new text>"""
import sys
import time

from playwright.sync_api import sync_playwright

base, out, card, starts, new = sys.argv[1:6]
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome", headless=True)
    pg = b.new_context(viewport={"width": 1440, "height": 900}).new_page()
    pg.goto(base + "/learned", wait_until="networkidle")
    c = pg.locator(".card", has=pg.locator(".ftitle", has_text=card)).first
    f = c.locator(".fact", has_text=starts).first
    f.scroll_into_view_if_needed()
    c.screenshot(path=f"{out}/f2-1-before.png")
    f.locator("button.fix").click()
    f.locator(".edit input").fill(new)
    c.screenshot(path=f"{out}/f2-2-editing.png")
    f.locator(".edit .btn").first.click()
    pg.wait_for_load_state("networkidle")
    time.sleep(1)
    c = pg.locator(".card", has=pg.locator(".ftitle", has_text=card)).first
    c.scroll_into_view_if_needed()
    c.screenshot(path=f"{out}/f2-3-after.png")
    print("after:", c.locator(".fact", has_text="Driver").first.inner_text()[:300])
    b.close()
