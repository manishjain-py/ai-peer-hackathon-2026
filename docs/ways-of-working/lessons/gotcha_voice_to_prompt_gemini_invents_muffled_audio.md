---
name: gotcha-voice-to-prompt-gemini-invents-muffled-audio
description: "/voice-to-prompt: on a muffled recording the Gemini backup invents a transcript (a loop, or a new story per try) and the script still marks it ok, while ElevenLabs answers 0 words; read the raw text before cleaning"
metadata:
  type: feedback
---

Found 2026-11-09 (Manish's 18-minute Android voice note, learnlikemagic session): ElevenLabs refused (a failed
payment), so `transcribe` fell to the Gemini backup, which returned 1,098 words of looped phrases ("PowerPoint
presentation" about 150 times), and the script marked it `ok`. Sent again in 2-minute parts, Gemini wrote a different
invented story for each part (a heart attack, a late tiffin, a UFO), and another new one on each retry of the same part.
Once the payment was fixed, ElevenLabs Scribe v2 returned 0 words (language "eng" at 0.1245, the same score on every
no-speech input), while a `say` control sentence came back word for word. The audio was muffled: 2-4 kHz sat about
38 dB under the voice body and 4-8 kHz was gone (a pocket or a covered mic). Boosting the highs did not help.

**Why:** asked to transcribe, Gemini never says "I can't hear it"; it writes fluent made-up text. The script only
checks that some text came back.

**How to apply:** read `raw/NN.txt` before cleaning. A loop, or topics that jump between unrelated stories, means the
backup did not hear the audio. Then try ElevenLabs (its billing fixed first). If it returns 0 words and a `say` control
passes, the recording is unusable: send nothing, and ask Manish to re-record with the phone out of his pocket.
