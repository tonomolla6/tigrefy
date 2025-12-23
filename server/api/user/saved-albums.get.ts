import { useDB } from '~/server/db'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth?.userId
  if (!userId) {
    return []
  }

  const db = useDB()

  const saved = await db.query.savedAlbums.findMany({
    where: (sa, { eq }) => eq(sa.userId, userId)
  })

  return saved.map(sa => sa.albumId)
})
