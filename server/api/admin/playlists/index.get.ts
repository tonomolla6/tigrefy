import { useDB } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireTigre(event)

  const db = useDB()

  const allPlaylists = await db.query.playlists.findMany({
    with: {
      owner: true,
      songs: true
    },
    orderBy: (playlists, { desc }) => [desc(playlists.createdAt)]
  })

  return allPlaylists.map(playlist => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    cover: playlist.cover,
    ownerId: playlist.ownerId,
    ownerName: playlist.owner?.displayName || playlist.owner?.username || 'Sistema',
    isPublic: playlist.isPublic,
    songCount: playlist.songs.length,
    createdAt: playlist.createdAt
  }))
})
