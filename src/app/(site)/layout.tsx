import type { Metadata, Viewport } from "next";

import { cookies } from "next/headers";

import { Consent } from "@/components/layout/consent";
import { MotionProvider } from "@/components/layout/motion-provider";
import { PreviewGuard } from "@/components/layout/preview-guard";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDealer } from "@/lib/data";
import { changan, noto } from "@/lib/fonts";
import { PREVIEW_COOKIE, previewClient, previewEnabled, verifyToken } from "@/lib/preview";
import "./globals.css";

// Dealer details come from the CMS, so nothing under this layout is prerendered at build time
// (the build machine has an empty database).
export const dynamic = "force-dynamic";

const site = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "Changan Pretoria | New Changan Uni-S, Deepal S07, Hunter, CS75 Pro and Alsvin",
    template: "%s | Changan Pretoria",
  },
  description:
    "Changan Pretoria in Brooklyn. New and demo Changan Uni-S, Deepal S07, Hunter, CS75 Pro and Alsvin, finance through Changan Finance, trade-ins and test drives.",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "Changan Pretoria",
    images: [{ url: "/brand/cover.webp", width: 1700, height: 956 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b457f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const dealer = await getDealer();
  const viewer = previewEnabled()
    ? verifyToken((await cookies()).get(PREVIEW_COOKIE)?.value)
    : null;
  return (
    <html lang="en-ZA" className={`${changan.variable} ${noto.variable}`}>
      <body style={{ background: "var(--bg)", color: "var(--ink)" }}>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteHeader whatsapp={dealer.whatsapp} />
        <main id="main">{children}</main>
        <SiteFooter dealer={dealer} />
        <MotionProvider />
        {viewer ? (
          <PreviewGuard
            client={previewClient()}
            viewer={viewer.name}
            code={viewer.code}
            date={new Date().toISOString().slice(0, 10)}
          />
        ) : (
          <Consent />
        )}
      </body>
    </html>
  );
}
