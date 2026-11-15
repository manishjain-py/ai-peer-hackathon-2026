---
name: howto_check_a_window_you_opened_for_a_person
description: A window a script opens for a person (a headed Playwright Chrome) may not be on their screen; check it read-only with CGWindowList and screencapture -l before saying it is up
metadata:
  type: reference
---

A headed browser that a script starts for a person (Playwright `launch_persistent_context(headless=False)`)
can open where they cannot see it. `ai-peer-wp1-3`, 2026-11-06: the Peer's Slack sign-in window was on no
screen at 18:12 (CGWindowList: none of its windows on screen). By 18:14 it was in front, but on Google's
"unusual traffic" puzzle, after a search typed into its address bar: Google flags the automated Chrome too.
Reopened, it came up in front, and he signed in within 3 minutes.

**Why:** "window up" was said on the script's own print line, so the person spent minutes looking, and the
script's 15-minute wait nearly ran out.

**How to apply:** after the script says the window is open, check it yourself, read-only, then say it is up.
- The window list: a short Swift script, `CGWindowListCopyWindowInfo([.optionAll], kCGNullWindowID)` filtered
  by the browser's pid, prints each window's bounds, `kCGWindowIsOnscreen` and title;
  `NSRunningApplication(processIdentifier:)` says whether it is active.
- The page they see: `screencapture -x -o -l <window number> out.png`. It works while Playwright holds the
  profile. Titles and captures need Screen Recording for Terminal (granted on Mac-48-GB).
- Tell them the window has the "Chrome is being controlled by automated test software" bar, and to type only
  into the page. Give the wait 30 minutes when the steps are relayed. If it is hidden, reopen it rather than
  guess where it went.
