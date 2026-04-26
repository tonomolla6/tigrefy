/**
 * Rate limiter en memoria para proteger endpoints sensibles (login, register).
 *
 * Limitaciones conocidas:
 * - El estado vive en cada instancia del Worker; un atacante con múltiples IPs
 *   o que provoca el reciclaje del Worker puede esquivarlo. Para esta app
 *   personal es suficiente, pero si hace falta más rigor cambiar a un store
 *   compartido (Turso o Cloudflare KV).
 *
 * Uso:
 *   const ip = getClientIp(event)
 *   if (!checkRateLimit(`login:${ip}`, 5, 15 * 60_000)) {
 *     throw createError({ statusCode: 429, statusMessage: 'Demasiados intentos' })
 *   }
 */
import type { H3Event } from 'h3'
import { getRequestHeader, getRequestIP } from 'h3'

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

/**
 * Devuelve true si la petición está dentro del límite (y consume un intento).
 * Devuelve false si se ha pasado del límite (debe rechazarse).
 */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()

  // Limpieza inline cada vez que el mapa crece — evita timers en Workers
  if (buckets.size > 500) {
    for (const [k, b] of buckets) {
      if (b.resetAt < now) buckets.delete(k)
    }
  }

  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= max) return false

  bucket.count++
  return true
}

/**
 * Permite resetear el contador (p.ej. tras un login exitoso).
 */
export function resetRateLimit(key: string): void {
  buckets.delete(key)
}

/**
 * Obtiene la IP del cliente respetando el header de Cloudflare.
 */
export function getClientIp(event: H3Event): string {
  return (
    getRequestHeader(event, 'cf-connecting-ip') ||
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestIP(event, { xForwardedFor: true }) ||
    'unknown'
  )
}

