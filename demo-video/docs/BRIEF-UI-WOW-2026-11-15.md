# Brief: make the AI Peer's own screens a "wow" (2026-11-15, 13:14 UTC)

Manish's request, word for word, as he typed it in the session of
ai-peer-video-controller-4 (window 3977). His own first line came before a pasted text that
he asked to be done. Recorded in `DESIGN.md` section 0 as V21 (his view of Draft 3) and V22
(this task). Dated, never edited.

## His words

> draft 3 looks good. next task -
>
> As next steps, I want you to see this recording yourself that I am going to share with you around the current hackathon prototype walkthrough, what it looks like as the real system. So look at that video, understand that in depth and form an understanding of its current shape, how it is working today. And our next immediate goal, which is a very important goal, is: how do we make it super attractive? How do we make it visually very, very appealing, that people just look at it and they say: wow, this looks super, super cool? Not just from the functionality, but also how we show that in the UI. Feel free to use any advanced motions, 3D motion, graphics, whatever you want. But the goal is that we make it a wow visual experience without bringing any change to the functionality. Unless you think that you can make it wow visually but you might need to make some changes to the functionality: that is also okay. But we have to make it really, really wow visually.
>
> Think about it. Think about those scenarios also. I can give you an example. Let's say when you click on the Setup. You are saying "set up AI Peer for me", and then you click on a button. At that time, you can show the cool animations and a visual representation of how the actual physical process is happening. How it's actually reading different sources one by one. I don't know, maybe a mascot that is appearing, and it's pulling up information from actual [company portal], where we can maybe show a widget, and, I don't know, like an email it is reading. So we can show a widget of Gmail, from where it is actually physically pulling all the information and updating its notes, so we can show visually it's writing some notes. I'm just, hypothetically, giving my thoughts, but I want you to be super, super creative and come up with your own ideas.
>
> So for all such scenarios, think of a super cool visual or physical representation of that scenario and then integrate that in the UI. Think of those super cool ideas. And really apply your best creative thinking, and think really out of the box here. And just, once you have all those ideas, implement all those ideas. Not at the actual functionality, but to just show me those ideas. Same functionality, a different visual idea. Create a video of that idea: you can maybe create an HTML or just whatever you need to be able to create a video so that you can show me that idea. Just create that artifact so that I can see that in an end-to-end walkthrough of that idea. And come up with your four to five best ideas that you can possibly come up with. Give it your best shot. And once you have everything, all those ideas, let me know, and I will review all of those and tell you what I think about all these ideas.
>
> /Users/manishjain/Downloads/Qn-TgPlkpEQyrmmEvyGbhQ.mp4

One internal name in his words is replaced by "[company portal]" (AGENTS.md: no internal
details in new files).

## The recording

- **What it is.** An 81-second silent screen recording (1920x1200, 30 fps) of the AI Peer
  running at his company, with captions. The controller looked at one sheet of 20 frames.
- **Privacy.** It shows real company content (a person's role and team, internal project and
  channel names, internal links), so it is handled like the recordings of V8 and C8:
  - a copy lives only in `~/.ai-peer/demo-video-private/ui-wow/walkthrough-2026-11-15.mp4`,
    outside git;
  - it may be looked at by this initiative's sessions, because Manish asked for exactly that;
  - its frames, its words and any detail from it never go into git, into a file of a worktree,
    or to any outside tool or service (fal.ai, ElevenLabs, Telegram, the web).

## What the product does today

Described generically, from the recording and the generic build in `peer/`:

- **One web page.** A left rail holds the parts (Set up, What I learned, Your brief, Ask your
  Peer, How it works) and the sources of the session: the company directory, documents, Slack,
  code, tickets, and mail and calendar.
- **"Set up my AI Peer".** One button runs four steps, each ticked off with its time:
  1. reading the person's directory entry;
  2. searching their documents and Slack messages, as them;
  3. writing what it learned, with sources;
  4. building the first brief.

  A sources line then shows what it could read. Slack, code and tickets need a one-time
  "Connect" with the person's own sign-in.
- **"What I learned".** A summary of the person's role and work, then fact cards, each with a
  link and a date.
- **"Your brief".** What matters now, newest first. Each item has a suggested next step and its
  sources.
- **"Ask your Peer".** A question box with example questions. It searches again and answers
  with its sources, how sure it is, and as of when.
- **"How it works".** Its rules: always labelled as AI; it reads only what the person can
  already see, as them; sources and dates on everything; what it reads is information, never
  instructions; nothing about the person is kept on the server.
- **Waits.** They are seconds to a minute long; the recording speeds them up.

## The controller's reading

1. **Draft 3 is approved for now** (V21). The film waits for its next round: his real
   recordings, or the made-up screens kept (open, for later).
2. **The new goal** (V22) is a wow visual experience for the product's own screens, with the
   same functionality. Functionality may change only where the wow needs it, and every such
   change is said.
3. **The ideas.** For every scenario (setup first, then learning, the brief, asking, the rules),
   a visual or physical picture of what really happens.
4. **The output.** His 4 to 5 best ideas, each shown as an end-to-end walkthrough video made
   by code (HTML and the film's renderer). It is not built into the product yet. He reviews
   them all, then decides.
5. **Who does it.** The package is WP6, run by `ai-peer-video-wp6`
   (brief: `handoffs/HANDOFF-2026-11-15-ai-peer-video-wp6.md`).
6. **Data.** The concept videos use only made-up data: the film's Ram and its made-up Airbnb
   payments story (V19).
