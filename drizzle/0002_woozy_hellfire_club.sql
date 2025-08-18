ALTER TABLE `ratings` ADD `created_at` integer DEFAULT (strftime('%s','now'));--> statement-breakpoint
ALTER TABLE `ratings` ADD `updated_at` integer DEFAULT (strftime('%s','now'));--> statement-breakpoint
ALTER TABLE `recipes` ADD `created_at` integer DEFAULT (strftime('%s','now'));--> statement-breakpoint
ALTER TABLE `recipes` ADD `updated_at` integer DEFAULT (strftime('%s','now'));--> statement-breakpoint
ALTER TABLE `saved_recipes` ADD `created_at` integer DEFAULT (strftime('%s','now'));--> statement-breakpoint
ALTER TABLE `saved_recipes` ADD `updated_at` integer DEFAULT (strftime('%s','now'));--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` integer DEFAULT (strftime('%s','now'));--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` integer DEFAULT (strftime('%s','now'));