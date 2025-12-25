import { useDB, artists } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID del artista es requerido'
    })
  }

  const body = await readBody(event)
  const { name, image, bio } = body

  const db = useDB()

  // Verificar que el artista existe
  const artist = await db.query.artists.findFirst({
    where: (artists, { eq }) => eq(artists.id, id)
  })

  if (!artist) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Artista no encontrado'
    })
  }

  // Preparar los campos a actualizar
  const updateData: Record<string, any> = {}

  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El nombre del artista no puede estar vacío'
      })
    }
    updateData.name = name.trim()
  }

  if (image !== undefined) {
    updateData.image = image || null
  }

  if (bio !== undefined) {
    updateData.bio = bio || null
  }

  if (Object.keys(updateData).length === 0) {
    return {
      success: true,
      artist
    }
  }

  // Actualizar el artista
  const result = await db.update(artists)
    .set(updateData)
    .where(eq(artists.id, id))
    .returning()

  return {
    success: true,
    artist: result[0]
  }
})
