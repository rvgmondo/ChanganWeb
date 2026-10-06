import type { Metadata } from "next";

import { changan, noto } from "@/lib/fonts";
import "../(site)/globals.css";

export const metadata: Metadata = {
  title: "Private preview",
  robots: { index: false, follow: false, nocache: true },
};

export default function GateLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${changan.variable} ${noto.variable}`}>
      <body style={{ background: "var(--bg)", color: "var(--ink)", margin: 0 }}>{children}</body>
    </html>
  );
}
