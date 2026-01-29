CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`level` text DEFAULT 'standard' NOT NULL,
	`tamer_ids` text NOT NULL,
	`encounter_ids` text NOT NULL,
	`current_encounter_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `digimon` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`species` text NOT NULL,
	`stage` text NOT NULL,
	`attribute` text NOT NULL,
	`family` text NOT NULL,
	`type` text NOT NULL,
	`base_stats` text NOT NULL,
	`attacks` text NOT NULL,
	`qualities` text NOT NULL,
	`data_optimization` text,
	`base_dp` integer NOT NULL,
	`bonus_dp` integer DEFAULT 0 NOT NULL,
	`current_wounds` integer DEFAULT 0 NOT NULL,
	`current_stance` text DEFAULT 'neutral' NOT NULL,
	`evolution_path_ids` text NOT NULL,
	`partner_id` text,
	`is_enemy` integer DEFAULT false NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`sprite_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`partner_id`) REFERENCES `tamers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `encounters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`round` integer DEFAULT 0 NOT NULL,
	`phase` text DEFAULT 'setup' NOT NULL,
	`participants` text NOT NULL,
	`turn_order` text NOT NULL,
	`current_turn_index` integer DEFAULT 0 NOT NULL,
	`battle_log` text NOT NULL,
	`hazards` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tamers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`campaign_level` text NOT NULL,
	`attributes` text NOT NULL,
	`skills` text NOT NULL,
	`aspects` text NOT NULL,
	`torments` text NOT NULL,
	`special_orders` text NOT NULL,
	`inspiration` integer DEFAULT 1 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`equipment` text NOT NULL,
	`current_wounds` integer DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
