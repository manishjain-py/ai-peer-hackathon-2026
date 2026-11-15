"""The transition ideas (WP7 v2, V27): short variants of a blend's move from the phone to the laptop.

    python3 demo-video/film/cuts/_blend/make_cut.py tag --idea b   -> demo-video/film/cuts/idea-tag-b/

Each idea replaces only the hook-sleeper's mascot after it is out of the phone, the entrance slots
(14.0 to 22.0) and the time of line p02 ("I'm Ram's AI Peer"); everything else is the blend's. Render
the stretch with render.mjs --cut idea-tag-<x> --from 13.3 --to 22.4. Made for the tag (Manish,
18:31 UTC: "lets only work on tag for now"); the moves are the engine's (layer/src/mascot/engine.js).

    a  screen to screen: it rises out of the phone's screen and sinks back in; a streak of light runs
       to the laptop, which wakes; the tag walks in at the laptop screen's edge, inside the screen
    b  a ribbon of the phone's light carries it in one arc across the room; the laptop wakes as it lands
    c  it tucks its legs and glides like a paper card across the room, the camera following; it lands
       softly, taps the laptop awake and stays beside it while the camera pushes in (it never dives in)
    e  it looks toward the desk; the camera closes on its eyes; a cut on the eyes to the tag already
       beside the lit laptop
    f  it walks to the laptop and clips itself onto the lid like a name badge; the screen wakes
"""
from __future__ import annotations

import copy

ROOM = "cuts/_blend/plates/night-room-v1.mp4"   # the dark room: the phone on the bedside table, the laptop shut on the desk
DESK = "cuts/_blend/plates/night-desk-v1.mp4"   # the desk with the laptop open
LAPTOP_SHUT = [[1530, 618], [1662, 620], [1664, 646], [1526, 644]]   # the shut laptop in ROOM (px)
SURFACE = 968   # the phone screen's line in the hook's first frame (px); below it the tag is inside the phone


