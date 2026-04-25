import { requireTigre } from '~/server/utils/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { putR2Object } from '~/server/utils/r2'

// Imágenes (cover/artist) → siempre R2 (dev y prod).
// Audio MP3 → aún se sirve desde public/ hasta migrar a HLS.
// HLS pre-convertido → siempre R2 (los scripts lo suben directo).
const AUDIO_TO_R2 = process.env.USE_R2_STORAGE === 'true'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No se ha recibido ningún archivo'
    })
  }

  const fileField = formData.find(f => f.name === 'file')
  const typeField = formData.find(f => f.name === 'type')
  const trackIdField = formData.find(f => f.name === 'trackId')

  if (!fileField || !fileField.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No se ha recibido el archivo'
    })
  }

  const type = typeField?.data?.toString() || 'cover'
  const trackId = trackIdField?.data?.toString()

  // Determinar el directorio según el tipo
  let subDir = 'covers'
  let allowedMimes: string[] = []

  switch (type) {
    case 'audio':
      subDir = 'audio'
      allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a']
      break
    case 'hls':
      // Para archivos HLS pre-convertidos (.m3u8 y .ts)
      subDir = 'tracks'
      allowedMimes = ['application/vnd.apple.mpegurl', 'video/MP2T', 'application/octet-stream', 'text/plain']
      break
    case 'artist':
      subDir = 'artists'
      allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      break
    case 'cover':
    default:
      subDir = 'covers'
      allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      break
  }

  // Verificar tipo MIME (más permisivo para HLS)
  const mimeType = fileField.type || ''
  if (type !== 'hls' && allowedMimes.length > 0 && !allowedMimes.some(m => mimeType.includes(m.split('/')[1]))) {
    throw createError({
      statusCode: 400,
      statusMessage: `Tipo de archivo no permitido. Se esperaba: ${allowedMimes.join(', ')}`
    })
  }

  // Usar el nombre original del archivo, solo sanitizarlo
  const originalName = fileField.filename || 'file'
  const ext = originalName.includes('.') ? originalName.split('.').pop() : (type === 'audio' ? 'mp3' : 'jpg')
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')

  // Sanitizar: quitar caracteres especiales pero mantener espacios como guiones
  const safeName = nameWithoutExt
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo alfanuméricos, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Eliminar guiones múltiples
    .replace(/^-|-$/g, '') // Quitar guiones al inicio/final
    .substring(0, 100) // Limitar longitud

  // Imágenes y HLS pre-convertido → siempre R2.
  if (type === 'cover' || type === 'artist' || type === 'hls') {
    return await handleR2Upload(type, safeName, ext!, fileField.data, mimeType, originalName, trackId)
  }

  // Audio MP3: R2 si AUDIO_TO_R2 está activo, si no local.
  if (type === 'audio' && AUDIO_TO_R2) {
    return await handleR2Upload(type, safeName, ext!, fileField.data, mimeType, originalName, trackId)
  }

  return await handleLocalUpload(type, subDir, safeName, ext!, fileField.data)
})

/**
 * Maneja la subida a R2 (producción)
 * - HLS: Sube archivos pre-convertidos a tracks/{trackId}/
 * - Imágenes: Sube directamente a covers/ o artists/
 * - Audio MP3: No recomendado, usar HLS
 */
async function handleR2Upload(
  type: string,
  safeName: string,
  ext: string,
  data: Buffer,
  mimeType: string,
  originalName: string,
  trackId?: string
) {
  if (type === 'hls') {
    // Archivos HLS pre-convertidos
    if (!trackId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'trackId es requerido para archivos HLS'
      })
    }

    // El nombre del archivo determina la ruta: index.m3u8 o segmentXXX.ts
    const r2Key = `tracks/${trackId}/${originalName}`

    let contentType = 'application/octet-stream'
    if (originalName.endsWith('.m3u8')) {
      contentType = 'application/vnd.apple.mpegurl'
    } else if (originalName.endsWith('.ts')) {
      contentType = 'video/MP2T'
    }

    await putR2Object(r2Key, data, contentType)

    return {
      success: true,
      r2Key,
      trackId,
      fileName: originalName,
      type,
      size: data.length
    }
  }

  if (type === 'audio') {
    // Advertencia: Audio MP3 directo no soporta streaming HLS
    // Subir como fallback pero recomendar conversión
    const fileName = `${safeName}.${ext}`
    const r2Key = `audio/${fileName}`

    await putR2Object(r2Key, data, mimeType || 'audio/mpeg')

    return {
      success: true,
      url: fileName, // ID para /api/media/audio/
      r2Key,
      fileName,
      type,
      size: data.length,
      warning: 'Audio MP3 directo no soporta streaming HLS. Considera convertir a HLS.'
    }
  }

  // Para imágenes: subir directamente a R2
  const fileName = `${safeName}.${ext}`
  const r2Path = type === 'artist' ? `artists/${fileName}` : `covers/${fileName}`

  await putR2Object(r2Path, data, mimeType)

  return {
    success: true,
    url: `/${type === 'artist' ? 'artists' : 'covers'}/${fileName}`, // Path para useMediaUrl
    r2Path,
    fileName,
    type,
    size: data.length
  }
}

/**
 * Maneja la subida local (desarrollo)
 */
async function handleLocalUpload(
  type: string,
  subDir: string,
  safeName: string,
  ext: string,
  data: Buffer
) {
  const fileName = `${safeName}.${ext}`

  // Construir ruta del archivo
  const publicDir = join(process.cwd(), 'public', subDir)

  // Crear directorio si no existe
  if (!existsSync(publicDir)) {
    await mkdir(publicDir, { recursive: true })
  }

  const filePath = join(publicDir, fileName)

  // Guardar el archivo
  try {
    await writeFile(filePath, data)
  } catch (error) {
    console.error('Error saving file:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al guardar el archivo'
    })
  }

  // Devolver la URL relativa
  const url = `/${subDir}/${fileName}`

  return {
    success: true,
    url,
    fileName,
    type,
    size: data.length
  }
}
