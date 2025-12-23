import { useDB, users } from '~/server/db'
import { eq, and, ne } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de usuario requerido'
    })
  }

  const body = await readBody(event)
  const { role, displayName, username, password } = body

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

  // Preparar actualizaciones
  const updates: Record<string, any> = {}

  if (role) {
    const validRoles = ['tigre', 'user', 'guest'] as const
    if (validRoles.includes(role)) {
      updates.role = role
    }
  }

  if (displayName !== undefined) {
    updates.displayName = displayName
  }

  // Actualizar username si se proporciona
  if (username !== undefined && username !== existing.username) {
    if (username.length < 3) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El nombre de usuario debe tener al menos 3 caracteres'
      })
    }

    // Verificar que el nuevo username no esté en uso
    const usernameExists = await db.query.users.findFirst({
      where: and(
        eq(users.username, username),
        ne(users.id, id)
      )
    })

    if (usernameExists) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Este nombre de usuario ya está en uso'
      })
    }

    updates.username = username
  }

  // Actualizar contraseña si se proporciona
  if (password) {
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La contraseña debe tener al menos 6 caracteres'
      })
    }
    // Hash de la contraseña
    const bcrypt = await import('bcryptjs')
    updates.passwordHash = await bcrypt.hash(password, 10)
  }

  if (Object.keys(updates).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No hay cambios para aplicar'
    })
  }

  await db.update(users)
    .set(updates)
    .where(eq(users.id, id))

  // Devolver el usuario actualizado
  const updatedUser = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: {
      id: true,
      username: true,
      displayName: true,
      role: true
    }
  })

  return {
    success: true,
    user: updatedUser
  }
})
