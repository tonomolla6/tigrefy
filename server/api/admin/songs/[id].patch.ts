import { useDB, songs, albums } from '~/server/db'
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

  const body = await readBody(event)
  const { title, audioUrl, duration, trackNumber, lyrics, isPublic } = body

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

  // Preparar los campos a actualizar
  const updateData: Record<string, any> = {}

  if (title !== undefined) {
    if (!title || title.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El título de la canción no puede estar vacío'
      })
    }
    updateData.title = title.trim()
  }

  if (audioUrl !== undefined) {
    updateData.audioUrl = audioUrl || null
  }

  if (duration !== undefined) {
    updateData.duration = duration || 0
  }

  if (trackNumber !== undefined) {
    updateData.trackNumber = trackNumber || null
  }

  if (lyrics !== undefined) {
    updateData.lyrics = lyrics || null
  }

  if (isPublic !== undefined) {
    updateData.isPublic = isPublic
  }

  if (Object.keys(updateData).length === 0) {
    return { success: true, song }
  }

  // Actualizar la canción
  const result = await db.update(songs)
    .set(updateData)
    .where(eq(songs.id, id))
    .returning()

  // Si cambió la duración, actualizar el álbum
  if (duration !== undefined && song.albumId) {
    const albumSongs = await db.query.songs.findMany({
      where: (songs, { eq }) => eq(songs.albumId, song.albumId!)
    })
    const totalDuration = albumSongs.reduce((sum, s) => sum + (s.duration || 0), 0)

    await db.update(albums)
      .set({ duration: totalDuration })
      .where(eq(albums.id, song.albumId))
  }

  return {
    success: true,
    song: result[0]
  }
})
