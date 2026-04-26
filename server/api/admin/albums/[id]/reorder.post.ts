/**
 * Reordena las canciones de un álbum.
 *
 * POST /api/admin/albums/<albumId>/reorder
 * Body: { songIds: string[] }   ← nuevo orden completo
 *
 * Actualiza songs.trackNumber según la posición en el array (1-indexed).
 * Solo afecta a canciones que pertenecen a ese álbum.
 */
import { useDB, songs } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { requireParam } from '~/server/utils/params'
import { and, eq, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireTigre(event)
  const albumId = requireParam(event, 'id', 'albumId')

  const body = await readBody<{ songIds?: string[] }>(event)
  const songIds = body?.songIds
  if (!Array.isArray(songIds) || songIds.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'songIds debe ser un array no vacío' })
  }

  const db = useDB()

  // Verificar que todas las canciones pertenecen al álbum
  const albumSongs = await db.select({ id: songs.id })
    .from(songs)
    .where(and(eq(songs.albumId, albumId), inArray(songs.id, songIds)))

  const validIds = new Set(albumSongs.map(s => s.id))
  const invalidIds = songIds.filter(id => !validIds.has(id))
  if (invalidIds.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Canciones que no pertenecen a este álbum: ${invalidIds.join(', ')}`
    })
  }

  // Actualizar trackNumber según posición (1-indexed)
  for (let i = 0; i < songIds.length; i++) {
    await db.update(songs)
      .set({ trackNumber: i + 1 })
      .where(eq(songs.id, songIds[i]))
  }

  return { success: true, updated: songIds.length }
})
