import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core'
import { sql, relations } from 'drizzle-orm'

// ==================== GENERADOR DE IDs ====================

// SQL para generar ID aleatorio de 22 caracteres hex (SQLite)
const randomId = sql`(lower(hex(randomblob(11))))`

// Función JS para generar IDs (para uso en código)
const ID_CHARS = 'abcdef0123456789'
export function generateId(): string {
  let id = ''
  for (let i = 0; i < 22; i++) {
    id += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length))
  }
  return id
}

// ==================== CONTENIDO MUSICAL ====================

export const artists = sqliteTable('artists', {
  id: text('id').primaryKey().default(randomId),
  name: text('name').notNull(),
  image: text('image'),
  followers: integer('followers').default(0),
  genres: text('genres'), // JSON array
  bio: text('bio'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
})

export const artistFollowers = sqliteTable('artist_followers', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  artistId: text('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
  followedAt: text('followed_at').notNull().default(sql`(current_timestamp)`)
}, (table) => [
  primaryKey({ columns: [table.userId, table.artistId] }),
  index('idx_artist_followers_artist').on(table.artistId)
])

export const albums = sqliteTable('albums', {
  id: text('id').primaryKey().default(randomId),
  artistId: text('artist_id').notNull().references(() => artists.id),
  title: text('title').notNull(),
  cover: text('cover'),
  releaseDate: text('release_date'),
  totalTracks: integer('total_tracks').default(0),
  duration: integer('duration').default(0),
  genres: text('genres'), // JSON array
  isPublic: integer('is_public', { mode: 'boolean' }).default(false)
}, (table) => [
  index('idx_albums_artist').on(table.artistId)
])

export const songs = sqliteTable('songs', {
  id: text('id').primaryKey().default(randomId),
  title: text('title').notNull(),
  artistId: text('artist_id').notNull().references(() => artists.id),
  albumId: text('album_id').references(() => albums.id),
  trackNumber: integer('track_number'),
  duration: integer('duration').default(0),
  // Nota: el audio HLS se sirve desde R2 en tracks/<song.id>/. No hay columna
  // separada — el ID de la canción es el ID del track.
  lyrics: text('lyrics'),
  plays: integer('plays').default(0),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false)
}, (table) => [
  index('idx_songs_artist').on(table.artistId),
  index('idx_songs_album').on(table.albumId),
  index('idx_songs_plays').on(table.plays)
])

export const songLikes = sqliteTable('song_likes', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  songId: text('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  likedAt: text('liked_at').notNull().default(sql`(current_timestamp)`)
}, (table) => [
  primaryKey({ columns: [table.userId, table.songId] }),
  index('idx_song_likes_song').on(table.songId)
])

// ==================== PLAYLISTS (UNIFICADAS) ====================

// Una sola tabla para todas las playlists (sistema y usuario)
export const playlists = sqliteTable('playlists', {
  id: text('id').primaryKey().default(randomId),
  name: text('name').notNull(),
  description: text('description'),
  cover: text('cover').default('/covers/default-playlist.png'),
  // Si ownerId es null = playlist del sistema, si tiene valor = playlist de usuario
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
}, (table) => [
  index('idx_playlists_owner').on(table.ownerId)
])

// Canciones de cualquier playlist
export const playlistSongs = sqliteTable('playlist_songs', {
  playlistId: text('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  songId: text('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  position: integer('position').default(0),
  addedAt: text('added_at').notNull().default(sql`(current_timestamp)`)
}, (table) => [
  primaryKey({ columns: [table.playlistId, table.songId] }),
  // Para consultar "¿en qué playlists está esta canción?"
  index('idx_playlist_songs_song').on(table.songId)
])

// Playlists guardadas en la biblioteca del usuario (como el corazón en Spotify)
export const savedPlaylists = sqliteTable('saved_playlists', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  playlistId: text('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  savedAt: text('saved_at').notNull().default(sql`(current_timestamp)`)
}, (table) => [
  primaryKey({ columns: [table.userId, table.playlistId] }),
  index('idx_saved_playlists_user').on(table.userId)
])

// Álbumes guardados en la biblioteca del usuario
export const savedAlbums = sqliteTable('saved_albums', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  albumId: text('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
  savedAt: text('saved_at').notNull().default(sql`(current_timestamp)`)
}, (table) => [
  primaryKey({ columns: [table.userId, table.albumId] }),
  index('idx_saved_albums_user').on(table.userId)
])

export const genres = sqliteTable('genres', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique()
})

export const songGenres = sqliteTable('song_genres', {
  songId: text('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  genreId: integer('genre_id').notNull().references(() => genres.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.songId, table.genreId] }),
  // Para consultar "¿qué canciones tiene este género?"
  index('idx_song_genres_genre').on(table.genreId)
])

// ==================== USUARIOS ====================

export const users = sqliteTable('users', {
  id: text('id').primaryKey().default(randomId),
  username: text('username').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  role: text('role', { enum: ['tigre', 'user', 'guest'] }).default('user'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  lastLoginAt: text('last_login_at')
})

export const userSessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey().default(randomId),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: text('expires_at').notNull()
})

// ==================== DATOS DE USUARIO ====================

// Mantener solo para artistas (songs usan song_likes)
export const userFavorites = sqliteTable('user_favorites', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemType: text('item_type', { enum: ['artist'] }).notNull(),
  itemId: text('item_id').notNull(),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
}, (table) => [
  primaryKey({ columns: [table.userId, table.itemType, table.itemId] }),
  index('idx_user_favorites_user').on(table.userId)
])

