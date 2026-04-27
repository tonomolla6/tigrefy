import { useDB, songs, albums, songGenres } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { requireParam } from '~/server/utils/params'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireTigre(event)
  const id = requireParam(event, 'id', 'ID de la canción')
  const body = await readBody(event)
  const { title, duration, trackNumber, lyrics, isPublic, genreIds } = body

  const db = useDB()

  const song = await db.query.songs.findFirst({
    where: (songs, { eq }) => eq(songs.id, id)
  })
  if (!song) {
    throw createError({ statusCode: 404, statusMessage: 'Canción no encontrada' })
  }

  const updateData: Record<string, any> = {}
  if (title !== undefined) {
    if (!title || title.trim().length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'El título de la canción no puede estar vacío' })
    }
    updateData.title = title.trim()
  }
  if (duration !== undefined) updateData.duration = duration || 0
  if (trackNumber !== undefined) updateData.trackNumber = trackNumber || null
  if (lyrics !== undefined) updateData.lyrics = lyrics || null
  if (isPublic !== undefined) updateData.isPublic = isPublic

  if (Object.keys(updateData).length > 0) {
    await db.update(songs).set(updateData).where(eq(songs.id, id))
  }

  // Reemplazar géneros si vienen en el body.
  if (Array.isArray(genreIds)) {
    await db.delete(songGenres).where(eq(songGenres.songId, id))
    const validIds = genreIds.filter((n: unknown) => Number.isInteger(n))
    if (validIds.length > 0) {
      await db.insert(songGenres).values(
        validIds.map((genreId: number) => ({ songId: id, genreId }))
      ).onConflictDoNothing()
    }
  }

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

  // Devolver la canción actualizada con géneros resueltos.
  const updated = await db.query.songs.findFirst({
    where: eq(songs.id, id),
    with: { genres: { with: { genre: true } } }
  })
  const genres = updated?.genres.map(g => g.genre) ?? []

  return {
    success: true,
    song: { ...updated, genres }
  }
})
