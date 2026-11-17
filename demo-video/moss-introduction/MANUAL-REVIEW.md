# Moss v4 manual walk and preservation evidence

V37/V38 source and final media were inspected by controller`/root`, with one worker
`moss_v3_builder`. No unit-test,CI or review gate was introduced. Old versions are preserved.

## Source acceptance

The controller accepted the24-point`v4-accepted-source-*` proof. The new definition is
clear at delivery scale; the two benefit cards appear with the relevant voice clauses;
Moss presents and then waits. Its identity badge, cards and setup button clear the long
caption. The home remains continuous at22.0 and the click/transition lands on the existing
setup at24.6. The new voice begins15.0 and ends21.667, filling the old silent space while
leaving a brief natural musical breath before the existing22.2 setup line.

Both morning external mascot overlays are removed. The1.1 wake framing excludes the
bedside phone while retaining Ram's head. The1.3 desk starting view excludes the desk
phone; its room and projected laptop screen follow the same camera path. Only the laptop
Moss remains. The p08 caption moves320px left at102.2 through its final spoken word and
hold; the greeting stays readable from the first laptop frame. The attached push-in and
105.6 brief landing are retained.

A sparse proof exposed the first frame of a newly visible video before its seek had painted.
Waiting two animation frames after video seeks resolved it;24.59/24.6/24.633 show the same
setup composition. Software compositing is also retained from the V3 GPU-ghost fix. Final
encoded proof confirms the joins without stale pictures.

## Patch premise and final verification

Before assembly, splitting and rejoining the saved V3 master at its real IDR boundaries
produced exactly119.6s/3588frames, with all3588 decoded frame hashes identical. New capture
then rendered only486 frames:14–24.6 and100–105.6. The two re-encoded High-profile GOP
spans are14–28.566667 and100–113.633333; bridges use actual V3 pictures and change only
compression. Remaining GOPs are stream-copied. No full-film re-render was needed.

`tools/verify.py` passed on both completed exports:119.600s,3588frames,30fps, correct
resolutions and full decodes. All5608 AAC packets/timestamps match between master and720p.
Encoded loudness is-14.0LUFS/-2.1dBTP. Exactly2742 decoded master frames(91.4s) outside the
patch GOP spans match V3; range hash aggregates are saved. All Tagv2 and Mossv1/v2/v3
master hashes remain unchanged. The21 other original narration entries are exact; only
p02 is replaced by p02v4.

The controller inspected and accepted all56 master scene frames,24 join/boundary frames
and26 independently decoded720p frames, including both patch seams and both picture bridges.
No final creative approval from Manish is implied by this technical/manual acceptance.

## Audio, cost and privacy

The same Matilda voice/model is used through the authorized fal route because the direct
ElevenLabs credential was absent; the first local attempt made no HTTP request. Selected
106-character take costs$0.0106, project total$51.398527. Source/request/result, exact words,
alignment and local speech recognition are saved. No new mascot art or paid video calls.

Controller's audio proof shows exact V3 mixed PCM at0–14 and24.6–119.6, including the full
meeting/Slack/morning/globe/ending. All original music-bed samples are reused. No direct
listening claim is made. All media comes from the existing public fictional demo and
selected generic Moss; only invented narration text went to the provider. No private input,
production access or unavailable private-term-list scan is claimed.
