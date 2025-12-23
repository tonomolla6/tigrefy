import { useDB, songLikes } from '~/server/db'
import { eq, and } from 'drizzle-orm'
import { getAuthUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = getAuthUser(event)

  // Si no está autenticado, no tiene like
  if (!user) {
    return { liked: false }
  }

  const songId = getRouterParam(event, 'id')

  if (!songId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de canción requerido'
    })
  }

  const db = useDB()

  const result = await db
    .select()
    .from(songLikes)
    .where(and(
      eq(songLikes.userId, user.userId),
      eq(songLikes.songId, songId)
    ))
    .limit(1)

  return { liked: result.length > 0 }
})
