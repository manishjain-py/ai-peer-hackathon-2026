# AI Peer — ownership handoff, 1 November 2026

This handoff was prepared after a read-only artifact/context audit. The latest
film was produced and delivered on **19 September 2026**; it has not been revised
or regenerated for this handoff. Its files and recorded source hashes still match.

## 1. Take over from this point

At the time of this handoff the project folder was **not a Git repository**;
source control came on 4 November (see
[decision 0008](../decisions/0008-private-github-and-media-preservation.md)).
Preserve the full project, not only the newest files.

Start with `AGENTS.md` and [the current state](current-state.md), then load the
relevant routed documents (the `$ai-peer` skill does this). This handoff
summarizes history; current user instructions take precedence.

**The current deliverable is complete.** Draft 07 is delivered and awaits Manish's
review. There is no pending render, upload, approved Draft 08, or live-product
implementation task. Do not start another version simply because you inherit
ownership. Confirm the state briefly and continue from Manish's next request.
No explicit acceptance of Draft 07's creative result has been received yet.

Operating preferences:

- Use clear, simple language. Be autonomous within the authorized scope; avoid
  repeated confirmations and do not ask Manish to repeat settled choices.
- Private delivery of revised completed films to Manish is the established
  workflow. Public publishing needs separate explicit instruction.
- Keep old drafts, original user source and professional context intact. Record
  significant choices, update current state, append dated history, check links
  and inspect actual outputs before handing off.
- Manish previously asked to collect a feedback round without implementing until
  explicitly released. That round was released and completed. The preserved
  collection-only text in its record is historical, not an active hold.

## 2. Product vision and current scope

AI Peer is a proposed persistent personal work teammate:
**learn the employee → understand their work → stay current → protect their focus
→ represent them within delegated limits → return a reviewable handoff.**

Its value is two-way. For Manish, it connects permitted company signals to his
projects, services, interests and relationships, surfaces what matters, prepares
next steps and provides a daily brief. For colleagues, it answers supported
routine questions while he is unavailable, reduces timezone clarification delays
and participates transparently in delegated meetings.

Do not reduce the idea to company search, an inbox digest or an offline answering
bot. The original vision also includes historical decision explanations,
engineering assistance, onboarding, PTO coverage and eventually Peer-to-Peer
collaboration. These are future possibilities, not required additions to the
current film and not implemented capabilities.

**Only the concept film and supporting documentation exist.** No live AI Peer
backend, knowledge graph service, continuous sync, directory connector, Slack bot,
Zoom participant, Gmail/calendar integration, permissions engine, activity pipeline
or AirChat AI Peer plugin was implemented. Source badges and animated actions
are authored examples. No real company messages, tags, calendar responses,
deployment, validation or launch approval occurred during film production.

Future design requires source and recipient access checks, scoped delegation,
evidence and timestamps, stale/conflicting-fact handling, visible AI identity,
human control over consequential decisions, and a correction/audit trail.

## 3. Verified deliverables

All paths below are relative to `film/`. This copy keeps only the final film and
its captions; the preview, older drafts and `work/` stayed in the original repository.

- **Final film:** [renders/ai-peer-draft-07.mp4](../../renders/ai-peer-draft-07.mp4).
  **4:23 / 263.000 s**, 1920×1080, 30 fps, 7,890 frames, H.264, stereo AAC 48 kHz.
  **22,743,114 bytes**.
- **Preview:** `renders/ai-peer-draft-07-preview.mp4` (original repository only),
  960×540, same duration; 10,484,008 bytes.
- **Captions:** [renders/ai-peer-draft-07.srt](../../renders/ai-peer-draft-07.srt)
  and preview SRT; **85 cues**. Captions are visible in the picture. There is no
  additional embedded subtitle stream that would duplicate them.
- **Delivery:** sent privately to Manish on Telegram and confirmed; the receipt
  is in the original repository's `work/draft07/`. Do not resend by default.
- App file opening returned **queued**; do not claim it was visibly opened.
- Drafts 01–06 remain in the original repository's `renders/`. Nothing was publicly hosted.

Final MP4 SHA-256:
`bf51906c77713c0a6d7b72702d6414372bd09709d2441110d4353d25e4738cf5`

