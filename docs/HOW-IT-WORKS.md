# How asafahmad.com works

A plain-language guide to the code behind the site. Written for Asaf, so it assumes you know what the site does and want to know how, and where to look when you want to change something.

## 1. The big picture

The site is a set of ordinary web pages. There is no server, no database and no framework. GitHub stores the files and serves them to visitors through a feature called GitHub Pages. Whenever a new commit lands on the `main` branch, GitHub publishes it, usually within a minute.

Because there is no server, three things that normally need one are done differently:

| Need | How the site does it |
|---|---|
| Editing content | A private admin page (Studio) that writes files straight into the GitHub repository through GitHub's API. |
| Receiving messages | A small relay service (Web3Forms) that turns a form submission into an email to you. |
| Counting visits | GoatCounter, a privacy-friendly counter loaded from a script tag. |

Everything a visitor sees comes from these folders:

```
index.html, about.html, ...     the pages
css/                            how things look (three files, one per concern)
js/data.js                      the shared behaviour on every page
data/                           the content, as JSON files the pages read on load
content/articles/               the body text of each article
img/                            avatar, banners, mind maps, sketches
files/                          the resume PDF and any decks
```

## 2. Two looks, one set of pages

Every page can be shown in two looks. The visitor picks one and the choice is remembered in their browser.

- **Artsy** is the dark, neon, hand-drawn look. It is the default.
- **Minimal** is the cream, soft-shadow look with a teal accent.

The trick is a single class on the `<body>` tag. When `minimal-mode` is present, the page is Minimal. When it is absent, the page is Artsy. All three stylesheets are loaded on every page, in this order:

1. `css/style.css` holds the layout and base rules that both looks share, plus the welcome screen.
2. `css/artsy.css` holds rules that start with `body:not(.minimal-mode)`, so they apply only to Artsy.
3. `css/minimal.css` holds rules that start with `body.minimal-mode`, so they apply only to Minimal.

If you want to change how something looks in one theme only, edit that theme's file. If you want to change the structure, edit `style.css`.

The toggle in the top-right corner adds or removes the class and saves the choice under the key `asaf_theme` in the browser's local storage. The stored value for Artsy is the word `creative`, a leftover from an older name. Adding `?theme=artsy` or `?theme=minimal` to any address forces a look and saves it.

A tiny script at the very top of each page reads that stored value before anything is drawn, so the page never flashes the wrong colour.

## 3. The welcome screen

The home page opens with a full-screen question: which view would you like? It lives at the top of `index.html` as a block with the id `welcome`, and its styles are in `style.css` under the WELCOME heading.

Rules for when it appears:

- Once per browser session on the home page. The site notes `asaf_welcomed` in session storage after a choice, and session storage clears when the tab or browser closes.
- Never on inner pages.
- `?welcome=1` on the address forces it, `?welcome=0` or `?theme=...` skips it.
- The constant `WELCOME_ENABLED` at the top of `index.html` switches the whole thing off when set to `false`.

What happens on a click, in order: the other card fades out, the chosen card turns into its flat theme colour, a copy of the button flies into the real theme toggle at the top right, the overlay fades away, and the hero elements rise in one after another. The whole sequence takes about a second and a half.

## 4. Where the words live

Most of the text you see is not typed into the pages. It is kept in JSON files inside `data/` and poured into the page when it loads. This is what lets the admin panel edit everything without touching HTML.

| File | What is in it |
|---|---|
| `data/site.json` | Hero text, tagline, contact details, footer lines, About page paragraphs and quick profile, section labels, hobbies, the note box copy, the forms relay settings, the analytics code. |
| `data/experience.json` | The timeline, education, awards and competencies on the Experience page. |
| `data/services.json` | Consultancy and mentoring offerings, the how-it-works steps, the FAQ, the brief form labels. |
| `data/learnings.json` | Every article and every deck or PDF on the Learnings page. |
| `data/creative.json` | Sketches, poems and the gallery disclaimer. |

How the pouring works: an element in the HTML carries an attribute such as `data-site="hero.description"`. On load, `js/data.js` fetches `site.json`, follows the dotted path (`hero`, then `description`) and puts that text into the element. Lists use `data-site-render` with a small renderer function. The Experience and Consulting pages are rebuilt entirely from their JSON files by `renderExperience` and `renderServices`.

The HTML still contains a copy of the text as a fallback, so search engines and anyone with scripts disabled see the same words. If you edit text directly in an HTML file, remember the JSON will overwrite it a moment later. Edit the JSON instead, or both.

## 5. Articles, decks and the Learnings page

An article is two things: an entry in `data/learnings.json` and a body file in `content/articles/` containing only the article's HTML (paragraphs, headings, figures). The entry records the title, date, topic, read length, excerpt, the path to the body file, an optional Medium link and the banner image.

`learnings.html` reads the JSON, draws the cards, and offers filters by topic and read length. `post.html?id=<slug>` reads the same JSON, finds the entry, fetches the body file and shows it, and adds article structured data for search engines.

