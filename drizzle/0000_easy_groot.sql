CREATE TABLE `albums` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(11)))) NOT NULL,
	`artist_id` text NOT NULL,
	`title` text NOT NULL,
	`cover` text,
	`release_date` text,
	`total_tracks` integer DEFAULT 0,
	`duration` integer DEFAULT 0,
	`genres` text,
	`is_public` integer DEFAULT false,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_albums_artist` ON `albums` (`artist_id`);--> statement-breakpoint
CREATE TABLE `artist_followers` (
	`user_id` text NOT NULL,
	`artist_id` text NOT NULL,
	`followed_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`user_id`, `artist_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_artist_followers_artist` ON `artist_followers` (`artist_id`);--> statement-breakpoint
CREATE TABLE `artists` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(11)))) NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`followers` integer DEFAULT 0,
	`genres` text,
	`bio` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `genres_name_unique` ON `genres` (`name`);--> statement-breakpoint
CREATE TABLE `playlist_songs` (
	`playlist_id` text NOT NULL,
	`song_id` text NOT NULL,
	`position` integer DEFAULT 0,
	`added_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`playlist_id`, `song_id`),
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(11)))) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`cover` text DEFAULT '/covers/default-playlist.png',
	`owner_id` text,
	`is_public` integer DEFAULT true,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_playlists_owner` ON `playlists` (`owner_id`);--> statement-breakpoint
CREATE TABLE `saved_albums` (
	`user_id` text NOT NULL,
	`album_id` text NOT NULL,
	`saved_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`user_id`, `album_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_saved_albums_user` ON `saved_albums` (`user_id`);--> statement-breakpoint
CREATE TABLE `saved_playlists` (
	`user_id` text NOT NULL,
	`playlist_id` text NOT NULL,
	`saved_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`user_id`, `playlist_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_saved_playlists_user` ON `saved_playlists` (`user_id`);--> statement-breakpoint
CREATE TABLE `song_genres` (
	`song_id` text NOT NULL,
	`genre_id` integer NOT NULL,
	PRIMARY KEY(`song_id`, `genre_id`),
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `song_likes` (
	`user_id` text NOT NULL,
	`song_id` text NOT NULL,
	`liked_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`user_id`, `song_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_song_likes_song` ON `song_likes` (`song_id`);--> statement-breakpoint
CREATE TABLE `songs` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(11)))) NOT NULL,
	`title` text NOT NULL,
	`artist_id` text NOT NULL,
	`album_id` text,
	`track_number` integer,
	`duration` integer DEFAULT 0,
	`audio_url` text NOT NULL,
	`lyrics` text,
	`plays` integer DEFAULT 0,
	`is_public` integer DEFAULT false,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_songs_artist` ON `songs` (`artist_id`);--> statement-breakpoint
CREATE INDEX `idx_songs_album` ON `songs` (`album_id`);--> statement-breakpoint
CREATE INDEX `idx_songs_plays` ON `songs` (`plays`);--> statement-breakpoint
CREATE TABLE `user_favorites` (
	`user_id` text NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`user_id`, `item_type`, `item_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_user_favorites_user` ON `user_favorites` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_play_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`song_id` text NOT NULL,
	`played_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_user_play_history_user` ON `user_play_history` (`user_id`,`played_at`);--> statement-breakpoint
CREATE TABLE `user_search_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`query` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(11)))) NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(11)))) NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text,
	`role` text DEFAULT 'user',
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`last_login_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);