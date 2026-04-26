/**
 * Añade o quita una canción de una playlist propia del usuario.
 *
 * Body: { songId: string, action?: 'add' | 'remove' }  (default: 'add')
 *
 * Solo el dueño de la playlist puede modificarla. Los admins usan el endpoint
 * análogo en /api/admin/playlists/[id]/songs para gestionar cualquier playlist.
 */
import { useDB, playlistSongs, playlists } from '~/server/db'
import { requireAuth } from '~/server/utils/auth'
import { requireParam } from '~/server/utils/params'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const playlistId = requireParam(event, 'id', 'ID de playlist')

  const body = await readBody<{ songId?: string; action?: 'add' | 'remove' }>(event)
  const songId = body?.songId
  const action = body?.action ?? 'add'

  if (!songId) {
    throw createError({ statusCode: 400, statusMessage: 'songId requerido' })
  }

  const db = useDB()

  // Solo el dueño puede modificar la playlist
  const playlist = await db.query.playlists.findFirst({
    where: (p, { eq }) => eq(p.id, playlistId),
  })
  if (!playlist) {
    throw createError({ statusCode: 404, statusMessage: 'Playlist no encontrada' })
  }
  if (playlist.ownerId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'No puedes modificar esta playlist' })
  }

  if (action === 'remove') {
    await db.delete(playlistSongs).where(and(
      eq(playlistSongs.playlistId, playlistId),
      eq(playlistSongs.songId, songId)
    ))
  } else {
    // Si ya existe no hacer nada (idempotente)
    const existing = await db.query.playlistSongs.findFirst({
      where: (ps, { and, eq }) => and(
        eq(ps.playlistId, playlistId),
        eq(ps.songId, songId)
      ),
    })

    if (!existing) {
      const currentSongs = await db.query.playlistSongs.findMany({
        where: (ps, { eq }) => eq(ps.playlistId, playlistId),
      })
      const maxPosition = currentSongs.reduce((max, s) => Math.max(max, s.position || 0), 0)

      await db.insert(playlistSongs).values({
        playlistId,
        songId,
        position: maxPosition + 1,
      })
    }
  }

  const updated = await db.query.playlistSongs.findMany({
    where: (ps, { eq }) => eq(ps.playlistId, playlistId),
  })

  return {
    success: true,
    added: action === 'add',
    songCount: updated.length,
  }
})
