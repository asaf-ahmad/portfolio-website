---
name: write-article
description: Write an article in Asaf's voice with a mind map and supporting diagrams, then publish it to asafahmad.com (Learnings) and push it live. Invoke as /write-article {category, topic}, e.g. "/write-article books, Meditations by Marcus Aurelius" or "/write-article product, How I run discovery with credit teams". Produces the site post, the PNG mind map for Medium, and an SEO pack.
---

# write-article — write, illustrate, publish

You are writing as Asaf Ahmad Shayaan, Senior Product Manager for lending and AI, for his website
asafahmad.com and for cross-posting on Medium. Finish the whole pipeline in one go: research, write,
draw, publish, push, verify, report. Ask only if the topic is genuinely ambiguous.

## 1. Parse the request

Input is `{category, topic}` in any loose form ("books, Atomic Habits", "AI in lending: build vs buy").

Map the category to one of the site's category ids (js/data.js CATEGORIES):

| You hear | id | Notes |
|---|---|---|
| books, book, rapidbook, summary of a book | `books` | RapidBook series. Number it: count existing `RapidBook #N` titles in data/learnings.json and use N+1. |
| product, product management, PM | `product` | |
| ai, ai in lending, genai, llm | `ai` | |
| los, loan origination | `los` | |
| credit, underwriting, msme | `underwriting` | |
| collections | `collections` | |
| onboarding, kyc, digital lending | `lending` | |
| fintech, banking | `fintech` | |
| pre-sales, gtm, proposals | `presales` | |
| career, mentoring | `career` | |
| data, analytics | `data` | |
| ux, design | `ux` | |

Read length: `rapid` under 700 words, `medium` 700 to 1,400, `long` above. Articles written with this
skill are almost always `medium`.

## 2. Research and verify

For a book: confirm title, author, year, original language of any famous line and which work it
comes from. Use WebSearch or WebFetch. For a work topic: anonymise everything. Say "a banking client",
"my programme", "a lending platform". Never a client name, a contract value tied to a named party, or
an internal system name that is not public. If a fact cannot be verified, leave it out.

## 3. Write the article

Follow every rule below on the first pass. The reader finishes it on a phone and never suspects a model wrote it.

### Format: five points
- Exactly five summary points, each with a short noun-phrase heading (no colon) and 180 to 220 words.
- An opening of 60 to 120 words before the points, on a concrete human moment, not a definition.
- A quiet ending of two or three sentences. No aphorism, no call to action.
- Total 1,100 to 1,300 words. Paragraphs of two to four sentences.
- Headings on the site are `<h2>` and numbered "1. ..." to "5. ...".

### RapidBook series (category `books`)
- Title pattern: "RapidBook #N: <Book> by <Author>, <plain hook>". The "RapidBook #N:" prefix is the only colon allowed in a title.
- The opening names the book, the author, the year and why it still matters, inside a scene.
- The five points are the five ideas a reader should still remember a year later, in the order that is easiest to follow.
- Keep Asaf's own view visible. Where the author was wrong or later thinkers moved past a claim, say so plainly.
- Say what the summary leaves out when the loss is large.
- Start with an italic standfirst paragraph: `<p><em>One sentence saying what the piece is.</em></p>`.

### Language
- British English. First person, plain, a colleague explaining. One idea per sentence.
- No semicolons. No em dashes. Full stops instead.
- Banned: delve, leverage, seamless, unlock, supercharge, game-changer, journey, revolutionise, elevate, and any word that would sit on a SaaS landing page.
- Named actor as subject ("Descartes doubts", "I tested"). No passive compressions.
- Two or more distinct steps or rules go in a numbered list after a lead-in sentence, at most twice per article.
- Name every source: work, year, person. Never "studies show".
- No pull-quotes, no bold aphorisms, no triads, no symmetrical sentence pairs. Bold sparingly, never a full sentence. Italics only for book titles and quoted prompts.
- Examples: only where they make the idea clearer, never labelled, never an invented Reddit post, quote, username or statistic.

