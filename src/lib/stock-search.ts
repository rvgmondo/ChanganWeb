import type { VehicleView } from "./data";

/**
 * Inventory search, filters, sorting and pagination as pure functions.
 *
 * A single dealer carries a few hundred cars at most, so the whole set is loaded once per
 * request and filtered in memory. That gives instant, typo-tolerant search ("hunetr", "unis",
 * "deepal s7") without running Meilisearch, which a shared cPanel account cannot host.
 */

export type SortKey = "featured" | "price-asc" | "price-desc" | "year-desc" | "km-asc";

export type Filters = {
  q: string;
  model: string[];
  body: string[];
  fuel: string[];
  condition: string[];
  transmission: string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxKm?: number;
  sort: SortKey;
  view: "grid" | "list";
  page: number;
};

export const PAGE_SIZE = 12;
const SORTS: SortKey[] = ["featured", "price-asc", "price-desc", "year-desc", "km-asc"];

type Params = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined): string[] =>
  (Array.isArray(v) ? v : v ? v.split(",") : []).map((s) => s.trim()).filter(Boolean);
const num = (v: string | string[] | undefined): number | undefined => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function parseFilters(params: Params): Filters {
  const sort = String(params.sort ?? "featured") as SortKey;
  return {
    q: String(params.q ?? "").slice(0, 80),
    model: list(params.model),
    body: list(params.body),
    fuel: list(params.fuel),
    condition: list(params.condition),
    transmission: list(params.transmission),
    minPrice: num(params.minPrice),
    maxPrice: num(params.maxPrice),
    minYear: num(params.minYear),
    maxKm: num(params.maxKm),
    sort: SORTS.includes(sort) ? sort : "featured",
    view: params.view === "list" ? "list" : "grid",
    page: Math.max(1, Math.floor(num(params.page) ?? 1)),
  };
}

/** Back to a query string, omitting defaults so URLs stay short and shareable. */
export function toQuery(f: Partial<Filters>): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  for (const k of ["model", "body", "fuel", "condition", "transmission"] as const) {
    const v = f[k];
    if (v?.length) p.set(k, v.join(","));
  }
  for (const k of ["minPrice", "maxPrice", "minYear", "maxKm"] as const) {
    const v = f[k];
    if (v) p.set(k, String(v));
  }
  if (f.sort && f.sort !== "featured") p.set("sort", f.sort);
  if (f.view === "list") p.set("view", "list");
  if (f.page && f.page > 1) p.set("page", String(f.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/* ---------------------------------------------------------------- fuzzy text match */

const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const ALIASES: Record<string, string> = {
  ev: "electric",
  bev: "electric",
  ute: "bakkie",
  pickup: "bakkie",
  auto: "automatic",
  manual: "manual",
  "7seater": "7",
  seven: "7",
};

/** Damerau–Levenshtein distance (optimal string alignment), capped for speed. */
export function editDistance(a: string, b: string, cap = 3): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array(b.length).fill(0),
  ]);
  for (let j = 1; j <= b.length; j++) (d[0] as number[])[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const row = d[i] as number[];
    const prev = d[i - 1] as number[];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(
        (prev[j] as number) + 1,
        (row[j - 1] as number) + 1,
        (prev[j - 1] as number) + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        row[j] = Math.min(row[j] as number, ((d[i - 2] as number[])[j - 2] as number) + 1);
      }
    }
  }
  return (d[a.length] as number[])[b.length] as number;
}

const haystack = (v: VehicleView): string[] => {
  const words =
    `${v.model} ${v.variant} ${v.colour} ${v.body} ${v.fuel} ${v.transmission} ${v.year} ${v.condition} ${v.stockNumber ?? ""} changan`
      .toLowerCase()
      .split(/[\s·/,-]+/)
      .filter(Boolean);
  return [...words, compact(v.model), compact(`${v.model}${v.variant}`)];
};

const tokenMatches = (token: string, words: string[]): boolean => {
  const t = ALIASES[token] ?? token;
  const tol = t.length >= 7 ? 2 : t.length >= 4 ? 1 : 0;
  return words.some(
    (w) =>
      w.startsWith(t) ||
      (tol > 0 &&
        editDistance(t, w.slice(0, Math.max(t.length, Math.min(w.length, t.length + 1)))) <= tol) ||
      (tol > 0 && editDistance(t, w) <= tol),
  );
};

export function matchesQuery(v: VehicleView, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  const words = haystack(v);
  // "unis", "deepals07": also try the whole query squashed against squashed model names.
  const squashed = compact(query);
  if (
    squashed.length >= 3 &&
    words.some(
      (w) => w.startsWith(squashed) || (squashed.length >= 4 && editDistance(squashed, w) <= 1),
    )
  )
    return true;
  return query
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .every((t) => tokenMatches(t, words));
}

/* ---------------------------------------------------------------- filter, facet, sort */

const inList = (val: string, sel: string[]) => sel.length === 0 || sel.includes(val);

export function applyFilters(
  all: VehicleView[],
  f: Filters,
  except?: keyof Filters,
): VehicleView[] {
  return all.filter(
    (v) =>
      matchesQuery(v, f.q) &&
      (except === "model" || inList(v.model, f.model)) &&
      (except === "body" || inList(v.body, f.body)) &&
      (except === "fuel" || inList(v.fuel, f.fuel)) &&
      (except === "condition" || inList(v.condition, f.condition)) &&
      (except === "transmission" || inList(v.transmission, f.transmission)) &&
      (!f.minPrice || v.price >= f.minPrice) &&
      (!f.maxPrice || v.price <= f.maxPrice) &&
      (!f.minYear || v.year >= f.minYear) &&
      (!f.maxKm || v.mileage <= f.maxKm),
  );
}

export type Facet = { value: string; label: string; count: number };

/** Counts for each option, computed with every OTHER filter applied (standard faceting). */
export function facets(
  all: VehicleView[],
  f: Filters,
): Record<"model" | "body" | "fuel" | "condition" | "transmission", Facet[]> {
  const build = (
    key: "model" | "body" | "fuel" | "condition" | "transmission",
    label = (s: string) => s,
  ) => {
    const base = applyFilters(all, f, key);
    const values = Array.from(new Set(all.map((v) => v[key]))).sort();
    return values.map((value) => ({
      value,
      label: label(value),
      count: base.filter((v) => v[key] === value).length,
    }));
  };
  return {
    model: build("model"),
    body: build("body"),
    fuel: build("fuel"),
    condition: build("condition", (s) => ({ new: "New", demo: "Demo", used: "Used" })[s] ?? s),
    transmission: build("transmission"),
  };
}

export function sortStock(list: VehicleView[], sort: SortKey): VehicleView[] {
  const out = [...list];
  if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
  if (sort === "year-desc") out.sort((a, b) => b.year - a.year || a.mileage - b.mileage);
  if (sort === "km-asc") out.sort((a, b) => a.mileage - b.mileage);
  if (sort === "featured") out.sort((a, b) => Number(b.featured) - Number(a.featured));
  return out;
}

export function search(all: VehicleView[], f: Filters) {
  const matched = sortStock(applyFilters(all, f), f.sort);
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const page = Math.min(f.page, pages);
  return {
    total: matched.length,
    page,
    pages,
    results: matched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    facets: facets(all, f),
    priceRange: [
      Math.min(...all.map((v) => v.price)),
      Math.max(...all.map((v) => v.price)),
    ] as const,
  };
}
