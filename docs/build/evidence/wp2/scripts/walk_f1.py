"""F1 walk: open the setup page, click "Create my AI Peer", screenshot the live progress until ready.
Throwaway headless browser context (never the Peer's own profile). Usage: walk_f1.py <base url> <out dir>"""
import json
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright

base, out = sys.argv[1], sys.argv[2]
t0 = time.time()
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome", headless=True)
    pg = b.new_context(viewport={"width": 1440, "height": 900}).new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(base + "/setup", wait_until="networkidle")
    time.sleep(1)
    pg.screenshot(path=f"{out}/f1-1-profile.png")
    pg.click("#go")
    print(f"[{time.time() - t0:5.1f}s] clicked Create my AI Peer", flush=True)
    shots, last_status = 0, ""
    while time.time() - t0 < 900:
        time.sleep(2)
        d = json.loads(urllib.request.urlopen(base + "/api/setup/progress").read())
        status = " ".join(f"{s['key']}:{s['status']}" for s in d.get("steps", []))
        if status != last_status:
            print(f"[{time.time() - t0:5.1f}s] {status}", flush=True)
            last_status = status
            running = [s["key"] for s in d.get("steps", []) if s["status"] == "running"]
            if running and running[0] in ("github", "projects", "people") and shots < 3:
                shots += 1
                time.sleep(1.5)
                pg.screenshot(path=f"{out}/f1-2-learning-{shots}-{running[0]}.png")
        if d.get("state") in ("done", "failed"):
            break
    print(f"[{time.time() - t0:5.1f}s] state {d.get('state')}", flush=True)
    time.sleep(2)
    pg.screenshot(path=f"{out}/f1-3-ready.png", full_page=True)
    pg.goto(base + "/learned", wait_until="networkidle")
    pg.screenshot(path=f"{out}/f1-4-learned.png", full_page=True)
    print("js errors:", errs, "total s:", round(time.time() - t0))
    b.close()
