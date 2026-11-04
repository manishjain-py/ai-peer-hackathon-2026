# Personal brief scene QA — 18 September 2026

Owned implementation: `video/src/draft03/PersonalBrief.tsx` only.

Exports:
- `PersonalBrief({t})`: local 0–40 seconds, global 40–80.
- `UpdatedBrief({t})`: local 0–20 seconds, global 143–163.

The first scene shows a prioritized morning overview, then three source →
personal relevance → prepared-action sequences at local 5, 14.6, and 24.5 seconds.
Each includes an authored source snippet, animated exact-line highlight, moving
source chip, personal source match, and a reviewable action. The company event
explicitly matches Manish's saved handoff idea. A visible cursor saves the draft
pitch for later at local 33.5 seconds. At 35.6 seconds, all three priorities return.

The updated brief preserves the same workspace. Field mapping received is distinct
from test examples merely offered; validation and the launch decision still need
Manish. The saved opportunity remains in view without taking over the priority.

Strict isolated TypeScript compilation passed. Full project typecheck passed when
first implemented; the later full run found only in-progress ZoomScene errors
because its timing.json did not yet exist. No errors reported in this component.

Rendered and personally inspected 1080p stills:
- brief-3.png: opening overview.
- brief-9.png: source change and service relevance.
- brief-19.png: office hours and open test relevance.
- brief-29.png: hackathon and saved idea match.
- brief-34.png: saved state and visible cursor.
- brief-38.png: final organized overview.
- brief-return-12.png: updated priorities and pending decision.

After initial inspection, increased important focus copy to at least 28 px,
corrected sidebar active-source selection, prevented nav icon shrinking, and
freed 20 px of bottom margin in both focused cards and the return scene.
Final return and focus frames were rerendered and inspected after those changes.

Temporary isolated Remotion entry and render script are in this directory.
No audio or full-film timing review was performed for this bounded subtask.
