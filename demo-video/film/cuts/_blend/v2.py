"""v2: the Tag blend's version 2 (WP7 v2; DESIGN V27, V28, V29), called by make_cut.py --v2.

    python3 demo-video/film/cuts/_blend/make_cut.py tag --v2   -> demo-video/film/cuts/blended-tag-v2/

Manish's eight changes (FEEDBACK-BLENDED-2026-11-15.md, FEEDBACK-BLENDED-TAG-2026-11-15.md), read for
the tag:
 1. the hook's second colleague no longer names the AI Peer: line h2b, and a new lip-sync take of
    hook-2 (HOOK2) once it is made;
 2. idea C for the move from the phone to the laptop (ideas.py; his pick, V29);
 3. the tag's own "Set up my AI Peer" home page stays (the walkthrough clip);
 4. the tag is the logo: layer-tag-v2/src/mark.js draws it wherever the film draws the AI Peer mark;
 5. the clearer Zoom line, m4b;
 6. Slack closer on the message;
 7. the morning brief on the laptop: a new desk shot (Ram at the desk; the tag beside the laptop goes
    back into his phone, V19) and the tag's own brief screen (scene tagbrief, layer-tag-v2);
 8. Draft 3's globe back with p11 (scene earth, its own 108 to 120 s mapped onto v2's close by the
    slot's "warp"), then the end card on the tag.
The walkthrough plays the same clip spans a little faster to pay for the new parts. Film seconds
throughout; the v1 files and Draft 3's are read, never written.
"""
from __future__ import annotations

import copy
import json
from pathlib import Path

FILM = Path(__file__).resolve().parents[2]

# The walkthrough: (slot, film length, clip in-point, clip span); v1 played the same spans in 53.0 s.
WALK = [("walk-click", 2.6, 2.8, 2.7), ("walk-setup", 16.0, 5.5, 19.5), ("walk-learned", 6.4, 25.0, 7.0),
        ("walk-brief", 6.8, 32.0, 7.5), ("walk-ask", 9.0, 39.5, 10.5), ("walk-rules", 6.6, 50.0, 7.5)]
# The rest, in order after the walkthrough (film seconds each).
LEN = {"zoom": 22.8, "slack": 7.8, "wake": 2.2, "desk": 3.4, "laptop": 5.4, "earth": 4.7, "end": 3.9}   # the morning on a bar line (100.0)
ORDER = ["zoom", "slack", "wake", "desk", "laptop", "earth", "end"]

LINES = [
    ("h2b", "Ram's out of office... but the update I needed is already here.",
     "Rahm's out of office... but the update I needed is already here!"),
    ("m4b", "That's Ram's call. I'll put it in his morning brief, and he'll get back to you.",
     "That's Rahm's call. I'll put it in his morning brief, and he'll get back to you."),
]
META = {"h2b": {"part": "hook", "speaker": "colleague-2"}, "m4b": {"part": "night", "speaker": "peer", "caption": "screen"}}

# hook-2's new take with h2b: take r1's route, still, seed and prompt, the line at 0.9 s
# (shots/hook-2/requests/hook-2-raw-v2t1.json, $0.336; the mouth follows every word, closed from 3.75 s).
HOOK2 = {"clip": "assets/shots/hook-2-h2b-v2t1.mp4", "in_s": 0.4, "line_in_s": 0.9,
         "shows": "Late afternoon, another city, a small meeting room. A colleague reads his update, surprised and pleased: "
                  "Ram is out of office, and the update he needed is already here."}
# The desk shot: Ram at the desk in the sunrise, reading the laptop (shots/morning-desk: a nano-banana
# edit of morning-wake-b with his portrait, $0.09, made live by one H3 Max Turbo take, $0.224; camera
# locked). The camera moves a little toward the laptop at the end; the cut lands in the brief.
DESK = {"clip": "assets/shots/morning-desk-t1.mp4", "own_clip": True, "clip_seconds": 4.0, "in_s": 0.3,
        "view": [[0, [960, 540, 1.0]], [2.3, [960, 540, 1.0]], [3.4, [1180, 600, 1.3]]]}
# The tag, where it spent the night (beside the laptop, idea C): it looks at Ram and waves, hops onto
# his phone, folds back into a plain tag and goes into it (V19: back where it came from). Plate px.
DESK_MASCOT = {
    "s": 0.44, "start": [1650, 815, 0],
    "moves": [{"t0": 1.45, "t1": 1.8, "to": [1540, 893, 0], "h": 60, "kind": "hop"}],
    "dive": {"at": 2.1, "dur": 0.4, "to": [1530, 900], "flash": 0.25},
    "look": [[0, [-1, -0.4]], [1.3, [-1, -0.4]], [1.45, [-0.3, 0.5]]], "happy": [[0, 0.6], [0.4, 0.95]],
    "wave": [[0.3, 1.3]], "blinks": [0.9], "legs": [[1.85, 1], [2.0, 0]], "eyes": [[1.9, 1], [2.05, 0]],
    "badge": [[0, 0.3], [2.0, 1]], "glow": 0.25, "light": 0.15, "shadow": 0.5, "trail": [[1.45, 1.8]],
}
# In the laptop brief: his click on his answer (slot seconds).
CLICK = 4.2


