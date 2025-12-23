import { useDB, songs } from '~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de canción requerido'
    })
  }

  const body = await readBody(event)
  const { isPublic } = body

  if (typeof isPublic !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'isPublic debe ser un booleano'
    })
  }

  const db = useDB()

  // Verificar que la canción existe
  const existing = await db.query.songs.findFirst({
    where: eq(songs.id, id)
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Canción no encontrada'
    })
  }

  // Actualizar visibilidad
  await db.update(songs)
    .set({ isPublic })
    .where(eq(songs.id, id))

  return {
    success: true,
    id,
    isPublic
  }
})
