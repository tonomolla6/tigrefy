import { useDB, playlistSongs, playlists } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  requireTigre(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de playlist requerido'
    })
  }

  const body = await readBody(event)
  const { songId, action } = body

  if (!songId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de canción requerido'
    })
  }

  const db = useDB()

  // Verificar que la playlist existe
  const playlist = await db.query.playlists.findFirst({
    where: (playlists, { eq }) => eq(playlists.id, id)
  })

  if (!playlist) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Playlist no encontrada'
    })
  }

  if (action === 'remove') {
    // Eliminar canción de la playlist
    await db.delete(playlistSongs)
      .where(and(
        eq(playlistSongs.playlistId, id),
        eq(playlistSongs.songId, songId)
      ))
  } else {
    // Añadir canción a la playlist
    // Verificar si ya existe
    const existing = await db.query.playlistSongs.findFirst({
      where: (ps, { and, eq }) => and(
        eq(ps.playlistId, id),
        eq(ps.songId, songId)
      )
    })

    if (!existing) {
      // Obtener la posición más alta actual
      const currentSongs = await db.query.playlistSongs.findMany({
        where: (ps, { eq }) => eq(ps.playlistId, id)
      })
      const maxPosition = currentSongs.reduce((max, s) => Math.max(max, s.position || 0), 0)

      await db.insert(playlistSongs).values({
        playlistId: id,
        songId,
        position: maxPosition + 1
      })
    }
  }

  // Obtener el conteo actualizado
  const updatedSongs = await db.query.playlistSongs.findMany({
    where: (ps, { eq }) => eq(ps.playlistId, id)
  })

  return {
    success: true,
    songCount: updatedSongs.length
  }
})
