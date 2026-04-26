import { useDB, users } from '~/server/db'
import { requireParam } from '~/server/utils/params'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = requireParam(event, 'id', 'ID de usuario')
  const authUser = event.context.auth

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
