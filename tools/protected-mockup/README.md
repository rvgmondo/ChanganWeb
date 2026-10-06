# Protected single-file mockup

Turns a mockup HTML file into **one file you upload to your own hosting and share as a link**. It needs no Node app and no login.

```bash
node tools/protected-mockup/build.mjs \
  --in concepts/full/home-a.html \
  --out concepts/protected/changan-pretoria-preview-<random>.html \
  --domain mondobase.com \
  --client "Changan Pretoria" \
  --expires 2026-11-05
```

## Upload

1. Upload the file to any folder on a site under the domain you built for, e.g.
   `public_html/preview/`. Subdomains work too.
2. The page must be served over **https**, which AutoSSL handles. Plain http redirects to https.
3. Share the URL, e.g. `https://mondobase.com/preview/changan-pretoria-preview-95fbcd747f.html`.
   Keep the random part in the name so the URL can't be guessed.
4. Optional, in that folder's `.htaccess`:

   ```apache
   Header set X-Robots-Tag "noindex, nofollow, noarchive"
   Header set Cache-Control "no-store"
   Options -Indexes
   ```

## What it does

- The page is gzipped and encrypted with AES-256-GCM. The key is derived from the domain it is opened on, so a downloaded copy, or the file uploaded to another site, only shows "works only at the address it was shared from".
- "Save page as… complete" copies check the domain again and wipe themselves.
- It stops working after `--expires`.
- Every screen is covered by a tiled watermark: client, Mondobase, date and a per-visit ID.
- Right-click, copy, drag, select, save, print, view-source and dev-tools shortcuts are blocked. Printing produces a blank page with a notice.
- The page is blanked when the window loses focus, when PrintScreen is pressed and when docked dev tools open.

## Limits

No web page can fully stop screenshots, especially phone cameras and OS snipping tools that keep focus. A developer who is determined enough can still dig the decrypted page out of memory. The watermark covers those cases: any screenshot that leaks carries the client name, date and visit ID. The real code (Next.js, Payload, the CMS and the animation source) never leaves our servers. This file is only the visual mockup.
