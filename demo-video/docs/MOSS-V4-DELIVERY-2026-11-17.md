# Moss v4: complete movie delivered

17 November 2026 UTC. V37/V38 are complete. Manish's words are preserved in
`FEEDBACK-MOSS-V3-2026-11-17.md`. This is the latest review cut; earlier films remain intact.

## Watch

- [1080p master](../film/renders/blended-moss-v4.mp4): 379,701,921 bytes.
- [720p review copy](../film/renders/blended-moss-v4-720p.mp4): 20,090,083 bytes.
- Both are **119.600 seconds, 3,588 frames at 30 fps**.

Telegram delivery is confirmed in `delivery/moss-v4-film-2026-11-17.json`: video **23108**
at **04:13:34 UTC**, review **23109** at **04:13:35 UTC**, in the established Attention
group. The video has correct 1280×720, streaming and rounded 120-second metadata.
Do not resend unless Manish asks.

## The revision

The setup home now states “Your proactive AI teammate. 24/7.” Two visible benefits arrive
with the voice: keeping Ram informed and covering when he is away. A larger Moss presents
them; the setup button remains and the existing setup flow starts at 24.6 seconds.
The new 18-word Matilda introduction runs from 15.0 to 21.667 seconds:

> I'm Ram's AI Peer, his proactive AI teammate, keeping him informed and covering for him around the clock.

In the morning, Moss appears only on the laptop greeting screen. Reframing the existing
fictional wake and desk shots keeps both phones out of view; the two external Moss overlays
are removed. The laptop greeting and attached camera push remain. The last morning-caption
word and hold move left at 102.2 seconds so the greeting is readable from its first frame.

## Evidence and reproduction

Source/rebuild: [moss-introduction](../moss-introduction/README.md); audio recipes, selected
voice, requests, settings, result and ledger are saved in that package. New scene layer:
`../moss-introduction/layer/`; cut: `../film/cuts/blended-moss-v4/`. The walkthrough after
24.6 seconds uses retained `../ui-concepts/moss-v3/` source; there is no moss-v4 UI directory.

The controller accepted 24 source points, 56 final master scene frames, 24 boundary/join
frames and 26 independently decoded 720p frames. Both exports fully decode and measure
-14.0 LUFS / -2.1 dBTP, sharing all 5,608 AAC packet payloads and timestamps. All predecessor
master hashes are unchanged. See [acceptance](MOSS-V4-ACCEPTANCE-2026-11-17.md) and the
package's `MANUAL-REVIEW.md`, `evidence/checks.json` and `evidence/assembly.json`.

All 21 other narration entries and the entire V3 music bed are reused. Actual V3 mixed PCM
is identical outside 14–24.6 seconds. The delivered assembly preserves 2,742 decoded master
frames exactly; the two re-encoded GOP spans include V3 picture bridges where only
compression changes. A full rebuild route is also documented. The new line's local speech
check matches. Direct human listening and an unavailable private-term-list scan are not claimed.

New spending: **$0.0106**, for 106 fictional narration characters through the authorized
fal.ai route using the same Matilda voice and Multilingual v2 model. The direct ElevenLabs
credential was absent; its local attempt stopped before HTTP and incurred no charge.
Project total: **$51.398527 of $100**. The $50 notice was already sent; next notice is $80.
Weekly usage was 22% at closeout. No provider request, render or server remains. Only
invented narration text went to the provider; no new art, private recording or company data.

PR [21](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/21) merged as
`033fb44a0d3c060786c584d63be3af1693f3bf17`; annotated checkpoint `blended-moss-v4` is pushed.
Tag v2 remains the last explicitly approved full movie. Next: Manish's feedback on v4.

Master SHA256: `c23a8e7e5b5d20e650ee20508e52cd6e2ab2cbda37b0a49032756f26c2113432`.
720p SHA256: `819b58b640e9f1bd6ee180ec8d6705bf5f2604d8fdebffc37519d76563206b46`.
