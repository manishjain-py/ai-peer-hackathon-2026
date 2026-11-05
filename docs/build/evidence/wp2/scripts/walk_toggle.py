"""Flip one switch on the settings page (throwaway headless browser). Usage: walk_toggle.py <base> <out png> <data-key> [on|off]"""
import sys
import time

from playwright.sync_api import sync_playwright

base, out, key, want = sys.argv[1], sys.argv[2], sys.argv[3], (sys.argv[4] if len(sys.argv) > 4 else "off")
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome", headless=True)
    pg = b.new_context(viewport={"width": 1440, "height": 900}).new_page()
    pg.goto(base + "/settings", wait_until="networkidle")
    t = pg.locator(f'button.toggle[data-key="{key}"]')
    if ("on" in (t.get_attribute("class") or "").split()) != (want == "on"):
        t.click()
        time.sleep(1)
    pg.reload(wait_until="networkidle")
    card = pg.locator(".card", has=pg.locator(f'button.toggle[data-key="{key}"]')).first
    card.scroll_into_view_if_needed()
    pg.screenshot(path=out, full_page=False, clip=card.bounding_box() if card.bounding_box() else None)
    print(key, "is now", "on" if "on" in (pg.locator(f'button.toggle[data-key="{key}"]').get_attribute("class") or "") else "off")
    b.close()
