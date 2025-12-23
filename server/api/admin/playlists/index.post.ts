import { useDB, playlists } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const body = await readBody(event)
  const { name, description, cover, isPublic } = body

  if (!name || name.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre de la playlist es requerido'
    })
  }

  const db = useDB()

  // Crear playlist del sistema (sin owner)
  const result = await db.insert(playlists).values({
    name: name.trim(),
    description: description || null,
    cover: cover || '/covers/default-playlist.png',
    ownerId: null, // Playlist del sistema
    isPublic: isPublic ?? true
  }).returning()

  return {
    success: true,
    playlist: {
      ...result[0],
      ownerName: 'Sistema',
      songCount: 0
    }
  }
})
