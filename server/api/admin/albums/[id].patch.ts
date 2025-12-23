import { useDB, albums } from '~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de álbum requerido'
    })
  }

  const body = await readBody(event)
  const { isPublic } = body

  if (typeof isPublic !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'isPublic debe ser un booleano'
    })
  }

  const db = useDB()

  // Verificar que el álbum existe
  const existing = await db.query.albums.findFirst({
    where: eq(albums.id, id)
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Álbum no encontrado'
    })
  }

  // Actualizar visibilidad
  await db.update(albums)
    .set({ isPublic })
    .where(eq(albums.id, id))

  return {
    success: true,
    id,
    isPublic
  }
})
