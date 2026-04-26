import { useDB, songs } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { requireParam } from '~/server/utils/params'
import { mapSongResponse } from '~/server/utils/mappers'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = requireParam(event, 'id', 'ID de canción')
  const db = useDB()
  const authUser = await getAuthUser(event)

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

  return mapSongResponse(result)
})
