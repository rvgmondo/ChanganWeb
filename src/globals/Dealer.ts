import type { GlobalConfig } from "payload";

import { signedIn } from "@/access";

/** Dealership details shown in the header, footer, booking section and structured data. */
export const Dealer: GlobalConfig = {
  slug: "dealer",
  label: "Dealership details",
  admin: { group: "Settings" },
  access: { read: () => true, update: signedIn },
  fields: [
    { name: "name", type: "text", required: true, defaultValue: "Changan Pretoria" },
    {
      type: "row",
      fields: [
        {
          name: "street",
          type: "text",
          required: true,
          defaultValue: "332 Middel Street",
          admin: { width: "50%" },
        },
        {
          name: "suburb",
          type: "text",
          required: true,
          defaultValue: "Brooklyn",
          admin: { width: "25%" },
        },
        {
          name: "city",
          type: "text",
          required: true,
          defaultValue: "Pretoria",
          admin: { width: "25%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "postalCode", type: "text", defaultValue: "0181", admin: { width: "25%" } },
        { name: "latitude", type: "number", defaultValue: -25.7685, admin: { width: "25%" } },
        { name: "longitude", type: "number", defaultValue: 28.2369, admin: { width: "25%" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "phone",
          type: "text",
          required: true,
          defaultValue: "012 023 3433",
          admin: { width: "33%" },
        },
        {
          name: "email",
          type: "email",
          required: true,
          defaultValue: "info@changanpta.co.za",
          admin: { width: "33%" },
        },
        {
          name: "whatsapp",
          type: "text",
          label: "WhatsApp number",
          admin: {
            width: "33%",
            description:
              "International format, digits only, e.g. 27821234567. Leave blank to hide WhatsApp.",
          },
        },
      ],
    },
    {
      name: "hours",
      type: "array",
      label: "Trading hours",
      defaultValue: [
        { days: "Monday to Friday", time: "08:00 – 17:00" },
        { days: "Saturday", time: "08:00 – 13:00" },
        { days: "Sunday and public holidays", time: "Closed" },
      ],
      fields: [
        {
          type: "row",
          fields: [
            { name: "days", type: "text", required: true, admin: { width: "50%" } },
            { name: "time", type: "text", required: true, admin: { width: "50%" } },
          ],
        },
      ],
    },
    {
      name: "socials",
      type: "group",
      fields: [
        { name: "facebook", type: "text" },
        { name: "instagram", type: "text" },
        { name: "tiktok", type: "text" },
      ],
    },
    {
      name: "financeDefaults",
      type: "group",
      label: "Finance calculator defaults",
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "rate",
              type: "number",
              defaultValue: 11.75,
              label: "Interest rate (%)",
              admin: { width: "33%" },
            },
            {
              name: "deposit",
              type: "number",
              defaultValue: 10,
              label: "Deposit (%)",
              admin: { width: "33%" },
            },
            {
              name: "term",
              type: "number",
              defaultValue: 72,
              label: "Term (months)",
              admin: { width: "33%" },
            },
          ],
        },
      ],
    },
  ],
};
