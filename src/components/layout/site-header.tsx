"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#range", label: "Vehicles" },
  { href: "/#stock", label: "Stock" },
  { href: "/#finance", label: "Finance" },
  { href: "/#visit", label: "Trade-in" },
  { href: "/#legacy", label: "About" },
  { href: "/#visit", label: "Contact" },
];

export function SiteHeader({ whatsapp }: { whatsapp?: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <Link href="/" aria-label="Changan Pretoria home">
        {/* biome-ignore lint/performance/noImgElement: static brand asset, sized explicitly */}
        <img
          className="logo"
          src="/brand/changan-logo-blue.webp"
          alt="Changan"
          width={134}
          height={28}
        />
      </Link>
      <nav className="links" aria-label="Main">
        {LINKS.map((l) => (
          <a key={l.label} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <div className="right">
        {whatsapp ? (
          <a
            className="wa"
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener"
            aria-label="Chat on WhatsApp"
          >
            ✆
          </a>
        ) : null}
        <a className="btn sm book mag" href="/#visit">
          Book a test drive
        </a>
      </div>
    </header>
  );
}
