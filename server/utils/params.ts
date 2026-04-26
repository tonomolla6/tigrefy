/**
 * Helpers para validar parámetros y body de endpoints.
 *
 * Antes había `if (!id) throw createError(400, '...')` en 20+ endpoints.
 * Centralizado aquí para tener mensajes y status codes consistentes.
 */
import type { H3Event } from 'h3'
import { createError, getRouterParam } from 'h3'

/**
 * Devuelve el parámetro de ruta o lanza 400 si falta.
 *
 * @example
 *   const id = requireParam(event, 'id', 'ID de canción')
 */
export function requireParam(
  event: H3Event,
  paramName: string,
  label?: string
): string {
  const value = getRouterParam(event, paramName)
  if (!value) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label || paramName} requerido`,
    })
  }
  return value
}
