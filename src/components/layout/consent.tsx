"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const KEY = "changan-consent";
type Choice = "accepted" | "declined" | null;

/**
 * POPIA cookie consent. GA4 and the Meta Pixel load only after "Accept"; "Decline" keeps the
 * site free of tracking. The choice is remembered in localStorage.
 */
export function Consent() {
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);
  const ga = process.env.NEXT_PUBLIC_GA4_ID;
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  useEffect(() => {
    try {
      setChoice((localStorage.getItem(KEY) as Choice) ?? null);
    } catch {
      setChoice(null);
    }
    setReady(true);
  }, []);

  const decide = (value: Exclude<Choice, null>) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    setChoice(value);
  };

  if (!ready) return null;
  return (
    <>
      {choice === "accepted" && ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      ) : null}
      {choice === "accepted" && pixel ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      ) : null}
      {choice === null ? (
        <section className="consent-bar" aria-label="Cookie consent">
          <p>
            We use cookies to understand how the site is used and to show relevant Changan offers.
            You can say no, and the site works just the same.
          </p>
          <div className="acts">
            <button type="button" className="btn acc" onClick={() => decide("accepted")}>
              Accept cookies
            </button>
            <button type="button" className="btn dec" onClick={() => decide("declined")}>
              No thanks
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
