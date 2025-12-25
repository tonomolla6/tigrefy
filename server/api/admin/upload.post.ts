import { requireTigre } from '~/server/utils/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

  if (!fileField || !fileField.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No se ha recibido el archivo'
    })
  }

  const type = typeField?.data?.toString() || 'cover'

  // Determinar el directorio según el tipo
  let subDir = 'covers'
  let allowedMimes: string[] = []

  switch (type) {
    case 'audio':
      subDir = 'audio'
      allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a']
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

  // Verificar tipo MIME
  const mimeType = fileField.type || ''
  if (allowedMimes.length > 0 && !allowedMimes.some(m => mimeType.includes(m.split('/')[1]))) {
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
    await writeFile(filePath, fileField.data)
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
    size: fileField.data.length
  }
})
