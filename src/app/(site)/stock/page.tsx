import type { Metadata } from "next";

import { PageHero } from "@/components/ui/page-hero";
import { StockBrowser } from "@/components/vehicles/stock-browser";
import { getAllStock, getDealer } from "@/lib/data";
import { parseFilters, search } from "@/lib/stock-search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New and demo Changan stock in Pretoria",
  description:
    "Search every Changan in stock at Changan Silverton: Uni-S, Deepal S07, Hunter, CS75 Pro and Alsvin. Filter by model, price, year and mileage.",
  alternates: { canonical: "/stock" },
};

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, all, dealer] = await Promise.all([searchParams, getAllStock(), getDealer()]);
  const filters = parseFilters(params);
  const r = search(all, filters);
  return (
    <>
      <PageHero
        eyebrow={`${all.length} cars at ${dealer.name}`}
        title={
          <>
            In stock.
            <br />
            Ready to drive.
          </>
        }
        lead="New and demo Changans on the floor in Silverton today. Search by name, filter by budget, and save the ones you like."
        crumbs={[{ href: "/stock", label: "Stock" }]}
        images={[
          "/brand/l_unis_walk.webp",
          "/brand/l_hunter_dust.webp",
          "/brand/l_s07_rear.webp",
          "/brand/l_alsvin.webp",
        ]}
      />
      <StockBrowser
        filters={filters}
        results={r.results}
        total={r.total}
        page={r.page}
        pages={r.pages}
        facets={r.facets}
        priceRange={r.priceRange}
        rate={dealer.financeDefaults?.rate ?? 11.75}
      />
    </>
  );
}
