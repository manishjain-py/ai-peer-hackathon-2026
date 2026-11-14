# Where the film's music and sound effects come from

Written 2026-11-14 by the sound helper of session ai-peer-video-wp2. Every page quoted here was
read on 2026-11-14 between 12:00 and 12:45 UTC. Nobody in this pipeline can hear: what the
audio *is* rests on the measurements in `music/measurements/`, and the final judge is Manish's ear.

## In one paragraph

The music bed is one take from **Google's Lyria 3.5, called through fal.ai** (`google/lyria-3.5`),
cut to the film on bar lines by code. fal.ai marks the model "Commercial use" and its terms give
the right to use the service for "your own personal or internal business use", which is what an
internal company film is. Three points are **not** settled by the published words (ownership of
the output, whose account it is, and which of Google's terms reach a fal.ai customer); they are
listed under "Not clear" and are Manish's call. All nine sound effects are made by code in this
repo: no service, no sample, no licence. ElevenLabs was not used (no calls, so no usage file).

## The music bed

| | |
|---|---|
| File used | `music/bed.wav` (48 kHz, stereo, 24 bit, 121.0 s; film time 0 = file time 0) |
| Alternate | `music/bed-alt-1.wav`: the same take cut more plainly (see below) |
| Model | Lyria 3.5 (Google DeepMind), released on fal.ai 2026-09-19 |
| Endpoint | `google/lyria-3.5` on fal.ai (a "Partner" model: fal.ai passes the call to Google) |
| Take used | `music/takes/lyria35-b2.mp3` (117.7 s, MP3 192 kbit/s, 44.1 kHz); request `music/requests/lyria35-b2.json` holds the exact prompt |
| fal.ai request id | `music/takes/lyria35-b2.result.json` |
| Price | 0.10 US dollars per generation (live price read before each call) |
| How it was cut | `music/bed.edl.json`, run by `music/tools/make_bed.py`: which bars of the take play at which film bars, the level ride, the tone setting, the limiter, the ending |
| Made again by | `uv run --quiet demo-video/film/audio/music/tools/make_bed.py demo-video/film/audio/music/bed.edl.json` |

What the code did to the take, all of it: resampled it from its measured 119.9973 BPM to 120
(a change of pitch of 0.04 cents); joined bars at 54, 72, 74, 90 and 106 s with 15 ms crossfades
that end just before the bar line; laid the take's own opening bar (D major) on 116.0 as the end
card's accent; a level ride; one gentle tone setting (30 Hz high-pass, 4 dB less under 100 Hz,
2 dB more above 6 kHz); a limiter that takes at most 4 dB off the highest peaks (it acts on
0.6% of the time); a fade to digital silence by 120.0 s.

Lyria's own answer for this take lists six sections and **no words** (`"lyrics": "[[A0]] [[B1]]
[[C2]] [[D3]] [[C4]] [[E5]]"`): it was asked for, and gave, an instrumental.

### The words relied on

**1. fal.ai, Terms of Service**, "Last Updated: September 8, 2026",
<https://fal.ai/legal/terms-of-service>

- Section 4: "Subject to your payment of the required fees (or credits), Company grants you a
  limited, non-exclusive, non-transferable, revocable right to access and use the Sites and the
  Services in accordance with these Terms and applicable Documentation for your own personal or
  internal business use."
- Section 4: "Customer must use the AI Features and the Output Content only (i) in a lawful
  manner and in compliance with all applicable laws, rules, and regulations and (ii) in a manner
  (including with respect to any Output Content) that does not infringe or attempt to infringe,
  misappropriate, or otherwise violate any rights of Company or any third party."
- Section 7: "Customer’s Confidential Information includes Customer Input and Output Content
  generated for Customer."

**2. fal.ai, documentation, "FAQ"** (Model APIs),
<https://fal.ai/docs/documentation/model-apis/faq.md>

- "Can I use generated files for commercial purposes?" "Each model has its own license. Most
  models on fal are available for commercial use and are marked with a `Commercial use` badge on
  the model page. Models marked `Research only` are restricted to non-commercial use. Check the
  model's page for its specific license."
- "What is the Partner API?" "Models marked `Partner API` are hosted by fal's partners, and
  their availability is managed by the partner."

**3. fal.ai, the model's own page**, <https://fal.ai/models/google/lyria-3.5>

- The page carries the two badges "Commercial use" and "Partner". It states no other licence.
- fal.ai's catalogue API (`GET https://api.fal.ai/v1/models`) gives the same model
  `"license_type": "commercial"`.

**4. Google DeepMind, the Lyria 3.5 model card**, "Updated: July 2026",
<https://deepmind.google/models/model-cards/lyria-3-5/>

- "Our models are available to downstream providers via an application program interface (API)
  and subject to relevant terms of use."
- "Google’s Generative AI Prohibited Use Policy applies to uses of the model in accordance with
  the applicable terms of service."
- Among the safeguards: "product-level mitigations such as safety filtering and applying SynthID
  watermarking."

**5. Google, Gemini API Additional Terms of Service**, "Effective March 23, 2026",
<https://ai.google.dev/gemini-api/terms> (it redirects to <https://aistudio.google.com/docs/terms>)

- "Some of our Services allow you to generate original content. Google won't claim ownership
  over that content. You acknowledge that Google may generate the same or similar content for
  others and that we reserve all rights to do so."
- How this was read: the page is drawn by script, so it could not be searched as plain text. It
  was read through a page-fetching tool that was asked for exact sentences. Check these three
  sentences by eye before leaning on them.

### How these words fit the film

