# LucX Auto Detailing — Website

Static site (English) served by a tiny Express server, ready to deploy on Railway.

## Run locally

From the project folder:

```powershell
cd "C:\projetos\lucx auto detailing"
npm install
npm start
```

Or use the shortcuts:

- `run-local.ps1` (PowerShell)
- `run-local.bat` (Windows)

Then open `http://localhost:3000`.

## Before going live — checklist

1. **Contact form (Formspree).** Create a free form at https://formspree.io, point it to
   `lucxautodetailing@gmail.com`, then replace `YOUR_FORM_ID` in
   [public/index.html](public/index.html) (the `<form action="...">`). Verify the email once
   when Formspree asks. Until then the form will not deliver submissions.
2. **Gallery photos.** Replace the 6 "Add photo" placeholders in the Gallery section with real
   before/after shots. Put images in `public/img/`, ~1200×900px, under ~300KB each (JPG).
3. **Hero image.** Currently a stock Unsplash photo. Swap for a real photo of your work
   (`public/img/hero.jpg`) and update `.hero` background in [public/styles.css](public/styles.css).
4. **Domain.** Meta tags use `https://lucxautodetailing.com/`. Update the canonical/OG URLs in
   `index.html` if the real domain differs.
5. **Analytics (optional).** Add Google Analytics / Meta Pixel before the closing `</head>`.

## Assets

Original brand files are in `assets/` (filenames with spaces/brackets — not web-safe).
Web-ready copies live in `public/img/`:

- `logo-white.png` — header logo (dark background)
- `logo-color.png`, `favicon.png`, `og-image.png`

> Note: `assets/Lucx [ Logotipo ]_avatar.png` is ~19 MB — do **not** reference it on the site.

## Deploy on Railway

- Push the repo to GitHub.
- In Railway, create a new project and connect the repo.
- Build: `npm install` · Start: `npm start`. Railway sets `PORT` automatically.

The current domain still points to Wix. Once the site is approved, switch DNS to Railway.
