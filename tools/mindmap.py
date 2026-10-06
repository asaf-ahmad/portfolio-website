#!/usr/bin/env python3
"""Draw a RapidBook-style mind map (SVG, and PNG when Edge or Chrome is available).

Usage:
  python tools/mindmap.py spec.json img/articles/<slug>-mind-map
    -> writes <out>.svg and <out>.png (1800 x 1000)

spec.json:
{
  "title": "Cogito, Ergo Sum",
  "subtitle": "René Descartes · RapidBook",
  "branches": [
    {"label": "1. Doubt as a tool", "leaves": ["Senses can deceive", "Dreams feel real", "The demon test"]},
    ... exactly five branches, two or three leaves each, a leaf is six words or fewer
  ]
}

Layout matches the series: pale background, dark centre ellipse, branches 1 to 3 on the right
(top, middle, bottom), 4 and 5 on the left (bottom, top), one colour per branch, leaves as plain
text joined by curved connectors. Long titles, labels and leaves shrink and then wrap onto two
lines so nothing overlaps or leaves the canvas. Nothing is drawn that is not in the spec.
"""
import json, os, shutil, subprocess, sys
from xml.sax.saxutils import escape

W, H = 1800, 1000
BG = "#FAF8F3"
CENTRE = "#1F2430"
PALETTE = ["#2F6FDB", "#C8591A", "#1F8A5B", "#8E4ED6", "#C23A5C"]
FONT = "Helvetica Neue, Helvetica, Arial, 'Segoe UI', sans-serif"
PILL_INNER_RIGHT, PILL_INNER_LEFT = 1092, 708   # pill edges nearest the centre
CENTRE_RX, CENTRE_RY = 175, 82
MARGIN = 24


def text_width(s, size, bold=False):
    return len(s) * size * (0.50 if bold else 0.48)


def wrap_two(s):
    """Split a string into two lines of roughly equal width at a word boundary."""
    words = s.split()
    if len(words) < 2:
        return [s]
    best, best_diff = None, None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        diff = abs(len(a) - len(b))
        if best is None or diff < best_diff:
            best, best_diff = [a, b], diff
    return best


def fit(text, size, max_w, bold, min_size):
    """Return (lines, size): shrink the font to min_size, then wrap onto two lines."""
    while size > min_size and text_width(text, size, bold) > max_w:
        size -= 1
    if text_width(text, size, bold) <= max_w:
        return [text], size
    lines = wrap_two(text)
    while size > min_size and max(text_width(l, size, bold) for l in lines) > max_w:
        size -= 1
    return lines, size


def text_block(x, y, lines, size, anchor, fill, bold=False):
    """Vertically centred multi-line text at (x, y)."""
    lh = size * 1.18
    y0 = y - (len(lines) - 1) * lh / 2 + size * 0.36
    weight = ' font-weight="700"' if bold else ""
    return "".join(f'<text x="{x:.0f}" y="{y0 + i*lh:.0f}" font-family="{FONT}" font-size="{size}"{weight} fill="{fill}" text-anchor="{anchor}">{escape(l)}</text>'
                   for i, l in enumerate(lines))


