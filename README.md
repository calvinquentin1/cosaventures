# Cosa CRM — white-label landing site

A fast, dependency-free marketing site for **Cosa CRM**, a white-labelled GoHighLevel CRM.
Plain HTML/CSS/JS — no build step, no framework, no npm install. Open `index.html` and it runs.

---

## Before you go live

Three things need your input. Everything else works out of the box.

### 1. Set your links — `assets/js/main.js`

The `CONFIG` block at the very top of the file is the only place you edit links:

```js
const CONFIG = {
  loginUrl:     '',   // your white-labelled GHL app URL, e.g. https://app.cosacrm.com
  phone:        '',   // '+15551234567'
  phoneText:    '',   // '(555) 123-4567'
  email:        'admin@cosaventures.com',
  formEndpoint: '',   // GHL inbound webhook / Formspree / your own endpoint
  thankYouUrl:  ''    // optional redirect after a successful submit
};
```

Anything left blank degrades gracefully — the phone and email buttons hide themselves, the
login link falls back to the demo section, and the form runs in **demo mode** (validates and
shows a success state without sending anything).

### 2. Replace the placeholder testimonials — `index.html`

The three quotes in the **Results** section (`<section id="results">`) are format examples
with `Client name` bylines. **Swap them for real, permission-granted client quotes before
publishing.** Publishing invented reviews is unlawful in the US under
[16 CFR Part 465](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-465) and
carries civil penalties. There's a comment marking the block in the HTML.

While you're there, sanity-check the stat numbers in the hero (`data-count` attributes) and
the KPI row so every claim is one you can back up.

### 3. Finish the legal pages

`privacy.html` and `terms.html` are structural templates with a visible review banner and
`[bracketed]` fields for your entity name, address and jurisdiction. Have an attorney review
them, fill the brackets, then delete the `.notice` banner from each page.

---

## Connecting a GoHighLevel calendar or form

The demo section ships with a native form. To use a GHL widget instead, find this comment in
`index.html` inside `<div class="demo__card">` and replace the `<form>` element below it:

```html
<iframe src="https://api.leadconnectorhq.com/widget/booking/YOUR_ID"
        style="width:100%;border:none;overflow:hidden;min-height:720px"
        scrolling="no" id="YOUR_ID"></iframe>
<script src="https://link.msgsndr.com/js/form_embed.js"></script>
```

To keep the native form but pipe submissions into GHL, create an **Inbound Webhook** trigger
in a GHL workflow and paste its URL into `CONFIG.formEndpoint`. The form POSTs JSON with the
keys `name`, `email`, `phone`, `company`, `industry`, `message` and `page`.

---

## Rebranding

Every colour, radius and font lives in the `:root` token block at the top of
`assets/css/styles.css`. Change the tokens and the whole site follows:

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0A0B0D` | Page background |
| `--elev` | `#14161A` | Cards and panels |
| `--acc` | `#C6F24E` | Electric lime accent |
| `--acc-ink` | `#0A0B0D` | Text on accent surfaces |
| `--text` | `#F5F7FA` | Body text |
| `--mute` | `#8A93A3` | Secondary text |
| `--display` | Space Grotesk | Headings |
| `--font` | Inter | Body |

Swap the logo in the `.brand__mark` SVG (it appears in the header and footer of each page)
and in `assets/img/favicon.svg`.

---

## Structure

```
index.html          Landing page — nav, hero, platform, why, onboarding,
                    industries, results, demo, FAQ, footer
privacy.html        Privacy policy template
terms.html          Terms of service template
assets/css/styles.css   Design tokens + all styles
assets/js/main.js       CONFIG block + nav, scroll reveal, counters, FAQ, form
assets/img/favicon.svg  Logo mark
```

## Running locally

Just open `index.html`. If you'd rather serve it over HTTP:

```bash
python -m http.server 8000     # then visit http://localhost:8000
```

## Deploying

**GitHub Pages** — Settings → Pages → Source: *Deploy from a branch* → `main` / `root`.
Live at `https://<user>.github.io/<repo>/` in about a minute. Add a `CNAME` file containing
your domain to use a custom one.

**Netlify / Vercel / Cloudflare Pages** — connect the repo, leave the build command empty and
set the publish directory to the repo root.

---

## Notes

- No JS framework, no bundler, no runtime dependencies. Google Fonts is the only external
  request.
- Responsive from 320px up; mobile nav, fluid type and a stacked comparison table.
- Accessibility: skip link, visible focus rings, `aria-expanded` on the menu, live region on
  the form, and full `prefers-reduced-motion` support.
- Hero dashboard is built from HTML and CSS — no screenshot to keep up to date.
