import { useDB, songs } from '~/server/db'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de canción requerido'
    })
  }

  const db = useDB()

  // Incrementar contador de reproducciones
  await db.update(songs)
    .set({ plays: sql`${songs.plays} + 1` })
    .where(eq(songs.id, id))

  // Obtener el nuevo valor
  const result = await db.select({ plays: songs.plays })
    .from(songs)
    .where(eq(songs.id, id))
    .limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Canción no encontrada'
    })
  }

  return {
    success: true,
    plays: result[0].plays
  }
})
