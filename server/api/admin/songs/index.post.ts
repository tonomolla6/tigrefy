import { useDB, songs, albums, songGenres } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const body = await readBody(event)
  const { id, title, artistId, albumId, trackNumber, duration, lyrics, isPublic, genreIds } = body

  if (!title || title.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'El título de la canción es requerido' })
  }
  if (!artistId) {
    throw createError({ statusCode: 400, statusMessage: 'El artista es requerido' })
  }
  if (!albumId) {
    throw createError({ statusCode: 400, statusMessage: 'El álbum es requerido' })
  }

  const db = useDB()

  const artist = await db.query.artists.findFirst({
    where: (artists, { eq }) => eq(artists.id, artistId)
  })
  if (!artist) {
    throw createError({ statusCode: 404, statusMessage: 'El artista no existe' })
  }

  const album = await db.query.albums.findFirst({
    where: (albums, { eq }) => eq(albums.id, albumId)
  })
  if (!album) {
    throw createError({ statusCode: 404, statusMessage: 'El álbum no existe' })
  }
  if (album.artistId !== artistId) {
    throw createError({ statusCode: 400, statusMessage: 'El álbum no pertenece al artista seleccionado' })
  }

  let finalTrackNumber = trackNumber
  if (!finalTrackNumber) {
    const existingSongs = await db.query.songs.findMany({
      where: (songs, { eq }) => eq(songs.albumId, albumId)
    })
    finalTrackNumber = existingSongs.length + 1
  }

  const result = await db.insert(songs).values({
    ...(id ? { id } : {}),
    title: title.trim(),
    artistId,
    albumId,
    trackNumber: finalTrackNumber,
    duration: duration || 0,
    lyrics: lyrics || null,
    plays: 0,
    isPublic: isPublic ?? false
  }).returning()

  const newSong = result[0]

  // Asignar géneros si vienen en el body.
  if (Array.isArray(genreIds) && genreIds.length > 0) {
    const validIds = genreIds.filter((n: unknown) => Number.isInteger(n))
    if (validIds.length > 0) {
      await db.insert(songGenres).values(
        validIds.map((genreId: number) => ({ songId: newSong.id, genreId }))
      ).onConflictDoNothing()
    }
  }

  // Actualizar totalTracks y duration del álbum
  const albumSongs = await db.query.songs.findMany({
    where: (songs, { eq }) => eq(songs.albumId, albumId)
  })
  const totalDuration = albumSongs.reduce((sum, s) => sum + (s.duration || 0), 0)

  await db.update(albums)
    .set({ totalTracks: albumSongs.length, duration: totalDuration })
    .where(eq(albums.id, albumId))

  // Resolver géneros para la respuesta.
  const songWithGenres = await db.query.songs.findFirst({
    where: eq(songs.id, newSong.id),
    with: { genres: { with: { genre: true } } }
  })
  const genres = songWithGenres?.genres.map(g => g.genre) ?? []

  return {
    success: true,
    song: {
      ...newSong,
      artistName: artist.name,
      albumName: album.title,
      cover: album.cover,
      genres
    }
  }
})