def branch(spec, color, side, cy):
    out = []
    label = spec["label"]
    leaves = spec.get("leaves", [])[:3]
    plines, psize = fit(label, 22, 400 - 48, True, 17)
    w = max(240, max(text_width(l, psize, True) for l in plines) + 48)
    h = 64 if len(plines) == 1 else 84
    if side == "right":
        pl, pr = PILL_INNER_RIGHT, PILL_INNER_RIGHT + w
        avail = W - MARGIN - (pr + 76)
    else:
        pr, pl = PILL_INNER_LEFT, PILL_INNER_LEFT - w
        avail = (pl - 76) - MARGIN
    fitted = [fit(l, 21, avail, False, 15) for l in leaves]
    lsize = min(f[1] for f in fitted) if fitted else 21
    leaf_lines = [f[0] for f in fitted]
    gap = 62 if all(len(l) == 1 for l in leaf_lines) else 74
    cxc, cyc = W / 2, H / 2
    sx = cxc + CENTRE_RX - 20 if side == "right" else cxc - CENTRE_RX + 20
    sy = cyc - 55 if cy < cyc - 40 else cyc + 55 if cy > cyc + 40 else cyc
    ex = pl if side == "right" else pr
    mx = (sx + ex) / 2
    out.append(f'<path d="M{sx:.0f} {sy:.0f} C {mx:.0f} {sy:.0f}, {mx:.0f} {cy:.0f}, {ex:.0f} {cy:.0f}" fill="none" stroke="{color}" stroke-width="4" stroke-linecap="round"/>')
    out.append(f'<rect x="{pl:.0f}" y="{cy - h/2:.0f}" width="{w:.0f}" height="{h}" rx="{min(32, h/2)}" fill="{color}"/>')
    out.append(text_block((pl + pr) / 2, cy, plines, psize, "middle", "#FFFFFF", bold=True))
    n = len(leaves)
    ys = [cy + (i - (n - 1) / 2) * gap for i in range(n)]
    for lines, ly in zip(leaf_lines, ys):
        if side == "right":
            lx0, lx1, tx, anchor = pr + 2, pr + 58, pr + 76, "start"
        else:
            lx0, lx1, tx, anchor = pl - 2, pl - 58, pl - 76, "end"
        out.append(f'<path d="M{lx0:.0f} {cy:.0f} C {(lx0+lx1)/2:.0f} {cy:.0f}, {(lx0+lx1)/2:.0f} {ly:.0f}, {lx1:.0f} {ly:.0f}" fill="none" stroke="{color}" stroke-width="3" stroke-linecap="round"/>')
        out.append(text_block(tx, ly, lines, lsize, anchor, "#2A2A2E"))
    return "".join(out)


def render(spec):
    branches = spec["branches"]
    if len(branches) != 5:
        sys.exit("spec must have exactly five branches")
    for b in branches:
        if not (2 <= len(b.get("leaves", [])) <= 3):
            sys.exit(f"branch '{b['label']}' needs two or three leaves")
        for leaf in b["leaves"]:
            if len(leaf.split()) > 6:
                sys.exit(f"leaf too long (max six words): {leaf}")
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="{escape(spec["title"])} mind map">',
             f'<rect width="{W}" height="{H}" fill="{BG}"/>']
    positions = [("right", 200), ("right", 500), ("right", 800), ("left", 700), ("left", 300)]
    for b, (side, cy), color in zip(branches, positions, PALETTE):
        parts.append(branch(b, color, side, cy))
    title, sub = spec["title"], spec.get("subtitle", "")
    tlines, tsize = fit(title, 32, CENTRE_RX * 2 - 56, True, 20)
    parts.append(f'<ellipse cx="{W/2}" cy="{H/2}" rx="{CENTRE_RX}" ry="{CENTRE_RY}" fill="{CENTRE}"/>')
    ty = H / 2 - (14 if sub else 0)
    parts.append(text_block(W / 2, ty, tlines, tsize, "middle", "#FFFFFF", bold=True))
    if sub:
        sub_lines, ssize = fit(sub, 17, CENTRE_RX * 2 - 60, False, 13)
        parts.append(text_block(W / 2, ty + (len(tlines) * tsize * 0.6) + 20, sub_lines, ssize, "middle", "#C9CDD6"))
    parts.append("</svg>")
    return "".join(parts)


def to_png(svg_path, png_path):
    candidates = [r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                  r"C:\Program Files\Google\Chrome\Application\chrome.exe", shutil.which("msedge"), shutil.which("chrome"), shutil.which("google-chrome"), shutil.which("chromium")]
    exe = next((c for c in candidates if c and os.path.exists(c)), None)
    if not exe:
        print("no Chromium browser found, SVG written only"); return False
    html = svg_path + ".html"
    with open(html, "w", encoding="utf-8") as f:
        f.write(f'<!doctype html><html><head><meta charset="utf-8"><style>html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden}}</style></head><body><img src="{os.path.basename(svg_path)}" width="{W}" height="{H}"></body></html>')
    subprocess.run([exe, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--window-size={W},{H}", "--virtual-time-budget=3000",
                    f"--screenshot={os.path.abspath(png_path)}", "file:///" + os.path.abspath(html).replace(os.sep, "/")], capture_output=True)
    os.remove(html)
    return os.path.exists(png_path)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    spec = json.load(open(sys.argv[1], encoding="utf-8"))
    out = sys.argv[2]
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    with open(out + ".svg", "w", encoding="utf-8", newline="\n") as f:
        f.write(render(spec))
    ok = to_png(out + ".svg", out + ".png")
    print(f"wrote {out}.svg" + (f" and {out}.png" if ok else ""))
