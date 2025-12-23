-- Drop album_likes table (albums cannot be liked, only songs)
DROP INDEX IF EXISTS `idx_album_likes_album`;--> statement-breakpoint
DROP TABLE IF EXISTS `album_likes`;
