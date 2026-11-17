# Implement Moss v5 in the current prototype

**Receiving agent: update the actual prototype in your current workspace.** The folder
Manish supplies is a read-only design and asset reference. Complete the applicable code,
UI, mascot behavior and state integration, exercise the real flows, fix issues and record
the result. Do not stop at a plan, a new mockup or another video.

This is **V40**, recorded in [Manish's request](REQUEST-2026-11-17.md). **Moss v5 is the
implementation target.** Older notes saying Tag v2 was the last approved movie are
historical film records, not a request to implement Tag or ask for another mascot choice.
This source-Mac package is ready; the prototype changes have not been performed here.

## 1. Establish the two repositories

1. Read the current prototype's own `AGENTS.md`/instructions, current state, package/start
   commands and relevant frontend/backend code. Locate its running UI, mascot, routes,
   services, source connections, jobs, event/stream interfaces and existing test setup.
   Preserve local user changes and follow that repository's workflow. If the current
   workspace is ambiguous, inspect attached/open projects first; ask for its path only
   when that cannot identify the actual prototype.
2. Treat this copied demo repository as reference. **Do not replace the current prototype
   with this repo's `peer/`, its November 7 handoff, or its old architecture/setup state.**
   The product continued on the other Mac after that archive closed. The target code and
   actual backend behavior are the functional truth.
3. The target's own instructions and Manish's current authorization govern implementation,
   verification, accounts, deployments and external messages. The film repository's
   no-tests/video-worker procedures do not override the target's engineering workflow.
   Proceed with reversible implementation within this task; use existing authorization
   for any live integrations, deployment or external messaging.
4. Copy selected reusable assets and applicable fonts/licenses into the target's normal
   asset pipeline. Keep imports and shipped URLs relative to that app. The resulting app
   must work after this reference folder is moved or removed: no source-Mac home paths,
   `file://` URLs, runtime symlinks into this folder or dependency on its `.build/` output.

All paths below are **relative to the supplied demo repository root**, except links
within this guide's directory.

## 2. Inspect the pinned visual reference

| Reference | Exact path / identity |
|---|---|
| Full 1080p movie | `demo-video/film/renders/blended-moss-v5.mp4` — 119.600s, 1920×1080, 30fps |
| Convenient review copy | `demo-video/film/renders/blended-moss-v5-720p.mp4` — same timing/audio, 1280×720 |
| Pinned source | Tag `blended-moss-v5`, commit `3c3b66a022fb487462573d088d6aa8192a17fbc1`; implementation PR 22 merged as `30de35e8186d415c069284ff4870c778818aee84` |
| Final frame evidence | `demo-video/moss-ocean/evidence/film-encoded-1.jpg` through `film-encoded-9.jpg`, plus their `film-encoded-times.json` |
| 720p readability evidence | `demo-video/moss-ocean/evidence/controller-720p-1.jpg` through `controller-720p-4.jpg`, plus `controller-720p-times.json` |
| Film provenance and checks | `demo-video/docs/MOSS-V5-DELIVERY-2026-11-17.md`, `demo-video/moss-ocean/evidence/checks.json` |

Inspect the complete movie and the focused sections below. Existing frame sheets help
inspect details when local video viewing is inconvenient; do not infer visual details
from narration alone. The manifest pins both movie hashes and selected asset bytes.
No new generation or movie rendering is required for this task.

## 3. Translate scenes into real product views

Keep the target's useful existing flows and functionality. Adapt these visual relationships
and interactions to its components; a film timestamp identifies a reference, not a timer
or required screen duration in the live app.

| V5 time | Visual intent | Implement against the target's real behavior |
|---|---|---|
| 16.3–24.6 | Cream/green welcome, large friendly Moss, “Your proactive AI teammate. 24/7.”, informed/away benefits and setup button | Upgrade the current home/onboarding entry. Use the actual owner/workspace and supported coverage behavior. Bind Setup to the real flow; do not simulate sign-in or imply continuous availability if the service is offline. |
| 24.6–36.6 | Directory/docs/Slack/code/tickets/mail cards, accumulated notebook facts, source-to-note connections | Adapt connection/setup and ingestion views to configured adapters. Show actual auth requirements, source status and progress. Writing begins when information is being processed, not merely because a film timer elapsed. Retain error, partial, empty and reconnect states. |
| 36.6–41.6 | What I learned, profile context and facts connected to source chips | Use actual learned facts, timestamps and permission-valid links. Selecting/hovering a fact can emphasize its provenance. Unknown or stale facts remain identified as such. |
| 41.6–47.2 | Brief items with next steps, Moss presenting relevant items | Use real brief generation and saved items. Preserve existing actions, navigation and detail views; show loading/partial/no-update states honestly. |
| 47.2–55.8 | Ask, thinking, answer, sources and a readable round confidence seal | Submit real questions, stream/display actual answers, expose real citations and backend-supported confidence/uncertainty. The stamp can accompany completion; never hard-code “HIGH” or invent a numeric score. |
| 55.8–59.2 | Labelled AI identity and concise source/choice rules | Apply the theme to existing rules/settings and retain all trust controls. No change to permissions, retention, approval or source-access semantics merely to match a short film. |
| 59.2–82 | Clearly labelled AI in a meeting, listening vs speaking, notebook visible while promising a follow-up | Where the prototype supports meeting presence, update its actual avatar/tile and event hooks. Support simultaneous speaking and note capture. Keep the owner's decision with the owner; persist the follow-up through the real workflow. Do not build a fake Zoom clone or claim a meeting integration exists because it is in the film. |
| 82–90 | Mention → reading → checking → typing → concise labelled reply with sources and decision boundary | Update applicable in-app activity/conversation views and existing integration avatar surfaces. Use actual jobs, messages and delivery acknowledgments. A cosmetic typing animation must not manufacture or send a response. |
| 90–100 | Broad information becomes a few updates matched to Role, Goal and Interests, then joins the brief | Build an appropriate live relevance summary/explanation view from actual accessible updates, owner context and match reasons. Show provenance and allow detail inspection. Do not use random theatrical cards, fake counts or the film's invented payment facts as production information. |
| 102.2–111 | One cheerful Moss greets the owner in the app; brief groups what it did/learned/needs the owner; acknowledgment follows a decision | Adapt the current home/brief to the actual owner's name, time/context and saved decisions. One main mascot per active view; compact avatars elsewhere are fine. Acknowledge after the mutation succeeds, not on a fake auto-click. |

The bedroom/phone emergence, camera travel, floating giant UI, globe, end card, soundtrack,
119.6-second duration and cinematic cuts are film staging, not ordinary app requirements.
Its Ram identity, role, goals, counts, dates, sources, answers, meeting dialogue and confidence
are invented demo data. Keep such data only in clearly marked fixtures/stories if useful
for local testing, never as successful live results. Do not ship a pre-rendered walkthrough
video as the app's functioning interface.

## 4. Actual source map and visual system

**There is no `ui-concepts/moss-v5/` folder.** V5 composes retained and newer layers. Older
function names such as `buildTag`, `tg-*` and `src/mascot/tag` can already render Moss;
identify artwork and behavior, not just names. These files are reference implementations
for a deterministic film, not a drop-in application framework. Its `renderAt`,
`window.__mascotTime`, canned pointer paths and absolute schedules must become actual
components and event/state transitions in the target.

| What to inspect | Exact source paths |
|---|---|
| Layer order and asset copy map | `demo-video/film/cuts/blended-moss-v5/cut.json` (later layers override earlier); `shots.json` beside it has scene boundaries and the selective walkthrough time map |
| Main retained walkthrough | `demo-video/ui-concepts/moss-v3/scene.js`, `paper.js`, `room.js`, `motion.js`, `style.css`, `mascot.js`, `acting.js`, `tl.js` |
| Shared UI utilities and invented data boundary | `demo-video/ui-concepts/shared/kit.js`, `shared/data.js`, `moss-v3/data-extra.js`; the last two contain fixtures, not production models |
| Latest setup home | `demo-video/moss-introduction/layer/src/scenes/mossentrance.js` |
| Latest meeting/Slack and combined speaking/writing | `demo-video/moss-ocean/layer/src/scenes/screens.js`, `demo-video/moss-ocean/layer/src/mascot/tag/mascot.js` |
| Relevance/ocean foreground | `demo-video/moss-ocean/layer/src/scenes/ocean.js`; base space is `demo-video/film/src/scenes/world.js` and invented `demo-video/film/world.json` |
| Morning greeting and framing | `demo-video/moss-introduction/layer/src/scenes/morning-greeting.js`, `clip.js` beside it; live-app greeting only, not room footage |
| Morning brief | `demo-video/film/cuts/_blend/layer-tag-v2/src/scenes/tagbrief.js` and V5 `shots.json` brief data; inherited styling is already used with Moss |

The core palette in `moss-v3/style.css` is paper `#f4f3eb`, rail `#eeebdf`, card `#fbfaf4`,
ink `#1d2420`, green `#1f5b43`, sage `#e1e9dd`, line `#e0dbca` and amber `#eba844`.
Use soft paper cards, green rounded actions, source chips, restrained amber emphasis and
clear whitespace. Carry the feel into the target's existing design system and accessible
contrast; do not copy the film's fixed 1920×1080 positioning or enormous camera canvas.

The walkthrough uses Instrument Serif headings, Inter UI text and JetBrains Mono metadata;
the newer home/ocean use Manrope. Files and corresponding OFL notices are in
`demo-video/ui-concepts/shared/fonts/`: `InstrumentSerif-Regular.ttf`,
`InstrumentSerif-Italic.ttf`, `Inter.ttf`, `JetBrainsMono.ttf`, `Manrope.ttf`, and
`OFL-instrumentserif.txt`, `OFL-inter.txt`, `OFL-jetbrainsmono.txt`, `OFL-manrope.txt`.
Keep licenses with copied fonts. Choose a coherent hierarchy in the target rather than
unnecessarily loading every face. The manifest includes hashes for these files.

Preserve Moss's green felt body, cream face/belly, curled sprout, small ears, dark eyes and
amber pendant. Keep the friendly, calm personality; no replacement mascot or new art round.
Use the supplied full-body transparent cutout for a static actor and the mint-backed
avatar for small icons. Use a dynamic label such as the target's existing “[Owner]'s AI Peer”
with an explicit AI marker, not hard-coded Ram or a label that impersonates the owner.

Film sizing is reference only: its actor normalizes a 768px square with `k = height / 644`,
places that square at `(-363k, -702k)` relative to its feet anchor, and keeps the label below
it. Its final meeting actor is 250px in a 1920px-wide frame; default actor helpers often
start at 180px. Retain the foot/prop alignment when adapting assets, then use the target's
responsive layout. Keep the sprout, notebook, pencil, stamp and identity label inside the
available region. Never cover inputs, source links, confidence, status text or subtitles.

## 5. Verified reusable Moss assets

[asset-manifest.json](asset-manifest.json) is the authoritative relative-path, format,
size, SHA256, dimensions, duration and transparency inventory. The selected animations
are all **768×768 VP9 WebM, 24fps, silent, with decoded alpha 0–255**. Most last 5.167s;
`speak-m1` lasts 6.584s and `speak-m2` 8.000s. These are gestures, not guaranteed seamless
loops. Use bounded playback, a quiet hold and a short transition; the film commonly uses
0.04–4.8s windows and approximately 0.12s blends.

| Asset/action | Exact checked-in path |
|---|---|
| Original appearance reference | `demo-video/mascot-exploration-v2/images/25-moss.png` — actually JPEG bytes, 2048px RGB despite the filename |
| Transparent static actor | `demo-video/mascot-exploration-v2/cutouts/25-moss.png` — PNG, 2048px RGBA |
| Avatar/logo | `demo-video/mascot-exploration-v2/avatars/25-moss.png` — PNG, 512px RGB, opaque mint background |
| `wave` | `demo-video/mascot-exploration-v2/motion/25-moss.webm` |
| `attentive` (thinking) | `demo-video/moss-film/assets/moss-attentive.webm` — no separate `think.webm` |
| `present` | `demo-video/moss-film/assets/moss-present.webm` |
| `notebook` | `demo-video/moss-acting/assets/moss-notebook.webm` |
| `listen` | `demo-video/moss-acting/assets/moss-listen.webm` |
| `reassure` | `demo-video/moss-acting/assets/moss-reassure.webm` |
| `acknowledge` | `demo-video/moss-acting/assets/moss-acknowledge.webm` |
| `stamp` | `demo-video/moss-refinement/assets/moss-stamp.webm` |
| `type` | `demo-video/moss-refinement/assets/moss-type.webm` |
| `speak-m1`, `speak-m2`, `speak-m4b` | `demo-video/moss-refinement/assets/moss-speak-m1.webm`, `moss-speak-m2.webm`, `moss-speak-m4b.webm` in that same directory |
| `speak-write` | `demo-video/moss-ocean/assets/moss-speak-write.webm` — V5's final meeting reply, replacing the old standalone `speak-m4b` there |

Copy the **selected silent WebMs**, not their `*-source.mp4` provider takes. Provider
sources have opaque backgrounds and audio streams. Notebook/stamp keyframes are opaque
magenta references, not transparent fallback pictures; some also contain JPEG bytes under
`.png` names. Sniff actual formats and serve the right MIME type; if renaming a copied
reference to its real extension, keep the manifest/provenance association. Do not embed
any provider-source audio, the narrator's film audio or the music into the live app.

**Speaking limitation:** `speak-m1`, `speak-m2`, `speak-m4b` and `speak-write` were generated
for fixed fictional dialogue. They show the desired performance and may inform a bounded
speaking animation; they do not provide arbitrary-word lip-sync. Drive mouth/speaking state
from actual speech playback and the target's available viseme, word-boundary or audio-energy
signals. If precise lip-sync is unavailable, implement an honest speech-active animation
with the actual playback lifecycle and record that limitation. Never play Ram's recorded
lines, run a silent speaking loop while no audio plays, or claim exact live lip-sync from
these fixed takes. Simultaneous note-taking needs independent speech and note state so the
mouth can remain active while the notebook action is visible.

## 6. Drive actions from real state

Create/adapt a small reusable mascot component and an application-state adapter in the
**target**. Inspect existing event names and payloads first. The names below describe
semantics, not invented API contracts. Use operation IDs/cancellation to prevent stale
jobs from taking over a new view. Animation itself never triggers a privileged action.

| Actual state/event | Moss behavior and truthful exit |
|---|---|
| Home ready / first greeting | One `wave`, then quiet `listen` or static pose; do not replay on every render. |
| Awaiting sign-in, permission or user input | Quiet `listen`; keep the real Connect/Retry controls usable. No notebook progress before data arrives. |
| Connector fetch/index underway | `attentive` while waiting/checking. Reflect actual source status; indeterminate progress if no measured count exists. |
| Content arriving, facts extracted or notes being drafted | `notebook` while the corresponding work is active; source highlights follow real results. Stop/cancel on failure or cancellation. |
| Facts/brief ready | `present` toward relevant content, then settle; source links and next steps remain interactive. |
| Question submitted / evidence retrieval | `attentive` until actual answer events; support cancellation, failure, insufficient evidence and retry. |
| Answer generation / text streaming | `type` only during actual composition, `present` when ready; don't force artificial typing delays before showing data. |
| Answer completed with evidence/confidence | A bounded `stamp` gesture and separate real confidence UI. Stamp art does not establish truth; uncertain/unavailable confidence stays honest. |
| Human speaking in a meeting | `listen`, with `attentive` for actual analysis; don't mouth along or imply an owner decision. |
| AI audio playback started/stopped/interrupted | Runtime-driven speaking/mouth activity; stop immediately on pause, interruption, end or disconnect. |
| AI speaking while capturing a follow-up/decision request | Notebook visible early; speaking and writing coexist. Use `speak-write` as visual reference. Show draft/saving/saved/failure from real note persistence; don't claim “added” before success. |
| Deferring a decision / explaining a boundary | Calm `reassure`; clearly leave the actual choice with the owner and surface the pending item. |
| Relevance results available | `attentive` → `present`; show actual role/goal/interest matches and evidence, not arbitrary numbers or faux successful filtering. |
| Owner approves/declines or completes a task | `acknowledge` after successful persistence; keep pending/error states separate. Prevent duplicate submission. |
| Idle, background tab, reduced motion or unsupported alpha video | Static cutout/avatar, with the same useful status text and controls. No success celebration for failed work. |

Use the current backend's jobs/subscriptions/streaming transport where possible. Add the
smallest necessary state hooks or backend fields if the existing operation has no reliable
UI signal: status, operation identity, actual sources/match reasons, completion/failure and
saved follow-up/decision result are examples. Keep existing adapter boundaries and auth.
Do not start a second AI pipeline merely to animate Moss, or report missing meetings,
Slack sending, relevance or persistence as implemented because the film depicts them.
Implement feasible gaps in scope, keep unsupported states explicit and document residual
capability/integration gaps with evidence. Complete independent UI work while a genuine
external dependency is unavailable.

For relevance, inspect the target's owner profile, goals/interests and ranking/retrieval
outputs. Reuse or expose actual match reasons and provenance; allow correction of owner
context if the current product supports it. If evidence is incomplete, say so. Keep irrelevant
updates out of the short brief without silently destroying them or claiming a nonexistent
perfect filter. Permission checks must still govern any source/card/detail shown.

## 7. Responsive, accessible and operational finish

- Use normal responsive layout and readable cards, not the film's canvas scale/camera.
  Verify the target's supported desktop and narrow widths, long owner names, long text,
  multiple sources and both empty and dense results. Labels/props must not collide.
- Keep controls keyboard-accessible and status available as text. Respect reduced motion;
  decorative Moss images may be hidden from assistive tech while the AI identity/status
  remains accessible. Avoid repeated announcements for each animation frame.
- Load only the active/likely next gesture, not all 13 autoplay videos. Reuse a bounded
  player, pause offscreen/background work, dispose old media listeners and avoid parallel
  decoders for every card. Keep layout stable during asset loading. Use muted inline media.
- Test alpha in the target's supported browser/platform. The verified source alpha does
  not prove every delivery/browser path preserves it. Use the static cutout/avatar when
  playback/transparency fails or motion is disabled; never show a magenta/black rectangle.
- Preserve existing integrations, identity, permissions, retention and human approval
  boundaries. Show real source freshness and uncertainty. Run target-appropriate tests and
  authorized manual end-to-end walks; the demo repository's film policy is not a waiver.

## 8. Materialization and completion

**If the receiving copy contains placeholders, use [the media repair transfer](MEDIA-TRANSFER.md).**
The ready ZIP is built from verified real files on the personal Mac and merges into the
already copied reference folder. No personal account download, Git setup or installation
is needed on the company Mac. Verify the overlay before inspecting the movie or assets.

The copied folder should contain real media bytes. [asset-manifest.json](asset-manifest.json)
records sizes and SHA256 values. A tiny text file beginning
`version https://git-lfs.github.com/spec/v1` is an LFS pointer, not an image/movie. Verify
required reference videos, static assets and selected actions before wiring them into the
app. Seven older selected WebMs also use LFS through nested package `.gitattributes`;
the six newer selected WebMs and fonts are ordinary Git blobs. Images/movies and other
media patterns use LFS. An extension alone does not establish whether bytes are present.

Hydrate missing files on the **personal Mac**, verify them there and transfer the checked
filesystem ZIP described in `MEDIA-TRANSFER.md`. The company Mac should verify and extract
that local bundle, not acquire personal accounts or fetch the assets itself. The source-side
hydration command is:

```sh
git lfs pull --include="demo-video/**" --exclude=""
```

A plain folder copy without `.git` can still supply all references if the media bytes are
present; a Git checkout/tag is not required for runtime integration. If authorized recovery
cannot supply a required file, report the exact missing path/hash and continue independent
work. Do not substitute another mascot or regenerate assets silently. Do not copy secrets,
private runtime data, real recordings, the source repo's `.env` setup or ignored `.build/`
folders into the target or its public assets.

Complete the receiving task with:

1. A short actual target-component/state mapping, followed by implementation in that codebase.
2. Moss identity across applicable existing logos/avatars/views; event-driven reading,
   thinking, presenting, speaking, writing, typing and acknowledgments where supported.
3. Real interactive onboarding, learned facts, brief, ask/confidence, relevance and existing
   communication surfaces, including loading, empty, partial, error, cancel/retry and saved
   decision/note behavior. Preserve working capabilities beyond the film's limited examples.
4. A manual walk of each applicable flow using the target's authorized local/test setup,
   with screenshots or a short recording and observed backend state/results. Include slow
   operations, permission denial, no results, failed save and interruption of speech; fix
   observed regressions and perform the target's required checks.
5. Verification that the app runs from its own checkout/assets after the demo-reference
   path is unavailable, with responsive/reduced-motion/static fallbacks working.
6. Target-repo docs and normal commit/PR handoff: what changed, actual checks, remaining
   capability gaps and how to run it. Report deployment status accurately under existing
   authority. Do not describe this source-Mac package or film as proof of live integration.

The ready-to-paste instruction is [PASTE-PROMPT.md](PASTE-PROMPT.md).
