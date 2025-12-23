import { useDB, users } from '~/server/db'
import { verifyPassword, generateToken } from '~/server/utils/auth'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { username, password } = body

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username y password son requeridos'
    })
  }

  const db = useDB()

  // Buscar usuario
  const result = await db
    .select()
    .from(users)
    .where(sql`LOWER(${users.username}) = LOWER(${username})`)
    .limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales inválidas'
    })
  }

  const user = result[0]

  // Verificar contraseña
  const isValid = await verifyPassword(password, user.passwordHash)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales inválidas'
    })
  }

  // Generar token con rol
  const token = await generateToken({
    userId: user.id,
    username: user.username,
    role: user.role || 'user'
  })

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

  // Actualizar último login
  await db.update(users)
    .set({ lastLoginAt: sql`datetime('now')` })
    .where(eq(users.id, user.id))

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      role: user.role || 'user'
    },
    token
  }
})
