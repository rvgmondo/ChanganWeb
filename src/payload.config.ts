import path from "node:path";
import { fileURLToPath } from "node:url";

import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";

import {
  Leads,
  PreviewVisits,
  Reviews,
  Specials,
  Staff,
  TradeInPhotos,
} from "./collections/content";
import { Media } from "./collections/Media";
import { Models } from "./collections/Models";
import { Users } from "./collections/Users";
import { Vehicles } from "./collections/Vehicles";
import { Dealer } from "./globals/Dealer";
import { migrateOnBoot } from "./lib/migrate-on-boot";
import { migrations } from "./migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Run-time origins allowed to use the session cookie, for a build served on more than one host.
const trustedOrigins = Array.from(
  new Set(
    [serverURL, process.env.SERVER_URL, ...(process.env.TRUSTED_ORIGINS ?? "").split(",")]
      .map((v) => v?.trim().replace(/\/$/, ""))
      .filter((v): v is string => Boolean(v)),
  ),
);

// Media on local disk unless Cloudflare R2 credentials are set. Shared hosting caps inodes
// long before disk, so switch to R2 before stock photography piles up.
const r2 = Boolean(
  process.env.R2_BUCKET && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY,
);

const smtp = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM || "noreply@changansilverton.co.za",
      defaultFromName: "Changan Silverton",
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  : undefined;

export default buildConfig({
  onInit: async (payload) => {
    await migrateOnBoot(payload);
  },
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: "| Changan Silverton admin",
      description: "Changan Silverton website administration",
      defaultOGImageType: "off",
    },
    avatar: "default",
    dateFormat: "d MMM yyyy, HH:mm",
  },
  collections: [
    Vehicles,
    Models,
    Specials,
    Reviews,
    Staff,
    Leads,
    TradeInPhotos,
    Media,
    Users,
    PreviewVisits,
  ],
  globals: [Dealer],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL,
  cors: trustedOrigins,
  csrf: trustedOrigins,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || "file:./changan.db" },
    // Development pushes the schema directly; production applies committed migrations on boot.
    push: process.env.NODE_ENV !== "production",
    prodMigrations: migrations,
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  email: smtp,
  sharp,
  plugins: r2
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.R2_BUCKET ?? "",
          config: {
            endpoint: process.env.R2_ENDPOINT,
            region: "auto",
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
            },
          },
        }),
      ]
    : [],
  telemetry: false,
});
