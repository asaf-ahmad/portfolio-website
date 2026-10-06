# Asaf Ahmad Shayaan — Portfolio Website

A fully functional personal portfolio website with built-in blog management, design portfolio system, creative gallery, and consultation booking.

## Files

```
portfolio/
├── index.html          → Home page
├── about.html          → About page
├── experience.html     → Career timeline
├── blog.html           → Blog listing with category + read-length filters
├── post.html           → Single blog post view
├── portfolio.html      → Design portfolio gallery
├── creative.html       → Sketches + Poetry gallery
├── services.html       → 6 consultation offerings + booking form
├── contact.html        → Contact page
├── resume-download.html→ Public resume download page
├── admin.html          → Admin panel (password protected)
├── css/
│   ├── style.css       → Global styles (Minimal theme + shared layout)
│   └── artsy.css       → Artsy theme overrides (dark, neon, hand-drawn)
└── js/
    └── data.js         → Data management (localStorage) + theme toggle
```

## Features

### Theme Toggle
- **Minimal** (default) — Clean black & white professional look
- **Artsy** — Dark, hand-drawn sticker aesthetic: marker headlines, neon lime/purple/blue accents, paint splashes, doodles, custom cursor
- Append `?theme=artsy` or `?theme=minimal` to any page URL to switch (the choice is remembered)
- Home hero in Artsy mode shows a placeholder monogram; drop a transparent PNG at `img/avatar.png` to show your own illustration instead

### Blog System
- Rich text editor (bold, italic, headings, lists, quotes, links)
- 15 category options with auto-assigned cover images
- Read length tags: Rapid (< 3 min), Medium (5-8 min), Long (10+ min)
- Filter by category and read length on the blog page

### Design Portfolio
- Upload HTML designs — they render live in a modal
- Cover image selection from 15 options

### Creative Gallery
- **Sketches** — Upload images (JPG/PNG/GIF, max 5MB), view in lightbox
- **Poetry** — Write and publish poems with preserved line breaks

### Services / Consultations
- 6 consultation offerings (Lending, Career, Product Strategy, Due Diligence, AI, Pre-Sales)
- Booking form captures Name, WhatsApp, Email, Company, Description
- All requests visible in admin panel

### Resume Manager
- Upload PDF resume from admin panel
- Public download page at `/resume-download.html`

## Admin Panel

1. Go to `yoursite.com/admin.html`
2. Default password: **Asaf@2026**
3. Change your password immediately in Settings

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
