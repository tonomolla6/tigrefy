import { useDB, albums } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const body = await readBody(event)
  const { title, artistId, cover, releaseDate, genres, isPublic } = body

  if (!title || title.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El título del álbum es requerido'
    })
  }

  if (!artistId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El artista es requerido'
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

  const result = await db.insert(albums).values({
    title: title.trim(),
    artistId,
    cover: cover || null,
    releaseDate: releaseDate || new Date().toISOString().split('T')[0],
    genres: genres ? JSON.stringify(genres) : null,
    totalTracks: 0,
    duration: 0,
    isPublic: isPublic ?? false
  }).returning()

  return {
    success: true,
    album: {
      ...result[0],
      artistName: artist.name
    }
  }
})
