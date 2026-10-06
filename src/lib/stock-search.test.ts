import { describe, expect, it } from "vitest";

import type { VehicleView } from "./data";
import {
  applyFilters,
  editDistance,
  facets,
  matchesQuery,
  parseFilters,
  search,
  toQuery,
} from "./stock-search";

const car = (over: Partial<VehicleView>): VehicleView => ({
  id: "1",
  slug: "x",
  model: "Uni-S",
  variant: "1.5T Luxury",
  year: 2026,
  mileage: 0,
  condition: "new",
  price: 469900,
  body: "SUV",
  fuel: "Petrol",
  transmission: "7-speed DCT",
  colour: "White",
  colourHex: "#fff",
  featured: false,
  modelSlug: "uni-s",
  status: "available",
  ...over,
});

const stock = [
  car({ id: "1" }),
  car({
    id: "2",
    model: "Hunter",
    variant: "2.0TD 4x4 Double Cab",
    body: "Bakkie",
    fuel: "Diesel",
    price: 539900,
    mileage: 6800,
    condition: "demo",
    year: 2025,
  }),
  car({
    id: "3",
    model: "Deepal S07",
    variant: "RWD",
    body: "Electric",
    fuel: "Electric",
    price: 995900,
    colour: "Orange",
  }),
  car({
    id: "4",
    model: "Alsvin",
    variant: "1.5 Auto CE",
    body: "Sedan",
    price: 199900,
    mileage: 38600,
    condition: "used",
    year: 2024,
  }),
];

describe("fuzzy search", () => {
  it("tolerates typos and squashed names", () => {
    expect(matchesQuery(stock[1] as VehicleView, "hunetr")).toBe(true);
    expect(matchesQuery(stock[0] as VehicleView, "unis")).toBe(true);
    expect(matchesQuery(stock[2] as VehicleView, "deepal orange")).toBe(true);
    expect(matchesQuery(stock[2] as VehicleView, "ev")).toBe(true);
  });
  it("does not match unrelated words", () => {
    expect(matchesQuery(stock[3] as VehicleView, "bakkie")).toBe(false);
    expect(matchesQuery(stock[0] as VehicleView, "diesel")).toBe(false);
  });
  it("computes edit distance with transpositions", () => {
    expect(editDistance("hunetr", "hunter")).toBe(1);
    expect(editDistance("alsvin", "alsvin")).toBe(0);
  });
});

describe("filters", () => {
  it("parses and round-trips the URL", () => {
    const f = parseFilters({
      body: "SUV,Bakkie",
      maxPrice: "500000",
      sort: "price-asc",
      page: "2",
    });
    expect(f.body).toEqual(["SUV", "Bakkie"]);
    expect(toQuery(f)).toBe("?body=SUV%2CBakkie&maxPrice=500000&sort=price-asc&page=2");
  });
  it("ignores unknown sorts and bad numbers", () => {
    const f = parseFilters({ sort: "drop table", minPrice: "abc" });
    expect(f.sort).toBe("featured");
    expect(f.minPrice).toBeUndefined();
  });
  it("filters by price, km and body", () => {
    const f = parseFilters({ maxPrice: "550000", maxKm: "10000" });
    expect(applyFilters(stock, f).map((v) => v.id)).toEqual(["1", "2"]);
  });
  it("facets count with other filters applied", () => {
    const f = parseFilters({ body: "SUV" });
    const body = facets(stock, f).body;
    expect(body.find((b) => b.value === "Bakkie")?.count).toBe(1);
    expect(facets(stock, f).model.find((m) => m.value === "Uni-S")?.count).toBe(1);
  });
  it("sorts and paginates", () => {
    const r = search(stock, parseFilters({ sort: "price-asc" }));
    expect(r.results[0]?.id).toBe("4");
    expect(r.total).toBe(4);
  });
});
