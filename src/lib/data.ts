import "server-only";

import config from "@payload-config";
import { getPayload } from "payload";

import type { Dealer, Media, Model, Review, Vehicle } from "@/payload-types";

/** Plain, serialisable shapes handed to client components. */
export type Img = { url: string; width?: number; height?: number; alt: string };
export type ModelView = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  type: string;
  fuel: string;
  fromPrice: number;
  monthlyFrom?: string;
  specs: { value: string; label: string }[];
  cutout: Img;
  world: Img;
  portrait: Img;
  interior?: Img;
  colours: { name: string; hex: string; cutout?: Img }[];
};
export type VehicleView = {
  id: string;
  slug: string;
  model: string;
  variant: string;
  year: number;
  mileage: number;
  condition: "new" | "demo" | "used";
  price: number;
  body: string;
  fuel: string;
  transmission: string;
  colour: string;
  colourHex: string;
  photo?: Img;
  featured: boolean;
  modelSlug: string;
  stockNumber?: string;
  status: "available" | "reserved" | "sold";
};
export type VehicleDetail = VehicleView & {
  photos: Img[];
  description?: string;
  features: string[];
  title: string;
};
export type ReviewView = {
  id: string;
  quote: string;
  name: string;
  suburb?: string;
  rating: number;
};

/** Picks the smallest stored rendition at least `want` pixels wide, else the original. */
export function img(
  media: Media | number | string | null | undefined,
  want = 1600,
): Img | undefined {
  if (!media || typeof media !== "object" || !media.url) return undefined;
  const sizes = Object.values(media.sizes ?? {}).filter(
    (s): s is { url: string; width: number; height: number } => Boolean(s?.url && s.width),
  );
  const fit = sizes.filter((s) => s.width >= want).sort((a, b) => a.width - b.width)[0];
  const chosen = fit ?? {
    url: media.url,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
  };
  return {
    url: chosen.url,
    width: chosen.width ?? undefined,
    height: chosen.height ?? undefined,
    alt: media.alt,
  };
}

const toModel = (m: Model): ModelView | null => {
  const cutout = img(m.cutout, 1200);
  const world = img(m.world, 1600);
  const portrait = img(m.portrait, 800);
  if (!cutout || !world || !portrait) return null;
  return {
    id: String(m.id),
    name: m.name,
    slug: m.slug ?? String(m.id),
    tagline: m.tagline,
    type: m.type,
    fuel: m.fuel,
    fromPrice: m.fromPrice,
    monthlyFrom: m.monthlyFrom ?? undefined,
    specs: (m.specs ?? []).map((s) => ({ value: s.value, label: s.label })),
    cutout,
    world,
    portrait,
    interior: img(m.interior, 1600),
    colours: (m.colours ?? []).map((c) => ({
      name: c.name,
      hex: c.hex,
      cutout: img(c.cutout, 1200),
    })),
  };
};

const toVehicle = (v: Vehicle): VehicleView => ({
  id: String(v.id),
  slug: v.slug ?? String(v.id),
  model: typeof v.model === "object" && v.model ? v.model.name : "",
  variant: v.variant,
  year: v.year,
  mileage: v.mileage,
  condition: v.condition,
  price: v.price,
  body: v.body,
  fuel: v.fuel,
  transmission: v.transmission,
  colour: v.colour,
  colourHex: v.colourHex ?? "#c9ced6",
  photo: img(Array.isArray(v.photos) ? v.photos[0] : undefined, 800),
  featured: Boolean(v.featured),
  modelSlug: typeof v.model === "object" && v.model ? (v.model.slug ?? "") : "",
  stockNumber: v.stockNumber ?? undefined,
  status: v.status,
});

const toDetail = (v: Vehicle): VehicleDetail => ({
  ...toVehicle(v),
  title: v.title ?? "",
  photos: (Array.isArray(v.photos) ? v.photos : [])
    .map((p) => img(p, 1600))
    .filter((p): p is Img => Boolean(p)),
  description: v.description ?? undefined,
  features: (v.features ?? []).map((f) => f.feature),
});

const AVAILABLE = { status: { not_equals: "sold" } } as const;

/** Every car on the site. Stock is a few hundred at most, so search and facets run in memory. */
export async function getAllStock(): Promise<VehicleView[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "vehicles",
    where: AVAILABLE,
    sort: ["-featured", "-updatedAt"],
    depth: 1,
    limit: 1000,
    pagination: false,
  });
  return res.docs.map(toVehicle);
}

export async function getVehicle(slug: string): Promise<VehicleDetail | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "vehicles",
    where: { and: [{ slug: { equals: slug } }, AVAILABLE] },
    depth: 1,
    limit: 1,
  });
  const v = res.docs[0];
  return v ? toDetail(v) : null;
}

export async function getModels(): Promise<ModelView[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "models",
    where: { published: { equals: true } },
    sort: "order",
    depth: 1,
    limit: 50,
  });
  return res.docs.map(toModel).filter((m): m is ModelView => m !== null);
}

export async function getModel(slug: string): Promise<ModelView | null> {
  return (await getModels()).find((m) => m.slug === slug) ?? null;
}

export async function getHomeData() {
  const payload = await getPayload({ config });
  const [models, featured, stockCount, reviews, dealer] = await Promise.all([
    payload.find({
      collection: "models",
      where: { published: { equals: true } },
      sort: "order",
      depth: 1,
      limit: 20,
    }),
    payload.find({
      collection: "vehicles",
      where: { status: { not_equals: "sold" } },
      sort: ["-featured", "-updatedAt"],
      depth: 1,
      limit: 10,
    }),
    payload.count({ collection: "vehicles", where: { status: { not_equals: "sold" } } }),
    payload.find({
      collection: "reviews",
      where: { published: { equals: true } },
      limit: 12,
      depth: 0,
    }),
    payload.findGlobal({ slug: "dealer", depth: 0 }),
  ]);
  return {
    models: models.docs.map(toModel).filter((m): m is ModelView => m !== null),
    stock: featured.docs.map(toVehicle),
    stockTotal: stockCount.totalDocs,
    reviews: reviews.docs.map(
      (r: Review): ReviewView => ({
        id: String(r.id),
        quote: r.quote,
        name: r.name,
        suburb: r.suburb ?? undefined,
        rating: r.rating,
      }),
    ),
    dealer: dealer as Dealer,
  };
}

export async function getDealer(): Promise<Dealer> {
  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "dealer", depth: 0 });
}
