import { useDB, albums, songs } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID del álbum es requerido'
    })
  }

  const db = useDB()

  // Verificar que el álbum existe
  const album = await db.query.albums.findFirst({
    where: (albums, { eq }) => eq(albums.id, id)
  })

  if (!album) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Álbum no encontrado'
    })
  }

  // Verificar si tiene canciones asociadas
  const albumSongs = await db.query.songs.findMany({
    where: (songs, { eq }) => eq(songs.albumId, id)
  })

  if (albumSongs.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `No se puede eliminar el álbum porque tiene ${albumSongs.length} canción(es). Elimina primero las canciones.`
    })
  }

  // Eliminar el álbum
  await db.delete(albums).where(eq(albums.id, id))

  return {
    success: true,
    message: 'Álbum eliminado correctamente'
  }
})
