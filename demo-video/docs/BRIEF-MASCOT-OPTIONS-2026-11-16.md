# Mascot alternatives for the approved Tag film

Manish's request, 16 November 2026, received in Codex. Recorded at 12:40 UTC.
The approved base is `film/renders/blended-tag-v2.mp4` (V30, V31).

## His words

> All right. So this is what I want you to do as your first task. You already have access to the latest approved deliverable, the tag version, the blended tag version, right? What I want you to do is just look at it and think of a better mascot if you can come up with a better mascot. So what we will do is we will keep the entire video same, right, as it is today. But we will just change the mascot part, right? That still goes along with the theme and everywhere. But let's come up with those 10-15 different better mascot ideas that look better and, you know, feels better, and be creative, think out of the box. And once you have, you know, your suggestions, maybe create a short video of how that particular mascot will look like within our demo, and then send all those options to me on Telegram so that I can review.

## Scope for this round

- Twelve new mascot directions, distinct in silhouette and character, in the existing cream-paper, green and mint visual theme.
- Short, numbered animated previews inside representative scenes of the approved film, plus an overview sheet for comparison. The selected scene backgrounds, story, words and timing stay the same; this is a mascot exploration.
- The mascot must work in the room, on the paper UI, as the labelled meeting avatar and as the logo. It remains visibly an AI Peer.
- The approved film, previous concepts, voice files and music are preserved. No final replacement is selected until Manish chooses.
- Send every option to the established Telegram Attention group, with names, brief descriptions and a recommendation. This request explicitly authorizes delivery.
- Use the existing code-native SVG/animation pipeline. No new paid generation is planned; the recorded film spend stays $42.08 of $100.
- Only already-public source assets from this repo and newly authored code are used. No private recordings or company content are needed. The old private term list is absent on this Mac; review source provenance and new visible text directly rather than claiming that unavailable check passed.

## Work

One Codex implementation worker, `mascot_previews`, in the managed `mascot-options` worktree,
branch `codex/mascot-options`. Codex is the current user-selected application; this round uses
its available worker runtime and does not launch or consume the old Claude sessions.
The controller records decisions, checks the rendered work and handles Telegram delivery.
Worker instructions: `handoffs/HANDOFF-2026-11-16-mascot-options.md`.

