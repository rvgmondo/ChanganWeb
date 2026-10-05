import type { Payload } from "payload";

/**
 * Production databases are created and upgraded by committed migrations (src/migrations).
 * Payload's `prodMigrations` applies pending ones when the app boots, so a deploy never needs
 * somebody to open a terminal on the host. This only logs what happened, and warns when the
 * database was pushed in development mode (batch -1), which migrations will not touch.
 * Set CHANGAN_MIGRATE_ON_BOOT=false to skip the check for a manual migration.
 */
export async function migrateOnBoot(payload: Payload): Promise<void> {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.CHANGAN_MIGRATE_ON_BOOT === "false") return;
  try {
    const found = await payload.find({
      collection: "payload-migrations",
      limit: 0,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    });
    const rows = found.docs as { name?: string | null; batch?: number | null }[];
    if (rows.some((row) => row.batch === -1)) {
      payload.logger.warn(
        "This database was pushed in development mode. Run `npx payload migrate` by hand.",
      );
    } else {
      payload.logger.info(`Database at ${rows.length} applied migration(s).`);
    }
  } catch (error) {
    payload.logger.error({ err: error }, "Could not read migration state");
  }
}
