#!/usr/bin/env node
/**
 * Builds a single, self-contained, domain-locked mockup file you can upload anywhere on your
 * own hosting and share as a plain link.
 *
 *   node tools/protected-mockup/build.mjs \
 *     --in concepts/full/home-a.html \
 *     --out dist/changan-silverton-preview.html \
 *     --domain mondobase.com \
 *     --client "Changan Silverton" \
 *     --expires 2026-11-06
 *
 * The page is gzipped and encrypted (AES-256-GCM). The key is derived (PBKDF2, 150 000 rounds)
 * from the registrable domain the file is opened on, so it only decrypts on that domain and its
 * subdomains. The file never contains the key or the domain in plain text. Opened from disk or on
 * another site, it shows a "works only at its original address" notice. Inside, guard.js repeats
 * the domain check (so a "save complete page" copy wipes itself), enforces the expiry date and
 * adds the watermark and copy/print/screenshot deterrents.
 */
import { gzipSync } from "node:zlib";
import { createHash, randomBytes, webcrypto } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const input = args.in ?? "concepts/full/home-a.html";
const output = args.out ?? "dist/preview.html";
const domain = (args.domain ?? "mondobase.com").toLowerCase().replace(/^www\./, "");
const client = args.client ?? "Changan Silverton";
const expires = args.expires ? Date.parse(`${args.expires}T23:59:59+02:00`) : Date.now() + 30 * 864e5;
const message = args.message ?? "Please contact Mondobase for access.";
if (!Number.isFinite(expires)) throw new Error("--expires must be YYYY-MM-DD");

/* 1. Prepare the page: drop concept navigation, private title, noindex, inject the guard. */
let html = readFileSync(input, "utf8");
html = html.replace(/<nav class="mockbar"[\s\S]*?<\/nav>/, "");
html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${client} · Confidential preview by Mondobase</title>`);
const rootHash = createHash("sha256").update(domain).digest("hex");
const guard = readFileSync(path.join(here, "guard.js"), "utf8")
  .replaceAll("__ROOT_HASH__", rootHash)
  .replaceAll("__CLIENT__", client.replace(/["\\<>']/g, ""))
  .replaceAll("__EXPIRES__", String(expires))
  .replaceAll("__MESSAGE__", message.replace(/["\\<>']/g, ""));
if (/__[A-Z_]+__/.test(guard)) throw new Error("guard.js has an unreplaced placeholder");
html = html.replace(
  /<head>/i,
  () => `<head>\n<meta name="robots" content="noindex,nofollow,noarchive,noimageindex">\n<script>${guard}</script>`,
);

/* 2. Compress and encrypt. */
const salt = randomBytes(16);
const iv = randomBytes(12);
const subtle = webcrypto.subtle;
const baseKey = await subtle.importKey("raw", new TextEncoder().encode(domain), "PBKDF2", false, ["deriveKey"]);
const key = await subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
  baseKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt"],
);
const packed = gzipSync(Buffer.from(html, "utf8"), { level: 9 });
const cipher = Buffer.from(await subtle.encrypt({ name: "AES-GCM", iv }, key, packed));

/* 3. The shell: a branded "opening" screen and the decryptor. */
const b64 = (b) => Buffer.from(b).toString("base64");
const shell = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow,noarchive,noimageindex">
<meta name="referrer" content="no-referrer">
<title>Confidential preview</title>
<style>
html,body{margin:0;height:100%;background:#f3f5f8;color:#062949;font:15px/1.6 Arial,Helvetica,sans-serif;-webkit-user-select:none;user-select:none}
.o{min-height:100%;display:grid;place-items:center;text-align:center;padding:24px;background:linear-gradient(180deg,#7fb3dc 0%,#b9d3ea 35%,#f3cdb5 65%,#f3f5f8 100%)}
.c{max-width:440px}.l{letter-spacing:.24em;font-size:11px;text-transform:uppercase;color:#0b457f}
.s{width:34px;height:34px;margin:18px auto;border-radius:50%;border:3px solid rgba(6,41,73,.15);border-top-color:#0b457f;animation:r 1s linear infinite}
@keyframes r{to{transform:rotate(360deg)}}
</style>
</head><body>
<div class="o"><div class="c"><div class="l">Confidential preview · Mondobase</div><div class="s" id="s"></div><p id="m">Opening the preview…</p></div></div>
<script>
(async()=>{
const D=(s)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const S=D("${b64(salt)}"),I=D("${b64(iv)}"),C=D("${b64(cipher)}");
const msg=(t)=>{document.getElementById("s").remove();document.getElementById("m").textContent=t};
const root=(h)=>{const l=h.replace(/^www\\./,"").split(".");const two=["co.za","org.za","net.za","co.uk","com.au","co.nz"];return l.length>2&&two.includes(l.slice(-2).join("."))?l.slice(-3).join("."):l.slice(-2).join(".")};
try{
if(!/^https?:$/.test(location.protocol))throw 0;
if(location.protocol==="http:"&&!window.isSecureContext){location.replace("https:"+location.href.slice(5));return}
if(!crypto.subtle||!window.DecompressionStream){msg("Please open this preview in an up-to-date Chrome, Safari, Edge or Firefox.");return}
const bk=await crypto.subtle.importKey("raw",new TextEncoder().encode(root(location.hostname)),"PBKDF2",false,["deriveKey"]);
const k=await crypto.subtle.deriveKey({name:"PBKDF2",salt:S,iterations:150000,hash:"SHA-256"},bk,{name:"AES-GCM",length:256},false,["decrypt"]);
const z=await crypto.subtle.decrypt({name:"AES-GCM",iv:I},k,C);
const html=await new Response(new Blob([z]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
document.open();document.write(html);document.close();
}catch(e){msg("This preview only works at the address it was shared from. ${message.replace(/["\\<>]/g, "")}")}
})();
</script>
</body></html>
`;

mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, shell);
console.log(
  `Wrote ${output} (${Math.round(shell.length / 1024)} KB). Locked to ${domain} and its subdomains, expires ${new Date(expires).toISOString().slice(0, 10)}.`,
);
