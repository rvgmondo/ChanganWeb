"use client";

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";

import { prefersReducedMotion } from "@/components/layout/motion-provider";
import type { VehicleView } from "@/lib/data";
import { km, rand } from "@/lib/format";
import { type Facet, type Filters, type SortKey, toQuery } from "@/lib/stock-search";

import { VehicleCard } from "./vehicle-card";

gsap.registerPlugin(Flip);

type Props = {
  filters: Filters;
  results: VehicleView[];
  total: number;
  page: number;
  pages: number;
  facets: Record<"model" | "body" | "fuel" | "condition" | "transmission", Facet[]>;
  priceRange: readonly [number, number];
  rate: number;
};

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "year-desc": "Newest first",
  "km-asc": "Lowest mileage",
};
const PRICE_STEPS = [250000, 300000, 400000, 500000, 600000, 800000, 1000000];
const KM_STEPS = [0, 5000, 10000, 20000, 50000];
const SAVED_KEY = "changan-saved";

/**
 * Filters and results for /stock. Every change is written to the URL (shareable, back button
 * works) and the server answers with the new results; GSAP Flip carries the cards that stay
 * from their old positions to their new ones.
 */
export function StockBrowser(props: Props) {
  const { filters, results, total, page, pages, facets, rate } = props;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q);
  const [drawer, setDrawer] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  useEffect(() => {
    try {
      setSaved(new Set(JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]")));
    } catch {}
  }, []);
  const toggleSave = (id: string) =>
    setSaved((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });

  const go = (patch: Partial<Filters>) => {
    const next = { ...filters, page: 1, ...patch };
    if (gridRef.current && !prefersReducedMotion()) {
      flipState.current = Flip.getState(gridRef.current.querySelectorAll(".card"));
    }
    startTransition(() => router.replace(`${pathname}${toQuery(next)}`, { scroll: false }));
  };

  // Debounced search as you type.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only the query text should trigger this
  useEffect(() => {
    if (q === filters.q) return;
    const t = setTimeout(() => go({ q }), 280);
    return () => clearTimeout(t);
  }, [q]);

  // FLIP the cards once the new results are in the DOM.
  const ids = results.map((r) => r.id).join(",");
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the result set changes
  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state || !gridRef.current) return;
    flipState.current = null;
    Flip.from(state, {
      targets: gridRef.current.querySelectorAll(".card"),
      duration: 0.75,
      ease: "expo.out",
      absolute: false,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.88, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.03 },
        ),
    });
  }, [ids, filters.view]);

  const toggle = (key: "model" | "body" | "fuel" | "condition" | "transmission", value: string) => {
    const cur = filters[key];
    go({ [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] });
  };

  const active =
    filters.model.length +
    filters.body.length +
    filters.fuel.length +
    filters.condition.length +
    filters.transmission.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.minYear ? 1 : 0) +
    (filters.maxKm !== undefined ? 1 : 0);

  const group = (key: "model" | "body" | "fuel" | "condition" | "transmission", title: string) => (
    <fieldset className="fgroup">
      <legend>{title}</legend>
      {facets[key].map((f) => (
        <label
          key={f.value}
          className={`fcheck${f.count === 0 && !filters[key].includes(f.value) ? " zero" : ""}`}
        >
          <input
            type="checkbox"
            checked={filters[key].includes(f.value)}
            onChange={() => toggle(key, f.value)}
          />
          <span>{f.label}</span>
          <b>{f.count}</b>
        </label>
      ))}
    </fieldset>
  );

  return (
    <div className="sb wrap" data-pending={pending ? "" : undefined}>
      <div className="sb-bar">
        <label className="sb-search">
          <span className="sr-only">Search stock</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: Hunter 4x4, white Uni-S, electric…"
          />
        </label>
        <button
          type="button"
          className="btn ghost sb-filters-btn"
          onClick={() => setDrawer(true)}
          aria-expanded={drawer}
          aria-controls="sb-rail"
        >
          Filters{active ? ` (${active})` : ""}
        </button>
        <label className="sb-sort">
          <span className="lab">Sort</span>
          <select value={filters.sort} onChange={(e) => go({ sort: e.target.value as SortKey })}>
            {Object.entries(SORT_LABELS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="sb-view">
          <legend className="sr-only">Layout</legend>
          <button
            type="button"
            aria-pressed={filters.view === "grid"}
            onClick={() => go({ view: "grid", page })}
            aria-label="Grid view"
          >
            ▦
          </button>
          <button
            type="button"
            aria-pressed={filters.view === "list"}
            onClick={() => go({ view: "list", page })}
            aria-label="List view"
          >
            ☰
          </button>
        </fieldset>
      </div>

      <div className="sb-body">
        <aside id="sb-rail" className={`sb-rail${drawer ? " open" : ""}`} aria-label="Filters">
          <div className="sb-rail-head">
            <b>Filters</b>
            <button
              type="button"
              className="x"
              onClick={() => setDrawer(false)}
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>
          {group("model", "Model")}
          {group("body", "Body type")}
          {group("fuel", "Fuel")}
          {group("condition", "Condition")}
          {group("transmission", "Transmission")}
          <fieldset className="fgroup">
            <legend>Price</legend>
            <div className="frow">
              <select
                aria-label="Minimum price"
                value={filters.minPrice ?? ""}
                onChange={(e) => go({ minPrice: Number(e.target.value) || undefined })}
              >
                <option value="">Any min</option>
                {PRICE_STEPS.map((p) => (
                  <option key={p} value={p}>
                    {rand(p)}
                  </option>
                ))}
              </select>
              <select
                aria-label="Maximum price"
                value={filters.maxPrice ?? ""}
                onChange={(e) => go({ maxPrice: Number(e.target.value) || undefined })}
              >
                <option value="">Any max</option>
                {PRICE_STEPS.map((p) => (
                  <option key={p} value={p}>
                    {rand(p)}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>
          <fieldset className="fgroup">
            <legend>Year and mileage</legend>
            <div className="frow">
              <select
                aria-label="Minimum year"
                value={filters.minYear ?? ""}
                onChange={(e) => go({ minYear: Number(e.target.value) || undefined })}
              >
                <option value="">Any year</option>
                {[2026, 2025, 2024, 2023].map((y) => (
                  <option key={y} value={y}>
                    {y} or newer
                  </option>
                ))}
              </select>
              <select
                aria-label="Maximum mileage"
                value={filters.maxKm ?? ""}
                onChange={(e) =>
                  go({ maxKm: e.target.value === "" ? undefined : Number(e.target.value) || 1 })
                }
              >
                <option value="">Any km</option>
                {KM_STEPS.map((k) => (
                  <option key={k} value={k || 1}>
                    {k === 0 ? "New only (0 km)" : `Up to ${km(k)}`}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>
          <div className="sb-rail-foot">
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => {
                setQ("");
                go({
                  q: "",
                  model: [],
                  body: [],
                  fuel: [],
                  condition: [],
                  transmission: [],
                  minPrice: undefined,
                  maxPrice: undefined,
                  minYear: undefined,
                  maxKm: undefined,
                });
              }}
            >
              Clear all
            </button>
            <button type="button" className="btn pri sm" onClick={() => setDrawer(false)}>
              Show {total} cars
            </button>
          </div>
        </aside>
        {drawer ? (
          <button
            type="button"
            className="sb-scrim"
            aria-label="Close filters"
            onClick={() => setDrawer(false)}
          />
        ) : null}

        <div className="sb-main">
          <p className="sb-count" aria-live="polite">
            <b>{total}</b> {total === 1 ? "car" : "cars"}{" "}
            {filters.q ? <>matching &ldquo;{filters.q}&rdquo;</> : "in stock"}
            {saved.size ? <span className="sb-saved"> · {saved.size} saved</span> : null}
          </p>
          {results.length ? (
            <div className={`grid${filters.view === "list" ? " is-list" : ""}`} ref={gridRef}>
              {results.map((v) => (
                <VehicleCard
                  key={v.id}
                  v={v}
                  rate={rate}
                  layout={filters.view}
                  saved={saved.has(v.id)}
                  onSave={toggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="sb-empty">
              <h2>No cars match those filters.</h2>
              <p>Try removing a filter, or tell us what you want and we&apos;ll find it.</p>
              <a className="btn pri" href="/contact">
                Ask us to find it <i>→</i>
              </a>
            </div>
          )}
          {pages > 1 ? (
            <nav className="pager" aria-label="Pages">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === page ? "page" : undefined}
                  onClick={() => go({ page: n })}
                >
                  {n}
                </button>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
