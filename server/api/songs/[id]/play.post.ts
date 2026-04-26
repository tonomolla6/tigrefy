import { useDB, songs } from '~/server/db'
import { requireParam } from '~/server/utils/params'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = requireParam(event, 'id', 'ID de canción')
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