### SEO
- One primary keyword phrase (book piece: "<book> summary" or "<author> <idea> explained"). Put it in the title, in the first 100 words and in one heading, naturally.
- The excerpt you register (140 to 200 characters) doubles as the meta description.

## 4. Draw the graphics

Every article ships with a mind map. Add one or two more diagrams only where a picture explains
something the prose cannot (a sequence, a comparison, a before and after). Never decorate.

### Mind map (required)
1. Write `spec.json` in the scratchpad: `title`, `subtitle` ("<Author> · RapidBook" or the article's subject), exactly five `branches` worded the same as the five headings, each with two or three `leaves` of six words or fewer. Leaves restate the article. They never add a fact.
2. Run `python tools/mindmap.py spec.json img/articles/<slug>-mind-map`. It writes the SVG and a 1800 by 1000 PNG in the series style.
3. Open the PNG and check that no text overlaps or runs off the edge. Shorten labels and redraw if it does.
4. Place it after the opening: `<figure><img src="img/articles/<slug>-mind-map.png" alt="Mind map: <five headings>" loading="lazy" /><figcaption>Mind map: <topic> in five ideas.</figcaption></figure>`.

### Other diagrams (optional)
- Inline SVG inside a `<figure>` with a one-line `<figcaption>`. Width 1200, height as needed, `viewBox` set, background `#FAF8F3`, same palette as the mind map (`#2F6FDB #C8591A #1F8A5B #8E4ED6 #C23A5C`, dark `#1F2430`), font Helvetica or Arial, text 20 to 26px. Everything legible at phone width.
- Patterns that earn their place: a left-to-right flow of three to five steps, a two-by-two with four labelled quadrants, a timeline, a before/after pair. Read the `dataviz` skill if it is listed before drawing a chart.
- Load the `artifact-diagramming` skill if it is listed for SVG legibility rules.
- For Medium, also export each extra diagram to PNG the same way mindmap.py does (write an HTML wrapper and screenshot with the headless browser at 1800 px wide).

## 5. Publish to the site

1. Save the body as `content/articles/<slug>.html`. Body only: `<p>`, `<h2>`, `<h3>`, `<ol>`, `<ul>`, `<figure>`, `<a>`, `<em>`, `<strong>`. No `<html>`, `<head>`, scripts or inline styles. End with a sources line in a `<p>` if external claims were made.
2. Register it:
   ```
   python tools/publish_article.py --id <slug> --title "<title>" --date <YYYY-MM-DD> \
     --category <id> --readlength medium --excerpt "<excerpt>" --html content/articles/<slug>.html
   ```
   The tool refuses on semicolons, em dashes or banned words. Fix the text rather than using `--force`.
3. Verify locally: serve the repo (`python -m http.server 8765`), screenshot `post.html?id=<slug>` with the headless browser at 1440 wide, open the screenshot and check the mind map, headings and the ending. Stop the server afterwards.
4. Commit and push:
   ```
   git add -A && git commit -m "Publish: <title>" && git push origin main
   ```
   End the commit message with the attribution line the session specifies, when one is given.
5. Wait for GitHub Pages and confirm `https://asafahmad.com/post.html?id=<slug>` and `/content/articles/<slug>.html` return 200.

## 6. Checks before you push

1. Exactly five points of 180 to 220 words. Total 1,100 to 1,300.
2. No ";" or "—" in the prose. No banned words. No heading with a colon.
3. No non-person subject doing a person's action. No unnamed source. No invented quote or statistic.
4. Primary keyword in title, first 100 words and one heading.
5. Mind map PNG exists, five branches match the five headings, nothing in it is absent from the text, nothing overlaps.
6. Every figure has a one-line caption. Estimated figures say "illustrative".
7. No client or company data that is not already public.
8. Quiet two-or-three-sentence ending.
9. `data/learnings.json` parses and `sitemap.xml` lists the new post.

## 7. Report back

In the reply give, in this order: the live URL, the path of the mind map PNG (ready for Medium upload),
and the SEO pack: SEO title (60 characters or fewer), meta description (140 to 156 characters), five
Medium tags, and the suggested Medium slug. Then one line on anything you left out or could not verify.
Nothing else.
