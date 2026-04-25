/**
 * Endpoint de subida del admin para imágenes (covers + artistas).
 *
 * El audio NO se sube por aquí — se hace por /api/admin/upload-audio
 * (recibe HLS pre-convertido en el navegador con ffmpeg.wasm).
 */
import { requireTigre } from '~/server/utils/auth'
import { putR2Object } from '~/server/utils/r2'

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No se ha recibido ningún archivo' })
  }

  const fileField = formData.find(f => f.name === 'file')
  const typeField = formData.find(f => f.name === 'type')

  if (!fileField || !fileField.data) {
    throw createError({ statusCode: 400, statusMessage: 'No se ha recibido el archivo' })
  }

  const type = typeField?.data?.toString() || 'cover'
  const mimeType = fileField.type || ''
  const originalName = fileField.filename || 'file'

  if (type !== 'cover' && type !== 'artist') {
    throw createError({
      statusCode: 400,
      statusMessage: type === 'audio'
        ? 'El audio se sube por /api/admin/upload-audio (HLS bundle)'
        : `Tipo no soportado: ${type}`
    })
  }

  if (!IMAGE_MIMES.some(m => mimeType.includes(m.split('/')[1]))) {
    throw createError({ statusCode: 400, statusMessage: `Imagen inválida (${mimeType})` })
  }

  const ext = (originalName.split('.').pop() || 'jpg').toLowerCase()
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  const safeName = nameWithoutExt
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)

  const fileName = `${safeName}.${ext}`
  const r2Key = type === 'artist' ? `artists/${fileName}` : `covers/${fileName}`
  const url = `/${r2Key}`

  await putR2Object(r2Key, new Uint8Array(fileField.data), mimeType, event)

  return { success: true, url, fileName, type, size: fileField.data.length }
})
