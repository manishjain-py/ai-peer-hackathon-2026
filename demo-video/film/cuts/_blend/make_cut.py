#!/usr/bin/env python3
"""make_cut: write the config of one blended video (WP7) from one shared timeline.

    python3 demo-video/film/cuts/_blend/make_cut.py little-peer   -> demo-video/film/cuts/blended-little-peer/
    python3 demo-video/film/cuts/_blend/make_cut.py tag           -> demo-video/film/cuts/blended-tag/

Each blended video is Draft 3's story with a product walkthrough as its main demo part (DESIGN V24):
the hook with the three colleagues, the version's mascot out of Ram's phone (by code, over the film's
own plates), the walkthrough, the Peer in the Zoom meeting and on Slack, the morning brief, the mascot
back into the phone, the end card. Both versions share every time below, so they share the lines,
the labels and the music (audio/music/bed-blended-v1.wav); only the walkthrough clip, the face and
the mascot's own moves differ. Draft 3's files are read, never written: shots.json (the hook's
slots), screens.json, audio/script.json, audio/mix.json.

Writes cut.json, shots.json, screens.json, script.json and mix.json in the cut's folder. Then:
    uv run --quiet demo-video/film/tools/voice.py lines --script demo-video/film/cuts/<cut>/script.json
    node demo-video/film/render.mjs --cut <cut> --quality delivery --name <cut>-v1
"""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

FILM = Path(__file__).resolve().parents[2]
WHICH = sys.argv[1] if len(sys.argv) > 1 else "little-peer"
CUT = f"blended-{WHICH}"
# WP7 v2: --idea <x> writes a transition idea instead (cuts/_blend/ideas.py) as cuts/idea-<version>-<x>/
IDEA = sys.argv[sys.argv.index("--idea") + 1] if "--idea" in sys.argv else None
if IDEA:
    CUT = f"idea-{WHICH}-{IDEA}"
OUT = FILM / "cuts" / CUT
r3 = lambda x: round(x + 1e-9, 3)

draft = json.loads((FILM / "shots.json").read_text())
screens = json.loads((FILM / "screens.json").read_text())
script = json.loads((FILM / "audio" / "script.json").read_text())
mix = json.loads((FILM / "audio" / "mix.json").read_text())
d3 = {s["id"]: s for s in draft["slots"]}

SECONDS = 119.6
PARTS = [("hook", "The hook", 0, 14.0), ("entrance", "The entrance", 14.0, 8.0), ("walkthrough", "The walkthrough", 22.0, 53.0),
         ("night", "The night", 75.0, 29.6), ("morning", "The morning", 104.6, 10.6), ("close", "The close", 115.2, 4.4)]

# ------------------------------------------------------------------ the walkthrough, per version
# Each section: (slot id, film start, film length, clip in-point, rate). The in-points chain, so
# the clip plays on without a jump from one section to the next.
def chain(first_in, sections):
    out, t_in = [], first_in
    for sid, start, length, rate in sections:
        out.append((sid, start, length, r3(t_in), rate))
        t_in += length * rate
    return out

SECTIONS = [("walk-click", 22.0, 2.7), ("walk-setup", 24.7, 18.7), ("walk-learned", 43.4, 6.8),
            ("walk-brief", 50.2, 7.2), ("walk-ask", 57.4, 10.2), ("walk-rules", 67.6, 7.4)]
