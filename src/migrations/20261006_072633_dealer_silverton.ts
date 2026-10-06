import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_dealer\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text DEFAULT 'Changan Silverton' NOT NULL,
  	\`street\` text DEFAULT '478 Pretoria Road' NOT NULL,
  	\`suburb\` text DEFAULT 'Silverton' NOT NULL,
  	\`city\` text DEFAULT 'Pretoria' NOT NULL,
  	\`postal_code\` text DEFAULT '0184',
  	\`latitude\` numeric DEFAULT -25.7325,
  	\`longitude\` numeric DEFAULT 28.2948,
  	\`phone\` text DEFAULT '012 804 2369' NOT NULL,
  	\`email\` text DEFAULT 'stavros@changansilverton.co.za' NOT NULL,
  	\`whatsapp\` text,
  	\`socials_facebook\` text,
  	\`socials_instagram\` text,
  	\`socials_tiktok\` text,
  	\`finance_defaults_rate\` numeric DEFAULT 11.75,
  	\`finance_defaults_deposit\` numeric DEFAULT 10,
  	\`finance_defaults_term\` numeric DEFAULT 72,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_dealer\`("id", "name", "street", "suburb", "city", "postal_code", "latitude", "longitude", "phone", "email", "whatsapp", "socials_facebook", "socials_instagram", "socials_tiktok", "finance_defaults_rate", "finance_defaults_deposit", "finance_defaults_term", "updated_at", "created_at") SELECT "id", "name", "street", "suburb", "city", "postal_code", "latitude", "longitude", "phone", "email", "whatsapp", "socials_facebook", "socials_instagram", "socials_tiktok", "finance_defaults_rate", "finance_defaults_deposit", "finance_defaults_term", "updated_at", "created_at" FROM \`dealer\`;`)
  await db.run(sql`DROP TABLE \`dealer\`;`)
  await db.run(sql`ALTER TABLE \`__new_dealer\` RENAME TO \`dealer\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_dealer\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text DEFAULT 'Changan Pretoria' NOT NULL,
  	\`street\` text DEFAULT '332 Middel Street' NOT NULL,
  	\`suburb\` text DEFAULT 'Brooklyn' NOT NULL,
  	\`city\` text DEFAULT 'Pretoria' NOT NULL,
  	\`postal_code\` text DEFAULT '0181',
  	\`latitude\` numeric DEFAULT -25.7685,
  	\`longitude\` numeric DEFAULT 28.2369,
  	\`phone\` text DEFAULT '012 023 3433' NOT NULL,
  	\`email\` text DEFAULT 'info@changanpta.co.za' NOT NULL,
  	\`whatsapp\` text,
  	\`socials_facebook\` text,
  	\`socials_instagram\` text,
  	\`socials_tiktok\` text,
  	\`finance_defaults_rate\` numeric DEFAULT 11.75,
  	\`finance_defaults_deposit\` numeric DEFAULT 10,
  	\`finance_defaults_term\` numeric DEFAULT 72,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_dealer\`("id", "name", "street", "suburb", "city", "postal_code", "latitude", "longitude", "phone", "email", "whatsapp", "socials_facebook", "socials_instagram", "socials_tiktok", "finance_defaults_rate", "finance_defaults_deposit", "finance_defaults_term", "updated_at", "created_at") SELECT "id", "name", "street", "suburb", "city", "postal_code", "latitude", "longitude", "phone", "email", "whatsapp", "socials_facebook", "socials_instagram", "socials_tiktok", "finance_defaults_rate", "finance_defaults_deposit", "finance_defaults_term", "updated_at", "created_at" FROM \`dealer\`;`)
  await db.run(sql`DROP TABLE \`dealer\`;`)
  await db.run(sql`ALTER TABLE \`__new_dealer\` RENAME TO \`dealer\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
