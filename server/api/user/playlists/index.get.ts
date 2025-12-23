import { useDB, playlists, savedPlaylists } from '~/server/db'
import { eq, or } from 'drizzle-orm'

// Obtener playlists del usuario:
// - Playlists creadas por el usuario (ownerId = userId)
// - Playlists guardadas en su biblioteca (saved_playlists)
export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const db = useDB()

  // Obtener IDs de playlists guardadas
  const savedIds = await db
    .select({ playlistId: savedPlaylists.playlistId })
    .from(savedPlaylists)
    .where(eq(savedPlaylists.userId, userId))

  const savedPlaylistIds = savedIds.map(s => s.playlistId)

  // Obtener todas las playlists (creadas por el usuario o guardadas)
  const result = await db.query.playlists.findMany({
    where: or(
      eq(playlists.ownerId, userId),
      ...savedPlaylistIds.map(id => eq(playlists.id, id))
    ),
    with: {
      songs: {
        orderBy: (playlistSongs, { asc }) => [asc(playlistSongs.position)]
      },
      owner: true
    },
    orderBy: (playlists, { desc }) => [desc(playlists.createdAt)]
  })

  return result.map(playlist => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    cover: playlist.cover,
    ownerId: playlist.ownerId,
    ownerName: playlist.owner?.displayName || playlist.owner?.username || null,
    isPublic: playlist.isPublic,
    isOwner: playlist.ownerId === userId,
    isSaved: savedPlaylistIds.includes(playlist.id),
    createdAt: playlist.createdAt,
    songIds: playlist.songs.map(s => s.songId)
  }))
})
