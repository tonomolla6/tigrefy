import { useDB, playlists } from '~/server/db'
import { isNull } from 'drizzle-orm'

// Obtener playlists del sistema (públicas, sin owner)
export default defineEventHandler(async () => {
  const db = useDB()

  const result = await db.query.playlists.findMany({
    where: isNull(playlists.ownerId),
    with: {
      songs: {
        orderBy: (playlistSongs, { asc }) => [asc(playlistSongs.position)]
      }
    },
    orderBy: (playlists, { desc }) => [desc(playlists.createdAt)]
  })

  return result.map(playlist => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    cover: playlist.cover,
    ownerId: null,
    isPublic: playlist.isPublic,
    createdAt: playlist.createdAt,
    songIds: playlist.songs.map(s => s.songId)
  }))
})
