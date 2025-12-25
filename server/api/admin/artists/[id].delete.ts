import { useDB, artists, albums, songs } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID del artista es requerido'
    })
  }

  const db = useDB()

  // Verificar que el artista existe
  const artist = await db.query.artists.findFirst({
    where: (artists, { eq }) => eq(artists.id, id)
  })

  if (!artist) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Artista no encontrado'
    })
  }

  // Verificar si tiene álbumes asociados
  const artistAlbums = await db.query.albums.findMany({
    where: (albums, { eq }) => eq(albums.artistId, id)
  })

  if (artistAlbums.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `No se puede eliminar el artista porque tiene ${artistAlbums.length} álbum(es) asociado(s). Elimina primero los álbumes.`
    })
  }

  // Verificar si tiene canciones asociadas (por si hay canciones sin álbum)
  const artistSongs = await db.query.songs.findMany({
    where: (songs, { eq }) => eq(songs.artistId, id)
  })

  if (artistSongs.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `No se puede eliminar el artista porque tiene ${artistSongs.length} canción(es) asociada(s). Elimina primero las canciones.`
    })
  }

  // Eliminar el artista
  await db.delete(artists).where(eq(artists.id, id))

  return {
    success: true,
    message: 'Artista eliminado correctamente'
  }
})
