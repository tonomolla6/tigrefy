import { useDB, playlists } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  requireTigre(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de playlist requerido'
    })
  }

  const body = await readBody(event)
  const { isPublic } = body

  const db = useDB()

  await db.update(playlists)
    .set({ isPublic })
    .where(eq(playlists.id, id))

  return { success: true }
})