Decks and PDFs are entries under `documents` in the same JSON, pointing at a file in `files/`.

Three helper scripts in `tools/` make publishing from your computer easy:

- `publish_article.py` copies a body file into place, adds or updates the JSON entry, builds a banner and rewrites `sitemap.xml`. It refuses semicolons, em dashes and a short list of marketing words so the house style holds.
- `banner.py` draws the 1600 by 900 title card used as the article's image everywhere.
- `mindmap.py` draws the five-branch mind map from a small JSON spec in the RapidBook style.

Inside Claude Code, `/write-article {category, topic}` runs the whole pipeline: research, write, draw, publish, push, verify.

## 6. The Creative page

`creative.html` reads `data/creative.json`. Each sketch has a title, a one-line note, a date and an image path under `img/sketches/`. The page shows them as framed cards with a lightbox, and prints the disclaimer "Sketched by self, smoothened by AI" under the grid. Poems are entries with a title and a body whose line breaks are kept.

## 7. Messages from visitors

Three places collect messages: the "Drop me a line" note box on the home page, the contact form, and the consulting brief form. All three call one function, `postForm` in `js/data.js`.

It tries, in order:

1. Send the message to the relay named in `site.json` under `forms.endpoint`, with the `access_key` next to it. The relay emails you. The visitor sees a thank-you. This is the normal path.
2. If the browser blocks that request, submit the same data as a plain form. The relay accepts it and sends the visitor back to the page with `?sent=1`, which shows the thank-you.
3. If no relay is configured at all, open the visitor's email app with the message pre-filled.

The relay is Web3Forms. Its free plan allows 250 messages a month. The key is public by nature; it only lets people send mail to you, nothing else.

## 8. Visit counting

When `analytics.goatcounter` in `site.json` has a value, every page loads GoatCounter's counting script. The dashboard at `<code>.goatcounter.com` shows visits, visitors and pages. The site also sends one extra event when a visitor leaves a page, bucketed by how long they stayed, which is how the admin panel estimates average time on page. Nothing is tracked on `localhost`.

## 9. The admin panel (Studio)

Studio is a single web page at a private address. The address is the folder name in the repository that starts with `s-`. It is not linked from anywhere and is marked not to be indexed, but the repository is public, so the real protection is encryption, not secrecy.

How the encryption works, in plain terms: the whole admin application is scrambled with a key that is computed from your username and password. The page you open contains only a login form and the scrambled text. When you log in, your browser recomputes the key and unscrambles the application on the spot. A wrong username or password produces nothing usable. There is no reset, because nothing anywhere knows your password.

The source of the application is `admin-src/app.html`, which is kept out of git. `tools/build_admin.mjs` scrambles it into the `s-...` folder. Rebuilding with the same username and password keeps the same address. Studio's own Settings page can also re-encrypt itself with a new login and publish the result.

How saving works: Studio talks directly to GitHub's API using a personal access token you paste once. The token stays in your browser, itself scrambled with your login key. Each save becomes a commit on `main`, so GitHub Pages republishes the site. The panels map one to one onto the data files above, plus article writing with image upload, document upload, sketches and poems, the resume PDF, and a raw editor for any file as a safety net.

## 10. Search engines

Every page carries a unique title and description, a canonical address, social sharing tags with an image, and structured data describing you as a person, the consultancy as a professional service with its offer list, the FAQ, and each article. `sitemap.xml` lists all pages and articles and is regenerated whenever an article is published. `robots.txt` allows everything and points to the sitemap. The welcome screen does not affect this because the full page is still in the HTML underneath it.

## 11. Common tasks, briefly

- **Change a sentence anywhere:** Studio, Site & Bio, or edit `data/site.json` and push.
- **Add an article:** Studio, Articles, New; or `/write-article` in Claude Code; or `tools/publish_article.py`.
- **Add a deck:** Studio, Decks & PDFs, upload; or drop the file in `files/` and add an entry to `learnings.json`.
- **Add a sketch:** Studio, Sketches & Poems; or drop a JPG in `img/sketches/` and add an entry to `creative.json`.
- **Replace the resume:** Studio, Resume; or overwrite `files/Asaf_Ahmad_Shayaan_Resume.pdf`.
- **Change the avatar:** replace `img/avatar.png` with a transparent PNG.
- **Change a theme colour:** the variables at the top of `css/minimal.css` or `css/artsy.css`.
- **Turn the welcome screen off:** `WELCOME_ENABLED = false` in `index.html`.
- **Roll back a release:** `git log` to find the commit, then `git revert <sha>` and push. The tag `before-welcome` marks the build before the welcome screen.

## 12. Things to know

- Anything saved in a browser (theme choice, admin token) lives only in that browser. Nothing you do as a visitor changes the site.
- The old `admin.html` with a default password is gone. If you see it referenced anywhere, that reference is stale.
- The `portfolio-backend` repository next to this one is a Spring Boot API built earlier. It is not deployed and the site does not use it. Studio replaced the need for it.
- Line-ending warnings from git on Windows (`LF will be replaced by CRLF`) are harmless.
