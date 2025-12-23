import { useDB } from '~/server/db'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth?.userId
  if (!userId) {
    return []
  }

  const db = useDB()

  const saved = await db.query.savedPlaylists.findMany({
    where: (sp, { eq }) => eq(sp.userId, userId)
  })

  return saved.map(sp => sp.playlistId)
})
