/**
 * Endpoint único para HLS:
 *
 *   GET /api/hls/<songId>/index.m3u8
 *     → Devuelve el playlist con URLs de segmento firmadas (HMAC)
 *     → No requiere firma (info pública por sí sola)
 *
 *   GET /api/hls/<songId>/<segment>.ts?expires=<ts>&token=<hmac>
 *     → Sirve el segmento desde R2 si la firma valida
 *     → 401 si falta firma, expiró o no valida
 */
import { signPath, getExpires, safeCompare } from '~/server/utils/signedUrl'
import { getR2Object, getR2ObjectBuffer } from '~/server/utils/r2'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const filename = getRouterParam(event, 'filename')

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid track id' })
  }
  if (!filename || !/^[a-zA-Z0-9._-]+$/.test(filename) || filename.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })
  }

  // ---------- PLAYLIST ----------
  if (filename === 'index.m3u8' || filename.endsWith('.m3u8')) {
    const playlistKey = `tracks/${id}/${filename}`
    const original = await getR2Object(playlistKey, event)
    if (!original) {
      throw createError({ statusCode: 404, statusMessage: 'Playlist not found' })
    }

    // 15 min. El cliente (useHlsPlayer) refresca proactivamente este manifest
    // a los 12 min de cargarlo, así que la caducidad real nunca afecta a
    // playback en curso. Si por algún motivo el refresh proactivo falla (tab
    // throttled, etc.), el recovery reactivo del cliente lo coge.
    // Mantener este valor en sintonía con MANIFEST_REFRESH_MS de useHlsPlayer.
    const expires = getExpires(900)

    const lines = original.split('\n')
    const rewritten = await Promise.all(
      lines.map(async (line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return line
        if (!trimmed.endsWith('.ts')) return line

        const segmentPath = `/api/hls/${id}/${trimmed}`
        const token = await signPath(segmentPath, expires)
        return `${segmentPath}?expires=${expires}&token=${token}`
      })
    )

    setHeader(event, 'Content-Type', 'application/vnd.apple.mpegurl')
    setHeader(event, 'Cache-Control', 'no-store')
    setHeader(event, 'X-Content-Type-Options', 'nosniff')
    return rewritten.join('\n')
  }

  // ---------- SEGMENTO ----------
  if (filename.endsWith('.ts')) {
    const query = getQuery(event)
    const expires = parseInt(query.expires as string, 10)
    const token = query.token as string

    if (!expires || !token) {
      throw createError({ statusCode: 401, statusMessage: 'Missing signature' })
    }
    if (Math.floor(Date.now() / 1000) > expires) {
      throw createError({ statusCode: 401, statusMessage: 'Signature expired' })
    }

    const path = `/api/hls/${id}/${filename}`
    const expected = await signPath(path, expires)
    if (!safeCompare(expected, token)) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
    }

    const buffer = await getR2ObjectBuffer(`tracks/${id}/${filename}`, event)
    if (!buffer) {
      throw createError({ statusCode: 404, statusMessage: 'Segment not found' })
    }

    setHeader(event, 'Content-Type', 'video/MP2T')
    setHeader(event, 'Cache-Control', 'public, max-age=300, immutable')
    return new Uint8Array(buffer)
  }

  throw createError({ statusCode: 400, statusMessage: 'Unsupported file type' })
})
