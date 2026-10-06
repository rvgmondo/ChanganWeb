"use client";

import { useEffect, useState } from "react";

/**
 * Deterrents for the private preview. None of this can stop a determined person with a phone
 * camera; it makes casual copying awkward and makes every screenshot traceable.
 *
 *  - A faint diagonal watermark tiled over every screen, naming the client, Mondobase, the
 *    viewer's personal code and today's date. Screenshots and recordings carry it.
 *  - No right-click menu, text selection, image dragging, or Save/Print/View-source shortcuts.
 *  - Printing produces a blank "confidential" page (see the print rules in site CSS).
 *  - The page blurs when the window loses focus, which most snipping tools cause, and on the
 *    PrintScreen key, where the clipboard is overwritten with a notice.
 */
export function PreviewGuard({
  client,
  viewer,
  code,
  date,
}: {
  client: string;
  viewer: string;
  code: string;
  /** Passed from the server so the server and browser render the same watermark text. */
  date: string;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && Boolean(t.closest("input,textarea,select,[contenteditable]"));
    const stop = (e: Event) => {
      if (!isField(e.target)) e.preventDefault();
    };
    const keys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (
        (mod && ["s", "p", "u", "c", "a"].includes(k) && !isField(e.target)) ||
        (mod && e.shiftKey && ["i", "j", "c", "s", "3", "4", "5"].includes(k)) ||
        k === "f12"
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (k === "printscreen") {
        setHidden(true);
        navigator.clipboard
          ?.writeText(
            `Screenshots of this confidential Mondobase preview are not permitted. (${code})`,
          )
          .catch(() => {});
        setTimeout(() => setHidden(false), 1500);
      }
    };
    const blur = () => setHidden(true);
    const focus = () => setHidden(false);
    const vis = () => setHidden(document.visibilityState !== "visible");

    document.addEventListener("contextmenu", stop);
    document.addEventListener("copy", stop);
    document.addEventListener("cut", stop);
    document.addEventListener("dragstart", stop);
    document.addEventListener("selectstart", stop);
    window.addEventListener("keydown", keys, true);
    window.addEventListener("keyup", keys, true);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", vis);
    document.documentElement.classList.add("is-preview");
    return () => {
      document.removeEventListener("contextmenu", stop);
      document.removeEventListener("copy", stop);
      document.removeEventListener("cut", stop);
      document.removeEventListener("dragstart", stop);
      document.removeEventListener("selectstart", stop);
      window.removeEventListener("keydown", keys, true);
      window.removeEventListener("keyup", keys, true);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", vis);
      document.documentElement.classList.remove("is-preview");
    };
  }, [code]);

  const line = `CONFIDENTIAL PREVIEW · ${client} · by Mondobase · ${viewer} · ${code} · ${date}`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='560' height='300'><text x='0' y='170' transform='rotate(-24 280 150)' font-family='Arial, sans-serif' font-size='15' letter-spacing='2' fill='rgba(6,41,73,0.075)'>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text><text x='0' y='190' transform='rotate(-24 280 150)' font-family='Arial, sans-serif' font-size='15' letter-spacing='2' fill='rgba(255,255,255,0.09)'>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`;

  return (
    <>
      <div
        className="pv-mark"
        aria-hidden="true"
        style={{ backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")` }}
      />
      <div className="pv-ribbon" aria-hidden="true">
        Mondobase concept preview · confidential · {code}
      </div>
      {hidden ? (
        <div className="pv-shield" role="presentation">
          <p>
            Confidential preview for {client}.
            <br />
            Click back into the window to continue.
          </p>
        </div>
      ) : null}
      <div className="pv-print">
        This preview is confidential to {client} and Mondobase and may not be printed. ({code})
      </div>
    </>
  );
}
