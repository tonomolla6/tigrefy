import { useDB, songs } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de canción requerido'
    })
  }

  const db = useDB()
  const authUser = getAuthUser(event)

  const result = await db.query.songs.findFirst({
    where: eq(songs.id, id),
    with: {
      artist: true,
      album: true
    }
  })

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Canción no encontrada'
    })
  }

  // Verificar permisos: si no es pública y el usuario no puede ver todo
  if (!result.isPublic && !canSeeAllContent(authUser?.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes acceso a esta canción'
    })
  }

  return {
    id: result.id,
    title: result.title,
    artistId: result.artistId,
    artistName: result.artist.name,
    albumId: result.albumId,
    albumName: result.album?.title || null,
    trackNumber: result.trackNumber,
    duration: result.duration,
    cover: result.album?.cover || null,
    audioUrl: result.audioUrl,
    lyrics: result.lyrics,
    plays: result.plays,
    releaseDate: result.album?.releaseDate || null,
    isPublic: result.isPublic
  }
})
