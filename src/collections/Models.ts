import type { CollectionConfig } from "payload";

import { publishedOrSignedIn, signedIn } from "@/access";
import { slugField } from "@/lib/slug";

/** The new Changan range: one record per model line (Uni-S, Deepal S07, Hunter, CS75 Pro, Alsvin). */
export const Models: CollectionConfig = {
  slug: "models",
  labels: { singular: "Model", plural: "Range (models)" },
  defaultSort: "order",
  admin: {
    group: "Stock",
    useAsTitle: "name",
    defaultColumns: ["name", "type", "fromPrice", "published", "order"],
    description: "The new-vehicle range. These drive the home page hero and range sections.",
  },
  access: { read: publishedOrSignedIn(), create: signedIn, update: signedIn, delete: signedIn },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "50%" } },
        slugField("name"),
      ],
    },
    {
      name: "tagline",
      type: "text",
      required: true,
      admin: { description: "One line, shown under the name." },
    },
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "text",
          required: true,
          admin: { width: "33%", description: "e.g. SUV, Bakkie, Sedan" },
        },
        {
          name: "fuel",
          type: "text",
          required: true,
          admin: { width: "33%", description: "e.g. Petrol, Electric, Diesel · REEV" },
        },
        {
          name: "order",
          type: "number",
          defaultValue: 10,
          admin: { width: "33%", description: "Lower shows first" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "fromPrice",
          type: "number",
          required: true,
          min: 0,
          label: "From price (R, incl. VAT)",
          admin: { width: "50%" },
        },
        {
          name: "monthlyFrom",
          type: "text",
          label: "Monthly line (optional)",
          admin: { width: "50%", description: "e.g. From R4 999 p/m*" },
        },
      ],
    },
    {
      name: "specs",
      type: "array",
      minRows: 1,
      maxRows: 4,
      labels: { singular: "Headline spec", plural: "Headline specs" },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "value",
              type: "text",
              required: true,
              admin: { width: "40%", description: "e.g. 138" },
            },
            {
              name: "label",
              type: "text",
              required: true,
              admin: { width: "60%", description: "e.g. kW" },
            },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Imagery",
      fields: [
        {
          name: "cutout",
          type: "upload",
          relationTo: "media",
          required: true,
          admin: { description: "Side-profile car on a transparent background, facing left." },
        },
        {
          name: "world",
          type: "upload",
          relationTo: "media",
          required: true,
          label: "Landscape world photo",
          admin: {
            description:
              "Wide lifestyle photo (about 2.2:1). Used by the glass-slat hero and the range.",
          },
        },
        {
          name: "portrait",
          type: "upload",
          relationTo: "media",
          required: true,
          label: "Portrait world photo",
          admin: { description: "Tall version for phones (about 2:3)." },
        },
        {
          name: "interior",
          type: "upload",
          relationTo: "media",
          label: "Interior photo (optional)",
        },
      ],
    },
    {
      name: "colours",
      type: "array",
      labels: { singular: "Colour", plural: "Colours" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "name", type: "text", required: true, admin: { width: "40%" } },
            {
              name: "hex",
              type: "text",
              required: true,
              admin: { width: "20%", description: "#RRGGBB" },
            },
            { name: "cutout", type: "upload", relationTo: "media", admin: { width: "40%" } },
          ],
        },
      ],
    },
    { name: "published", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
    {
      name: "showInHero",
      type: "checkbox",
      defaultValue: true,
      label: "Show in home page hero",
      admin: { position: "sidebar" },
    },
  ],
};
