# AI Peer mascot options · 16 November 2026

Twelve original animated characters explored at Manish's request (DESIGN V32), using the **approved Tag v2 film as the unchanged base**. These preserved comparison reels record the first exploration. Manish later chose Moss (25) from the [generated Round 2](../mascot-exploration-v2/README.md) for the full film. The latest complete review cut is [Moss acting v2](../film/renders/blended-moss-v2.mp4), with its [delivery record](../docs/MOSS-ACTING-DELIVERY-2026-11-16.md). This package and its original recommendations remain preserved.

Open `index.html` for all twelve videos, `renders/overview.png` for the numbered contact sheet, or `renders/NN-name.mp4` for each Telegram-sized preview. The corresponding `-1080p.mp4` is its full-resolution master. Every candidate also has a portrait and a five-scene contact sheet.

## The twelve directions

| # | Name | Character | What to judge |
|---|---|---|---|
| 01 | **Folio** | A folded cream page with a forest-green spine; it gathers knowledge and keeps your place. | Strongest connection to the paper interface and work knowledge. A more literal character than the animal options. |
| 02 | **Swift** | A sculptural paper swallow: quick, precise and quietly helpful across time zones. | Most graceful entrance silhouette; its wide wings are distinctive, but the face is smaller at avatar size. |
| 03 | **Sable** | An origami fox in forest green and warm cream, alert without looking mischievous. | Memorable and perceptive. A sharper, more assertive personality than the calmest candidates. |
| 04 | **Nox** | A small ceramic owl with a wide cream facial disc and dark green wings. | The clearest after-hours companion, with an especially readable face. The owl metaphor is familiar. |
| 05 | **Loop** | A continuous woven ribbon with a bright face in its open centre; a living connection. | Most abstract connection metaphor. Distinctive outline, but the woven form needs a larger icon to read fully. |
| 06 | **Pip** | A warm ceramic seed with two folded green leaves, grounded and approachable. | Warmest, softest personality. Its growth metaphor is less directly about night coverage. |
| 07 | **Cairn** | An asymmetric river pebble of glazed green stone with a cream face and gold seam. | Calm and reliable with a tactile silhouette. The connection to information work is mostly carried by the story. |
| 08 | **Luma** | A pocket lantern with folded paper wings and a warm living light inside. | Directly reinforces someone keeping the light on. Amber is used more prominently than in the other candidates. |
| 09 | **North** | A friendly brass-and-green pocket compass, its face floating within an open ring. | Expresses relevance and direction well. The compass is more a trusted tool than a little teammate. |
| 10 | **Manta** | A folded-paper ray, broad cream wings over a green underside and a ribbon tail. | Most fluid and unusual shape. The paper ray needs the film context to explain why it represents a peer. |
| 11 | **Tandem** | Two interlocking ceramic arcs, one green and one cream, form a single attentive face. | A compact visual metaphor for collaboration. More abstract and brand-like than the character-led options. |
| 12 | **Post** | A soft-cornered envelope courier with a green fold, tiny satchel tab and amber seal. | A clear carrier of updates and handoffs. Its envelope association can make the scope feel narrower than the product. |

The controller's initial shortlist, after looking at the sheet and the first source-scene proofs: **01 Folio**, for the closest fit to work and paper; **08 Luma**, for the “someone keeps the light on” story; **04 Nox**, for a calm after-hours teammate. This is a recommendation, not a user decision.

## The comparison is the same for every option

Each reel is **23.3 seconds, 30 fps**, with an original 3-second identification card followed by four excerpts. The original scene timing, camera movement, data, dialogue, captions and music are preserved at their original speed. The new mascot uses the existing path through the room and the original morning-brief choreography. Only the drawn mascot, its name plaque, its avatar and its mark change. The paper morning brief provides the UI comparison; these reels do not re-render the entire setup walkthrough.

| Reel time | Source time in approved film | What it shows |
|---|---|---|
| 0–3.0 | New comparison card | Name, idea, moving character, small app icon; silent |
| 3.0–9.0 | 14.0–20.0 | The same phone-to-desk entrance |
| 9.0–14.0 | 76.5–81.5 | The same Zoom update with the candidate's avatar |
| 14.0–19.4 | 105.6–111.0 | The same paper morning brief and decision |
| 19.4–23.3 | 115.7–119.6 | The same end card with the candidate's mark |

The sound is cut from the corresponding intervals of the approved movie, without new narration, music generation or timing changes. These short excerpts have intentional editorial cuts between scenes. Direct audio listening is not claimed.

## How it is built

`mascots.js` draws every character in SVG using the existing tag's anchors and the pose fields needed by the sampled scenes. The audition adapter is not yet a replacement for the tag's full setup and rules-card transformation. Shapes, folds, highlights, face movement and secondary motion are code-native. `concepts.json` holds the names and ideas. `render.mjs` calls the existing public-film builder into `.build/film/`, then replaces only the mascot module, avatar and mark **in that disposable build**. It seeks the original scene functions and source footage at the source times above in local headless Chrome, captures 1080p frames, and packs them with ffmpeg. No approved source or master is edited.

Rebuild requirements: Node 22+, Playwright, Google Chrome, ffmpeg/ffprobe, and the repo's demo-video Git LFS assets. Run `npm install --prefix demo-video/mascot-options` for the local renderer dependency (or use the bundled runtime below). The renderer first tries a local Playwright install, then the Codex bundled runtime; `CODEX_NODE_MODULES` can supply another package directory. No paid service is called.

```sh
node demo-video/mascot-options/render.mjs --sheet --probe folio pip
node demo-video/mascot-options/render.mjs folio
node demo-video/mascot-options/render.mjs --all
```

The 1080p delivery files use H.264 CRF25 with the slow preset; high-rate frame-capture intermediates stay in the ignored cache. The 720p copies use CRF22.

`--probe` writes portraits and source-scene contact sheets only. `--sheet` writes the twelve-character overview. One or more IDs render selected reels. All outputs go to `renders/`; disposable caches are ignored. Independent selected-ID processes may render concurrently after the initial build exists.

## After a mascot is chosen

Integrate only the chosen character across the complete film: re-render the existing setup walkthrough with that character, retain the rules card while adapting its transition, check every avatar and logo, then render the full unchanged 119.6-second timeline. The preserved source and audition rig make that work straightforward; it is intentionally not done for twelve unchosen options.

## Provenance and checks

- Input master: `demo-video/film/renders/blended-tag-v2.mp4`, approved under V30/V31, SHA-256 `7756283021b7237605337f079e435babb25143c2fb1d9023e6b70204a952b039`.
- The visual plates, made-up UI data, scene code and fonts all come from committed **public** demo-video sources. No private recording, frame, text, data file or credential was read or used.
- No external generation call and **$0.00 new spend**. The existing approved source audio is reused.
- The old private-term-list check is unavailable on this Mac. Privacy proof therefore rests on strictly public input provenance, new original character geometry, and inspection of the changed-file list; it is not reported as a passed private-list scan.
- Browser page errors fail the render. Video seeks wait for the actual frame. Outputs are checked for dimensions, frame rate, length, audio and decoding; results are in `evidence.json`.
- Every character and its in-demo contact sheet are visually inspected; the parent controller reviews the set before delivery.

The approved Tag master, all earlier cuts, all product code and the original source scene files remain untouched. New source and outputs live in this directory only.
