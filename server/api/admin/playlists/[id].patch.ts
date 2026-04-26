import { useDB, playlists } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { requireParam } from '~/server/utils/params'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireTigre(event)
  const id = requireParam(event, 'id', 'ID de playlist')
  const body = await readBody(event)
  const { isPublic } = body

  const db = useDB()

  await db.update(playlists)
    .set({ isPublic })
    .where(eq(playlists.id, id))

  return { success: true }
})
