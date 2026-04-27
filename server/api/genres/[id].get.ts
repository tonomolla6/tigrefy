import { useDB, genres, songs, songGenres, albums, artists } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { requireParam } from '~/server/utils/params'
import { mapSongResponse, mapAlbumResponse, mapArtistResponse } from '~/server/utils/mappers'
import { getAlbumsGenresMap, getArtistGenres } from '~/server/utils/genres'
import { eq, inArray, and } from 'drizzle-orm'

/**
 * Detalle de un género: canciones que pertenecen a él (top por plays),
 * álbumes derivados (con al menos una canción del género) y artistas
 * derivados. Filtrado por visibilidad.
 */
export default defineEventHandler(async (event) => {
  const idParam = requireParam(event, 'id', 'ID de género')
  const db = useDB()
  const authUser = await getAuthUser(event)
  const showAll = canSeeAllContent(authUser?.role)

  // Acepta id numérico o nombre exacto.
  const genreRow = await db.query.genres.findFirst({
    where: /^\d+$/.test(idParam)
      ? eq(genres.id, Number(idParam))
      : eq(genres.name, idParam)
  })

  if (!genreRow) {
    throw createError({ statusCode: 404, statusMessage: 'Género no encontrado' })
  }

  // 1. Canciones del género (con relaciones para mapear).
  const allSongIds = (await db
    .select({ songId: songGenres.songId })
    .from(songGenres)
    .where(eq(songGenres.genreId, genreRow.id))
  ).map(r => r.songId)

  if (allSongIds.length === 0) {
    return {
      genre: { id: genreRow.id, name: genreRow.name },
      songs: [],
      albums: [],
      artists: []
    }
  }

  const songsRaw = await db.query.songs.findMany({
    where: showAll
      ? inArray(songs.id, allSongIds)
      : and(inArray(songs.id, allSongIds), eq(songs.isPublic, true)),
    with: {
      artist: true,
      album: true,
      genres: { with: { genre: true } }
    },
    orderBy: (songs, { desc }) => [desc(songs.plays)]
  })

  const songsList = songsRaw.map(s => mapSongResponse(s))

  // 2. Álbumes derivados (que tienen al menos una de esas canciones).
  const visibleAlbumIds = Array.from(new Set(
    songsRaw.map(s => s.albumId).filter((x): x is string => !!x)
  ))

  let albumsList: ReturnType<typeof mapAlbumResponse>[] = []
  if (visibleAlbumIds.length > 0) {
    const albumsRaw = await db.query.albums.findMany({
      where: showAll
        ? inArray(albums.id, visibleAlbumIds)
        : and(inArray(albums.id, visibleAlbumIds), eq(albums.isPublic, true)),
      with: { artist: true },
      orderBy: (albums, { desc }) => [desc(albums.releaseDate)]
    })
    const genresMap = await getAlbumsGenresMap(albumsRaw.map(a => a.id))
    albumsList = albumsRaw.map(a => mapAlbumResponse(a, { genres: genresMap.get(a.id) ?? [] }))
  }

  // 3. Artistas derivados (distinct de las canciones visibles).
  const visibleArtistIds = Array.from(new Set(songsRaw.map(s => s.artistId)))
  let artistsList: ReturnType<typeof mapArtistResponse>[] = []
  if (visibleArtistIds.length > 0) {
    const artistsRaw = await db.query.artists.findMany({
      where: inArray(artists.id, visibleArtistIds),
      orderBy: (artists, { desc }) => [desc(artists.followers)]
    })
    const artistGenresArr = await Promise.all(
      artistsRaw.map(a => getArtistGenres(a.id))
    )
    artistsList = artistsRaw.map((a, idx) => mapArtistResponse(a, { genres: artistGenresArr[idx] }))
  }

  return {
    genre: { id: genreRow.id, name: genreRow.name },
    songs: songsList,
    albums: albumsList,
    artists: artistsList
  }
})
