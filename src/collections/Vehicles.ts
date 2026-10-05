import type { CollectionConfig } from "payload";

import { signedIn } from "@/access";
import { slugify } from "@/lib/slug";

export const BODY_TYPES = ["SUV", "Electric", "Bakkie", "Sedan"] as const;
export const FUELS = ["Petrol", "Diesel", "Electric", "REEV"] as const;

/**
 * Stock on the floor. Staff add a car, upload photos and publish; "Mark sold" takes it off the
 * site. Sold cars stay in the database for reporting and are hidden from the public.
 */
export const Vehicles: CollectionConfig = {
  slug: "vehicles",
  labels: { singular: "Vehicle", plural: "Stock" },
  defaultSort: "-createdAt",
  admin: {
    group: "Stock",
    useAsTitle: "title",
    defaultColumns: ["title", "price", "mileage", "status", "featured", "updatedAt"],
    listSearchableFields: ["title", "stockNumber", "variant", "colour"],
    description: "Cars for sale. Set the status to Sold to take a car off the website.",
  },
  access: {
    read: ({ req }) => (req.user ? true : { status: { not_equals: "sold" } }),
    create: signedIn,
    update: signedIn,
    delete: signedIn,
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // The title and slug are built from the facts, so staff never type them twice.
        let modelName = "";
        if (data.model) {
          const id = typeof data.model === "object" ? data.model.id : data.model;
          const model = await req.payload
            .findByID({ collection: "models", id, depth: 0, req })
            .catch(() => null);
          modelName = model?.name ?? "";
        }
        data.title = [data.year, "Changan", modelName, data.variant].filter(Boolean).join(" ");
        if (!data.slug) data.slug = slugify(`${data.title} ${data.stockNumber ?? ""}`);
        return data;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      admin: { readOnly: true, description: "Built automatically from year, model and variant." },
    },
    {
      type: "row",
      fields: [
        {
          name: "model",
          type: "relationship",
          relationTo: "models",
          required: true,
          admin: { width: "50%" },
        },
        {
          name: "variant",
          type: "text",
          required: true,
          admin: { width: "50%", description: "e.g. 1.5T Luxury" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "year",
          type: "number",
          required: true,
          min: 2015,
          max: 2030,
          admin: { width: "25%" },
        },
        {
          name: "mileage",
          type: "number",
          required: true,
          defaultValue: 0,
          min: 0,
          label: "Mileage (km)",
          admin: { width: "25%" },
        },
        {
          name: "condition",
          type: "select",
          required: true,
          defaultValue: "new",
          options: [
            { label: "New", value: "new" },
            { label: "Demo", value: "demo" },
            { label: "Used", value: "used" },
          ],
          admin: { width: "25%" },
        },
        {
          name: "price",
          type: "number",
          required: true,
          min: 0,
          label: "Price (R, incl. VAT)",
          admin: { width: "25%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "body",
          type: "select",
          required: true,
          options: [...BODY_TYPES],
          admin: { width: "25%" },
        },
        {
          name: "fuel",
          type: "select",
          required: true,
          options: [...FUELS],
          admin: { width: "25%" },
        },
        {
          name: "transmission",
          type: "text",
          required: true,
          defaultValue: "Automatic",
          admin: { width: "25%" },
        },
        { name: "stockNumber", type: "text", admin: { width: "25%" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "colour", type: "text", required: true, admin: { width: "50%" } },
        {
          name: "colourHex",
          type: "text",
          defaultValue: "#c9ced6",
          label: "Colour swatch",
          admin: { width: "50%", description: "#RRGGBB, used to tint the stock card." },
        },
      ],
    },
    {
      name: "photos",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      required: true,
      admin: {
        description:
          "The first photo is the card image. A transparent side-profile cut-out looks best.",
      },
    },
    { name: "description", type: "textarea" },
    {
      name: "features",
      type: "array",
      fields: [{ name: "feature", type: "text", required: true }],
    },
    { name: "slug", type: "text", unique: true, index: true, admin: { position: "sidebar" } },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "available",
      index: true,
      options: [
        { label: "Available", value: "available" },
        { label: "Reserved", value: "reserved" },
        { label: "Sold (hidden from site)", value: "sold" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      label: "Feature on home page",
      admin: { position: "sidebar" },
    },
  ],
};
