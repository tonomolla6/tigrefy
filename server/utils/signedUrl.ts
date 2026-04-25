/**
 * Firma HMAC-SHA256 de paths para URLs caducantes.
 * Usado para proteger los segmentos HLS contra hotlinking/scraping.
 */

async function hmacSha256Base64(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Firma un path con timestamp de expiración.
 * El mensaje firmado es path+expires (concatenación directa).
 */
export async function signPath(path: string, expires: number): Promise<string> {
  const config = useRuntimeConfig()
  return hmacSha256Base64(config.r2SigningSecret, `${path}${expires}`)
}

/**
 * Calcula timestamp Unix de expiración a partir de ahora.
 */
export function getExpires(seconds: number): number {
  return Math.floor(Date.now() / 1000) + seconds
}

/**
 * Compara dos strings en tiempo constante (anti-timing-attack).
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
