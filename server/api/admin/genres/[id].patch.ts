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

  const body = await readBody(event)
  const name = (body?.name ?? '').toString().trim()
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'El nombre del género no puede estar vacío' })
  }

  const db = useDB()

  const existing = await db.query.genres.findFirst({ where: eq(genres.id, id) })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Género no encontrado' })
  }

  try {
    const result = await db.update(genres).set({ name }).where(eq(genres.id, id)).returning()
    return { success: true, genre: result[0] }
  } catch (err: any) {
    if (String(err?.message ?? '').includes('UNIQUE')) {
      throw createError({ statusCode: 409, statusMessage: 'Ya existe un género con ese nombre' })
    }
    throw err
  }
})
