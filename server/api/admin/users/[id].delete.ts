import { useDB, users } from '~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const authUser = event.context.auth

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de usuario requerido'
    })
  }

  // No permitir eliminarse a sí mismo
  if (authUser?.userId === id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No puedes eliminarte a ti mismo'
    })
  }

  const db = useDB()

  // Verificar que el usuario existe
  const existing = await db.query.users.findFirst({
    where: eq(users.id, id)
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuario no encontrado'
    })
  }

  await db.delete(users).where(eq(users.id, id))

  return {
    success: true,
    id
  }
})
