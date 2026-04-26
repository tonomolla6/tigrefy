import { useDB, songs } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { mapSongResponse } from '~/server/utils/mappers'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const authUser = await getAuthUser(event)

  // Si es tigre o user, mostrar todas las canciones
  // Si es guest o no autenticado, solo públicas
  const showAll = canSeeAllContent(authUser?.role)

  const result = await db.query.songs.findMany({
    where: showAll ? undefined : eq(songs.isPublic, true),
    with: {
      artist: true,
      album: true
    },
    orderBy: (songs, { desc }) => [desc(songs.plays)]
  })

  return result.map(song => mapSongResponse(song))
})
