/**
 * Recibe un bundle HLS pre-convertido (en el navegador con ffmpeg.wasm)
 * y lo guarda en R2 bajo tracks/<trackId>/.
 *
 * Funciona en Cloudflare Workers (no usa ffmpeg, solo guarda archivos).
 *
 * Body multipart con N campos llamados "files":
 *   - index.m3u8 (uno)
 *   - segment000.ts, segment001.ts, ... (varios)
 * Y un campo opcional "trackId" para reemplazar el audio de una canción
 * existente (mantiene mismo id en R2).
 */
import { requireTigre } from '~/server/utils/auth'
import { putR2Object } from '~/server/utils/r2'
import { generateId } from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No se ha recibido ningún archivo' })
  }

  const trackIdField = formData.find(f => f.name === 'trackId')
  const trackIdParam = trackIdField?.data?.toString()
  const songId = trackIdParam && /^[a-zA-Z0-9_-]+$/.test(trackIdParam)
    ? trackIdParam
    : generateId()

  const files = formData.filter(f => f.name === 'files' && f.data && f.filename)

  if (files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No se ha recibido ningún archivo HLS' })
  }

  const playlist = files.find(f => f.filename === 'index.m3u8')
  if (!playlist) {
    throw createError({ statusCode: 400, statusMessage: 'Falta index.m3u8 en el bundle' })
  }

  // Validar nombres (anti path-traversal)
  for (const file of files) {
    const name = file.filename!
    if (!/^[a-zA-Z0-9._-]+$/.test(name) || name.includes('..')) {
      throw createError({ statusCode: 400, statusMessage: `Nombre de archivo inválido: ${name}` })
    }
  }

  // Calcular duración sumando los EXTINF del playlist
  const playlistText = new TextDecoder().decode(playlist.data)
  const duration = Math.round(
    playlistText.split('\n')
      .filter(line => line.startsWith('#EXTINF:'))
      .reduce((sum, line) => {
        const match = line.match(/#EXTINF:([\d.]+)/)
        return sum + (match ? parseFloat(match[1]) : 0)
      }, 0)
  )

  // Subir cada archivo a R2
  let totalSize = 0
  for (const file of files) {
    const name = file.filename!
    const r2Key = `tracks/${songId}/${name}`
    const contentType = name.endsWith('.m3u8')
      ? 'application/vnd.apple.mpegurl'
      : 'video/MP2T'
    await putR2Object(r2Key, new Uint8Array(file.data), contentType, event)
    totalSize += file.data.length
  }

  return {
    success: true,
    url: songId,
    trackId: songId,
    duration,
    segments: files.length - 1,  // sin contar el index.m3u8
    size: totalSize,
  }
})
