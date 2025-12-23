import { useDB, songLikes } from '~/server/db'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const songId = getRouterParam(event, 'id')

  if (!songId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de canción requerido'
    })
  }

  const db = useDB()

  // Verificar si ya existe el like
  const existing = await db
    .select()
    .from(songLikes)
    .where(and(
      eq(songLikes.userId, user.userId),
      eq(songLikes.songId, songId)
    ))
    .limit(1)

  let liked: boolean

  if (existing.length > 0) {
    // Quitar like
    await db.delete(songLikes).where(and(
      eq(songLikes.userId, user.userId),
      eq(songLikes.songId, songId)
    ))
    liked = false
  } else {
    // Agregar like
    await db.insert(songLikes).values({
      userId: user.userId,
      songId
    })
    liked = true
  }

  return {
    success: true,
    liked,
    songId
  }
})