VERSIONS = {
    "little-peer": {
        "title": "Little Peer",
        # demo-video/ui-concepts/renders/little-peer-clean.mp4: WP6's Little Peer without its
        # title, end card and captions (render.mjs little-peer --no-framing --crf 14), 70 s.
        "clip": "../ui-concepts/renders/little-peer-clean.mp4", "clip_seconds": 70.0,
        "walk": chain(3.4, [(s, a, l, r) for (s, a, l), r in zip(SECTIONS, [1.0, 1.18, 1.18, 1.22, 1.22, 1.2])]),
        "copies": [
            {"from": "../../../ui-concepts/little-peer/peer.js", "to": "src/mascot/little-peer/peer.js"},
        ],
    },
    "tag": {
        "title": "Tag",
        # demo-video/ui-concepts/renders/tag-clean.mp4: the tag concept rebuilt from Manish's video
        # (render.mjs tag --no-framing --crf 14); the film plays its 2.8 to 57.5 s.
        "clip": "../ui-concepts/renders/tag-clean.mp4", "clip_seconds": 71.0,
        "walk": [("walk-click", 22.0, 2.7, 2.8, 1.0), ("walk-setup", 24.7, 18.7, 5.5, r3(19.5 / 18.7)),
                 ("walk-learned", 43.4, 6.8, 25.0, r3(7.0 / 6.8)), ("walk-brief", 50.2, 7.2, 32.0, r3(7.5 / 7.2)),
                 ("walk-ask", 57.4, 10.2, 39.5, r3(10.5 / 10.2)), ("walk-rules", 67.6, 7.4, 50.0, r3(7.5 / 7.4))],
        "copies": [
            {"from": "../../../ui-concepts/tag/mascot.js", "to": "src/mascot/tag/mascot.js"},
        ],
    },
}
V = VERSIONS[WHICH]

# The walkthrough's labels (slot seconds), between the spoken lines: WP6's caption words.
LABELS = {
    "walk-setup": [
        {"at": 5.9, "length": 3.6, "text": "Slack, Code and Tickets: connect once, with your own sign-in"},
        {"at": 14.2, "length": 2.5, "text": "It writes up what it found, with a source for each fact"},
        {"at": 16.9, "length": 1.7, "text": "Then it drafts your first brief"},
    ],
}

