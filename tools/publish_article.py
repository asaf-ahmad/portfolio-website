#!/usr/bin/env python3
"""Register an article on the Learnings page.

Usage:
  python tools/publish_article.py --id SLUG --title "..." --date YYYY-MM-DD --category books \
      --readlength medium --excerpt "..." --html path/to/body.html [--url https://medium.com/...]

What it does:
  1. Copies the HTML body to content/articles/<id>.html (unless --html already points there).
  2. Upserts the entry in data/learnings.json (matched by id).
  3. Regenerates sitemap.xml so the new post URL is listed.

The body file must contain only the article body (no <html>/<head>): <p>, <h2>, <h3>, <ul>, <ol>,
<figure><img ...><figcaption>...</figcaption></figure>, <a>, <em>, <strong>, <blockquote>.
Run from the repository root. Prints the public URL on success.
"""
import argparse, datetime, io, json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://asafahmad.com/"
CATEGORY_IDS = ["product", "books", "ai", "los", "underwriting", "collections", "lending", "fintech", "presales", "career", "data", "ux"]
READ_LENGTHS = ["rapid", "medium", "long"]
PAGES = [("", "1.0", "weekly"), ("services.html", "0.9", "monthly"), ("about.html", "0.8", "monthly"), ("experience.html", "0.8", "monthly"),
         ("learnings.html", "0.8", "weekly"), ("contact.html", "0.7", "yearly"), ("portfolio.html", "0.5", "monthly"),
         ("creative.html", "0.4", "monthly"), ("resume-download.html", "0.5", "monthly")]


def load_json(path):
    with io.open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def write_sitemap(data):
    today = datetime.date.today().isoformat()
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u, pr, f in PAGES:
        lines.append(f"  <url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod><changefreq>{f}</changefreq><priority>{pr}</priority></url>")
    for a in data.get("articles", []):
        if a.get("url"):
            continue
        lines.append(f"  <url><loc>{SITE}post.html?id={a['id']}</loc><lastmod>{a['date']}</lastmod><changefreq>yearly</changefreq><priority>0.6</priority></url>")
    lines.append("</urlset>")
    with io.open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")


def validate_body(html):
    problems = []
    if re.search(r"<(html|head|body|script|style)\b", html, re.I):
        problems.append("body must not contain <html>, <head>, <body>, <script> or <style>")
    if ";" in re.sub(r"<[^>]+>|&[a-z#0-9]+;", "", html):
        problems.append("semicolon found in prose")
    if "—" in html or "&mdash;" in html:
        problems.append("em dash found in prose")
    for w in ["delve", "leverage", "seamless", "unlock", "supercharge", "game-changer", "journey", "revolutionise", "elevate"]:
        if re.search(r"\b" + re.escape(w) + r"\b", html, re.I):
            problems.append(f"banned word: {w}")
    return problems


def publish(args):
    data_path = os.path.join(ROOT, "data", "learnings.json")
    data = load_json(data_path)
    if args.category not in CATEGORY_IDS:
        sys.exit(f"category must be one of {CATEGORY_IDS}")
    if args.readlength not in READ_LENGTHS:
        sys.exit(f"readlength must be one of {READ_LENGTHS}")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.id):
        sys.exit("id must be a lowercase slug, e.g. rapidbook-3-meditations-marcus-aurelius")
    datetime.date.fromisoformat(args.date)

    entry = {"id": args.id, "title": args.title, "date": args.date, "category": args.category,
             "readlength": args.readlength, "excerpt": args.excerpt}
    if args.html:
        html = io.open(args.html, encoding="utf-8").read()
        problems = validate_body(html)
        if problems and not args.force:
            sys.exit("Refusing to publish:\n  - " + "\n  - ".join(problems) + "\n(use --force to override)")
        dest = os.path.join(ROOT, "content", "articles", args.id + ".html")
        if os.path.abspath(args.html) != os.path.abspath(dest):
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            shutil.copyfile(args.html, dest)
        entry["source"] = f"content/articles/{args.id}.html"
    if args.url:
        entry["medium"] = args.url
        if not args.html:
            entry["url"] = args.url
    if args.cover:
        entry["cover_image"] = args.cover

    arts = data.setdefault("articles", [])
    for i, a in enumerate(arts):
        if a["id"] == args.id:
            arts[i] = entry
            break
    else:
        arts.insert(0, entry)
    arts.sort(key=lambda a: a["date"], reverse=True)
    save_json(data_path, data)
    write_sitemap(data)
    print(f"published: {SITE}post.html?id={args.id}")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--id", required=True)
    p.add_argument("--title", required=True)
    p.add_argument("--date", required=True)
    p.add_argument("--category", required=True)
    p.add_argument("--readlength", required=True)
    p.add_argument("--excerpt", required=True)
    p.add_argument("--html", help="path to the article body HTML")
    p.add_argument("--url", help="Medium URL (cross-post link, or the only destination when no --html)")
    p.add_argument("--cover", help="optional cover image path under img/")
    p.add_argument("--force", action="store_true", help="publish even if the style checks fail")
    publish(p.parse_args())
