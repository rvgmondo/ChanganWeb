import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Private client preview.
 *
 * Switched on by setting PREVIEW_CODES, a comma-separated list of CODE:Viewer name pairs,
 * for example:  PREVIEW_CODES="CPTA-7QX2:Changan Pretoria (MD),CPTA-K9M4:Changan Pretoria (Sales)"
 * Each viewer gets their own link, /preview/enter?code=CPTA-7QX2, which sets a signed cookie.
 * Without that cookie every page, image and API call is refused (see src/proxy.ts).
 *
 * PREVIEW_EXPIRES (YYYY-MM-DD) ends every link at midnight on that date.
 * PREVIEW_CLIENT names the client on the gate and the watermark.
 */

export const PREVIEW_COOKIE = "cp_preview";

export type PreviewViewer = { code: string; name: string };

export const previewEnabled = (): boolean => Boolean(process.env.PREVIEW_CODES?.trim());
export const previewClient = (): string => process.env.PREVIEW_CLIENT || "Changan Pretoria";

export function previewCodes(): PreviewViewer[] {
  return (process.env.PREVIEW_CODES ?? "")
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [code = "", ...rest] = pair.split(":");
      return { code: code.trim().toUpperCase(), name: rest.join(":").trim() || code.trim() };
    })
    .filter((v) => v.code.length >= 4);
}

/** Midnight at the end of PREVIEW_EXPIRES (SAST), or 30 days from now when unset. */
export function previewExpiry(): number {
  const d = process.env.PREVIEW_EXPIRES;
  const t = d ? Date.parse(`${d}T23:59:59+02:00`) : Number.NaN;
  return Number.isFinite(t) ? t : Date.now() + 30 * 24 * 3600 * 1000;
}

export const previewExpired = (): boolean => Date.now() > previewExpiry();

const secret = () => process.env.PREVIEW_SECRET || process.env.PAYLOAD_SECRET || "preview";
const sign = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url");

export function findViewer(code: string | null | undefined): PreviewViewer | null {
  const c = (code ?? "").trim().toUpperCase();
  return previewCodes().find((v) => v.code === c) ?? null;
}

/** cookie = code.expiry.signature */
export function issueToken(code: string): { value: string; maxAge: number } {
  const exp = previewExpiry();
  const body = `${code}.${exp}`;
  return {
    value: `${body}.${sign(body)}`,
    maxAge: Math.max(60, Math.floor((exp - Date.now()) / 1000)),
  };
}

export function verifyToken(token: string | undefined): PreviewViewer | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [code = "", exp = "", sig = ""] = parts;
  const expected = sign(`${code}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Date.now() > Number(exp)) return null;
  // A code removed from PREVIEW_CODES is revoked immediately, even with a valid cookie.
  return findViewer(code);
}
