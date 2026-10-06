#!/usr/bin/env python3
"""Render a 1600 x 900 banner PNG for an article (card image, post hero, social share).

Usage:
  python tools/banner.py --title "..." --category product --out img/articles/<slug>-banner
  python tools/banner.py --all            # (re)build a banner for every article in data/learnings.json that lacks one

Style matches the mind maps: pale paper background, a colour band per category, the title set large,
an eyebrow with the category label, the site name at the foot. No photos, no stock imagery.
"""
import argparse, json, os, shutil, subprocess, sys
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1600, 900
BG, INK, MUTED = "#FAF8F3", "#1F2430", "#6B6F7A"
FONT = "Helvetica Neue, Helvetica, Arial, 'Segoe UI', sans-serif"
CATEGORY = {
    "product": ("Product Management", "#2F6FDB"), "books": ("Learnings from Books", "#C8591A"),
    "ai": ("AI in Lending", "#8E4ED6"), "los": ("Loan Origination Systems", "#1F8A5B"),
    "underwriting": ("Credit Underwriting", "#C23A5C"), "collections": ("Collections", "#1F8A5B"),
    "lending": ("Digital Lending & Onboarding", "#2F6FDB"), "fintech": ("Fintech & Banking", "#1F2430"),
    "presales": ("Pre-Sales & GTM", "#C8591A"), "career": ("Career in Product", "#8E4ED6"),
    "data": ("Data & Analytics", "#2F6FDB"), "ux": ("UX & Design", "#C23A5C"),
}
PALETTE = ["#2F6FDB", "#C8591A", "#1F8A5B", "#8E4ED6", "#C23A5C"]


def text_width(s, size):
    return len(s) * size * 0.52


def wrap(text, size, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if text_width(trial, size) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def fit_title(title, max_w, max_lines=3):
    for size in range(84, 40, -4):
        lines = wrap(title, size, max_w)
        if len(lines) <= max_lines and all(text_width(l, size) <= max_w for l in lines):
            return lines, size
    return wrap(title, 40, max_w)[:max_lines], 40


def render(title, category, eyebrow=None):
    label, colour = CATEGORY.get(category, ("Learnings", "#2F6FDB"))
    eyebrow = eyebrow or f"Learnings  ·  {label}"
    lines, size = fit_title(title, W - 260)
    lh = size * 1.12
    block_h = len(lines) * lh
    y0 = (H - block_h) / 2 + size * 0.78 - 10
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="{escape(title)}">',
             f'<rect width="{W}" height="{H}" fill="{BG}"/>',
             f'<rect x="0" y="0" width="34" height="{H}" fill="{colour}"/>',
             # five-dot motif, top right
             "".join(f'<circle cx="{W - 70 - i*34}" cy="78" r="9" fill="{PALETTE[i]}"/>' for i in range(5)),
             f'<text x="130" y="140" font-family="{FONT}" font-size="26" font-weight="700" fill="{colour}" letter-spacing="2">{escape(eyebrow.upper())}</text>']
    for i, line in enumerate(lines):
        parts.append(f'<text x="130" y="{y0 + i*lh:.0f}" font-family="{FONT}" font-size="{size}" font-weight="700" fill="{INK}">{escape(line)}</text>')
    parts.append(f'<rect x="130" y="{H - 150}" width="120" height="6" rx="3" fill="{colour}"/>')
    parts.append(f'<text x="130" y="{H - 92}" font-family="{FONT}" font-size="28" font-weight="700" fill="{INK}">Asaf Ahmad Shayaan</text>')
    parts.append(f'<text x="130" y="{H - 56}" font-family="{FONT}" font-size="22" fill="{MUTED}">asafahmad.com  ·  Senior Product Manager, Lending &amp; AI</text>')
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


def build(title, category, out, eyebrow=None):
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    svg = out + ".svg"
    with open(svg, "w", encoding="utf-8", newline="\n") as f:
        f.write(render(title, category, eyebrow))
    ok = to_png(svg, out + ".png")
    os.remove(svg)
    return out + ".png" if ok else None


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--title"); p.add_argument("--category", default="product"); p.add_argument("--out"); p.add_argument("--eyebrow")
    p.add_argument("--all", action="store_true", help="build banners for every article in data/learnings.json that has none")
    p.add_argument("--force", action="store_true", help="with --all, rebuild even if a banner exists")
    a = p.parse_args()
    if a.all:
        path = os.path.join(ROOT, "data", "learnings.json")
        data = json.load(open(path, encoding="utf-8"))
        for art in data.get("articles", []):
            if art.get("banner") and not a.force:
                continue
            out = os.path.join(ROOT, "img", "articles", art["id"] + "-banner")
            png = build(art["title"], art.get("category", "product"), out)
            if png:
                art["banner"] = f"img/articles/{art['id']}-banner.png"; print("banner:", art["banner"])
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            json.dump(data, f, ensure_ascii=False, indent=2); f.write("\n")
    else:
        if not (a.title and a.out):
            sys.exit("--title and --out are required (or use --all)")
        png = build(a.title, a.category, a.out, a.eyebrow)
        print("wrote", png or "(svg only)")