Preview SHA-256:
`1b7f5b4613ccbe0b4caa939f32bf2290ec021292914ee44d6718a81587f65043`

On 1 November, both MP4 hashes, both caption sidecars, actual metadata,
nonprovisional timing/script correspondence and all **15 production manifest
entries** were rechecked. No media was regenerated and full decoding was not
repeated; unchanged hashes preserve the relevance of the recorded September QA.
That QA decoded both exports without errors, verified fast start and measured
AAC at **−16.0 LUFS / −2.7 dBTP**.

Independent reviewers passed the script, corrected opening proof and Zoom stills.
Final independent full-film review turns encountered usage limits; root completed
**60 encoded-preview samples and four 1080p spots**. Do not call this an uninterrupted
independent audiovisual playback review. **Direct audio listening was unavailable.**
Recognition, timing and level checks do not establish subjective naturalness.
Those September usage-limit incidents are history, not a claim about today's quota.

## 4. Current film, in order

| Time | Story |
|---|---|
| 0:00–0:24 | Fictional photographic employee already seated and happy; routine requests, 150 emails, Slack pings and late meetings form an attention circle. Expression becomes attentive then worried. No walking. |
| 0:24–0:30 | Peer reveal; requests move away, the employee relaxes and regains focus. |
| 0:30–1:04 | Create my AI Peer → OneAirbnb profile/team/projects → GitHub → proposed AirChat plugin for selected local projects, current tasks and uncommitted work → chosen Slack/Zoom/Gmail/calendar access. |
| 1:04–1:36 | Chapter 01, BOBO: company launch → relevance to chargebacks → possible missing payments-risk involvement → product-owner contact. |
| 1:36–2:16 | Chapter 02, Slack: US data owner asks why cancellation-window data is needed while Manish sleeps; Peer explains the dispute-agent need; owner offers purchased-item expiry guidance. |
| 2:16–3:09 | Chapter 03, cross-team Zoom: generic Maya/Product, Alex/D-REX and Jordan/Case Platform. Missing RPS representation → identified Peer steps in for Manish because it is late → draft status → specific fresh-case question → partner updates → captured owners/next steps. Launch stays with Manish. |
| 3:09–4:09 | Chapter 04, missed notifications: Gmail mark-all-read; Yuri's Airversary/Vince appreciation message; relevant fireside invitation (speaker Blake Carter) with Accept/Decline/Ignore and a visible acceptance; Cassette dependency alert; personal daily brief. |
| 4:09–4:23 | A few examples, countless possibilities. Closing line: **“More room for your best work.”** |

Exact line/scene times live in `video/public/draft07/script.json`. Spoken timing
lives in `video/public/draft07/audio/timing.json`.

## 5. Evolution and decisions not to reverse accidentally

- **Draft 01:** initial approximately two-minute concept film, generic UI/Edge TTS.
- **Draft 02:** expanded realistic Slack/Zoom reconstructions and longer conversations.
- **Draft 03:** faster pacing, local Qwen voices, original upbeat 124 BPM score;
  personal awareness/daily briefs became central.
- **Draft 04:** attention-circle character opening and explicit creation/setup.
- **Draft 05:** real supplied RPS context; Sourcegraph removed; proposed AirChat
  plugin explains local/uncommitted work.
- **Draft 06:** distinct full-screen use-case chapters; BOBO, real timezone problem,
  missed notifications; all speech moved to ElevenLabs; walking/sitting character.
- **Draft 07:** latest targeted change. Manish rejected the walking cartoon as
  childish/unprofessional. It was replaced with a seated photographic employee.
  Zoom was rebuilt as a meaningful cross-team exchange, using generic participant
  names. Other scenes retain their content; the longer meeting shifts later
  content by 23 seconds. Thirty-two exact voice clips were reused, nine added.

Manish wants polished advertising quality inspired by Slack's connected narrative
and Notion's clarity; smooth motion, realistic recognizable tools, clear individual
impacts, natural restrained voices, upbeat music and an impactful introduction.
A rigid two-minute limit is obsolete. Prefer clarity without sluggish pacing.

Do not restore Sourcegraph, robotic/excited Edge or Qwen performances, cartoon
walking, or real coworkers' names in Zoom. Keep actual RPS/project/system names.
The latest Zoom direction explicitly includes the missing-team/late-for-Manish
setup and supersedes earlier direct-address/no-late-night directions.

