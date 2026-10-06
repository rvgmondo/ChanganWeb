import config from "@payload-config";
import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

import {
  findViewer,
  issueToken,
  PREVIEW_COOKIE,
  previewEnabled,
  previewExpired,
} from "@/lib/preview";

/**
 * Opens the preview for one viewer. Shared links point here (GET ?code=…) and the gate form
 * posts here. A valid code sets the signed cookie and records the visit; anything else goes
 * back to the gate. Attempts are logged too, so a leaked or guessed code shows up in the admin.
 */
/** The public origin, from the proxy headers. request.url is Passenger's internal address. */
function origin(request: NextRequest): string {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return `${proto}://${host}`;
}

async function enter(request: NextRequest, code: string | null) {
  const base = new URL("/", origin(request));
  if (!previewEnabled()) return NextResponse.redirect(base, 303);

  const viewer = findViewer(code);
  const expired = previewExpired();
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "";
  const device = (request.headers.get("user-agent") ?? "").slice(0, 200);

  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "preview-visits",
      overrideAccess: true,
      data: {
        viewer: viewer?.name ?? "Unknown",
        code: (code ?? "").slice(0, 40).toUpperCase() || "(none)",
        ip,
        device,
        outcome: !viewer ? "refused" : expired ? "expired" : "granted",
      },
    });
  } catch {
    // Never block a visit because logging failed.
  }

  if (!viewer || expired) {
    const gate = new URL("/preview", origin(request));
    gate.searchParams.set(expired ? "expired" : "denied", "1");
    return NextResponse.redirect(gate, 303);
  }
  const res = NextResponse.redirect(base, 303);
  const token = issueToken(viewer.code);
  res.cookies.set(PREVIEW_COOKIE, token.value, {
    httpOnly: true,
    secure: origin(request).startsWith("https:"),
    sameSite: "lax",
    path: "/",
    maxAge: token.maxAge,
  });
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export async function GET(request: NextRequest) {
  return enter(request, request.nextUrl.searchParams.get("code"));
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  return enter(request, String(form?.get("code") ?? ""));
}
