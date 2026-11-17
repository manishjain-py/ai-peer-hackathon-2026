# Moss v7

[Watch the 1080p edition](../film/renders/blended-moss-v7-1080p.mp4) or [open the 4K master](../film/renders/blended-moss-v7.mp4). Both run 1 minute 59.6 seconds at 30 fps.

| Film time | What to watch |
|---|---|
| 0:25–0:42 | Moss waits at the Slack sign-in, writes when a source yields something worth keeping and follows the source-linked facts into Ram’s brief. |
| 0:47–0:55 | Moss glides off the brief, lands above Ask, watches the question take shape and stamps the confidence of its sourced answer. |
| 1:28–1:40 | Three catches from the moving stream. Each anonymous tile follows its own lane and opens only after it reaches the green brief. The assembled results are readable together for the final four seconds. |
| 1:40–1:51 | Ram stirs and sits up for 1.7 seconds before the greeting on his laptop. Moss travels once to “Needs you” as the camera closes in. Ram makes the decision. |

The v7 [cut](../film/cuts/blended-moss-v7/cut.json) layers the new performances and scenes over the retained v6 work. Source reading and the Ask move live under `walk/`. The company stream and morning motion live under `layer/src/scenes/`. The v6 soundtrack supplies every voice, music cue and sound effect. This revision uses the existing generic assets and adds no generation cost.

## Rebuild and verify

On the render Mac, use the Node, Playwright, Chrome, ffmpeg and Python setup in [START-HERE](../../START-HERE.md). Materialize the demo media through Git LFS, including the v6 master. From the repository root run:

```sh
node demo-video/moss-choreography/render.mjs
python3 demo-video/moss-choreography/tools/verify.py
```

The renderer captures the edited ranges at 3840 × 2160, assembles them with the retained v6 picture, copies the audio, and encodes the 1080p edition. For scene checks use the renderer’s `--probe` flag. To regenerate the encoded sheets, run `tools/encoded_proof.py` from this package with the argument `master` or `delivery`.

The [controller review](CONTROLLER-REVIEW.md) includes the measured screen path and references. For final visuals use the `stream-final` source sheets and `encoded-master` and `encoded-delivery` sheets in [evidence](evidence/). The earlier `motion-review` and `stream-reveal` sheets document development. [Export checks](evidence/checks.json) · [Image provenance](../moss-clarity/PROVENANCE.md)
