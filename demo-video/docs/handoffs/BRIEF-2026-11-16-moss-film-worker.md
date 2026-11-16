# Moss full-film implementation worker

16 November 2026. Immutable controller brief. The sole Codex implementation worker; no helpers.

Read `START-HERE.md`, `demo-video/AGENTS.md`, `demo-video/docs/DESIGN.md` section 0,
`demo-video/docs/BRIEF-MOSS-FULL-FILM-2026-11-16.md` in full, Round 2 README and
`HANDOFF-2026-11-16-generated-mascots-complete.md`. User V34 governs: complete full Moss movie.

## Workspace and ownership

Use `/Users/manishjain/.codex/worktrees/moss-film/ai-peer-hackathon-2026`, branch
`codex/blended-moss`. Controller owns shared main docs, delivery, PR merge/checkpoint and final
acceptance. Worker owns source implementation, media rendering and its evidence/package docs.
Do not edit shared STATE, START-HERE, root README or demo-video/AGENTS. Do not merge or send to
Telegram until controller tells you. Commit and push at concrete steps (fetch before pushing).
Report at least each meaningful milestone; alert at 40% context. Hand off at 45–50% measured
context, with all work pushed and a dated file; controller will start a fresh worker.

## Scope

Create additive `blended-moss-v1`, same 119.6 s / 1920×1080 / 30 fps as approved Tag v2,
plus 720p send copy. Keep approved story, timing, cameras, layout, words, voice, music, theme.
Preserve original source/assets and masters. Only public fictional sources are needed.
Use Moss 25 existing art, cutout, motion and avatar in `mascot-exploration-v2/`.

The audition renderer only swaps source-scene characters. You MUST rebuild the entire
`ui-concepts/tag/` source walkthrough as an additive Moss version, including landing, setup,
source reading, learned, brief, Ask, rules and all marks/avatars. Use all exact six source
spans from `film/cuts/_blend/v2.py`; do not leave the baked Tag in the middle. Modify the Tag
back-to-rules-card action sensibly: Moss should introduce/hold/stand by that same card, keeping
text/timing. Keep AI labels. Preserve entrance/glide/wake-laptop choreography, meeting/Slack,
morning desk return-to-phone, morning brief, globe and closing mark. A repeated greeting-wave
loop everywhere is insufficient: use purposeful existing gesture windows or additional art/
acting where genuinely needed. Keep Moss identity exact.

Reuse the original AAC audio stream from `film/renders/blended-tag-v2.mp4` if possible, avoiding
unnecessary re-encoding; compare audio packet/decoded hashes and timing. No audio-listening claim.

## Generation budget

Prefer existing art and motion. Up to $10 new paid generation is authorized within project
$100 cap; starting project total $48.906079. If generation is needed, only generic Moss art/
prompts may go to the already authorized Gemini/fal route. Read image skill and saved provider
research/tooling, inspect one new gesture before a batch. Keep a separate ledger, communicate
spend at each generation step so controller can notify when total crosses $50. Never print keys,
never upload product screens, never use private recordings or LLM production. No subscription.

## Proof and completion

1. Prove the source walkthrough integration with frames for every stage/transition and a first
full walkthrough preview. Send paths and findings to controller before the final full render.
2. Final full film in `demo-video/film/renders/blended-moss-v1.mp4` and
`blended-moss-v1-720p.mp4`; encoded frame sheets covering every scene and mascot transition,
including setup/reading/learned/brief/Ask/rules, room entrance/return and final marks.
3. Document actual encoded-frame visual checks, full decode, 3588 frames / duration, 1080p/720p,
30 fps, exact audio preservation/timing, base source/master hash unchanged, changed-file
provenance and absence of baked Tag. Private term-list scan unavailable; do not claim a pass.
No unit tests, CI or external review gate. Reuse useful build code; no needless reruns.
4. Save reproducible source/render instructions, asset/gesture method and any limitation.
Commit/push all chosen assets via LFS and source. Open and attach ONE PR, with concrete behavior
and manual validation, then tell controller ready. Controller independently walks the film and
accepts/merges. Do not overwrite any prior artifact.

Runtime: Chrome installed; bundled Playwright in
`/Users/manishjain/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules`.
Materialize demo LFS assets from shared objects. For VP9 alpha ffmpeg inspection put
`-c:v libvpx-vp9` before `-i`. Use async encoding so local media server stays responsive; await
video seeks. Keep render caches ignored. New full movie is a candidate until Manish reviews it.
