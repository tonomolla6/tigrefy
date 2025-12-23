-- Crear tabla saved_albums
CREATE TABLE `saved_albums` (
	`user_id` text NOT NULL,
	`album_id` text NOT NULL,
	`saved_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`user_id`, `album_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Crear índice
CREATE INDEX `idx_saved_albums_user` ON `saved_albums` (`user_id`);
