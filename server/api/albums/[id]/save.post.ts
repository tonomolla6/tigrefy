import { useDB, savedAlbums, albums } from '~/server/db'
import { requireAuth } from '~/server/utils/auth'
import { requireParam } from '~/server/utils/params'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.userId
  const albumId = requireParam(event, 'id', 'ID de álbum')
  const db = useDB()

  // Verificar que el álbum existe
  const album = await db.query.albums.findFirst({
    where: (a, { eq }) => eq(a.id, albumId)
  })

  if (!album) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Álbum no encontrado'
    })
  }

  // Verificar si ya está guardado
  const existing = await db.query.savedAlbums.findFirst({
    where: (sa, { and, eq }) => and(
      eq(sa.userId, userId),
      eq(sa.albumId, albumId)
    )
  })

  let saved: boolean

  if (existing) {
    // Quitar de guardados
    await db.delete(savedAlbums).where(and(
      eq(savedAlbums.userId, userId),
      eq(savedAlbums.albumId, albumId)
    ))
    saved = false
  } else {
    // Guardar
    await db.insert(savedAlbums).values({
      userId,
      albumId
    })
    saved = true
  }

  return {
    success: true,
    saved,
    albumId
  }
})
