import { useDB, albums, parseJsonField } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { requireParam } from '~/server/utils/params'
import { mapSongResponse } from '~/server/utils/mappers'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = requireParam(event, 'id', 'ID de álbum')
  const db = useDB()
  const authUser = await getAuthUser(event)

  const result = await db.query.albums.findFirst({
    where: eq(albums.id, id),
    with: {
      artist: true,
      songs: {
        with: {
          artist: true
        }
      }
    }
  })

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Álbum no encontrado'
    })
  }

  // Verificar permisos: si no es público y el usuario no puede ver todo
  if (!result.isPublic && !canSeeAllContent(authUser?.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes acceso a este álbum'
    })
  }

  const userCanSeeAll = canSeeAllContent(authUser?.role)

  return {
    id: result.id,
    title: result.title,
    artistId: result.artistId,
    artistName: result.artist.name,
    cover: result.cover,
    releaseDate: result.releaseDate,
    totalTracks: result.totalTracks,
    duration: result.duration,
    genres: parseJsonField<string>(result.genres),
    isPublic: result.isPublic,
    songs: result.songs
      .filter(song => userCanSeeAll || song.isPublic)
      .map(song => mapSongResponse(
        // El mapper espera album object — aquí no lo tenemos cargado, pero
        // pasamos overrides con los datos del álbum padre que sí conocemos.
        { ...song, album: null },
        {
          albumId: result.id,
          albumName: result.title,
          cover: result.cover,
          releaseDate: result.releaseDate,
        }
      ))
  }
})
