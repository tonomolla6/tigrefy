import { useDB, savedPlaylists } from '~/server/db'
import { requireAuth } from '~/server/utils/auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId

  const playlistId = getRouterParam(event, 'id')
  if (!playlistId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de playlist requerido'
    })
  }

  const db = useDB()

  // Verificar que la playlist existe
  const playlist = await db.query.playlists.findFirst({
    where: (p, { eq }) => eq(p.id, playlistId)
  })

  if (!playlist) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Playlist no encontrada'
    })
  }

  // Verificar si ya está guardada
  const existing = await db.query.savedPlaylists.findFirst({
    where: (sp, { and, eq }) => and(
      eq(sp.userId, userId),
      eq(sp.playlistId, playlistId)
    )
  })

  let saved: boolean

  if (existing) {
    // Quitar de guardados
    await db.delete(savedPlaylists).where(and(
      eq(savedPlaylists.userId, userId),
      eq(savedPlaylists.playlistId, playlistId)
    ))
    saved = false
  } else {
    // Guardar
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
