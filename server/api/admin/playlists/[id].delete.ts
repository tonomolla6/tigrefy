import { useDB, playlists } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de la playlist es requerido'
    })
  }

  const db = useDB()

  // Verificar que la playlist existe
  const playlist = await db.query.playlists.findFirst({
    where: (playlists, { eq }) => eq(playlists.id, id)
  })

  if (!playlist) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Playlist no encontrada'
    })
  }

  // Eliminar la playlist (las relaciones se eliminan automáticamente por CASCADE)
  await db.delete(playlists).where(eq(playlists.id, id))

  return {
    success: true,
    message: 'Playlist eliminada correctamente'
  }
})