def times(r3):
    t, walk = 22.0, []
    for sid, length, t_in, span in WALK:
        walk.append((sid, r3(t), length, t_in, r3(span / length)))
        t += length
    T = {"zoom": r3(t)}
    for a, b in zip(ORDER, ORDER[1:]):
        T[b] = r3(T[a] + LEN[a])
    T["film"] = r3(T["end"] + LEN["end"])
    return walk, T


def brief():
    """The morning brief's words: Draft 3's phone brief (screens.json), shown on the laptop."""
    b = json.loads((FILM / "screens.json").read_text())["slots"]["morning-product-brief"]
    return {k: copy.deepcopy(b[k]) for k in ("time", "greeting", "lead", "sections")}


def timeline(slots, narration, new_lines, labels, mascot, V, slot, keep, d3, r3):
    walk, T = times(r3)
    sec = {sid: start for sid, start, *_ in walk}
    parts = [("hook", "The hook", 0, 14.0), ("entrance", "The entrance", 14.0, 8.0),
             ("walkthrough", "The walkthrough", 22.0, r3(T["zoom"] - 22.0)), ("night", "The night", T["zoom"], r3(T["wake"] - T["zoom"])),
             ("morning", "The morning", T["wake"], r3(T["earth"] - T["wake"])), ("close", "The close", T["earth"], r3(T["film"] - T["earth"]))]

    out = [s for s in slots if s["part"] in ("hook", "entrance")]
    h2 = next(s for s in out if s["id"] == "hook-2")
    h2["line"] = "h2b"
    if HOOK2:
        h2.update(HOOK2)
    lab = copy.deepcopy(labels["walk-setup"])   # v1's labels, in v2's slot seconds, clear of p03
    for l, (a, n) in zip(lab, [(5.05, 3.1), (12.6, 1.9), (14.6, 1.4)]):
        l.update({"at": a, "length": n})
    for sid, start, length, t_in, rate in walk:
        s = slot(sid, "walkthrough", start, length, kind="ai", own_clip=True, clip=V["clip"], clip_seconds=V["clip_seconds"],
                 in_s=t_in, rate=rate, shows=f"The {V['title']} walkthrough: {sid[5:]}.")
        if sid == "walk-setup":
            s["labels"] = lab
        out.append(s)
    desk = slot("morning-desk", "morning", T["desk"], LEN["desk"], kind="ai", clip=None,
                shows="Ram at the desk in the sunrise, reading the laptop; the tag beside it waves, folds back into a plain tag and "
                      "slips into his phone on the desk (V19: back where it came from); the camera goes to the screen.")
    if DESK:
        desk.update(DESK)
    if DESK_MASCOT:
        desk["mascot"] = DESK_MASCOT
    out += [
        slot("proof-meeting", "night", T["zoom"], LEN["zoom"], kind="product", scene="product", clock="2 AM", clip=None,
             shows="Draft 3's Zoom meeting at 2 AM: the Peer joins as a labelled AI, gives Ram's update, and puts Brazil in Ram's morning brief for him to answer."),
        slot("proof-slack", "night", T["slack"], LEN["slack"], kind="product", scene="product", clock="4 AM", clip=None,
             shows="Draft 3's Slack at 4 AM, closer on the message: Daniel's question, answered with its sources, no promise made."),
        keep("morning-wake", part="morning", start=T["wake"], length=LEN["wake"], in_s=1.5, rate=1.2, mascot=mascot["morning-wake"],
             shows="Sunrise: Ram wakes and sits up; on the desk by the window the tag waves."),
        desk,
        slot("morning-laptop", "morning", T["laptop"], LEN["laptop"], kind="code", scene="tagbrief", clip=None, brief=brief(), click=CLICK,
             shows="The morning brief on the laptop, in the tag's own look: what it did overnight, what it learned, the one decision lit; he clicks his answer."),
        slot("close-earth", "close", T["earth"], LEN["earth"], kind="code", scene="earth", clip=None,
             warp={"about": "film seconds -> Draft 3's globe seconds (its scene runs 108.0 to 120.0; its end card came at 116.0)",
                   "points": [[T["earth"], 108.0], [T["end"], 116.0], [T["film"], 120.0]]},
             shows=d3["close-earth"]["shows"]),
        slot("close-endcard", "close", T["end"], LEN["end"], kind="code", scene="endcard", clip=None,
             shows="The tag as the AI Peer's mark, the line \"More room for your best work.\", over the lit horizon."),
    ]

    at = lambda sid, k: r3(sec[sid] + k)
    n = {"h1": narration["h1"], "h2b": r3(h2["start"] + h2["line_in_s"] - h2["in_s"]), "h3": narration["h3"], "p01": narration["p01"],
         "p02": narration["p02"],
         "n01": at("walk-click", 0.2), "n02": at("walk-setup", 0.3), "p03": at("walk-setup", 8.47), "n03": at("walk-learned", 0.5),
         "n04": at("walk-brief", 0.5), "n05": at("walk-ask", 0.4), "n06": at("walk-ask", 5.65), "p05": at("walk-rules", 0.7),
         "n07": at("walk-rules", 2.6),
         "m1": r3(T["zoom"] + 1.9), "m2": r3(T["zoom"] + 7.7), "m3": r3(T["zoom"] + 15.3), "m4b": r3(T["zoom"] + 18.45),
         "p06": r3(T["slack"] + 1.8), "p08": r3(T["wake"] + 0.3), "p10": r3(T["laptop"] + 1.6), "p11": r3(T["earth"] + 0.6),
         "p12": r3(T["end"] + 0.4)}
    new_lines.extend(LINES)
    return T["film"], parts, out, n, META


