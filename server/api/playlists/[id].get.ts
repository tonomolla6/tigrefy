import { useDB, playlists } from '~/server/db'
import { eq } from 'drizzle-orm'
import { getAuthUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = getAuthUser(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de playlist requerido'
    })
  }

  const db = useDB()

  const result = await db.query.playlists.findFirst({
    where: eq(playlists.id, id),
    with: {
      songs: {
        orderBy: (playlistSongs, { asc }) => [asc(playlistSongs.position)]
      },
      owner: true
    }
  })

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Playlist no encontrada'
    })
  }

  // Si la playlist es privada y no es del usuario actual, denegar acceso
  if (!result.isPublic && result.ownerId !== user?.userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes acceso a esta playlist'
    })
  }

  return {
    id: result.id,
    name: result.name,
    description: result.description,
    cover: result.cover,
    ownerId: result.ownerId,
    ownerName: result.owner?.displayName || result.owner?.username || null,
    isPublic: result.isPublic,
    isOwner: result.ownerId === user?.userId,
    createdAt: result.createdAt,
    songIds: result.songs.map(s => s.songId)
  }
})