export const userPlayHistory = sqliteTable('user_play_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  songId: text('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  playedAt: text('played_at').notNull().default(sql`(current_timestamp)`)
}, (table) => [
  index('idx_user_play_history_user').on(table.userId, table.playedAt)
])

export const userSearchHistory = sqliteTable('user_search_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  query: text('query').notNull(),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})

// ==================== RELACIONES ====================

export const artistsRelations = relations(artists, ({ many }) => ({
  albums: many(albums),
  songs: many(songs),
  followers: many(artistFollowers)
}))

export const artistFollowersRelations = relations(artistFollowers, ({ one }) => ({
  user: one(users, {
    fields: [artistFollowers.userId],
    references: [users.id]
  }),
  artist: one(artists, {
    fields: [artistFollowers.artistId],
    references: [artists.id]
  })
}))

export const albumsRelations = relations(albums, ({ one, many }) => ({
  artist: one(artists, {
    fields: [albums.artistId],
    references: [artists.id]
  }),
  songs: many(songs),
  savedBy: many(savedAlbums)
}))

export const genresRelations = relations(genres, ({ many }) => ({
  songs: many(songGenres)
}))

export const songGenresRelations = relations(songGenres, ({ one }) => ({
  song: one(songs, {
    fields: [songGenres.songId],
    references: [songs.id]
  }),
  genre: one(genres, {
    fields: [songGenres.genreId],
    references: [genres.id]
  })
}))

export const songsRelations = relations(songs, ({ one, many }) => ({
  artist: one(artists, {
    fields: [songs.artistId],
    references: [artists.id]
  }),
  album: one(albums, {
    fields: [songs.albumId],
    references: [albums.id]
  }),
  genres: many(songGenres),
  likes: many(songLikes),
  playlistSongs: many(playlistSongs)
}))

export const songLikesRelations = relations(songLikes, ({ one }) => ({
  user: one(users, {
    fields: [songLikes.userId],
    references: [users.id]
  }),
  song: one(songs, {
    fields: [songLikes.songId],
    references: [songs.id]
  })
}))

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  owner: one(users, {
    fields: [playlists.ownerId],
    references: [users.id]
  }),
  songs: many(playlistSongs),
  savedBy: many(savedPlaylists)
}))

export const playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistSongs.playlistId],
    references: [playlists.id]
  }),
  song: one(songs, {
    fields: [playlistSongs.songId],
    references: [songs.id]
  })
}))

export const savedPlaylistsRelations = relations(savedPlaylists, ({ one }) => ({
  user: one(users, {
    fields: [savedPlaylists.userId],
    references: [users.id]
  }),
  playlist: one(playlists, {
    fields: [savedPlaylists.playlistId],
    references: [playlists.id]
  })
}))

export const savedAlbumsRelations = relations(savedAlbums, ({ one }) => ({
  user: one(users, {
    fields: [savedAlbums.userId],
    references: [users.id]
  }),
  album: one(albums, {
    fields: [savedAlbums.albumId],
    references: [albums.id]
  })
}))

export const usersRelations = relations(users, ({ many }) => ({
  ownedPlaylists: many(playlists),
  savedPlaylists: many(savedPlaylists),
  savedAlbums: many(savedAlbums),
  favorites: many(userFavorites),
  playHistory: many(userPlayHistory),
  searchHistory: many(userSearchHistory),
  followingArtists: many(artistFollowers),
  likedSongs: many(songLikes)
}))

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id]
  })
}))

export const userPlayHistoryRelations = relations(userPlayHistory, ({ one }) => ({
  user: one(users, {
    fields: [userPlayHistory.userId],
    references: [users.id]
  }),
  song: one(songs, {
    fields: [userPlayHistory.songId],
    references: [songs.id]
  })
}))

export const userSearchHistoryRelations = relations(userSearchHistory, ({ one }) => ({
  user: one(users, {
    fields: [userSearchHistory.userId],
    references: [users.id]
  })
}))

// ==================== TIPOS ====================

export type Artist = typeof artists.$inferSelect
export type NewArtist = typeof artists.$inferInsert

export type ArtistFollower = typeof artistFollowers.$inferSelect
export type NewArtistFollower = typeof artistFollowers.$inferInsert

export type Album = typeof albums.$inferSelect
export type NewAlbum = typeof albums.$inferInsert

export type Genre = typeof genres.$inferSelect
export type NewGenre = typeof genres.$inferInsert

export type Song = typeof songs.$inferSelect
export type NewSong = typeof songs.$inferInsert

export type SongGenre = typeof songGenres.$inferSelect
export type NewSongGenre = typeof songGenres.$inferInsert

export type Playlist = typeof playlists.$inferSelect
export type NewPlaylist = typeof playlists.$inferInsert

export type PlaylistSong = typeof playlistSongs.$inferSelect
export type NewPlaylistSong = typeof playlistSongs.$inferInsert

export type SavedPlaylist = typeof savedPlaylists.$inferSelect
export type NewSavedPlaylist = typeof savedPlaylists.$inferInsert

export type SavedAlbum = typeof savedAlbums.$inferSelect
export type NewSavedAlbum = typeof savedAlbums.$inferInsert

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type UserFavorite = typeof userFavorites.$inferSelect
export type NewUserFavorite = typeof userFavorites.$inferInsert

export type SongLike = typeof songLikes.$inferSelect
export type NewSongLike = typeof songLikes.$inferInsert

// Tipos con relaciones para queries
export type SongWithRelations = Song & {
  artist: Artist
  album: Album | null
}

export type AlbumWithRelations = Album & {
  artist: Artist
  songs: Song[]
}

export type PlaylistWithSongs = Playlist & {
  owner: User | null
  songs: { song: Song, position: number }[]
}
