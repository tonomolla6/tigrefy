import { useDB, users } from '~/server/db'
import { getAuthUser } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const authUser = getAuthUser(event)

  if (!authUser) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No autorizado'
    })
  }

  const db = useDB()

  const result = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, authUser.userId))
    .limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuario no encontrado'
    })
  }

  const user = result[0]

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName || user.username,
    role: user.role || 'user',
    createdAt: user.createdAt
  }
})
