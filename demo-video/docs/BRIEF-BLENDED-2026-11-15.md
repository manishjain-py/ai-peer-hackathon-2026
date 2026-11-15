# Brief: the blended videos and the repo (Manish, 2026-11-15)

Written once, never edited. His message in the session of ai-peer-video-controller-5, at 16:26:22 UTC on 15 November 2026 (the transcript record's own time), word for word:

> I was creating some other videos as well, on my other Mac, and from there, I liked one specific video which i'm attaching here. And from the videos you sent me, I liked little peer. So I would like you to really go through these two video in depth, understand in detail, like the full design, how it's working, everything. And then let's take these two video as two bases. Let's just, for the time being, think that these are the two versions of our final product. So understand how those visuals and the product itself are working. And then let's see how we can blend this entire thing into the existing video (draft 3 i guess) that we have, so that the full demo contains the product walkthrough as well, as the main demo part. While we can still use our original things, we still want to show the initial pitch of the product, multiple people talking, and still the peer joining the Zoom meeting. Still we want to show the Slack update that it provides. But along with all of that, we also want to show this really cool visual walkthrough of the actual product. How can someone set it up?
>
> So you take your best judgment call on how much time you want to give to each portion. So now you have one base, which is your draft three, I guess, the latest original video that you sent me. So we don't want to overwrite any of these. Let's keep that as our separate base. Without overwriting that, try to merge this new product walkthrough video into a single video that captures the full end-to-end demo of this hackathon project.
>
> So you will be giving me two final videos - one with tag and another with little peer.
>
> So maybe you need to revisit your mascot and logo because here the mascots are different. So we might no longer be able to show the real Ram coming out of the phone. Based on these mascots, we might have to show this kind of a mascot coming out of the phone. So see how you want to plug that in.
>
> Don't overwrite anything, but I guess you must have understood the next task, which is to understand this video thoroughly and then blend it in and create a new blended video. We can call it "blended video". So create these two blended videos that gives me an end-to-end vision of, or the full walkthrough of, what the demo video would look like if this is our product walkthrough. And we will keep other video artifacts as well because we might have to go back and forth. For example, after this blending, I might ask you to do a different blend, like where you pick draft three and add a different actual product video into that. So let's not lose any of our important artifacts while still continuing to explore and experiment with different ideas. Hope the overall requirements are clear, but if anything is not clear, ask me first, and then once you are clear, let's get on with the task.
>
> Also, now we have done enough work related to this hackathon idea, but we are still inside the Learn Like Magic repo. So what I want you to do is just set up a separate new private repo for me. It just can be a temporary repo that we maintain for two, three weeks that can help us carry the hackathon work from maybe one machine to another machine and commit different milestones and checkpoints so that we might need to go back and forth between them if needed. So let's do this as well. Let's set up a new GitHub repo for my user and keep that repo private and push this hackathon work or whatever we have done: the context about the initiative, the work that we have been doing, progress that we have made, any artifacts that we have, any learnings that we had, what the next steps are. Every important thing, all the important documentation should be there inside the repo.
>
> And as usual, the repo should be the source of truth for understanding the context, the project, any important artifacts, and also the ways of working, how we generally work: this controller-based working where a controller is the only point of contact and it controls other sessions, and we do the handoff of ownership around forty-five to fifty percent of context. Everything should be part of the repo such that if I just clone this repo on a different Mac at any point, then from there on, if I start Claude on that Mac, it can reliably take over the ownership and understand everything about the project and can continue with the next steps. So please do that part as well.
>
> Okay, I think these are a lot of requirements, and I just want to make sure that you are understood everything. So, if you think you have understood everything, then uh, summarize what are you going to do as next steps for me in easy to understand language and in short before you start.

## What the controller checked at once (16:27 to 16:35 UTC)

- **His video.** It came in a second message, an upload in the session at 16:28:59 UTC
  (`VID_20261115_215845_878.mp4`: 88.7 s, 848x528, 30 fps, no sound). Kept outside git for now
  at `~/.ai-peer/demo-video-private/bases/tag-walkthrough-2026-11-15.mp4`. The controller
  looked at one sheet of 16 frames: a walkthrough of the AI Peer in a calm paper style whose
  mascot is a walking green name tag labelled "Maya's AI Peer" with an AI badge; made-up
  people and data (Maya Chen, a senior engineer on Checkout in Lisbon at "Fernway"; a pull
  request, a ticket, a Slack channel); the setup in four steps (reading her directory entry;
  searching Slack, documents, code and tickets as her; writing what it learned, every fact
  cited), then What I learned, the brief, Ask, the trust note and the return. Against WP6's
  private list of real terms from the walkthrough: one match, a generic job title; no name,
  team, place or ID.
- **The repo.** The hackathon work already lives in its own private GitHub repo,
  `manishjain-py/ai-peer-hackathon-2026` (created 2026-11-04, `PRIVATE`), not in Learn Like
  Magic's repo. The controller proposes completing this one for a fresh Mac rather than
  starting a second repo; his answer is pending.
- **Length.** `DESIGN.md` V6 (his answer of 14 November): under 2:00, 1080p, about half the
  time on the real product working. A blended video with the walkthrough as the main demo part
  fits that rule.
- **"one with tag".** His video: its mascot is a tag. So the two blended videos are the tag
  version and the Little Peer version.
- **Its size.** 848x528 is too small to cut into a 1080p film as it is; the code that made it
  would let a worker build it at full size (asked), else the worker rebuilds it by code.
