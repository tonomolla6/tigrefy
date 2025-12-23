import { useDB, users } from '~/server/db'
import { hashPassword, generateToken } from '~/server/utils/auth'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const { username, password, displayName, masterKey, role } = body

  // Validar clave maestra (registro privado)
  if (!masterKey || masterKey !== config.masterKey) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Clave maestra inválida. El registro requiere autorización.'
    })
  }

  // Validaciones
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username y password son requeridos'
    })
  }

  if (username.length < 3) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El username debe tener al menos 3 caracteres'
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La contraseña debe tener al menos 6 caracteres'
    })
  }

  // Validar rol
  const validRoles = ['tigre', 'user', 'guest'] as const
  const userRole = validRoles.includes(role) ? role : 'guest'

  const db = useDB()

  // Verificar si el usuario ya existe
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`LOWER(${users.username}) = LOWER(${username})`)
    .limit(1)

  if (existingUser.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'El username ya está en uso'
    })
  }

  // Crear usuario (ID se genera automáticamente)
  const passwordHash = await hashPassword(password)

  const result = await db.insert(users).values({
    username,
    passwordHash,
    displayName: displayName || username,
    role: userRole
  }).returning({ id: users.id })

  const userId = result[0].id

  // Generar token
  const token = await generateToken({ userId, username, role: userRole })

  // Establecer cookie httpOnly para el servidor
  setCookie(event, 'tigrefy_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/'
  })

  // Cookie no-httpOnly para que el cliente sepa que hay sesión
  setCookie(event, 'tigrefy_auth', '1', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/'
  })

  return {
    success: true,
    user: {
      id: userId,
      username,
      displayName: displayName || username,
      role: userRole
    },
    token
  }
})