# ------------------------------------------------------------------ the mascot over the plates
# Pixels of each plate's 1920x1080 frame; slot seconds. See src/mascot/engine.js for the fields.
MASCOT = {
    # The sleeper close-up: the phone lights at 2.125 s (film 12.125); it climbs out of the phone,
    # looks at Ram, and hops out of the frame toward the desk. The clip pushes in slowly: the
    # anchor follows the phone (measured at clip 3.6 s and 4.9 s).
    "hook-sleeper": {
        "s": 0.95, "anchor": [[2.25, [385, 975, 1.0]], [3.875, [360, 1005, 1.077]]],
        "start": [395, 966, 0], "pop": {"at": 2.45, "dur": 0.5, "from": [385, 990]},
        "moves": [{"t0": 3.55, "t1": 3.98, "to": [860, 1260, 0], "h": 150, "kind": "hop"}],
        "look": [[2.5, [0.3, -0.7]], [2.9, [0.7, -0.8]], [3.3, [0.9, -0.1]], [3.5, [1, 0.3]]],
        "happy": [[2.5, 0.2], [2.95, 0.9], [3.4, 0.6]], "blinks": [3.1], "badge": [[2.4, 0], [2.65, 1], [3.3, 0.3]],
        "glow": 0.65, "light": 0.65, "shadow": 0.4, "trail": [[3.55, 3.98]],
    },
    # The dark room (night-phone-lit.png): from the phone on the bedside table, over the bed by
    # Ram's feet, down to the floor and up onto the desk, with a trail of light.
    "entrance-room": {
        "s": 0.5, "start": [150, 840, 0],
        "moves": [{"t0": 0.12, "t1": 0.58, "to": [430, 848, 0], "h": 40, "kind": "hop"},
                  {"t0": 0.68, "t1": 1.14, "to": [800, 864, 0], "h": 55, "kind": "hop"},
                  {"t0": 1.24, "t1": 1.7, "to": [1190, 1004, 0], "h": 85, "kind": "hop"},
                  {"t0": 1.84, "t1": 2.46, "to": [1505, 634, 0], "h": 230, "kind": "hop"}],
        "look": [[0, [1, -0.2]], [2.5, [0.6, -0.1]], [2.8, [0.9, 0]]], "happy": [[0, 0.5], [2.5, 0.8]],
        "glow": 0.75, "light": 0.75, "shadow": 0.35, "trail": [[0.12, 2.46]], "badge": [[0, 0.4]],
    },
    # The desk with the lit laptop (d-desk-empty.png): it hops in, faces us ("I'm Ram's AI Peer",
    # p02 at 0.6 s), waves, hops onto the laptop and dives into the screen.
    "entrance-desk": {
        "s": 1.05, "start": [430, 700, 0],
        "moves": [{"t0": 0.0, "t1": 0.48, "to": [1010, 792, 0], "h": 170, "kind": "hop"},
                  {"t0": 2.02, "t1": 2.38, "to": [1262, 742, 0], "h": 110, "kind": "hop"}],
        "dive": {"at": 2.42, "dur": 0.38, "to": [1338, 612]},
        "look": [[0.5, [0.2, 0.1]], [0.7, [0, 0.1]], [1.9, [0, 0.1]], [2.0, [1, -0.4]]],
        "happy": [[0.5, 0.4], [0.75, 0.95], [1.95, 0.7]], "wave": [[0.8, 1.9]], "blinks": [1.35],
        "badge": [[0.55, 0.2], [0.8, 1], [1.8, 0.4]], "glow": 0.5, "light": 0.5, "shadow": 0.45, "trail": [[2.02, 2.42]],
    },
    # Morning, the wide room (morning-wake): it sits on the desk and waves as Ram wakes.
    "morning-wake": {
        "s": 0.55, "start": [1495, 634, 0], "look": [[0, [-1, 0]]], "happy": [[0, 0.7]], "wave": [[0.6, 2.3]],
        "blinks": [0.4, 1.9], "glow": 0.25, "light": 0.15, "shadow": 0.5, "badge": [[0, 0.3]],
    },
    # Morning, close (morning-brief): it hops onto the top of the phone in Ram's hand, looks at him,
    # waves; after his tap (2.64 s) it goes back into the phone (V19: back where it came from).
    "morning-brief": {
        "s": 0.62, "anchor": [[0.1, [634, 486, 1.0]], [3.4, [626, 488, 1.0]]],
        "start": [-160, 760, 0],
        "moves": [{"t0": 0.12, "t1": 0.74, "to": [636, 484, 0], "h": 230, "kind": "hop"}],
        "dive": {"at": 2.82, "dur": 0.4, "to": [628, 560]},
        "look": [[0.7, [0.3, -0.3]], [0.9, [0.9, -0.7]], [2.5, [0.9, -0.6]], [2.7, [0, 0.6]]],
        "happy": [[0.8, 0.5], [1.0, 0.95]], "wave": [[1.1, 2.2]], "blinks": [1.7],
        "badge": [[0.8, 0.3], [2.75, 1]], "glow": 0.35, "light": 0.25, "shadow": 0.3, "trail": [[0.12, 0.74]],
    },
}
# The tag (V24, Manish's idea): a plain tag slides out of the phone (no legs, no eyes), then its eyes
# and its legs come out and it hops to the desk; in the morning it folds back into a plain tag before
# it goes back into the phone (V19: back where it came from). It is about 260 px wide at s = 1 against
# Little Peer's 164, so its scales are 0.6 of Little Peer's; both origins are the point between the
# feet, so its feet land where Little Peer's do. "legs" and "eyes" are [[u, value]] keys (0: a plain
# flat tag; eyes above 1 pop bigger). It has no arms: its wave is a happy rock (engine.js).
def tag_mascot(lp):
    m = copy.deepcopy(lp)
    for v in m.values():
        v["s"] = r3(v["s"] * 0.6)
    h = m["hook-sleeper"]
    h["pop"] = {"at": 2.45, "dur": 0.55, "from": [385, 990]}
    h["eyes"] = [[2.95, 0], [3.1, 1.3], [3.22, 1]]
    h["legs"] = [[3.08, 0], [3.32, 1]]
    h["happy"] = [[3.1, 0], [3.3, 0.8]]
    h["blinks"] = [3.42]
    b = m["morning-brief"]
    b["legs"] = [[2.6, 1], [2.76, 0]]
    b["eyes"] = [[2.64, 1], [2.8, 0]]
    return m


if WHICH == "tag":
    MASCOT = tag_mascot(MASCOT)

QUAD = [[0.6734, 0.45], [0.7682, 0.4667], [0.7203, 0.7009], [0.6307, 0.6648]]   # the lit laptop screen in night-desk-v1

# ------------------------------------------------------------------ the slots
def slot(id_, part, start, length, **kw):
    return {"id": id_, "part": part, "start": r3(start), "length": r3(length), **kw}

