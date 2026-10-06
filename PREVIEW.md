# Sending the client a private preview

The same codebase runs as a **private preview** when `PREVIEW_CODES` is set. Run it as its own
cPanel Node app on a Mondobase subdomain, for example `changan.preview.mondobase.co.za`, so the
preview never shares a database or a URL with the live site.

## What the client gets

- **A personal link per person:** `https://changan.preview.mondobase.co.za/preview/enter?code=CPTA-7QX2`.
  Opening it sets a signed, HttpOnly cookie and takes them to the site. Without it, every page
  shows a "Private preview" gate.
- **An expiry date:** after `PREVIEW_EXPIRES` every link stops working and the gate says the
  preview has expired.
- **Instant revoking:** remove a code from `PREVIEW_CODES` and restart the app. That person's
  link and cookie stop working straight away.

## What protects the work

| | |
|---|---|
| Everything is gated | Pages, brand photography, uploaded images and the API all need the cookie. A saved copy of a page cannot load its images or data, so it falls apart offline. |
| Traceable watermark | A faint diagonal watermark over every screen: "Confidential preview · Changan Pretoria · by Mondobase · viewer name · code · date". Any screenshot or recording shows whose link it came from. A corner ribbon repeats the code. |
| Copy deterrents | No right-click menu, text selection, image dragging, copy, or Save / Print / View-source / dev-tools shortcuts. |
| Print | Printing produces one line of text saying the preview is confidential. |
| Screenshot deterrent | The page blurs whenever the window loses focus, which most snipping and screenshot tools cause, and on the PrintScreen key, which also replaces the clipboard with a notice. |
| Not indexed | `noindex` headers, `robots.txt` disallows everything, and nothing is cached by Cloudflare or the browser. |
| Admin closed | `/admin` returns 403 to preview viewers (set `PREVIEW_ALLOW_ADMIN=true` for Mondobase staff). |
| Visit log | Every link use, including refused codes, is saved in the admin under **Settings → Preview visits**, with the viewer, time, IP address and device. |
| Minified code | The production build is minified and ships no source maps. |

**Be honest with yourself about the limit:** nothing on the web can stop someone pointing a phone
at the screen, or a determined developer from saving what their browser renders. These measures
make copying awkward, make every capture traceable to one person, and make clear that the work is
Mondobase's. The confidentiality note on the gate backs this up. For stronger protection, add a
line to the proposal or NDA.

## Setting it up on cPanel

1. **Subdomain.** In cPanel, create `changan.preview.mondobase.co.za` (or similar). Let AutoSSL
   issue a certificate.
2. **Build for that address.** In GitHub, run the **Build deploy branch** workflow manually
   (Actions → Build deploy branch → Run workflow) with *serverUrl* set to
   `https://changan.preview.mondobase.co.za`. Alternatively, set the repository variable
   `SITE_URL` to it before merging.
3. **Node app.** Follow DEPLOY-CPANEL.md with application root `changan-preview`, then add these
   environment variables as well:

   ```
   PREVIEW_CODES=CPTA-7QX2:Changan Pretoria (Dealer Principal),CPTA-K9M4:Changan Pretoria (Sales Manager)
   PREVIEW_EXPIRES=2026-10-31
   PREVIEW_CLIENT=Changan Pretoria
   PREVIEW_ALLOW_ADMIN=true
   ```

   Make the codes hard to guess: 4+4 letters and digits, a different one per person.
4. **Seed it** once (`NODE_ENV=production npx tsx src/seed/index.ts`), then restart.
5. **Send the links**, one per person, by email or WhatsApp. Don't post them anywhere public.

## Checking who has looked

Sign in at `/admin` (Mondobase staff, with `PREVIEW_ALLOW_ADMIN=true`) and open
**Settings → Preview visits**. Refused codes show up there too, so a leaked or guessed link is
visible.
