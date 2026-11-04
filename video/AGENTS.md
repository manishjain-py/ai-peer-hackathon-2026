# Video production

Read ../docs/video/README.md for build commands and ../docs/progress/current-state.md for the latest verified export.

- Draft 07 lives in src/draft07/ with 263 seconds, seated photographic opening and rebuilt cross-team Zoom. Use its own script/timing and audio/mixed.wav only;32 voices reused and 9 new ElevenLabs lines.
- Draft 06 lives in src/draft06/ with a 240-second timeline, four use-case chapters and all-new ElevenLabs speech. Use public/draft06/audio/mixed.wav only; source/word timing is in its script and audio/timing JSON. Render stills and encoded review before delivery.
- Draft 05 lives in src/draft05/ with a 196-second timeline. It removes Sourcegraph, uses dated user-provided RPS context, and shows the proposed AirChat local-work plugin. Use only public/draft05/audio/mixed.wav and script/timing data.
- Draft 04 lives in src/draft04/ with a 179.5-second timeline, animated employee/orbit, and setup UI. Use only public/draft04/audio/mixed.wav; later scene components intentionally reuse Draft 03 local timing.
- Draft 03 lives in src/draft03/; public/draft03/script.json is the 166.5-second source of scene times. Its mix is public/draft03/audio/mixed.wav and its captions use actual ASR-aligned word timing.
- Draft 02 lives in src/draft02/ with a 240-second source timeline mapped by public/draft02/edit.json to 224.1 seconds. All visuals depend on the frame number.
- src/Film.tsx preserves the original 120-second Draft 01. Do not overwrite it.
- Draft 02 uses only public/draft02/audio/edited-mixed.wav and has visible captions; its original timing.json drives source-time speech and animation.
- src/Illustrations.tsx contains original vector portraits and the Peer mark.
- Draft 01: public/audio/timing.json is its narration text and timing source.
- Draft 01: public/audio/mixed.wav already includes voice, ducked music and effects. Never double-layer stems in either draft.
- Run npm run typecheck after code changes. Render representative stills, inspect them, then render the film.
- Keep labels and meaningful UI copy readable at 1920×1080. Avoid tiny screenshots.
- The concept badge and explicit AI identity are intentional. Live integrations are not implemented.
- Render into ../renders/. Put temporary checks in ../work/. Preserve draft versions when making substantial revisions.
- Update storyboard, audio notes, current state and session log when changes affect the handoff.
