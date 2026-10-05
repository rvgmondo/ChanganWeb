import type { CollectionConfig } from "payload";

import { isAdmin, signedIn } from "@/access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Staff login", plural: "Staff logins" },
  auth: { maxLoginAttempts: 5, lockTime: 15 * 60 * 1000, tokenExpiration: 60 * 60 * 8 },
  admin: { useAsTitle: "name", group: "Settings", defaultColumns: ["name", "email", "role"] },
  access: {
    read: signedIn,
    create: isAdmin,
    update: ({ req, id }) => req.user?.role === "admin" || req.user?.id === id,
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "sales",
      options: [
        { label: "Admin (everything, including logins)", value: "admin" },
        { label: "Sales (stock, content and leads)", value: "sales" },
      ],
      access: { update: ({ req }) => req.user?.role === "admin" },
    },
  ],
};
