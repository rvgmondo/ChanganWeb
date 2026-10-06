import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Two Content Security Policies, as on Rynet: the Payload admin bundles Lexical and a code
 * editor that need `eval`, so it gets `unsafe-eval` and the public site does not.
 * GA4 and Meta Pixel are allowed here but only load after POPIA consent.
 */
const cspFor = (surface: "public" | "admin") =>
  [
    "default-src 'self'",
    surface === "admin" || isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net"
      : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' https:",
    "font-src 'self' data:",
    "worker-src 'self' blob:",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    `connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.facebook.com${isDev ? " ws: http://localhost:*" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ]
    .concat(isDev ? [] : ["upgrade-insecure-requests"])
    .join("; ");

const sharedHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  // Appended to every asset URL so Cloudflare never serves a chunk from a previous build.
  deploymentId: process.env.NEXT_DEPLOYMENT_ID || "local",
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { inlineCss: true },
  images: {
    /*
     * The origin never resizes on request. On a shared CloudLinux account the optimiser
     * queued dozens of encodes and took Rynet down with 503s. Payload writes renditions once
     * at upload, and the brand photography in /public ships pre-sized as WebP.
     */
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "changansilverton.co.za" },
      { protocol: "https", hostname: "**.changansilverton.co.za" },
      ...(process.env.NEXT_PUBLIC_MEDIA_HOSTNAME
        ? [{ protocol: "https" as const, hostname: process.env.NEXT_PUBLIC_MEDIA_HOSTNAME }]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [...sharedHeaders, { key: "Content-Security-Policy", value: cspFor("admin") }],
      },
      {
        // Everything except /admin. The lookahead matters: a plain /:path* also matches the
        // admin, wins, and kills the editor with a CSP error.
        source: "/((?!admin).*)",
        headers: [...sharedHeaders, { key: "Content-Security-Policy", value: cspFor("public") }],
      },
    ];
  },
};

export default withPayload(nextConfig);
