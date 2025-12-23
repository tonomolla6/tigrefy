import { useDB, userFavorites } from '~/server/db'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const body = await readBody(event)

  const { type, id } = body

  if (!type || !id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'type e id son requeridos'
    })
  }

  const validTypes = ['song', 'album', 'artist', 'playlist']
  if (!validTypes.includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'type debe ser: song, album, artist o playlist'
    })
  }

  const db = useDB()

  // Verificar si ya existe
  const existing = await db
    .select({ itemId: userFavorites.itemId })
    .from(userFavorites)
    .where(and(
      eq(userFavorites.userId, userId),
      eq(userFavorites.itemType, type),
      eq(userFavorites.itemId, id)
    ))
    .limit(1)

  let added: boolean

  if (existing.length > 0) {
    // Eliminar
    await db.delete(userFavorites).where(and(
      eq(userFavorites.userId, userId),
      eq(userFavorites.itemType, type),
      eq(userFavorites.itemId, id)
    ))
    added = false
  } else {
    // Agregar
    await db.insert(userFavorites).values({
      userId,
      itemType: type,
      itemId: id
    })
    added = true
  }

  return {
    success: true,
    added,
    type,
    id
  }
})
