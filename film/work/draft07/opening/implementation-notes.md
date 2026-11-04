# Draft 07 opening implementation

The opening and relief keep their existing 24-second and 6-second boundaries.
The employee is already seated and visible on frame zero. All walking, sitting
rigs and cartoon artwork are removed from these Draft 07 components.

The visual uses original built-in ImageGen photographic assets: happy,
attentive, and concerned versions of the same fictional employee. The base body,
hands, laptop and desk stay fixed. Head-region edits use a feathered mask and
short full-state transitions:

- Happy → attentive: 8.68–8.96 seconds.
- Attentive → concerned: 12.85–13.13 seconds.
- Relief: brief return to the happy state while departing cards move behind the
  photo. No partial neutral/concerned blend is held.

Notification cue times remain 5.5, 8.5, 12, 15.5 and 19.5 seconds. Relief routes
cards out earlier so they clear the employee and Peer title. A very small
1.4-percent camera push gives the still composition some motion without
procedural body animation.

Source:

- `video/src/draft07/OverloadScene.tsx`
- `video/src/draft07/SeatedEmployee.tsx`

Assets and generation prompts are documented in `imagegen-prompts.md`; hashes
are in `asset-sha256.txt`. Source/assets were frozen after TypeScript passed.

Proof outputs:

- `opening-motion-proof.mp4`: current 30-second silent 960×540 encoded proof.
- Eleven final 1080p proof stills at 0, 3, 6.5, 10, 13.5, 17, 21, 23.5, 24.8,
  25.5 and 29.5 seconds.
- Fifteen dense 1080p transition samples at 8.6, 8.75, 8.9, 9, 9.3, 12.3,
  12.7, 12.9, 13, 13.2, 24.3, 24.6, 24.9, 25.3 and 26.8 seconds.

The historical `stale-heldblend-frame-13.png` records the first-pass ghosted-eye
issue and must not be treated as the current output. It was replaced by full
expression states with short dissolves. The earlier cards-over-face issue was
also corrected before the current proof. The independent reviewer was sent
the dense samples to verify both corrections.

This is authored photography with expression dissolves, not filmed performance
or webcam footage. No audio was generated or listened to in this subtask.
