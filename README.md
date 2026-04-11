# Asaf Ahmad Shayaan — Portfolio Website

A fully functional personal portfolio website with built-in blog management and design portfolio system.

## Files

```
portfolio/
├── index.html          → Home page
├── about.html          → About page
├── experience.html     → Career timeline
├── blog.html           → Blog listing
├── post.html           → Single blog post view
├── portfolio.html      → Design portfolio gallery
├── contact.html        → Contact page
├── admin.html          → Admin panel (password protected)
├── css/
│   └── style.css       → Global styles
└── js/
    └── data.js         → Data management (localStorage)
```

## Admin Panel

1. Go to `yoursite.com/admin.html`
2. Default password: **Asaf@2026**
3. Change your password immediately in Settings

### What you can do in Admin:
- **Write blog posts** — rich text editor, no coding needed
- **Upload HTML designs** — paste any HTML and it renders live on the portfolio page
- **Edit or delete** any post or design
- **Preview designs** before publishing

## Hosting on GitHub Pages (Free)

### Step 1 — Create a GitHub Account
Go to github.com and create a free account if you don't have one.

### Step 2 — Create a Repository
- Click "New repository"
- Name it: `your-username.github.io` (e.g. `asaf-ahmad.github.io`)
- Make it **Public**
- Click "Create repository"

### Step 3 — Upload Files
- Click "uploading an existing file"
- Drag and drop ALL files from this folder (maintain the folder structure)
- Commit changes

### Step 4 — Enable GitHub Pages
- Go to repository Settings
- Click "Pages" in the left sidebar
- Under Source, select "Deploy from branch"
- Select "main" branch, "/ (root)" folder
- Click Save

### Step 5 — Your site is live!
- URL: `https://your-username.github.io`
- Takes 2-3 minutes to go live after first deploy

### Step 6 — Link to LinkedIn
- Go to your LinkedIn profile
- Click "Edit profile"
- Under "Contact info", add your website URL
- Also add it to your About section

## Custom Domain (Optional)

If you buy a domain (e.g. asafahmad.com from GoDaddy ~₹800/year):
1. In GitHub Pages settings, add your custom domain
2. At your domain registrar, add these DNS records:
   - A record: 185.199.108.153
   - A record: 185.199.109.153
   - A record: 185.199.110.153
   - A record: 185.199.111.153
3. Wait 24 hours for DNS to propagate

## Notes

- All blog posts and designs are stored in your browser's localStorage
- Data persists across sessions on the same browser
- If you clear browser data, you'll lose posts — export them manually if needed
- The site works on all devices — fully responsive
