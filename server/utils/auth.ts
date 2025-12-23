import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'

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

// ============================================
// Password Hashing con Web Crypto API (PBKDF2)
// ============================================

// Genera un salt aleatorio
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}

// Deriva una key usando PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  )
}

// Convierte ArrayBuffer a hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Convierte hex string a Uint8Array
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

// Hash password con PBKDF2 (formato: salt$hash)
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt()
  const derivedKey = await deriveKey(password, salt)
  const saltHex = bufferToHex(salt.buffer as ArrayBuffer)
  const hashHex = bufferToHex(derivedKey)
  return `${saltHex}$${hashHex}`
}

// Verificar password contra hash
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split('$')
  if (!saltHex || !hashHex) return false

  const salt = hexToBuffer(saltHex)
  const derivedKey = await deriveKey(password, salt)
  const newHashHex = bufferToHex(derivedKey)

  return hashHex === newHashHex
}

// ============================================
// JWT con jose (Edge-compatible)
// ============================================

// Obtiene la secret key como Uint8Array
function getSecretKey(): Uint8Array {
  const config = useRuntimeConfig()
  return new TextEncoder().encode(config.jwtSecret)
}

// Generar JWT
export async function generateToken(payload: TokenPayload): Promise<string> {
  const secret = getSecretKey()

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret)
}

// Verificar JWT
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  const secret = getSecretKey()

  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string
    }
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
export async function getAuthUser(event: H3Event): Promise<TokenPayload | null> {
  const token = getTokenFromEvent(event)
  if (!token) return null
  return verifyToken(token)
}

// Requerir autenticación (lanza error si no está autenticado)
export async function requireAuth(event: H3Event): Promise<TokenPayload> {
  const user = await getAuthUser(event)
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
export async function requireTigre(event: H3Event): Promise<TokenPayload> {
  const user = await getAuthUser(event)
  if (!user || !canManageContent(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado. Se requiere rol tigre.'
    })
  }
  return user
}