def make(which, idea, mascot, quad, slot):
    """-> (hook mascot, hook slot extras, entrance slots, p02 time)."""
    if which != "tag":
        raise SystemExit("the ideas are made for the tag (V27, 18:31 UTC)")
    Q = [[round(x * 1920), round(y * 1080)] for x, y in quad]   # the laptop screen in DESK (px)
    hook = copy.deepcopy(mascot["hook-sleeper"])
    hook["moves"], hook["trail"] = [], []
    hook["look"] = [[2.5, [0.3, -0.7]], [2.9, [0.7, -0.8]], [3.3, [1, -0.2]]]
    hook["happy"] = [[3.1, 0], [3.3, 0.8]]
    extra = {}

    def plate(id_, start, length, clip, m, **kw):
        if length > 4.0:
            kw["rate"] = round(4.0 / length, 3)
        return slot(id_, "entrance", start, length, kind="ai", own_clip=True, clip=clip, clip_seconds=4.0, mascot=m, **kw)

    def push(m, shows):
        return slot("entrance-pushin", "entrance", 20.0, 2.0, kind="code", scene="pushin", clip=None,
                    hand_quads={"about": "The lit screen's corners in night-desk-v1.mp4, clockwise from the top left, as fractions of the frame.",
                                "night-desk-v1.mp4": quad}, mascot=m, shows=shows)

    beside = {"s": 0.63, "look": [[0, [0.9, -0.45]]], "happy": [[0, 0.7]], "glow": 0.5, "light": 0.45, "shadow": 0.45}

    if idea == "a":
        hook.pop("pop", None)
        hook["start"] = [395, 1100, 0]
        hook["moves"] = [{"t0": 2.45, "t1": 2.9, "to": [395, 966, 0], "h": 0, "kind": "glide", "step": False},
                         {"t0": 3.45, "t1": 3.9, "to": [470, 1110, 0], "h": 0, "kind": "glide", "step": False}]
        hook["clip"] = [[-400, -400], [2400, -400], [2400, SURFACE], [-400, SURFACE]]
        hook["legs"] = [[3.08, 0], [3.3, 1], [3.36, 1], [3.46, 0]]
        hook["look"] = [[2.5, [0.3, -0.7]], [2.9, [0.7, -0.8]], [3.3, [1, 0.3]]]
        hook["blinks"] = [3.2]
        room = {"s": 0.3, "start": [150, 832, 0], "fade": [[0, 0]], "glow": 0, "light": 0, "shadow": 0,
                "moves": [{"t0": 0.15, "t1": 1.25, "to": [1590, 626, 0], "h": 300, "kind": "glide", "step": False}],
                "ribbon": {"t0": 0.15, "t1": 1.25, "lead": 0.3, "fade": 0.45},
                "wake": {"at": 1.2, "dur": 0.5, "quad": LAPTOP_SHUT, "dark": False}}
        desk = {"s": 0.45, "clip": Q, "start": [1150, 722, 0],
                "moves": [{"t0": 0.7, "t1": 1.35, "to": [1312, 694, 0], "h": 0, "kind": "glide"}],
                "wake": {"at": 0.2, "dur": 0.55, "quad": Q},
                "look": [[1.3, [1, 0]], [1.5, [0, 0.1]]], "happy": [[1.4, 0.5], [1.7, 0.95]], "wave": [[1.8, 3.0]],
                "blinks": [2.4], "badge": [[1.5, 1], [3.0, 0.4]], "glow": 0.45, "light": 0.35, "shadow": 0}
        ent = [plate("entrance-room", 14.0, 1.8, ROOM, room, push={"to_scale": 1.05, "fx": 0.62, "fy": 0.62},
                     shows="The dark room: a streak of the phone's light runs to the shut laptop, which glows."),
               plate("entrance-desk", 15.8, 4.2, DESK, desk, camera={"to_scale": 1.15},
                     shows="The laptop's screen wakes; the tag walks in at its edge, inside the screen, and says it is Ram's AI Peer."),
               push({"s": 0.45, "clip": Q, "start": [1312, 694, 0], "look": [[0, [0, 0.1]], [0.6, [0.3, -0.2]]],
                     "happy": [[0, 0.8]], "glow": 0.45, "light": 0.3, "shadow": 0},
                    "The camera goes into the screen, where the tag already is.")]
        return hook, extra, ent, 17.35

    if idea == "b":
        hook["moves"] = [{"t0": 3.5, "t1": 3.98, "to": [1400, 380, 0], "h": 100, "kind": "glide", "step": False}]
        hook["ribbon"] = {"t0": 3.5, "t1": 3.98, "lead": 0.35, "fade": 0.3}
        hook["look"] = [[2.5, [0.3, -0.7]], [2.9, [0.7, -0.8]], [3.35, [1, -0.6]]]
        hook["happy"] = [[3.1, 0], [3.3, 0.9]]
        room = {"s": 0.3, "start": [150, 830, 0],
                "moves": [{"t0": 0.1, "t1": 2.0, "to": [1500, 634, 0], "h": 400, "kind": "glide", "step": False}],
                "ribbon": {"t0": 0.1, "t1": 2.0, "lead": 0.35, "fade": 0.8}, "trail": [[0.1, 2.0]],
                "wake": {"at": 1.95, "dur": 0.6, "quad": LAPTOP_SHUT, "dark": False},
                "look": [[0, [1, -0.4]], [1.9, [1, 0.3]]], "happy": [[0, 0.9]], "glow": 0.75, "light": 0.75, "shadow": 0.35}
        desk = {"s": 0.63, "start": [1080, 792, 0], "wake": {"at": 0.12, "dur": 0.6, "quad": Q},
                "look": [[0, [0.9, -0.4]], [0.5, [0, 0.1]]], "happy": [[0.5, 0.95]], "wave": [[0.9, 2.0]],
                "blinks": [1.4], "badge": [[0.6, 1], [2.0, 0.4]], "glow": 0.5, "light": 0.5, "shadow": 0.45}
        ent = [plate("entrance-room", 14.0, 3.0, ROOM, room, push={"to_scale": 1.06, "fx": 0.78, "fy": 0.58},
                     shows="The dark room: a ribbon of the phone's light carries the tag in one arc to the desk; the shut laptop glows."),
               plate("entrance-desk", 17.0, 3.0, DESK, desk, camera={"to_scale": 1.15},
                     shows="The laptop's screen wakes beside the tag, which says it is Ram's AI Peer."),
               push(dict(beside, start=[1080, 792, 0]), "The camera goes into the screen; the tag stays on the desk.")]
        return hook, extra, ent, 17.6

    if idea == "c":
        room = {"s": 0.3, "start": [150, 840, 0],
                "moves": [{"t0": 0.45, "t1": 2.65, "to": [1488, 634, 0], "h": 170, "kind": "glide", "step": False}],
                "legs": [[0.3, 1], [0.5, 0], [2.35, 0], [2.6, 1]], "trail": [[0.45, 2.65]],
                "look": [[0, [1, -0.2]], [2.6, [1, 0.2]], [2.95, [1, 0.5]]], "happy": [[0, 0.7], [2.7, 0.9]],
                "blinks": [0.2, 2.9], "glow": 0.7, "light": 0.7, "shadow": 0.4}
        desk = {"s": 0.63, "start": [1060, 792, 0],
                "moves": [{"t0": 0.15, "t1": 0.42, "to": [1118, 790, 0], "h": 28, "kind": "hop"}],
                "wake": {"at": 0.42, "dur": 0.5, "quad": Q},
                "look": [[0, [0.9, -0.4]], [0.75, [0.9, -0.4]], [0.95, [0, 0.1]]], "happy": [[0.5, 0.6], [1.0, 0.95]],
                "wave": [[1.1, 2.2]], "blinks": [1.6], "badge": [[0.9, 1], [2.2, 0.4]], "glow": 0.5, "light": 0.5, "shadow": 0.45}
        ent = [plate("entrance-room", 14.0, 3.2, ROOM, room,
                     view=[[0, [330, 770, 2.0]], [0.4, [330, 770, 2.0]], [2.7, [1440, 600, 1.6]], [3.2, [1480, 610, 1.7]]],
                     shows="The dark room, the camera following: the tag tucks its legs and glides like a paper card to the desk."),
               plate("entrance-desk", 17.2, 2.8, DESK, desk, camera={"to_scale": 1.15},
                     shows="It taps the laptop awake and says it is Ram's AI Peer."),
               push(dict(beside, start=[1118, 790, 0]), "The camera goes into the screen; the tag stays beside the laptop.")]
        return hook, extra, ent, 18.2

    if idea == "e":
        hook["look"] = [[2.5, [0.3, -0.7]], [2.9, [0.7, -0.8]], [3.3, [1, -0.15]]]
        hook["happy"] = [[3.1, 0], [3.3, 0.6]]
        # the camera closes on its eyes: they sit 133 px x s above its feet (legs out); feet (395, 966)
        # through the phone's anchor at the end of the shot are (371, 995), so its eyes are near (371, 914)
        extra["view"] = [[0, [960, 540, 1.0]], [3.2, [960, 540, 1.0]], [3.98, [371, 914, 3.0]]]
        # the same eyes, the same size and place (the hook's view is held at the frame's bottom: y 582)
        desk = {"s": 0.63, "start": [1080, 792, 0],
                "look": [[0, [1, -0.15]], [1.1, [1, -0.15]], [1.3, [0, 0.1]], [3.3, [0, 0.1]], [3.5, [0.9, -0.4]]],
                "happy": [[1.2, 0.5], [1.5, 0.95]], "wave": [[1.6, 2.8]], "blinks": [0.5, 2.2],
                "badge": [[1.3, 1], [3.0, 0.4]], "glow": 0.5, "light": 0.5, "shadow": 0.45}
        ent = [plate("entrance-desk", 14.0, 6.0, DESK, desk,
                     view=[[0, [1080, 694.6, 2.92]], [1.0, [960, 540, 1.0]], [6.0, [960, 540, 1.0]]],
                     shows="A cut on its eyes: the tag is already beside the lit laptop; the camera pulls back."),
               push(dict(beside, start=[1080, 792, 0]), "The camera goes into the screen; the tag stays beside the laptop.")]
        return hook, extra, ent, 15.3

    if idea == "f":
        desk = {"s": 0.5, "start": [860, 794, 0],
                "moves": [{"t0": 0.3, "t1": 1.5, "to": [1150, 790, 0], "h": 0, "kind": "glide"},
                          {"t0": 1.65, "t1": 2.1, "to": [1384, 528, 0], "h": 90, "kind": "hop"}],
                "legs": [[1.62, 1], [1.75, 0.7], [2.05, 0.7], [2.2, 0]],
                "wake": {"at": 2.2, "dur": 0.55, "quad": Q},
                "look": [[0, [1, -0.1]], [1.5, [1, -0.5]], [2.3, [0, 0.2]], [2.7, [0, 0.1]]],
                "happy": [[2.4, 0.4], [2.8, 0.95]], "blinks": [3.3], "badge": [[2.2, 1], [3.5, 0.5]],
                "glow": 0.45, "light": 0.45, "shadow": 0.25}
        ent = [plate("entrance-desk", 14.0, 6.0, DESK, desk, camera={"to_scale": 1.15},
                     shows="The tag walks to the laptop and clips itself onto the lid like a name badge; the screen wakes."),
               push({"s": 0.5, "start": [1384, 528, 0], "legs": [[0, 0]], "look": [[0, [0, 0.2]], [0.8, [0.2, 0.5]]],
                     "happy": [[0, 0.8]], "glow": 0.45, "light": 0.4, "shadow": 0},
                    "The camera goes into the screen under the badge.")]
        return hook, extra, ent, 16.8

    raise SystemExit(f"no idea {idea!r}: a, b, c, e or f")
