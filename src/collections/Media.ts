import type { CollectionConfig } from "payload";

import { signedIn } from "@/access";

/**
 * Photos and files. Renditions are written ONCE at upload, because the cPanel origin must
 * never resize on request (see next.config.ts). Width-only sizes keep the aspect ratio, so
 * transparent car cut-outs are never cropped. Uploads are re-encoded through sharp, which
 * strips EXIF (including the GPS position of a phone photo taken on the forecourt).
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Photo", plural: "Photos" },
  defaultSort: "-createdAt",
  admin: { group: "Content", defaultColumns: ["filename", "alt", "createdAt"] },
  access: { read: () => true, create: signedIn, update: signedIn, delete: signedIn },
  upload: {
    staticDir: "media",
    imageSizes: [
      { name: "thumb", width: 400 },
      { name: "card", width: 800 },
      { name: "large", width: 1600 },
    ],
    adminThumbnail: "thumb",
    focalPoint: true,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    formatOptions: { format: "webp", options: { quality: 82 } },
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Photo description",
      admin: {
        description: "What the photo shows, for example: 2026 Uni-S in Putty Grey, side view.",
      },
    },
  ],
};