Full-screen chapter titles and visible outcomes matter. The Peer must both give
and receive context; meeting notes should appear only after the relevant spoken
claim. Consequential decisions remain human. The current name/tagline are working
choices, not a permanent brand approval.

Opening-specific fixes: use complete photo expression states with brief dissolves;
never hold a partially blended face with doubled eyes. Released cards should pass
behind the employee and clear before the Peer title. The photos are fictional,
not a likeness of Manish or genuine recorded footage.

## 6. Real context versus authored examples

Preserve [the complete original idea](../../source-material/ai-peer-original.txt)
without edits (this copy only swapped the example engineer's name for an invented
one). The professional input was a work-profile file the user supplied
(not kept in this copy).
It contains **19 September 2026 work facts and August 2026 profile data**. It is
now November; no private source was refreshed. Do not narratively turn those
snapshots into current November facts or follow their private links without a task.

Manish is described as Airbnb Senior Software Engineer, Payments, Risk Partner
Systems (RPS). Ownership is scoped: Pennyworth service,
nova-disputes package, Compass risktooling actions. Pineapple and Treehouse are
workspaces. Do not claim ownership of all Atrium/Nova, Compass, UDS, Cassette,
Steward or other shared platforms. Source ownership files are `OWNERS`.

Premium chargebacks cover Weather Protection (WP), Synthetic Cancellation (SC)
and Cancel For Any Reason (CFAR). Recorded D-REX schema/producer changes are merged;
UI/backend PRs remain drafts. Merge does not establish rollout/deployment. Backend
deploy precedes production UI validation; a fresh D-REX→DCQ case remains unverified.
WP identity/outcomes are follow-ups. SC uses the purchased Order item's stored
expiry, not a whole-order expiry or an invented exact API field. A CFAR base-policy
result does not prove no refund was due/paid. Payments ML leads the CBQ pilot;
Manish's earlier ergo prototype used shadow investigations, not autonomous production
remediation. The film's chargeback-review queue is not a renaming of that CBQ pilot.

Scenario boundaries:

- BOBO (Booking on Behalf Of) and missing payments-risk consultation are Manish's
  reported experience. Peer detection/prevention is hypothetical. No real Alex
  product owner, proven incident prevented or measured saving is established.
- The US-team Synthetic Cancellation clarification delay is user-reported real.
  Peer participation is hypothetical. Cancellation timing helps assess a dispute;
  it does not alone determine legitimacy. The data reply is illustrative guidance.
- Yuri's five-year Airversary, Vince's appreciation email and an Airbnb fireside
  invitation are illustrative (invented names in this copy; the delivered render
  shows the original names). The real speaker's name and role were checked against
  a public source; that does not verify an actual Airbnb event.
- Cassette's dependency relationship is supplied context. The specific maintenance,
  tagging and impact are simulated. The survey reminder was an alternative idea,
  not an outstanding missing requirement.
- Read email is not necessarily handled; pending RSVP is not proof it was missed.
  Show source previews, relevance and action. Calendar action follows the user's
  visible choice. All people/dialogue in Zoom are authored/generic.

## 7. File map and production workflow

Read [video index](../video/README.md), [Draft 07 storyboard](../video/draft-07-storyboard.md),
[audio](../video/draft-07-audio.md) and [verification](../video/draft-07-verification.md).
Decisions 0001–0007 and the [session log](session-log.md) preserve history.
Product routes are `docs/idea/`; future architecture/status are `docs/technical/`.
Reference research and original Slack/Notion links are in `references/README.md`.
Reference film editing software/music are not established; Notion mascot cel/Rive
workflow is the verified narrow fact. Do not copy their assets or music.

Main source files:

- `video/src/draft07/Film07.tsx`: assembly and captions.
- `OverloadScene.tsx`, `SeatedEmployee.tsx`: opening and photo expression states.
- `ZoomScene.tsx`: generic cross-team call, speech-linked notes, handoff.
- `SetupScene.tsx`, `StoryScenes.tsx`, `Shared.tsx`: retained setup and other chapters.
- `video/public/draft07/opening/`: three PNGs. Prompts/provenance and proof material
  are in `work/draft07/opening/` (both in the original repository only).
