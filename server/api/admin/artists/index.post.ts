import { useDB, artists } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireTigre(event)

  const body = await readBody(event)
  const { name, image, bio, genres } = body

  if (!name || name.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre del artista es requerido'
    })
  }

  const db = useDB()

  const result = await db.insert(artists).values({
    name: name.trim(),
    image: image || null,
    bio: bio || null,
    genres: genres ? JSON.stringify(genres) : null,
    followers: 0
  }).returning()

  return {
    success: true,
    artist: result[0]
  }
})
