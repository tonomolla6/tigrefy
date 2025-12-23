import { useDB } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de playlist requerido'
    })
  }

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