- `video/public/draft07/audio/`: final mix, stems, actual timing, captions and QA
  (this copy keeps the timing, captions and QA text, not the mix or stems).
- `video/scripts/render-07.mjs`, `finalize-07.sh`, `audio_build_07.py`.
- `work/draft07/`: source manifest, review records, encoded samples, QA checker,
  combined/full/preview audits, upload helper and delivery receipt.

The stack is Remotion 4.0.526, React 19.3.0, TypeScript 7.0.2 and bundled Manrope.
The renderer uses `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
Node/npm, FFmpeg and `video/node_modules` were present on the production machine.
The audio interpreter was `work/draft03/audio-venv/bin/python` (Python 3.12).
Always run from `film/`:

```sh
cd film
npm --prefix video run typecheck
npm --prefix video run stills:07
npm --prefix video run preview:07
bash video/scripts/finalize-07.sh --preview
npm --prefix video run render:07
npm --prefix video run finalize:07
```

These commands rebuild the delivered version; **do not run them merely to resume**.
For an authorized new revision, create versioned source/script/render/finalizer
paths and register its composition in `video/src/index.tsx`; preserve Draft 07.
Render representative stills, inspect them, render a preview, review changed
sequences independently when possible, then render/mux and validate the actual file.

`--stills=...` accepts seconds. `--range=startFrame,endFrame` accepts frames.
Finalization copies silent picture and muxes **only `audio/mixed.wav` once**;
that WAV already includes narration, music and effects. Visible captions plus
sidecar SRT should not become duplicate embedded subtitles. Check duration/fps,
full decode, AAC levels, caption coverage, actual-file visuals and delivery receipt.
The checker `work/draft07/final_qa.py` supports `--report` and normalizes input paths.

Audio: ElevenLabs Multilingual v2, native speed 1.0, style exaggeration 0, moderate
stability. Sarah narrates; Aarav J is Peer; Alice is Maya; Karthik is Alex; Chris is
Jordan and the Slack data partner. These are catalog performances, not cloned voices.
Use the existing original 124 BPM score. Adjust copy/windows instead of speeding
speech to fit. For authorized audio rebuilding, use the versioned builder with
`--asr`. **Do not casually run `--provisional` on delivered timing: it overwrites
actual timing with estimates.** Visual-only changes usually need no new speech.

The ElevenLabs builder reads `ELEVENLABS_API_KEY` from the environment or, in
this copy, from an `ELEVENLABS_API_KEY=...` line in `~/.ai-peer/.env`. Never
print/copy/commit secrets or log headers. Preserve cached request/audio/alignment
files and inspect uncertain pending requests before retrying paid generation.

The 15-file manifest is **not a standalone dependency bundle**. Draft 07 imports
older shared code; audio imports earlier audio modules and reuses Draft 06 selected
WAVs. The composition index imports all versions. Keep `work/draft06/audio-clips`,
prior timing, older source modules, assets and the audio environment. Do not delete
`work/` as disposable scratch without auditing dependencies.

## 8. Delivery and continuation

Films were delivered privately on Telegram through a helper in the original
repository's `work/draft07/`. For a future draft, use a new filename and receipt
path and the correct duration; do not overwrite the delivered film or reuse its
receipt. Confirm delivery before claiming it. Do not publish the private
work-context video publicly by default.

The cosmetic `finalize-07.sh --help` usage line still says `finalize-06.sh`; actual
07 paths/behavior are correct. This was left unchanged to preserve the frozen
production manifest. Historical version docs remain historical; prefer current
state and latest decisions. First-draft open questions have been clarified during
this handoff so resolved preferences are not presented as new blockers.

Possible next steps require Manish's direction: targeted Draft 08 feedback,
presentation/pitch packaging, or a separately scoped prototype. For a prototype,
start with one employee/project, approved fixtures, evidence-backed retrieval,
a local interaction/review feed, and measurable acceptance criteria. Choose any
live connector, posting authority, model/runtime and meeting scope explicitly.
Do not jump from an animated demo to claiming live integrations.

No additional rendering or delivery is needed now. The immediate next step is
Manish's review of Draft 07 or a new task from him.
