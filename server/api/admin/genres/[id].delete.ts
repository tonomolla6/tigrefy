import { useDB, genres } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { requireParam } from '~/server/utils/params'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireTigre(event)
  const idStr = requireParam(event, 'id', 'ID del género')
  const id = Number(idStr)
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de género inválido' })
  }

  const db = useDB()

  const existing = await db.query.genres.findFirst({ where: eq(genres.id, id) })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Género no encontrado' })
  }

  // Las relaciones song_genres se eliminan en cascada (FK con onDelete cascade).
  await db.delete(genres).where(eq(genres.id, id))

  return { success: true }
})
