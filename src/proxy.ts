import { type NextRequest, NextResponse } from "next/server";

import { PREVIEW_COOKIE, previewEnabled, previewExpired, verifyToken } from "@/lib/preview";

/**
 * Private preview gate. Does nothing unless PREVIEW_CODES is set.
 *
 * When it is: every page, image, media file and API call needs a valid signed preview cookie.
 * Without one, pages redirect to /preview and everything else gets 403, so a saved copy of a
 * page cannot load its images or data. The admin is closed to preview visitors unless
 * PREVIEW_ALLOW_ADMIN=true. Every response is marked noindex and not cacheable.
 */
export function proxy(request: NextRequest) {
  if (!previewEnabled()) return NextResponse.next();
  const { pathname } = request.nextUrl;

  const harden = (res: NextResponse) => {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");
    res.headers.set("Cache-Control", "private, no-store, max-age=0");
    res.headers.set("Referrer-Policy", "no-referrer");
    return res;
  };

  // The gate itself, and what it needs to draw.
  if (
    pathname === "/preview" ||
    pathname.startsWith("/preview/") ||
    pathname === "/robots.txt" ||
    pathname.startsWith("/brand/changan-logo")
  ) {
    return harden(NextResponse.next());
  }

  const admin =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/graphql");
  // Mondobase staff: the admin, and anything requested with a Payload staff session (Payload
  // still checks that session itself).
  if (
    process.env.PREVIEW_ALLOW_ADMIN === "true" &&
    (admin || request.cookies.has("payload-token"))
  ) {
    return harden(NextResponse.next());
  }

  const viewer = previewExpired() ? null : verifyToken(request.cookies.get(PREVIEW_COOKIE)?.value);
  if (viewer && !admin) return harden(NextResponse.next());

  const isPage =
    request.method === "GET" && (request.headers.get("accept") ?? "").includes("text/html");
  if (isPage && !admin) {
    const url = request.nextUrl.clone();
    url.pathname = "/preview";
    url.search = previewExpired() ? "?expired=1" : "";
    return harden(NextResponse.redirect(url));
  }
  return harden(new NextResponse("This is a private preview.", { status: 403 }));
}

export const config = {
  // Everything except Next's own compiled assets and the favicons. Brand photography in
  // /public, media uploads and the API all go through the gate.
  matcher: ["/((?!_next/static|_next/image|icon.png|apple-icon.png|favicon.ico).*)"],
};
