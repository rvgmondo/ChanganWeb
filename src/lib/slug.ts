import type { Field } from "payload";

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** A unique, URL-safe slug, filled from another field when left blank. */
export const slugField = (from: string): Field => ({
  name: "slug",
  type: "text",
  unique: true,
  index: true,
  admin: { width: "50%", description: "Web address part. Leave blank to fill automatically." },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === "string" && value.trim()) return slugify(value);
        const source = data?.[from];
        return typeof source === "string" ? slugify(source) : value;
      },
    ],
  },
});