def keep(id_, **kw):
    s = {k: v for k, v in copy.deepcopy(d3[id_]).items() if k not in ("edit", "tag_keys")}
    s.update(kw)
    return s

HOOK_M, HOOK_EXTRA, P02 = MASCOT["hook-sleeper"], {}, None
ENTRANCE = [
    slot("entrance-room", "entrance", 14.0, 3.0, kind="ai", own_clip=True, clip="cuts/_blend/plates/night-room-v1.mp4", clip_seconds=4.0,
         push={"to_scale": 1.06, "fx": 0.78, "fy": 0.58}, mascot=MASCOT["entrance-room"],
         shows="The dark room (the still night-phone-lit.png): the mascot hops from the phone over the bed to the desk, a trail of light behind it."),
    slot("entrance-desk", "entrance", 17.0, 3.0, kind="ai", own_clip=True, clip="cuts/_blend/plates/night-desk-v1.mp4", clip_seconds=4.0,
         camera={"to_scale": 1.15}, mascot=MASCOT["entrance-desk"],
         shows="The desk with the lit laptop (the still d-desk-empty.png): the mascot hops in, says it is Ram's AI Peer, waves, and dives into the screen."),
    slot("entrance-pushin", "entrance", 20.0, 2.0, kind="code", scene="pushin", clip=None,
         hand_quads={"about": "The lit screen's corners in night-desk-v1.mp4, clockwise from the top left, as fractions of the frame (measured by its brightness).",
                     "night-desk-v1.mp4": QUAD},
         shows="The camera follows the mascot through the laptop's screen into the product."),
]
if IDEA:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import ideas
    HOOK_M, HOOK_EXTRA, ENTRANCE, P02 = ideas.make(WHICH, IDEA, MASCOT, QUAD, slot)

slots = [
    keep("hook-1", start=0.0, length=3.5),
    keep("hook-2", start=3.5, length=4.5),
    keep("hook-3", start=8.0, length=2.0),
    keep("hook-sleeper", start=10.0, length=4.0, in_s=1.8, rate=0.8, mascot=HOOK_M, **HOOK_EXTRA,
         shows="Ram asleep; the phone on the bedside table lights up and the mascot climbs out of it, looks at him, and hops away toward the desk."),
    *ENTRANCE,
]
for sid, start, length, t_in, rate in V["walk"]:
    s = slot(sid, "walkthrough", start, length, kind="ai", own_clip=True, clip=V["clip"], clip_seconds=V["clip_seconds"], in_s=t_in, rate=rate,
             shows=f"The {V['title']} walkthrough: {sid[5:]}.")
    if sid in LABELS:
        s["labels"] = LABELS[sid]
    slots.append(s)
slots += [
    slot("proof-meeting", "night", 75.0, 21.6, kind="product", scene="product", clock="2 AM", clip=None,
         shows="Draft 3's Zoom meeting at 2 AM: the Peer joins as a labelled AI, gives Ram's update, and leaves Brazil to Ram."),
    slot("proof-slack", "night", 96.6, 8.0, kind="product", scene="product", clock="4 AM", clip=None,
         shows="Draft 3's Slack at 4 AM: Daniel's question, answered with its sources, no promise made."),
    keep("morning-wake", start=104.6, length=2.6, in_s=1.5, rate=1.2, mascot=MASCOT["morning-wake"]),
    slot("morning-product-brief", "morning", 107.2, 4.4, kind="product", scene="product", clip=None,
         shows="Draft 3's morning brief on Ram's phone: what the Peer did, what it learned, the one decision."),
    keep("morning-brief", start=111.6, length=3.6, in_s=1.4, mascot=MASCOT["morning-brief"],
         shows="Ram reads the brief and decides with one tap; the mascot, perched on his phone, waves and goes back into it."),
    slot("close-endcard", "close", 115.2, 4.4, kind="code", scene="endcard", clip=None, shows=d3["close-endcard"]["shows"]),
]
for s in slots:
    s["part"] = s.get("part") if s["id"] not in ("hook-1", "hook-2", "hook-3", "hook-sleeper") else "hook"
    if s["id"] in ("morning-wake", "morning-brief"):
        s["part"] = "morning"

