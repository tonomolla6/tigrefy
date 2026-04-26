import { useDB, songLikes } from '~/server/db'
import { eq, and } from 'drizzle-orm'
import { getAuthUser } from '~/server/utils/auth'
import { requireParam } from '~/server/utils/params'

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)

  // Si no está autenticado, no tiene like
  if (!user) {
    return { liked: false }
  }

  const songId = requireParam(event, 'id', 'ID de canción')
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
