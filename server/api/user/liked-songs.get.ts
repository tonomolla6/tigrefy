import { useDB, songLikes } from '~/server/db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const db = useDB()

  const result = await db
    .select({ songId: songLikes.songId, likedAt: songLikes.likedAt })
    .from(songLikes)
    .where(eq(songLikes.userId, userId))
    .orderBy(desc(songLikes.likedAt))

  return result
})
