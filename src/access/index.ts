import type { Access, FieldAccess } from "payload";

/** Anyone signed in to the admin. Staff accounts are created by an admin, never self-registered. */
export const signedIn: Access = ({ req }) => Boolean(req.user);
export const signedInField: FieldAccess = ({ req }) => Boolean(req.user);

/** Admins manage users and settings; sales staff manage stock, content and leads. */
export const isAdmin: Access = ({ req }) => req.user?.role === "admin";

/** Public read for published content; staff see drafts and hidden records too. */
export const publishedOrSignedIn =
  (field = "published"): Access =>
  ({ req }) =>
    req.user ? true : { [field]: { equals: true } };
