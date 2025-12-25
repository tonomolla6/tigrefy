import { useDB, songs, albums, playlistSongs } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de la canción es requerido'
    })
  }

  const db = useDB()

  // Verificar que la canción existe
  const song = await db.query.songs.findFirst({
    where: (songs, { eq }) => eq(songs.id, id)
  })

  if (!song) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Canción no encontrada'
    })
  }

  const albumId = song.albumId

  // Eliminar de todas las playlists primero
  await db.delete(playlistSongs).where(eq(playlistSongs.songId, id))

  // Eliminar la canción
  await db.delete(songs).where(eq(songs.id, id))

  // Actualizar el contador del álbum si pertenecía a uno
  if (albumId) {
    const remainingSongs = await db.query.songs.findMany({
      where: (songs, { eq }) => eq(songs.albumId, albumId)
    })
    const totalDuration = remainingSongs.reduce((sum, s) => sum + (s.duration || 0), 0)

    await db.update(albums)
      .set({
        totalTracks: remainingSongs.length,
        duration: totalDuration
      })
      .where(eq(albums.id, albumId))
  }

  return {
    success: true,
    message: 'Canción eliminada correctamente'
  }
})
