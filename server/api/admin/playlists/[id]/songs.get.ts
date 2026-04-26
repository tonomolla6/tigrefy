import { useDB } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { requireParam } from '~/server/utils/params'

export default defineEventHandler(async (event) => {
  await requireTigre(event)
  const id = requireParam(event, 'id', 'ID de playlist')
  const db = useDB()

  // Obtener las canciones de la playlist ordenadas por posición
  const playlistSongs = await db.query.playlistSongs.findMany({
    where: (ps, { eq }) => eq(ps.playlistId, id),
    orderBy: (ps, { asc }) => [asc(ps.position)]
  })

  return {
    songIds: playlistSongs.map(ps => ps.songId)
  }
})
