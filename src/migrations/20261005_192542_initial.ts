import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`vehicles_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`feature\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`vehicles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`vehicles_features_order_idx\` ON \`vehicles_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`vehicles_features_parent_id_idx\` ON \`vehicles_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`vehicles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`model_id\` integer NOT NULL,
  	\`variant\` text NOT NULL,
  	\`year\` numeric NOT NULL,
  	\`mileage\` numeric DEFAULT 0 NOT NULL,
  	\`condition\` text DEFAULT 'new' NOT NULL,
  	\`price\` numeric NOT NULL,
  	\`body\` text NOT NULL,
  	\`fuel\` text NOT NULL,
  	\`transmission\` text DEFAULT 'Automatic' NOT NULL,
  	\`stock_number\` text,
  	\`colour\` text NOT NULL,
  	\`colour_hex\` text DEFAULT '#c9ced6',
  	\`description\` text,
  	\`slug\` text,
  	\`status\` text DEFAULT 'available' NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`model_id\`) REFERENCES \`models\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`vehicles_model_idx\` ON \`vehicles\` (\`model_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`vehicles_slug_idx\` ON \`vehicles\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`vehicles_status_idx\` ON \`vehicles\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`vehicles_updated_at_idx\` ON \`vehicles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`vehicles_created_at_idx\` ON \`vehicles\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`vehicles_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`vehicles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`vehicles_rels_order_idx\` ON \`vehicles_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`vehicles_rels_parent_idx\` ON \`vehicles_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`vehicles_rels_path_idx\` ON \`vehicles_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`vehicles_rels_media_id_idx\` ON \`vehicles_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`models_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	\`label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`models\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`models_specs_order_idx\` ON \`models_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`models_specs_parent_id_idx\` ON \`models_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`models_colours\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`hex\` text NOT NULL,
  	\`cutout_id\` integer,
  	FOREIGN KEY (\`cutout_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`models\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`models_colours_order_idx\` ON \`models_colours\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`models_colours_parent_id_idx\` ON \`models_colours\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`models_colours_cutout_idx\` ON \`models_colours\` (\`cutout_id\`);`)
  await db.run(sql`CREATE TABLE \`models\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text,
  	\`tagline\` text NOT NULL,
  	\`type\` text NOT NULL,
  	\`fuel\` text NOT NULL,
  	\`order\` numeric DEFAULT 10,
  	\`from_price\` numeric NOT NULL,
  	\`monthly_from\` text,
  	\`cutout_id\` integer NOT NULL,
  	\`world_id\` integer NOT NULL,
  	\`portrait_id\` integer NOT NULL,
  	\`interior_id\` integer,
  	\`published\` integer DEFAULT true,
  	\`show_in_hero\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`cutout_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`world_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`portrait_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`interior_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`models_slug_idx\` ON \`models\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`models_cutout_idx\` ON \`models\` (\`cutout_id\`);`)
  await db.run(sql`CREATE INDEX \`models_world_idx\` ON \`models\` (\`world_id\`);`)
  await db.run(sql`CREATE INDEX \`models_portrait_idx\` ON \`models\` (\`portrait_id\`);`)
  await db.run(sql`CREATE INDEX \`models_interior_idx\` ON \`models\` (\`interior_id\`);`)
  await db.run(sql`CREATE INDEX \`models_updated_at_idx\` ON \`models\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`models_created_at_idx\` ON \`models\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`specials\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`model_id\` integer,
  	\`headline\` text NOT NULL,
  	\`details\` text,
  	\`image_id\` integer,
  	\`valid_until\` text,
  	\`terms\` text,
  	\`published\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`model_id\`) REFERENCES \`models\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`specials_model_idx\` ON \`specials\` (\`model_id\`);`)
  await db.run(sql`CREATE INDEX \`specials_image_idx\` ON \`specials\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`specials_updated_at_idx\` ON \`specials\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`specials_created_at_idx\` ON \`specials\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`reviews\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`quote\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`suburb\` text,
  	\`rating\` numeric DEFAULT 5 NOT NULL,
  	\`source\` text DEFAULT 'google',
  	\`published\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`reviews_updated_at_idx\` ON \`reviews\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`reviews_created_at_idx\` ON \`reviews\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`staff\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text NOT NULL,
  	\`photo_id\` integer,
  	\`phone\` text,
  	\`email\` text,
  	\`order\` numeric DEFAULT 10,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`staff_photo_idx\` ON \`staff\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`staff_updated_at_idx\` ON \`staff\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`staff_created_at_idx\` ON \`staff\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`leads\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`name\` text NOT NULL,
  	\`phone\` text NOT NULL,
  	\`email\` text,
  	\`interest\` text,
  	\`vehicle_id\` integer,
  	\`preferred_date\` text,
  	\`message\` text,
  	\`details\` text,
  	\`consent\` integer DEFAULT false NOT NULL,
  	\`notes\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`leads_vehicle_idx\` ON \`leads\` (\`vehicle_id\`);`)
  await db.run(sql`CREATE INDEX \`leads_updated_at_idx\` ON \`leads\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`leads_created_at_idx\` ON \`leads\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumb_url\` text,
  	\`sizes_thumb_width\` numeric,
  	\`sizes_thumb_height\` numeric,
  	\`sizes_thumb_mime_type\` text,
  	\`sizes_thumb_filesize\` numeric,
  	\`sizes_thumb_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_large_url\` text,
  	\`sizes_large_width\` numeric,
  	\`sizes_large_height\` numeric,
  	\`sizes_large_mime_type\` text,
  	\`sizes_large_filesize\` numeric,
  	\`sizes_large_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumb_sizes_thumb_filename_idx\` ON \`media\` (\`sizes_thumb_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_large_sizes_large_filename_idx\` ON \`media\` (\`sizes_large_filename\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text DEFAULT 'sales' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`vehicles_id\` integer,
  	\`models_id\` integer,
  	\`specials_id\` integer,
  	\`reviews_id\` integer,
  	\`staff_id\` integer,
  	\`leads_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`vehicles_id\`) REFERENCES \`vehicles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`models_id\`) REFERENCES \`models\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`specials_id\`) REFERENCES \`specials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`reviews_id\`) REFERENCES \`reviews\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`staff_id\`) REFERENCES \`staff\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`leads_id\`) REFERENCES \`leads\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_vehicles_id_idx\` ON \`payload_locked_documents_rels\` (\`vehicles_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_models_id_idx\` ON \`payload_locked_documents_rels\` (\`models_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_specials_id_idx\` ON \`payload_locked_documents_rels\` (\`specials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_reviews_id_idx\` ON \`payload_locked_documents_rels\` (\`reviews_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_staff_id_idx\` ON \`payload_locked_documents_rels\` (\`staff_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_leads_id_idx\` ON \`payload_locked_documents_rels\` (\`leads_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`dealer_hours\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`days\` text NOT NULL,
  	\`time\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`dealer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`dealer_hours_order_idx\` ON \`dealer_hours\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`dealer_hours_parent_id_idx\` ON \`dealer_hours\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`dealer\` (
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
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`vehicles_features\`;`)
  await db.run(sql`DROP TABLE \`vehicles\`;`)
  await db.run(sql`DROP TABLE \`vehicles_rels\`;`)
  await db.run(sql`DROP TABLE \`models_specs\`;`)
  await db.run(sql`DROP TABLE \`models_colours\`;`)
  await db.run(sql`DROP TABLE \`models\`;`)
  await db.run(sql`DROP TABLE \`specials\`;`)
  await db.run(sql`DROP TABLE \`reviews\`;`)
  await db.run(sql`DROP TABLE \`staff\`;`)
  await db.run(sql`DROP TABLE \`leads\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`dealer_hours\`;`)
  await db.run(sql`DROP TABLE \`dealer\`;`)
}
