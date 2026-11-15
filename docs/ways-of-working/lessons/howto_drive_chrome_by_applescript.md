---
name: howto-drive-chrome-by-applescript
description: Driving Manish's real logged-in Chrome from a session with AppleScript `execute javascript` (setup steps in Google Admin, Gmail, Slack) — what works, what silently fails, and the switch only a person can flip
metadata:
  type: reference
---

**Verified 2026-11-05 (ai-peer build: five Slack test accounts set up end to end in his Chrome).**
Only with Manish's explicit word for that job; his word for one job does not cover the next.

- **The switch:** View > Developer > "Allow JavaScript from Apple Events" is per Chrome profile
  and ignores every scripted change (System Events click, opened menus, keyboard), on and off.
  Only a person's click works: ask him for that one click, and to untick it after.
- **Window ids** exceed AppleScript's integer range: `window id <arg>` fails. Loop over windows
  and match `(id of w) as text`. Window indexes shift as windows come forward; ids do not.
- **Isolated world:** page JS objects are invisible; the DOM is readable. Text inputs take
  `document.execCommand("insertText")`. Masked inputs often hold the value in the DOM already.
- **React forms** may ignore a JS `click()`: `form.requestSubmit(button)` works, sometimes only on
  a retry a few seconds after load.
- **Code editors (CodeMirror):** `insertText` into the hidden textarea lands at the cursor among
  the template. Use a real Cmd+A then Cmd+V (System Events, window in front) and verify from
  `.CodeMirror-code` lines outside `.CodeMirror-measure`.
- **Token inputs** (Slack invite emails) need a real paste to turn text into chips.
- **Gmail treats all aliases as "you":** `to:<alias>` matches every alias's mail; open each
  message and read its own To. Slack codes are XXX-XXX letters and digits.
- **Secrets:** read values into a shell variable and append to the `.env` file; print only lengths.
- **Cost:** about 20% of a 1M context for one setup job. Give it to a sub-agent or a fresh session.
