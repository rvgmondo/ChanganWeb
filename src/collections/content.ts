import type { CollectionConfig } from "payload";

import { publishedOrSignedIn, signedIn } from "@/access";

export const Specials: CollectionConfig = {
  slug: "specials",
  labels: { singular: "Special", plural: "Specials" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "model", "validUntil", "published"],
  },
  access: { read: publishedOrSignedIn(), create: signedIn, update: signedIn, delete: signedIn },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "model", type: "relationship", relationTo: "models" },
    {
      name: "headline",
      type: "text",
      required: true,
      admin: { description: "e.g. From R4 999 p/m" },
    },
    { name: "details", type: "textarea" },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "validUntil", type: "date" },
    { name: "terms", type: "textarea", label: "Terms and conditions" },
    { name: "published", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};

export const Reviews: CollectionConfig = {
  slug: "reviews",
  labels: { singular: "Review", plural: "Reviews" },
  admin: {
    group: "Content",
    useAsTitle: "name",
    defaultColumns: ["name", "rating", "source", "published"],
  },
  access: { read: publishedOrSignedIn(), create: signedIn, update: signedIn, delete: signedIn },
  fields: [
    { name: "quote", type: "textarea", required: true },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "40%" } },
        { name: "suburb", type: "text", admin: { width: "30%" } },
        {
          name: "rating",
          type: "number",
          min: 1,
          max: 5,
          defaultValue: 5,
          required: true,
          admin: { width: "30%" },
        },
      ],
    },
    {
      name: "source",
      type: "select",
      defaultValue: "google",
      options: ["google", "facebook", "hellopeter", "direct"],
    },
    { name: "published", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};

export const Staff: CollectionConfig = {
  slug: "staff",
  labels: { singular: "Team member", plural: "Team" },
  defaultSort: "order",
  admin: { group: "Content", useAsTitle: "name", defaultColumns: ["name", "role", "order"] },
  access: { read: () => true, create: signedIn, update: signedIn, delete: signedIn },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", required: true },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "phone", type: "text" },
    { name: "email", type: "email" },
    { name: "order", type: "number", defaultValue: 10 },
  ],
};

/**
 * Every enquiry from the site lands here: test drives, finance pre-approvals, trade-in
 * valuations, vehicle enquiries and contact messages. Created only by server actions (which
 * validate with zod and rate limit), never by the public REST API.
 */
export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "Lead", plural: "Leads" },
  defaultSort: "-createdAt",
  admin: {
    group: "Leads",
    useAsTitle: "name",
    defaultColumns: ["name", "type", "phone", "interest", "status", "createdAt"],
    description: "Enquiries from the website. Update the status as you follow up.",
  },
  access: { read: signedIn, create: () => false, update: signedIn, delete: signedIn },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          options: [
            { label: "Test drive", value: "test-drive" },
            { label: "Finance pre-approval", value: "finance" },
            { label: "Trade-in / sell", value: "trade-in" },
            { label: "Vehicle enquiry", value: "vehicle" },
            { label: "Contact", value: "contact" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "new",
          options: [
            { label: "New", value: "new" },
            { label: "Contacted", value: "contacted" },
            { label: "Won", value: "won" },
            { label: "Lost", value: "lost" },
          ],
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "34%" } },
        { name: "phone", type: "text", required: true, admin: { width: "33%" } },
        { name: "email", type: "email", admin: { width: "33%" } },
      ],
    },
    {
      name: "interest",
      type: "text",
      admin: { description: "Model or vehicle the person asked about." },
    },
    { name: "vehicle", type: "relationship", relationTo: "vehicles" },
    { name: "preferredDate", type: "date" },
    { name: "message", type: "textarea" },
    {
      name: "details",
      type: "json",
      admin: { description: "Extra form answers (finance figures, trade-in details)." },
    },
    {
      name: "consent",
      type: "checkbox",
      required: true,
      admin: { readOnly: true, description: "Agreed to be contacted (POPIA)." },
    },
    { name: "notes", type: "textarea", label: "Internal notes" },
  ],
};
