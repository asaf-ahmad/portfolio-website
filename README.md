# Asaf Ahmad Shayaan — Portfolio Website

A fully functional personal portfolio website with built-in blog management, design portfolio system, creative gallery, and consultation booking.

## Files

```
portfolio/
├── index.html          → Home page
├── about.html          → About page
├── experience.html     → Career timeline
├── learnings.html      → Learnings: articles (by topic + read length) and downloadable decks/PDFs
├── blog.html           → Redirects to learnings.html (kept for old links)
├── post.html           → Single article view
├── portfolio.html      → Design portfolio gallery
├── creative.html       → Sketches + Poetry gallery
├── services.html       → Consultancy (6 offerings), mentoring (3), how it works, FAQ, brief form
├── contact.html        → Contact page
├── resume-download.html→ Public resume download page
├── admin.html          → Admin panel (password protected)
├── css/
│   ├── style.css       → Global styles (Minimal theme + shared layout)
│   └── artsy.css       → Artsy theme overrides (dark, neon, hand-drawn)
├── js/
│   └── data.js         → Data layer (localStorage + public content loader) + theme toggle
├── data/learnings.json → PUBLIC articles and documents shown on the Learnings page
├── content/articles/   → Article bodies (HTML) referenced from learnings.json
├── files/              → Resume PDF and downloadable decks/papers
├── img/og-cover.png    → Social share image; img/avatar.png (optional) shows in the Artsy hero
├── robots.txt, sitemap.xml
```

## Publishing content (important)

Anything saved in the admin panel lives in **that browser's localStorage only**. Visitors and
search engines never see it. To publish for real:

1. **Articles**: add an entry to `data/learnings.json` under `articles` with `id`, `title`, `date`,
   `category` (product, books, ai, los, underwriting, collections, lending, fintech, presales, career,
   data, ux), `readlength` (rapid, medium, long), `excerpt`, and either `source` (an HTML file under
   `content/articles/`), inline `content`, or a `url` (e.g. a Medium post). The admin panel's
   *Publish to Learnings* page exports drafts in this shape.
2. **Decks and PDFs**: put the file in `files/` and add an entry under `documents` with `id`, `title`,
   `type` (pdf, ppt, pptx), `category`, `description`, `date`, `file` and optional `pages`.
3. **Resume**: save it as `files/Asaf_Ahmad_Shayaan_Resume.pdf`. The download page picks it up automatically.
4. Commit and push. GitHub Pages redeploys within a minute or two.

Helpers in `tools/`:

- `python tools/publish_article.py --id slug --title "..." --date YYYY-MM-DD --category books --readlength medium --excerpt "..." --html body.html [--url medium-link]`
  copies the body to `content/articles/`, upserts `data/learnings.json` and regenerates `sitemap.xml`. It refuses semicolons, em dashes and the banned marketing words.
- `python tools/mindmap.py spec.json img/articles/<slug>-mind-map` draws the RapidBook-style mind map (SVG + 1800x1000 PNG) from a five-branch spec.
- `python tools/banner.py --all` builds a 1600x900 title banner for every article that lacks one (publish_article.py does this automatically for new articles). Banners are the card image, post hero and social share image.

In Claude Code, `/write-article {category, topic}` (project skill in `.claude/skills/write-article/`) researches, writes in Asaf's voice,
draws the mind map and any supporting diagram, publishes through the tools above, pushes, and returns the live URL plus a Medium SEO pack.

## SEO

Every page carries a unique title and description, canonical URL, Open Graph and Twitter tags,
and JSON-LD structured data (Person, WebSite, ProfessionalService with an offer catalogue, FAQPage,
BreadcrumbList, Article). `sitemap.xml` and `robots.txt` are at the root. After deploying, submit
`https://asafahmad.com/sitemap.xml` in Google Search Console.

## Features

### Theme Toggle
- **Artsy** (default) — Dark, hand-drawn sticker aesthetic: marker headlines, neon lime/purple/blue accents, paint splashes, doodles, custom cursor
- **Minimal** — Clean black & white editorial look
- Append `?theme=artsy` or `?theme=minimal` to any page URL to switch (the choice is remembered)
- Home hero in Artsy mode shows a placeholder monogram; drop a transparent PNG at `img/avatar.png` to show your own illustration instead

