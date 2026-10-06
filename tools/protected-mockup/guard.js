/*
 * Runs inside the decrypted mockup. Injected by build.mjs, which fills in the domain hash,
 * client name, expiry and contact message at build time.
 *
 * 1. Domain check again, from inside the decrypted page, so a "save complete page" copy (which
 *    keeps this inline script) wipes itself when opened anywhere but the original domain.
 * 2. Expiry date.
 * 3. Watermark, copy and print deterrents, and a shield on focus loss / PrintScreen / devtools.
 */
(() => {
  const ROOT_HASH = "__ROOT_HASH__";
  const CLIENT = "__CLIENT__";
  const EXPIRES = __EXPIRES__;
  const MESSAGE = "__MESSAGE__";

  const wipe = (text) => {
    try { window.stop(); } catch (e) {}
    document.documentElement.style.visibility = "";
    document.documentElement.innerHTML =
      '<head><meta name="robots" content="noindex"><title>Private preview</title></head>' +
      '<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f5f8;font:16px/1.5 Arial,sans-serif;color:#062949;text-align:center;padding:24px">' +
      '<div><p style="letter-spacing:.2em;font-size:11px;text-transform:uppercase;color:#0b457f">Private preview</p>' +
      '<p style="max-width:420px">' + text + "</p></div></body>";
  };
  const rootOf = (host) => {
    const l = host.replace(/^www\./, "").split(".");
    const two = ["co.za", "org.za", "net.za", "co.uk", "com.au", "co.nz"];
    return l.length > 2 && two.includes(l.slice(-2).join(".")) ? l.slice(-3).join(".") : l.slice(-2).join(".");
  };
  const sha = async (s) =>
    Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  // Hide everything until both checks pass.
  document.documentElement.style.visibility = "hidden";
  (async () => {
    let ok = false;
    try { ok = location.protocol === "https:" || location.protocol === "http:" ? (await sha(rootOf(location.hostname))) === ROOT_HASH : false; } catch (e) {}
    if (!ok) return wipe("This preview only works at the address it was shared from. " + MESSAGE);
    if (Date.now() > EXPIRES) return wipe("This preview has expired. " + MESSAGE);
    document.documentElement.style.visibility = "";
  })();

  const viewId = Math.random().toString(36).slice(2, 7).toUpperCase();
  const day = new Date().toISOString().slice(0, 10);
  const line = "CONFIDENTIAL PREVIEW · " + CLIENT + " · by Mondobase · " + day + " · view " + viewId;
  const esc = line.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='560' height='300'>" +
    "<text x='0' y='170' transform='rotate(-24 280 150)' font-family='Arial' font-size='15' letter-spacing='2' fill='rgba(6,41,73,0.08)'>" + esc + "</text>" +
    "<text x='0' y='190' transform='rotate(-24 280 150)' font-family='Arial' font-size='15' letter-spacing='2' fill='rgba(255,255,255,0.1)'>" + esc + "</text></svg>";

  const css = document.createElement("style");
  css.textContent =
    "html,body{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}" +
    "input,textarea,select{-webkit-user-select:text!important;user-select:text!important}" +
    "img{-webkit-user-drag:none!important}" +
    ".pv-mark{position:fixed;inset:0;z-index:2147483000;pointer-events:none;background-repeat:repeat;background-image:url(\"data:image/svg+xml;utf8," + encodeURIComponent(svg) + "\")}" +
    ".pv-rib{position:fixed;z-index:2147483001;left:12px;bottom:12px;pointer-events:none;font:600 9px/1 Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#fff;background:rgba(6,41,73,.75);padding:7px 10px;border-radius:4px}" +
    ".pv-shield{position:fixed;inset:0;z-index:2147483002;display:none;place-items:center;text-align:center;background:#f3f5f8;font:15px/1.6 Arial,sans-serif;color:#062949;padding:24px}" +
    ".pv-shield.on{display:grid}" +
    "@media print{body *{display:none!important}body::after{content:'This preview is confidential to " + CLIENT.replace(/'/g, "") + " and Mondobase and may not be printed.';display:block;padding:40px;font:16px Arial}}";

  const mount = () => {
    document.head.appendChild(css);
    const mark = document.createElement("div"); mark.className = "pv-mark"; mark.setAttribute("aria-hidden", "true");
    const rib = document.createElement("div"); rib.className = "pv-rib"; rib.setAttribute("aria-hidden", "true");
    rib.textContent = "Mondobase concept preview · confidential";
    const shield = document.createElement("div"); shield.className = "pv-shield";
    shield.innerHTML = "<p>Confidential preview for " + CLIENT + ".<br>Click back into the page to continue.</p>";
    document.body.append(mark, rib, shield);

    const show = (on) => shield.classList.toggle("on", on);
    const isField = (t) => t && t.closest && t.closest("input,textarea,select,[contenteditable]");
    const stop = (e) => { if (!isField(e.target)) e.preventDefault(); };
    ["contextmenu", "copy", "cut", "dragstart", "selectstart"].forEach((ev) => document.addEventListener(ev, stop, true));
    const keys = (e) => {
      const k = (e.key || "").toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if ((mod && ["s", "p", "u", "c", "a", "o"].includes(k) && !isField(e.target)) || (mod && e.shiftKey && ["i", "j", "c", "k", "s", "3", "4", "5"].includes(k)) || (mod && e.altKey && ["i", "j", "c", "u"].includes(k)) || k === "f12") {
        e.preventDefault(); e.stopPropagation();
      }
      if (k === "printscreen") {
        show(true);
        try { navigator.clipboard.writeText("Screenshots of this confidential Mondobase preview are not permitted."); } catch (x) {}
        setTimeout(() => show(false), 1500);
      }
    };
    window.addEventListener("keydown", keys, true);
    window.addEventListener("keyup", keys, true);
    window.addEventListener("blur", () => show(true));
    window.addEventListener("focus", () => show(false));
    document.addEventListener("visibilitychange", () => show(document.visibilityState !== "visible"));
    // Docked developer tools shrink the viewport well below the window.
    const desktop = matchMedia("(hover:hover) and (pointer:fine)").matches;
    if (desktop) setInterval(() => {
      const open = window.outerWidth - window.innerWidth > 200 || window.outerHeight - window.innerHeight > 260;
      if (open) show(true);
    }, 800);
    // Remove the mockup's own "save" affordances if any.
    document.querySelectorAll('a[download]').forEach((a) => a.removeAttribute("download"));
  };
  // The page arrives through document.write, where DOMContentLoaded may not fire again, so wait
  // for <body> directly.
  const wait = setInterval(() => {
    if (document.body) {
      clearInterval(wait);
      mount();
    }
  }, 20);
})();
