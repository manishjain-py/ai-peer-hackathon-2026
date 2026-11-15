#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10"]
# ///
"""make_boards: one board per Peer concept for Manish (Draft 3, Phase A, DESIGN V19).

    uv run --quiet demo-video/look/peer-entrance/make_boards.py            (all boards)
    uv run --quiet demo-video/look/peer-entrance/make_boards.py a c        (some)

Run from the repo root. Reads boards.json beside this file. Each board: a title and one line,
three stills (it appears, it works at the desk, it goes back) with the "Ram's AI Peer" tag drawn
on by code where the Peer is, and a row that shows the Peer's one face where it appears in the
film: the hook's message card, the Zoom tile and the Slack reply. Writes boards/<id>.jpg.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
FONT = ROOT / "demo-video/tools/fonts/Manrope[wght].ttf"

INK = (21, 43, 49)
INK_DEEP = (12, 26, 30)
PAPER = (246, 244, 238)
MINT = (183, 244, 207)
MUTED = (150, 170, 172)
WHITE = (255, 255, 255)


def font(size: int, weight: int = 700) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(str(FONT), size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def mark(size: int) -> Image.Image:
    """The AI Peer mark (src/mark.js geometry), drawn at 4x and scaled down."""
    s = size * 4
    k = s / 100
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([2 * k, 2 * k, 98 * k, 98 * k], radius=31 * k, fill=MINT)
    w = round(9 * k)
    for x0 in (28, 46):  # two arches: up from y58 to y42, a half circle of radius 13, down again
        cx = (x0 + 13) * k
        d.line([(x0 * k, 58 * k), (x0 * k, 42 * k)], fill=INK, width=w)
        d.line([((x0 + 26) * k, 58 * k), ((x0 + 26) * k, 42 * k)], fill=INK, width=w)
        d.arc([cx - 13 * k - w / 2, 42 * k - 13 * k - w / 2, cx + 13 * k + w / 2, 42 * k + 13 * k + w / 2],
              180, 360, fill=INK, width=w)
        for y in (58, 42):
            for x in (x0, x0 + 26):
                d.ellipse([x * k - w / 2, y * k - w / 2, x * k + w / 2, y * k + w / 2], fill=INK)
    for cx in (35, 65):
        d.ellipse([(cx - 3) * k, (72 - 3) * k, (cx + 3) * k, (72 + 3) * k], fill=INK)
    return im.resize((size, size), Image.LANCZOS)


def circle(im: Image.Image, size: int, ring: int = 0) -> Image.Image:
    im = im.convert("RGB")
    w, h = im.size
    side = min(w, h)
    im = im.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2)).resize((size, size), Image.LANCZOS)
    m = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(m).ellipse([0, 0, size * 4 - 1, size * 4 - 1], fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(im, (0, 0), m.resize((size, size), Image.LANCZOS))
    if ring:
        r = Image.new("RGBA", (size * 4, size * 4), (0, 0, 0, 0))
        ImageDraw.Draw(r).ellipse([0, 0, size * 4 - 1, size * 4 - 1], outline=MINT, width=ring * 4)
        out.alpha_composite(r.resize((size, size), Image.LANCZOS))
    return out


def face_image(spec: dict, size: int) -> Image.Image:
    """The Peer's face, round: a crop of a picture ([x0, y0, x1, y1] as fractions), or the mark."""
    if spec.get("mark"):
        bg = Image.new("RGBA", (size, size), INK_DEEP + (255,))
        m = mark(int(size * 0.74))
        bg.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
        return circle(bg, size, ring=max(2, size // 40))
    im = Image.open(ROOT / spec["image"]).convert("RGB")
    if "crop" in spec:
        x0, y0, x1, y1 = spec["crop"]
        W, H = im.size
        im = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    out = circle(im, size, ring=max(2, size // 40))
    if spec.get("badge"):  # the mark as a small badge at the lower right: "this face is the AI Peer"
        b = mark(int(size * 0.34))
        out.alpha_composite(b, (size - b.width, size - b.height))
    return out


def tag(height: int, text: str = "Ram's AI Peer") -> Image.Image:
    """The pill on the Peer: the mark and the name, ink on mint glass (src/overlays/tag.js)."""
    f = font(int(height * 0.5), 800)
    tw = f.getbbox(text)[2]
    pad = int(height * 0.32)
    w = pad + height - 2 * int(height * 0.14) + int(height * 0.22) + tw + pad
    s = 4
    im = Image.new("RGBA", (w * s, height * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w * s - 1, height * s - 1], radius=height * s // 2, fill=(21, 43, 49, 225), outline=MINT, width=max(2, height // 18) * s)
    im = im.resize((w, height), Image.LANCZOS)
    mk = mark(height - 2 * int(height * 0.14))
    im.alpha_composite(mk, (pad - int(height * 0.12), int(height * 0.14)))
    ImageDraw.Draw(im).text((pad - int(height * 0.12) + mk.width + int(height * 0.22), height // 2), text, font=f, fill=MINT, anchor="lm")
    glow = Image.new("RGBA", (w + 60, height + 60), (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle([30, 30, w + 29, height + 29], radius=height // 2, fill=MINT + (90,))
    glow = glow.filter(ImageFilter.GaussianBlur(14))
    glow.alpha_composite(im, (30, 30))
    return glow


def still(cell: dict, width: int) -> Image.Image:
    im = Image.open(ROOT / cell["image"]).convert("RGBA")
    if "crop" in cell:  # a closer framing: [x0, y0, x1, y1] as fractions (keep it 16:9)
        x0, y0, x1, y1 = cell["crop"]
        W, H = im.size
        im = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    W, H = im.size
    im = im.resize((width, round(H * width / W)), Image.LANCZOS)
    if cell.get("tag"):
        x, y = cell["tag"]  # the pill's centre, as fractions of the still
        t = tag(int(width * 0.04))
        im.alpha_composite(t, (int(x * im.width - t.width / 2), int(y * im.height - t.height / 2)))
    return im


def card(face: Image.Image, w: int, text: str) -> Image.Image:
    """The hook's message card: the Peer's face, its name, a short line."""
    h = 230
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=26, fill=(21, 43, 49, 240), outline=(183, 244, 207, 120), width=2)
    f = face.resize((64, 64), Image.LANCZOS)
    im.alpha_composite(f, (24, 22))
    d.text((104, 54), "Ram's AI Peer", font=font(30, 800), fill=PAPER, anchor="lm")
    d.text((w - 26, 54), "now", font=font(24, 600), fill=MUTED, anchor="rm")
    y = 108
    for line in wrap(text, font(27, 600), w - 52):
        d.text((26, y), line, font=font(27, 600), fill=PAPER)
        y += 38
    return im


def zoom_tile(face: Image.Image, w: int) -> Image.Image:
    """A Zoom-like gallery tile: dark tile, the face in the middle, the name at the lower left."""
    h = round(w * 9 / 16)
    im = Image.new("RGBA", (w, h), (36, 36, 38, 255))
    d = ImageDraw.Draw(im)
    f = face.resize((int(h * 0.52), int(h * 0.52)), Image.LANCZOS)
    im.alpha_composite(f, ((w - f.width) // 2, (h - f.height) // 2 - 8))
    label = "Ram's AI Peer (AI)"
    lf = font(22, 600)
    lw = lf.getbbox(label)[2]
    d.rectangle([10, h - 44, 10 + lw + 20, h - 10], fill=(0, 0, 0, 170))
    d.text((20, h - 27), label, font=lf, fill=WHITE, anchor="lm")
    d.rectangle([0, 0, w - 1, h - 1], outline=(91, 213, 93), width=4)  # the active speaker's frame
    return im


def slack_line(face: Image.Image, w: int, text: str) -> Image.Image:
    """A Slack-like reply: square avatar, bold name, the APP badge, the time, the words."""
    h = 230
    im = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    d = ImageDraw.Draw(im)
    sq = face.resize((72, 72), Image.LANCZOS)
    m = Image.new("L", (72 * 4, 72 * 4), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, 72 * 4 - 1, 72 * 4 - 1], radius=14 * 4, fill=255)
    box = Image.new("RGBA", (72, 72), (12, 26, 30, 255))
    box.alpha_composite(sq)
    im.paste(box, (22, 22), m.resize((72, 72), Image.LANCZOS))
    nf = font(27, 800)
    d.text((112, 36), "Ram's AI Peer", font=nf, fill=(29, 28, 29), anchor="lm")
    x = 112 + nf.getbbox("Ram's AI Peer")[2] + 12
    d.rounded_rectangle([x, 22, x + 62, 50], radius=5, fill=(232, 232, 232))
    d.text((x + 31, 36), "APP", font=font(18, 800), fill=(97, 96, 97), anchor="mm")
    d.text((x + 76, 36), "2:14 AM", font=font(21, 500), fill=(97, 96, 97), anchor="lm")
    y = 66
    for line in wrap(text, font(25, 500), w - 134):
        d.text((112, y), line, font=font(25, 500), fill=(29, 28, 29))
        y += 36
    return im


def wrap(text: str, f: ImageFont.FreeTypeFont, width: int) -> list[str]:
    words, lines, cur = text.split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if f.getbbox(t)[2] <= width:
            cur = t
        else:
            lines.append(cur)
            cur = wd
    if cur:
        lines.append(cur)
    return lines


def board(b: dict, common: dict) -> Path:
    W, M, G = 2400, 48, 24
    sw = (W - 2 * M - 2 * G) // 3
    stills = [still(c, sw) for c in b["stills"]]
    sh = max(s.height for s in stills)
    face = face_image(b["face"], 320)
    head_h, cap_h, row_h = 214, 64, 300
    H = head_h + cap_h + sh + 70 + row_h + 70
    im = Image.new("RGBA", (W, H), INK_DEEP + (255,))
    d = ImageDraw.Draw(im)
    d.text((M, 50), b["title"], font=font(56, 800), fill=MINT, anchor="lm")
    y = 108
    for line in wrap(b["line"], font(30, 500), W - 2 * M):
        d.text((M, y), line, font=font(30, 500), fill=PAPER)
        y += 40
    for i, (s, c) in enumerate(zip(stills, b["stills"])):
        x = M + i * (sw + G)
        d.text((x, head_h + 20), f"{i + 1}  {c['caption']}", font=font(30, 700), fill=PAPER, anchor="lm")
        im.alpha_composite(s, (x, head_h + cap_h))
    y0 = head_h + cap_h + sh + 50
    d.text((M, y0), "One face everywhere: the hook's card, the Zoom tile, the Slack reply", font=font(30, 700), fill=PAPER, anchor="lm")
    y1 = y0 + 40
    f = face.resize((230, 230), Image.LANCZOS)
    im.alpha_composite(f, (M, y1))
    x = M + 230 + 40
    c = card(face, 640, common["card_text"])
    im.alpha_composite(c, (x, y1))
    x += 640 + 30
    z = zoom_tile(face, 410)
    im.alpha_composite(z, (x, y1))
    x += 410 + 30
    s = slack_line(face, W - M - x, common["slack_text"])
    im.alpha_composite(s, (x, y1))
    d.text((W - M, H - 30), common["footer"], font=font(22, 500), fill=MUTED, anchor="rm")
    out = HERE / "boards" / f"{b['id']}.jpg"
    out.parent.mkdir(exist_ok=True)
    im.convert("RGB").save(out, quality=88)
    return out


def main() -> None:
    spec = json.loads((HERE / "boards.json").read_text())
    want = set(sys.argv[1:])
    for b in spec["boards"]:
        if want and b["id"] not in want:
            continue
        print(board(b, spec["common"]).relative_to(ROOT))


if __name__ == "__main__":
    main()
