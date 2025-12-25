import { useDB, albums } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID del álbum es requerido'
    })
  }

  const body = await readBody(event)
  const { title, cover, releaseDate, isPublic, artistId } = body

  const db = useDB()

  // Verificar que el álbum existe
  const album = await db.query.albums.findFirst({
    where: (albums, { eq }) => eq(albums.id, id)
  })

  if (!album) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Álbum no encontrado'
    })
  }

  // Preparar los campos a actualizar
  const updateData: Record<string, any> = {}

  if (title !== undefined) {
    if (!title || title.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El título del álbum no puede estar vacío'
      })
    }
    updateData.title = title.trim()
  }

  if (cover !== undefined) {
    updateData.cover = cover || null
  }

  if (releaseDate !== undefined) {
    updateData.releaseDate = releaseDate || null
  }

  if (isPublic !== undefined) {
    updateData.isPublic = isPublic
  }

  if (artistId !== undefined) {
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
    updateData.artistId = artistId
    updateData.artistName = artist.name
  }

  if (Object.keys(updateData).length === 0) {
    return { success: true, album }
  }

  // Actualizar el álbum
  const result = await db.update(albums)
    .set(updateData)
    .where(eq(albums.id, id))
    .returning()

  return {
    success: true,
    album: result[0]
  }
})
