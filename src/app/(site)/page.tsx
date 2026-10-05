import { Hero } from "@/components/home/hero";
import { Range } from "@/components/home/range";
import { Finance, Inside, Legacy, Reviews } from "@/components/home/sections";
import { Stock } from "@/components/home/stock";
import { Visit } from "@/components/home/visit";
import { getHomeData } from "@/lib/data";

// Stock and prices change through the admin, so this renders per request (cache at Cloudflare).
export const dynamic = "force-dynamic";

export default async function Home() {
  const { models, stock, stockTotal, reviews, dealer } = await getHomeData();
  const fin = {
    rate: dealer.financeDefaults?.rate ?? 11.75,
    deposit: dealer.financeDefaults?.deposit ?? 10,
    term: dealer.financeDefaults?.term ?? 72,
  };
  const site = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: dealer.name,
    url: site,
    telephone: dealer.phone,
    email: dealer.email,
    image: `${site}/brand/cover.webp`,
    brand: { "@type": "Brand", name: "Changan" },
    address: {
      "@type": "PostalAddress",
      streetAddress: dealer.street,
      addressLocality: `${dealer.suburb}, ${dealer.city}`,
      postalCode: dealer.postalCode ?? undefined,
      addressRegion: "Gauteng",
      addressCountry: "ZA",
    },
    geo: dealer.latitude
      ? { "@type": "GeoCoordinates", latitude: dealer.latitude, longitude: dealer.longitude }
      : undefined,
    makesOffer: models.map((m) => ({
      "@type": "Offer",
      priceCurrency: "ZAR",
      price: m.fromPrice,
      itemOffered: {
        "@type": "Car",
        name: `Changan ${m.name}`,
        brand: { "@type": "Brand", name: "Changan" },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD; "<" is escaped so it cannot close the script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero models={models} />
      <Range models={models} />
      <Stock stock={stock} total={stockTotal} rate={fin.rate} />
      <Inside
        model={
          models.find((m) => m.interior && /uni-s/i.test(m.name)) ?? models.find((m) => m.interior)
        }
      />
      <Finance models={models} defaults={fin} />
      <Legacy />
      <Reviews reviews={reviews} />
      <Visit dealer={dealer} models={models.map((m) => m.name)} />
    </>
  );
}
