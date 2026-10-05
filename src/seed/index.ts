/**
 * Seeds an empty database with the real Changan line-up (prices and specs from
 * changanmotors.co.za), 22 sample stock vehicles, sample reviews and the current special.
 *
 *   npm run seed            # refuses if models already exist
 *   npm run seed -- --reset # deletes seeded content first (never users or leads)
 *
 * Sample stock and reviews are illustrative and should be replaced with real data.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import config from "@payload-config";
import { getPayload } from "payload";

const dir = path.dirname(fileURLToPath(import.meta.url));
const asset = (name: string) => path.join(dir, "assets", `${name}.webp`);

const MODELS = [
  {
    key: "unis",
    name: "Uni-S",
    tagline: "Unexpected, Unmistakable and Unmatched.",
    type: "SUV",
    fuel: "Petrol",
    fromPrice: 389900,
    monthlyFrom: "From R4 999 p/m*",
    order: 1,
    specs: [
      ["138", "kW"],
      ["300", "Nm"],
      ["12.8″", "Screen"],
    ],
    colours: [
      ["Putty Grey", "#a8a29a", "c_unis"],
      ["White", "#eef0f3", "c_unis_white"],
      ["Black", "#1b1e23", "c_unis_black"],
    ],
    interior: "i_unis",
  },
  {
    key: "s07",
    name: "Deepal S07",
    tagline: "Pure electric, with up to 560 km of range.",
    type: "Electric SUV",
    fuel: "Electric",
    fromPrice: 995900,
    order: 2,
    specs: [
      ["560", "km NEDC"],
      ["80", "kWh"],
      ["35", "min charge"],
    ],
    colours: [
      ["Orange", "#ef5a24", "c_s07_orange"],
      ["Cyan", "#2f9ea3", "c_s07_cyan"],
      ["White", "#eef0f3", "c_s07_white"],
      ["Grey", "#80878f", "c_s07_gray"],
      ["Black", "#14171c", "c_s07_black"],
    ],
    interior: "i_s07",
  },
  {
    key: "hunter",
    name: "Hunter",
    tagline: "Turbodiesel or range-extended. Over 1 000 km combined.",
    type: "Bakkie",
    fuel: "Diesel · REEV",
    fromPrice: 449900,
    order: 3,
    specs: [
      ["200", "kW REEV"],
      ["470", "Nm"],
      ["1 000", "kg payload"],
    ],
    colours: [["Grey", "#8a8f97", "c_hunter"]],
  },
  {
    key: "cs75",
    name: "CS75 Pro",
    tagline: "Luxury meets function, with room for seven.",
    type: "SUV · 7 seats",
    fuel: "Petrol",
    fromPrice: 429900,
    order: 4,
    specs: [
      ["138", "kW"],
      ["300", "Nm"],
      ["7", "Seats"],
    ],
    colours: [
      ["Blue", "#8cc4df", "c_cs75"],
      ["Black", "#1b1e23", "c_cs75b"],
      ["White", "#eef0f3", "c_cs75w"],
    ],
    interior: "i_cs75",
  },
  {
    key: "alsvin",
    name: "Alsvin",
    tagline: "The smart city sedan, with a 5-year / 150 000 km warranty.",
    type: "Sedan",
    fuel: "Petrol",
    fromPrice: 249900,
    order: 5,
    specs: [
      ["78", "kW"],
      ["145", "Nm"],
      ["5 yr", "Warranty"],
    ],
    colours: [
      ["White", "#eef0f3", "c_alsvin"],
      ["Black", "#1b1e23", "c_alsvin_black"],
    ],
  },
] as const;

type Body = "SUV" | "Electric" | "Bakkie" | "Sedan";
type Fuel = "Petrol" | "Diesel" | "Electric" | "REEV";
type Row = [
  model: string,
  variant: string,
  year: number,
  km: number,
  price: number,
  body: Body,
  fuel: Fuel,
  tr: string,
  colour: string,
  featured?: boolean,
];

// Sample stock. New cars at list price from the national site; demo and used priced below list.
const STOCK: Row[] = [
  ["unis", "1.5T Luxury", 2026, 0, 469900, "SUV", "Petrol", "7-speed DCT", "White", true],
  ["s07", "RWD", 2025, 3200, 939900, "Electric", "Electric", "Automatic", "Cyan", true],
  ["hunter", "2.0T REEV 4x4", 2026, 0, 799900, "Bakkie", "REEV", "Automatic", "Grey", true],
  ["cs75", "1.5T 7-Seater", 2025, 14500, 434900, "SUV", "Petrol", "7-speed DCT", "Black", true],
  ["alsvin", "1.5 Auto CE", 2025, 21300, 229900, "Sedan", "Petrol", "5-speed DCT", "White", true],
  ["unis", "1.5T CS", 2026, 0, 389900, "SUV", "Petrol", "7-speed DCT", "Putty Grey", true],
  ["s07", "RWD", 2026, 0, 995900, "Electric", "Electric", "Automatic", "Orange", true],
  ["cs75", "1.5T", 2026, 0, 429900, "SUV", "Petrol", "7-speed DCT", "Blue", true],
  ["unis", "1.5T Elite", 2025, 8900, 444900, "SUV", "Petrol", "7-speed DCT", "Black", true],
  ["alsvin", "1.5 Auto Lux", 2026, 0, 271200, "Sedan", "Petrol", "5-speed DCT", "Black", true],
  ["hunter", "2.0TD 4x2 Double Cab", 2026, 0, 449900, "Bakkie", "Diesel", "Automatic", "Grey"],
  ["hunter", "2.0TD 4x4 Double Cab", 2025, 6800, 539900, "Bakkie", "Diesel", "Automatic", "Grey"],
  ["unis", "1.5T Luxury", 2025, 12400, 424900, "SUV", "Petrol", "7-speed DCT", "Putty Grey"],
  ["s07", "RWD", 2026, 0, 995900, "Electric", "Electric", "Automatic", "White"],
  ["s07", "RWD", 2025, 5100, 929900, "Electric", "Electric", "Automatic", "Grey"],
  ["cs75", "1.5T Elite", 2026, 0, 474900, "SUV", "Petrol", "7-speed DCT", "White"],
  ["cs75", "1.5T 7-Seater Elite", 2026, 0, 489900, "SUV", "Petrol", "7-speed DCT", "Black"],
  ["alsvin", "1.4 Manual", 2026, 0, 249900, "Sedan", "Petrol", "5-speed manual", "White"],
  ["alsvin", "1.5 Auto CE", 2024, 38600, 199900, "Sedan", "Petrol", "5-speed DCT", "Black"],
  ["unis", "1.5T CS", 2025, 17800, 359900, "SUV", "Petrol", "7-speed DCT", "White"],
  ["hunter", "2.0TD 4x4 Double Cab", 2024, 29500, 479900, "Bakkie", "Diesel", "Automatic", "Grey"],
  ["s07", "RWD", 2025, 9800, 899900, "Electric", "Electric", "Automatic", "Black"],
];

const REVIEWS = [
  [
    "Walked in for a test drive, left with a Uni-S. No pressure, just straight answers on finance.",
    "Lerato M.",
    "Brooklyn",
  ],
  [
    "The S07 handover took an hour and they set up the home charger with me. Proper service.",
    "Johan v.d. M.",
    "Waterkloof",
  ],
  [
    "Traded in my old bakkie for a Hunter. Fair valuation, done in two days.",
    "Sipho N.",
    "Silverton",
  ],
  [
    "Seven seats, all the tech, and still cheaper than what I was looking at elsewhere.",
    "Anika P.",
    "Moreleta Park",
  ],
  [
    "They WhatsApped me photos of the exact car before I drove out from Hatfield.",
    "Kabelo T.",
    "Hatfield",
  ],
  [
    "Service plan explained properly, no small print surprises. Will buy here again.",
    "Marike S.",
    "Faerie Glen",
  ],
] as const;

async function main() {
  const payload = await getPayload({ config });
  const reset = process.argv.includes("--reset");

  if (reset) {
    for (const collection of ["vehicles", "specials", "reviews", "models", "media"] as const) {
      await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true });
    }
    payload.logger.info("Removed seeded content.");
  } else {
    const existing = await payload.count({ collection: "models", overrideAccess: true });
    if (existing.totalDocs > 0) {
      payload.logger.warn("Models already exist. Run with --reset to replace seeded content.");
      process.exit(0);
    }
  }

  const users = await payload.count({ collection: "users", overrideAccess: true });
  if (users.totalDocs === 0) {
    const email = process.env.SEED_ADMIN_EMAIL || "admin@changanpta.co.za";
    const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
    await payload.create({
      collection: "users",
      data: { name: "Admin", email, password, role: "admin" },
      overrideAccess: true,
    });
    payload.logger.info(`Created admin ${email}. Change the password after first sign-in.`);
  }

  const media = new Map<string, number>();
  const upload = async (name: string, alt: string) => {
    const found = media.get(name);
    if (found) return found;
    const buffer = readFileSync(asset(name));
    const doc = await payload.create({
      collection: "media",
      data: { alt },
      file: { data: buffer, mimetype: "image/webp", name: `${name}.webp`, size: buffer.length },
      overrideAccess: true,
    });
    media.set(name, doc.id);
    return doc.id;
  };

  const modelIds = new Map<string, number>();
  const colourHex = new Map<string, string>();
  const colourCut = new Map<string, string>();
  for (const m of MODELS) {
    const colours = [];
    for (const [name, hex, cut] of m.colours) {
      colours.push({
        name,
        hex,
        cutout: await upload(cut, `Changan ${m.name} in ${name}, side view`),
      });
      colourHex.set(`${m.key}:${name}`, hex);
      colourCut.set(`${m.key}:${name}`, cut);
    }
    const doc = await payload.create({
      collection: "models",
      overrideAccess: true,
      data: {
        name: m.name,
        tagline: m.tagline,
        type: m.type,
        fuel: m.fuel,
        fromPrice: m.fromPrice,
        monthlyFrom: "monthlyFrom" in m ? m.monthlyFrom : undefined,
        order: m.order,
        specs: m.specs.map(([value, label]) => ({ value, label })),
        cutout: await upload(m.colours[0][2], `Changan ${m.name} in ${m.colours[0][0]}, side view`),
        world: await upload(`w_${m.key}`, `Changan ${m.name} on location`),
        portrait: await upload(`p_${m.key}`, `Changan ${m.name} on location, portrait`),
        interior:
          "interior" in m ? await upload(m.interior, `Changan ${m.name} interior`) : undefined,
        colours,
        published: true,
        showInHero: true,
      },
    });
    modelIds.set(m.key, doc.id);
  }

  let n = 1;
  for (const [key, variant, year, km, price, body, fuel, tr, colour, featured] of STOCK) {
    const model = MODELS.find((m) => m.key === key);
    const cut = colourCut.get(`${key}:${colour}`) ?? model?.colours[0][2] ?? "c_unis";
    await payload.create({
      collection: "vehicles",
      overrideAccess: true,
      data: {
        model: modelIds.get(key) as number,
        variant,
        year,
        mileage: km,
        condition: km === 0 ? "new" : km < 10000 ? "demo" : "used",
        price,
        body,
        fuel,
        transmission: tr,
        colour,
        colourHex: colourHex.get(`${key}:${colour}`) ?? "#c9ced6",
        stockNumber: `CPTA-${String(1000 + n).padStart(4, "0")}`,
        photos: [await upload(cut, `Changan ${model?.name} in ${colour}, side view`)],
        description: `${year} Changan ${model?.name} ${variant} in ${colour}. ${model?.tagline}`,
        status: "available",
        featured: Boolean(featured),
      },
    });
    n += 1;
  }

  for (const [quote, name, suburb] of REVIEWS) {
    await payload.create({
      collection: "reviews",
      overrideAccess: true,
      data: { quote, name, suburb, rating: 5, source: "google", published: true },
    });
  }

  await payload.create({
    collection: "specials",
    overrideAccess: true,
    data: {
      title: "Uni-S launch finance",
      model: modelIds.get("unis") as number,
      headline: "From R4 999 p/m",
      details: "Finance deals from Changan Finance, powered by WesBank.",
      terms: "T&Cs apply. Subject to credit approval.",
      published: true,
    },
  });

  payload.logger.info(
    `Seeded ${MODELS.length} models, ${STOCK.length} vehicles, ${REVIEWS.length} reviews.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
