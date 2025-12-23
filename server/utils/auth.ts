import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

const SALT_ROUNDS = 10
const TOKEN_EXPIRY = '7d'

export interface TokenPayload {
  userId: string
  username: string
  role: string
}

export interface User {
  id: string
  username: string
  displayName: string | null
  createdAt: string
}

// Hash password con bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Verificar password contra hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generar JWT
export function generateToken(payload: TokenPayload): string {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, { expiresIn: TOKEN_EXPIRY })
}

// Verificar JWT
export function verifyToken(token: string): TokenPayload | null {
  const config = useRuntimeConfig()
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload
  } catch {
    return null
  }
}

// Obtener token del header Authorization o cookie
export function getTokenFromEvent(event: H3Event): string | null {
  // Primero intentar desde header Authorization
  const authHeader = getHeader(event, 'Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Si no, intentar desde cookie
  const token = getCookie(event, 'tigrefy_token')
  return token || null
}

// Obtener usuario autenticado del evento
export function getAuthUser(event: H3Event): TokenPayload | null {
  const token = getTokenFromEvent(event)
  if (!token) return null
  return verifyToken(token)
}

// Requerir autenticación (lanza error si no está autenticado)
export function requireAuth(event: H3Event): TokenPayload {
  const user = getAuthUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No autorizado'
    })
  }
  return user
}

// Verificar si el rol puede ver todo el contenido (tigre y user)
export function canSeeAllContent(role: string | undefined): boolean {
  return ['tigre', 'user'].includes(role || '')
}

// Verificar si el rol puede gestionar visibilidad (solo tigre)
export function canManageContent(role: string | undefined): boolean {
  return role === 'tigre'
}

// Requerir rol tigre (admin)
export function requireTigre(event: H3Event): TokenPayload {
  const user = getAuthUser(event)
  if (!user || !canManageContent(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado. Se requiere rol tigre.'
    })
  }
  return user
}