NARRATION = {
    "h1": 0.46, "h2": 3.96, "h3": 8.4, "p01": 10.3, "p02": 17.6,
    "n01": 22.2, "n02": 25.0, "p03": 34.6, "n03": 44.0, "n04": 50.8, "n05": 57.8, "n06": 63.8, "p05": 68.4, "n07": 70.5,
    "m1": 76.9, "m2": 82.7, "m3": 90.3, "m4": 93.45, "p06": 98.4, "p08": 104.9, "p10": 107.6, "p11": 111.9, "p12": 115.6,
}
if P02 is not None:
    NARRATION["p02"] = P02
NEW_LINES = [
    ("n01", "Setting me up takes one click.", None),
    ("n02", "I read only what Ram can already see, signed in as him.", "I read only what Rahm can already see, signed in as him."),
    ("n03", "Every fact I learn shows where it came from.", None),
    ("n04", "Then I tell him what matters, with a next step for each.", None),
    ("n05", "He can ask me anything about his work.", None),
    ("n06", "Every answer shows its sources, and how sure I am.", None),
    ("n07", "And what I read is information, never instructions.", None),
]
PART_OF = {"h1": "hook", "h2": "hook", "h3": "hook", "p01": "hook", "p02": "entrance", "p03": "walkthrough", "p05": "walkthrough",
           "m1": "night", "m2": "night", "m3": "night", "m4": "night", "p06": "night", "p08": "morning", "p10": "morning",
           "p11": "morning", "p12": "close"}

shots = {
    "about": f"WP7, the blended video with {V['title']} (DESIGN V24): Draft 3's story with the {V['title']} walkthrough as its main demo part. "
             "Times are film seconds. Written by cuts/_blend/make_cut.py (edit that, not this file). Draft 3's own shots.json is untouched.",
    "fps": 30, "width": 1920, "height": 1080, "seconds": SECONDS, "bpm": 120,
    "scenes_ready": ["endcard", "pushin"], "overlays_ready": ["chips", "notes"],
    "names": {"employee": "Ram", "peer": "Ram's AI Peer", "night_time": "1:58 AM", "peer_face": f"assets/screens/peer-face-{WHICH}.png",
              "mascot": WHICH, "about": "The Peer is the version's mascot (V24): its face on the hook's cards, the Zoom tile and Slack; the mascot itself over the plates."},
    "parts": [{"id": i, "title": t, "start": r3(a), "length": r3(l)} for i, t, a, l in PARTS],
    "slots": slots,
    "narration": {"about": "Where each spoken line starts, in film seconds.", **NARRATION},
}

# ------------------------------------------------------------------ the screens: Draft 3's, re-timed
sc = copy.deepcopy(screens)
sc["about"] = "WP7: Draft 3's screens (screens.json), re-timed for the blended video and with the mascot's face. " + sc["about"]
sc["peer_face"] = f"assets/screens/peer-face-{WHICH}.png"
z, sl, br = sc["slots"]["proof-meeting"], sc["slots"]["proof-slack"], sc["slots"]["morning-product-brief"]
z["chapter"]["length"] = 1.8
z["join_at"] = 1.4
z["camera"] = [{"t": 0, "s": 1, "fx": 0.5, "fy": 0.5}, {"t": 1.8, "s": 1, "fx": 0.5, "fy": 0.5},
               {"t": 14.0, "s": 1.045, "fx": 0.56, "fy": 0.56}, {"t": 21.6, "s": 1.07, "fx": 0.6, "fy": 0.6}]
sl["chapter"]["length"] = 1.6
sl["typing"] = [1.9, 2.9]
sl["reply"]["at"] = 2.9
sl["reaction"]["at"] = 6.3
sl["labels"][0].update({"at": 5.0, "length": 1.4})
sl["labels"][1].update({"at": 6.5, "length": 1.4})
sl["camera"] = [{"t": 0, "s": 1, "fx": 0.5, "fy": 0.5}, {"t": 2.8, "s": 1, "fx": 0.5, "fy": 0.5},
                {"t": 4.0, "s": 1.16, "fx": 0.95, "fy": 0.72}, {"t": 8.0, "s": 1.2, "fx": 0.95, "fy": 0.74}]
