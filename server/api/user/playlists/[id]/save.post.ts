import { useDB, playlists, savedPlaylists } from '~/server/db'
import { eq, and } from 'drizzle-orm'

// Guardar o quitar una playlist de la biblioteca del usuario
export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const playlistId = getRouterParam(event, 'id')

  if (!playlistId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de playlist requerido'
    })
  }

  const db = useDB()

  // Verificar que la playlist existe
  const existing = await db
    .select({ id: playlists.id, isPublic: playlists.isPublic, ownerId: playlists.ownerId })
    .from(playlists)
    .where(eq(playlists.id, playlistId))
    .limit(1)

  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Playlist no encontrada'
    })
  }

  const playlist = existing[0]

  // Solo se pueden guardar playlists públicas o del propio usuario
  if (!playlist.isPublic && playlist.ownerId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes acceso a esta playlist'
    })
  }

  // Verificar si ya está guardada
  const alreadySaved = await db
    .select({ playlistId: savedPlaylists.playlistId })
    .from(savedPlaylists)
    .where(and(
      eq(savedPlaylists.userId, userId),
      eq(savedPlaylists.playlistId, playlistId)
    ))
    .limit(1)

  let saved: boolean

  if (alreadySaved.length > 0) {
    // Quitar de biblioteca (a menos que sea el owner)
    if (playlist.ownerId === userId) {
      // El owner no puede quitar su propia playlist de su biblioteca
      return {
        success: true,
        saved: true,
        message: 'No puedes quitar tu propia playlist de tu biblioteca'
      }
    }

    await db.delete(savedPlaylists).where(and(
      eq(savedPlaylists.userId, userId),
      eq(savedPlaylists.playlistId, playlistId)
    ))
    saved = false
  } else {
    // Agregar a biblioteca
    await db.insert(savedPlaylists).values({
      userId,
      playlistId
    })
    saved = true
  }

  return {
    success: true,
    saved,
    playlistId
  }
})