def screens(sc, r3):
    walk, T = times(r3)
    sc["about"] = "WP7 v2 (Tag): the Zoom line m4b, Slack closer on the message; the brief is on the laptop (scene tagbrief). " + sc["about"]
    z, sl = sc["slots"]["proof-meeting"], sc["slots"]["proof-slack"]
    z["speakers"] = {("m4b" if k == "m4" else k): v for k, v in z["speakers"].items()}
    L = LEN["zoom"]
    z["camera"] = [{"t": 0, "s": 1, "fx": 0.5, "fy": 0.5}, {"t": 1.8, "s": 1, "fx": 0.5, "fy": 0.5},
                   {"t": r3(14.0 * L / 21.6), "s": 1.045, "fx": 0.56, "fy": 0.56}, {"t": L, "s": 1.07, "fx": 0.6, "fy": 0.6}]
    sl["reaction"]["at"] = 6.0
    sl["labels"][0].update({"at": 4.8, "length": 1.3})
    sl["labels"][1].update({"at": 6.2, "length": 1.3})
    # closer on the message (V27 item 6): the thread's question and reply fill the frame (the camera scales
    # about the point fx, fy; measured on v2's first render, the reply spans x 0.32 to 0.80, y 0.22 to 0.54)
    # The window fills the frame (build.mjs "full"): no night margins, the thread about a third larger than
    # v1's; the reply's lines run nearly the full width, so the camera only leans in from the top right
    # (above 1.045 the film's clock, drawn over the sidebar, would reach the avatars).
    sl["full"] = True
    sl["camera"] = [{"t": 0, "s": 1, "fx": 1, "fy": 0}, {"t": 2.6, "s": 1, "fx": 1, "fy": 0},
                    {"t": 4.0, "s": 1.04, "fx": 1, "fy": 0}, {"t": LEN["slack"], "s": 1.045, "fx": 1, "fy": 0}]
    sc["slots"] = {"proof-meeting": z, "proof-slack": sl}


def mix_and_cut(m, cut, moved, r3):
    walk, T = times(r3)
    m["about"] = "WP7 v2 (Tag): " + m["about"]
    m["music"]["file"] = "audio/music/bed-blended-v2.wav"
    m["music"]["note"] = ("bed-blended-v2.wav: the same take re-cut on v2's bars (audio/music/bed-blended-v2.edl.json). "
                          + m["music"]["note"].split(". ", 1)[-1])
    m["sfx"] = [
        moved("phone", 12.125, "the phone lights up in the sleeper close-up (clip 3.5 s at rate 0.8 from 1.8)"),
        moved("rise", 12.45, "shimmer as the tag slides out of the phone and glides across the room", gain=-17),
        moved("push", 22.0, "rising whoosh; its end on the cut into the walkthrough at 22.0"),
        moved("change-1", T["zoom"], "soft swish on the cut to Zoom"),
        moved("change-2", T["slack"], "the same, brighter, on the cut to Slack"),
        moved("return", r3(T["desk"] + 2.0), "the reveal's shimmer, quieter, as the tag goes back into his phone on the desk"),
        moved("tap", r3(T["laptop"] + CLICK), "his click on his answer in the laptop brief"),
        moved("end", T["end"], "one warm chime with the end card"),
    ]
    cut["about"] = ("WP7 v2: the Tag blend's version 2. Read by build.mjs and render.mjs (--cut blended-tag-v2); "
                    "written by cuts/_blend/make_cut.py tag --v2 (cuts/_blend/v2.py).")
    cut["layers"] = ["../_blend/layer", "../_blend/layer-tag-v2"]
    cut["copies"] = cut["copies"] + [{"from": "../../src/scenes/earth.js", "to": "src/scenes/earth-d3.js"}]