### Learnings (articles + decks)
- Articles by topic (Product Management, Learnings from Books, AI in Lending, LOS, Credit Underwriting, Collections, Digital Lending, Fintech, Pre-Sales, Career, Data, UX) and read length
- Decks and PDFs listed with type badges and direct download
- Rich text editor in the admin for drafting; publish via `data/learnings.json` (see above)

### Design Portfolio
- Upload HTML designs — they render live in a modal
- Cover image selection from 15 options

### Creative Gallery
- **Sketches** — Upload images (JPG/PNG/GIF, max 5MB), view in lightbox
- **Poetry** — Write and publish poems with preserved line breaks

### Consultancy & Mentoring
- Consultancy: Lending Systems Advisory, AI in Lending, Credit Product Strategy, Fintech Due Diligence, Pre-Sales & Proposal Support, Fractional Product Leadership
- Mentoring: PM Career Mentoring, Lending & Fintech Domain Coaching, Early-Career & B-School Guidance
- How-it-works steps and FAQ (FAQPage structured data)
- Brief form opens a pre-filled email and offers a WhatsApp alternative, so requests actually reach Asaf

### Resume
- Public download page at `/resume-download.html` serves `files/Asaf_Ahmad_Shayaan_Resume.pdf` when present

## Admin Panel (Studio)

The admin is a single encrypted page at an unlisted address. There is no `admin.html`.

- Source lives in `admin-src/app.html` (git-ignored). `ADMIN_USER=... ADMIN_PASS=... node tools/build_admin.mjs`
  encrypts it (PBKDF2-SHA256 600k rounds, AES-256-GCM) into `<opaque>/index.html`; the opaque folder name is
  kept in `.admin-path` (git-ignored) so rebuilds overwrite the same page. Only the ciphertext is committed.
- Open the page, log in, and add a fine-grained GitHub token (Contents: read/write on this repo) in Settings.
  Every save commits straight to `main` and GitHub Pages redeploys.
- It edits: site copy and bio (`data/site.json`), experience, consulting, articles (with banner generation),
  decks and PDFs, sketches and poems, the resume, any page's HTML, and raw data files. It can also rotate its own
  login and shows analytics from GoatCounter when a read token is added.
- Never put the admin address in this README, the sitemap, robots.txt or any page: the repository is public.

## Welcome screen (first-visit view chooser)

`index.html` opens with a full-screen view chooser once per browser session (it is the landing page). Picking a view flies the
button into the theme toggle and reveals the page. Controls for testing and rollback:

- `?welcome=1` forces it, `?welcome=0` or `?theme=...` skips it. Closing the tab resets the session, so it shows again next visit.
- `WELCOME_ENABLED = false` at the top of `index.html` switches it off without removing it.
- The build before the welcome screen is tagged `before-welcome`. To roll back entirely:
  `git revert --no-edit before-welcome..HEAD && git push` (keeps history) or
  `git reset --hard before-welcome && git push --force` (rewrites history).

## Content pipeline

Pages hydrate from JSON at load time (`data/site.json`, `data/experience.json`, `data/services.json`,
`data/learnings.json`, `data/creative.json`). The HTML keeps the same text as a fallback for crawlers.
Forms post to the FormSubmit endpoint in `site.json` (first submission triggers an activation email) and fall
back to opening the visitor's mail app. Analytics load GoatCounter when `analytics.goatcounter` is set.

### Admin sections:
- Dashboard — stats overview + quick actions
- New Post / Manage Posts — blog CRUD
- New Design / Manage Designs — portfolio CRUD
- Consultations — view/manage booking requests
- Sketches — upload/manage sketch images
- Poetry — write/manage poems
- Resume — upload/download/remove PDF resume
- Settings — change admin password

## Hosting on GitHub Pages

1. Create repo named `your-username.github.io`
2. Upload all files (maintain folder structure)
3. Settings → Pages → Deploy from main branch
4. Live at `https://your-username.github.io` in 2-3 minutes

## Custom Domain (Optional)

Add these DNS records at your registrar:
- A record: 185.199.108.153
- A record: 185.199.109.153
- A record: 185.199.110.153
- A record: 185.199.111.153
- CNAME www → your-username.github.io

## Notes

- All data stored in browser localStorage
- Data persists across sessions on the same browser
- Clearing browser data removes all posts/designs — export manually if needed
- Fully responsive on all devices
- Admin panel not linked from any public page (access via direct URL only)
