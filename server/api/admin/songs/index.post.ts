import { useDB, songs, albums } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  requireTigre(event)

  const body = await readBody(event)
  const { title, artistId, albumId, trackNumber, duration, audioUrl, lyrics, isPublic } = body

  if (!title || title.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El título de la canción es requerido'
    })
  }

  if (!artistId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El artista es requerido'
    })
  }

  if (!albumId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El álbum es requerido'
    })
  }

  if (!audioUrl || audioUrl.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La URL del audio es requerida'
    })
  }

  const db = useDB()

  // Verificar que el artista existe
  const artist = await db.query.artists.findFirst({
    where: (artists, { eq }) => eq(artists.id, artistId)
  })

  if (!artist) {
    throw createError({
      statusCode: 404,
      statusMessage: 'El artista no existe'
    })
  }

  // Verificar que el álbum existe y pertenece al artista
  const album = await db.query.albums.findFirst({
    where: (albums, { eq }) => eq(albums.id, albumId)
  })

  if (!album) {
    throw createError({
      statusCode: 404,
      statusMessage: 'El álbum no existe'
    })
  }

  if (album.artistId !== artistId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El álbum no pertenece al artista seleccionado'
    })
  }

  // Obtener el número de pista si no se proporciona
  let finalTrackNumber = trackNumber
  if (!finalTrackNumber) {
    const existingSongs = await db.query.songs.findMany({
      where: (songs, { eq }) => eq(songs.albumId, albumId)
    })
    finalTrackNumber = existingSongs.length + 1
  }

  // Crear la canción
  const result = await db.insert(songs).values({
    title: title.trim(),
    artistId,
    albumId,
    trackNumber: finalTrackNumber,
    duration: duration || 0,
    audioUrl: audioUrl.trim(),
    lyrics: lyrics || null,
    plays: 0,
    isPublic: isPublic ?? false
  }).returning()

  // Actualizar totalTracks y duration del álbum
  const albumSongs = await db.query.songs.findMany({
    where: (songs, { eq }) => eq(songs.albumId, albumId)
  })

  const totalDuration = albumSongs.reduce((sum, s) => sum + (s.duration || 0), 0)

  await db.update(albums)
    .set({
      totalTracks: albumSongs.length,
      duration: totalDuration
    })
    .where(eq(albums.id, albumId))

  return {
    success: true,
    song: {
      ...result[0],
      artistName: artist.name,
      albumName: album.title,
      cover: album.cover
    }
  }
})