The film is for a company's internal hackathon. fal.ai's badge and its FAQ say the model's output
may be used commercially, and its terms name "internal business use" as what the service is for.
Nothing read forbids this use. The prompt names no artist, song or brand, so the "do not infringe"
duty is met as far as a prompt can meet it.

### Not clear (said plainly)

1. **Nobody says "you own the music".** fal.ai's terms give a right to *use the service* and
   define "Output Content", but hold no sentence that hands ownership of the output to the
   customer. They also say: "Company does not represent, warrant, or covenant that any Output
   Content will be original, will not infringe rights of any third party (including intellectual
   property rights), or otherwise entitle Company to any intellectual property rights in any
   Output Content." So there is no promise and no cover from fal.ai if a claim is ever made.
2. **Whose use it is.** The right is for "your own personal or internal business use". The fal.ai
   account is Manish's own; the film is shown inside his employer. Whether "your own internal
   business use" reaches a film for the employer is not spelled out anywhere read. If the film
   stays inside the company's hackathon this looks low-risk, but it is his call (or his
   employer's).
3. **Which of Google's terms reach a fal.ai customer.** fal.ai's terms say third-party models
   "may be subject to additional terms, conditions, and policies (including terms of service or
   privacy policies of the providers of such Third-Party Materials)" (Section 14) and do not say
   which. The Gemini API sentence above is from Google's terms for its *own* customers: it shows
   Google's stated position, not a contract with us. Google's model card names only its
   Prohibited Use Policy, which an advert bed does not touch.
4. **Not exclusive.** Both fal.ai ("Output Content may not be unique across users") and Google
   (may "generate the same or similar content for others") say another customer could get similar
   music.
5. **A watermark.** Google says Lyria output carries its inaudible SynthID mark, which identifies
   the audio as made by AI. Whether it survives this edit was not tested. It only matters if the
   film must not be recognisable as using AI music, which is not this film's case.
6. **Outside the company.** Everything above was read for an internal film. A public release
   (YouTube, an advert) raises points 1 to 3 in earnest and should be looked at again first.

One request (`lyria35-a1`) was refused by the model's content checker with the same prompt that
passed a moment later as `lyria35-a2`; it was not billed. No reason was given.

### The alternate, `music/bed-alt-1.wav`

Same take, same terms, cut by `music/bed-alt-1.edl.json`: the groove runs from 32 to 90 s with one
join (at 64 s) instead of the thin bars at 54 and 72; the take's own soft last note instead of
the added accent on 116; no tone setting (the take's fuller bass). It sits at the same loudness
as `bed.wav`, so only `music.file` in `mix.json` changes. Use it if the cuts at 54, 72 and 74 s or
the lighter bass of `bed.wav` sound wrong.

### Takes made and not used

| Take | Model on fal.ai | Why not |
|---|---|---|
| `lyria35-a2.mp3` | `google/lyria-3.5` | 123.00 BPM measured (a 2.5% stretch would be needed) and in C sharp, not the D asked for |
| `lyria35-b1.mp3` | `google/lyria-3.5` | 120.00 BPM, but in B major and silent for its first 1.3 s |
| `stable3m-s1.wav`, `stable3m-s2.wav` | `fal-ai/stable-audio-3/medium/text-to-audio` | 120.00 BPM, but dull: almost no sound above 4 kHz (50 dB under the bass), and not in D |
| `sonilo-n1-1.m4a` (`-2` is the same file) | `sonilo/v1.1/text-to-music` | 117.98 BPM and a beat that wanders up to 11 ms |

Their pages also carry fal.ai's "Commercial use" badge; their terms were not read further because
they are not used. They stay in `music/takes/` as evidence and can be deleted.

### A model's listening notes

`fal-ai/audio-understanding` was sent `bed.wav` (music only: no speech, no picture) and asked six
questions. Its answer is in `music/listen/bed-listen.result.json`. It reports no voice, a steady
tempo, no audible faults, "a modern premium technology advert", and an ending that "sounds
completely finished". Its times are wrong (it puts the beat's start at 28 s, not 32, the tempo at
125 BPM, not 120, and describes sound after the file ends), so treat it as an opinion, not a
measurement.

## The sound effects

All nine are made by `sfx/make_sfx.py` from sine tones and filtered noise with a fixed random
seed (numpy and scipy only). No recording, sample, model or service is in them, so there are no
terms to meet. `sfx/sfx.json` lists what each one is and how it measures. The tonal ones (`rise`,
`lights`, `end`) use notes of D major, the bed's key.

ElevenLabs' sound-effects service was allowed for this work and was **not used**: zero calls,
so there is no `sfx/usage.csv`. ElevenLabs Music, and the Gemini and OpenAI keys on this Mac,
were not used either.

## Tools

Measured and built with ffmpeg, numpy, scipy, and (for the speech checks, on this Mac only)
faster-whisper with its built-in Silero voice detector. In `~/.ai-peer/` one thing was done: a
count of whether the ElevenLabs key line exists in `.env` (it does). The key itself was never
read, printed or used, and nothing from that folder was sent anywhere.

## Money

Every paid call went through `demo-video/tools/falgen.py` with the ledger
`demo-video/ledger/wp2.csv` and a cap of 5 US dollars. The ledger's total for this work is
**0.9352 dollars**: three Lyria 3.5 takes (0.30), two Stable Audio 3 takes (0.0752), one Sonilo
take (0.31), one listening call (logged at 0.25, the price expected from the listed 0.01 dollars
per 5 s; fal.ai reported 4 billable units, which would be 0.04, and `falgen.py` logs the higher
figure by rule), and one refused call (0.00). The true bill is therefore between 0.73 and 0.94
dollars.
