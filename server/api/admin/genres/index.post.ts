import { useDB, genres } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const body = await readBody(event)
  const name = (body?.name ?? '').toString().trim()

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'El nombre del género es requerido' })
  }

  const db = useDB()

  try {
    const result = await db.insert(genres).values({ name }).returning()
    return { success: true, genre: result[0] }
  } catch (err: any) {
    // libsql/SQLite: UNIQUE constraint failed
    if (String(err?.message ?? '').includes('UNIQUE')) {
      throw createError({ statusCode: 409, statusMessage: 'Ya existe un género con ese nombre' })
    }
    throw err
  }
})
