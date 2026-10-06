import type { MetadataRoute } from "next";

// Read at request time, so a preview deployment can switch indexing off with an env variable.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  if (process.env.PREVIEW_CODES) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${site}/sitemap.xml`,
  };
}
