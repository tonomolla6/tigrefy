import { useDB, albums, parseJsonField } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de álbum requerido'
    })
  }

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
      .map(song => ({
        id: song.id,
        title: song.title,
        artistId: song.artistId,
        artistName: song.artist.name,
        albumId: result.id,
        albumName: result.title,
        trackNumber: song.trackNumber,
        duration: song.duration,
        cover: result.cover,
        audioUrl: song.audioUrl,
        lyrics: song.lyrics,
        plays: song.plays,
        releaseDate: result.releaseDate,
        isPublic: song.isPublic
      }))
  }
})