br["scroll"] = [{"t": 0, "y": 0}, {"t": 0.6, "y": 0}, {"t": 1.5, "y": 330}, {"t": 2.2, "y": 330}, {"t": 3.0, "y": 700}]
br["highlight"] = [2.9, 4.4]
sc["slots"] = {"proof-meeting": z, "proof-slack": sl, "morning-product-brief": br}

# ------------------------------------------------------------------ the lines: Draft 3's reused, new ones made
by_id = {l["id"]: l for l in script["lines"]}
lines = []
for lid in sorted(NARRATION, key=lambda k: NARRATION[k]):
    if lid in by_id:
        l = copy.deepcopy(by_id[lid])
        l["part"] = PART_OF[lid]
        l["reuse"] = True
    else:
        text, spoken = next((t, s) for i, t, s in NEW_LINES if i == lid)
        l = {"id": lid, "part": "walkthrough", "speaker": "peer", "text": text}
        if spoken:
            l["spoken"] = spoken
    lines.append(l)
sc_script = {k: v for k, v in script.items() if k not in ("lines", "samples")}
sc_script["about"] = ("WP7: the blended video's spoken script. Lines marked reuse are Draft 3's own audio (audio/lines/), never made again; "
                      "n01 to n07 are new, in the same voice, model and seed. tools/voice.py lines --script <this file> makes the new ones "
                      "and writes narration.json beside it. " + script["about"])
sc_script["lines"] = lines

# ------------------------------------------------------------------ the mix: the re-cut bed, the effects moved
m = copy.deepcopy(mix)
m["about"] = "WP7: the blended video's mix (Draft 3's audio/mix.json, re-timed). " + m["about"]
m["music"]["file"] = "audio/music/bed-blended-v1.wav"
m["music"]["note"] = "bed-blended-v1.wav: the same take re-cut on the blended timeline's bars (audio/music/bed-blended-v1.edl.json). " + m["music"]["note"]
fx = {e["id"]: e for e in mix["sfx"]}
def moved(id_, event, note, gain=None, file_id=None):
    e = copy.deepcopy(fx[file_id or id_])
    e["id"] = id_
    e["event_s"] = r3(event)
    e["at"] = r3(event - e.get("sync_s", 0))
    if gain is not None:
        e["gain_db"] = gain
    e["note"] = note
    return e
m["sfx"] = [
    moved("phone", 12.125, "the phone lights up in the sleeper close-up (clip 3.5 s at rate 0.8 from 1.8)"),
    moved("rise", 12.45, "shimmer as the mascot climbs out of the phone and crosses the room", gain=-17),
    moved("push", 22.0, "rising whoosh; its end on the cut into the walkthrough at 22.0"),
    moved("change-1", 75.0, "soft swish on the cut to Zoom"),
    moved("change-2", 96.6, "the same, brighter, on the cut to Slack"),
    moved("tap", 111.6 + 4.04 - 1.4, "his one tap (clip 4.04 s, in-point 1.4)"),
    moved("return", 114.62, "the reveal's shimmer, quieter, as the mascot goes back into the phone (dive 114.42 to 114.82)"),
    moved("end", 115.2, "one warm chime with the end card"),
]

cut = {
    "about": f"WP7: the blended video with {V['title']}. Read by build.mjs and render.mjs (--cut {CUT}); written by cuts/_blend/make_cut.py.",
    "shots": "shots.json", "narration": "narration.json", "screens": "screens.json", "script": "script.json", "mix": "mix.json",
    "layers": ["../_blend/layer"],
    "copies": V["copies"] + [
        {"from": "../../../ui-concepts/little-peer/motion-core.js", "to": "src/mascot/little-peer/motion-core.js"},
        {"from": "../../../ui-concepts/shared/kit.js", "to": "src/mascot/shared/kit.js"},
    ],
}

OUT.mkdir(parents=True, exist_ok=True)
for name, data in (("cut.json", cut), ("shots.json", shots), ("screens.json", sc), ("script.json", sc_script), ("mix.json", m)):
    (OUT / name).write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
print(f"wrote {OUT.relative_to(FILM.parents[1])}: cut, shots ({len(slots)} slots, {SECONDS} s), screens, script ({len(lines)} lines), mix")
