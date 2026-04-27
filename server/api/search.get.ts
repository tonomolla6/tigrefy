import { useDB, songs, albums, artists, playlists, songGenres, genres } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { mapSongResponse, mapAlbumResponse, mapArtistResponse } from '~/server/utils/mappers'
import { getAlbumsGenresMap } from '~/server/utils/genres'
import { eq, or, like, and, inArray } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string || '').toLowerCase().trim()
  const genre = (query.genre as string || '').trim()

  if (!q && !genre) {
    return { songs: [], albums: [], artists: [], playlists: [] }
  }

  const db = useDB()
  const authUser = await getAuthUser(event)
  const showAll = canSeeAllContent(authUser?.role)

  // Resolver el filtro de género (puede llegar como id numérico o como nombre).
  let allowedSongIds: Set<string> | null = null
  if (genre) {
    const genreRow = await db.query.genres.findFirst({
      where: /^\d+$/.test(genre)
        ? eq(genres.id, Number(genre))
        : eq(genres.name, genre)
    })
    if (!genreRow) {
      // Género no existe → ningún resultado.
      return { songs: [], albums: [], artists: [], playlists: [] }
    }
    const sgRows = await db.select({ songId: songGenres.songId })
      .from(songGenres)
      .where(eq(songGenres.genreId, genreRow.id))
    allowedSongIds = new Set(sgRows.map(r => r.songId))
    if (allowedSongIds.size === 0) {
      return { songs: [], albums: [], artists: [], playlists: [] }
    }
  }

  // Buscar canciones con relaciones
  const songsResult = await db.query.songs.findMany({
    with: {
      artist: true,
      album: true,
      genres: { with: { genre: true } }
    },
    where: q
      ? showAll
        ? or(
            like(sql`LOWER(${songs.title})`, `%${q}%`),
            like(sql`LOWER(${songs.lyrics})`, `%${q}%`)
          )
        : and(
            eq(songs.isPublic, true),
            or(
              like(sql`LOWER(${songs.title})`, `%${q}%`),
              like(sql`LOWER(${songs.lyrics})`, `%${q}%`)
            )
          )
      : showAll
        ? undefined
        : eq(songs.isPublic, true),
    orderBy: (songs, { desc }) => [desc(songs.plays)],
    limit: 50
  })

  const albumsResult = await db.query.albums.findMany({
    with: { artist: true },
    where: q
      ? showAll
        ? like(sql`LOWER(${albums.title})`, `%${q}%`)
        : and(
            eq(albums.isPublic, true),
            like(sql`LOWER(${albums.title})`, `%${q}%`)
          )
      : showAll
        ? undefined
        : eq(albums.isPublic, true),
    orderBy: (albums, { desc }) => [desc(albums.releaseDate)],
    limit: 20
  })

  const artistsResult = await db.query.artists.findMany({
    where: q
      ? or(
          like(sql`LOWER(${artists.name})`, `%${q}%`),
          like(sql`LOWER(${artists.bio})`, `%${q}%`)
        )
      : undefined,
    orderBy: (artists, { desc }) => [desc(artists.followers)],
    limit: 10
  })

  const playlistsResult = await db.query.playlists.findMany({
    with: { songs: true },
    where: q
      ? or(
          like(sql`LOWER(${playlists.name})`, `%${q}%`),
          like(sql`LOWER(${playlists.description})`, `%${q}%`)
        )
      : undefined,
    orderBy: (playlists, { desc }) => [desc(playlists.createdAt)],
    limit: 10
  })

  // Filtros y mapeo: si hay filtro de género, intersectar con allowedSongIds.
  let songsList = songsResult
    .filter(song => {
      if (allowedSongIds && !allowedSongIds.has(song.id)) return false
      if (!q) return true
      return (
        song.title.toLowerCase().includes(q) ||
        song.artist.name.toLowerCase().includes(q) ||
        (song.album?.title || '').toLowerCase().includes(q) ||
        (song.lyrics || '').toLowerCase().includes(q)
      )
    })
    .map(song => mapSongResponse(song))

  let albumIds = albumsResult.map(a => a.id)
  if (allowedSongIds) {
    // Solo álbumes con al menos una canción del género filtrado.
    const allowedAlbumIds = new Set(
      songsResult
        .filter(s => allowedSongIds!.has(s.id) && s.albumId)
        .map(s => s.albumId as string)
    )
    albumIds = albumIds.filter(id => allowedAlbumIds.has(id))
  }
  const filteredAlbums = albumsResult.filter(a => albumIds.includes(a.id))
  const albumGenresMap = await getAlbumsGenresMap(filteredAlbums.map(a => a.id))
  const albumsList = filteredAlbums
    .filter(album => {
      if (!q) return true
      return (
        album.title.toLowerCase().includes(q) ||
        album.artist.name.toLowerCase().includes(q)
      )
    })
    .map(album => mapAlbumResponse(album, { genres: albumGenresMap.get(album.id) ?? [] }))

  let artistsList = artistsResult.map(artist => mapArtistResponse(artist))
  if (allowedSongIds) {
    const allowedArtistIds = new Set(
      songsResult.filter(s => allowedSongIds!.has(s.id)).map(s => s.artistId)
    )
    artistsList = artistsList.filter(a => allowedArtistIds.has(a.id))
  }

  const playlistsList = playlistsResult.map(playlist => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    cover: playlist.cover,
    public: playlist.isPublic,
    collaborative: false,
    createdAt: playlist.createdAt,
    songIds: playlist.songs
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map(s => s.songId)
  }))

  return {
    songs: songsList,
    albums: albumsList,
    artists: artistsList,
    playlists: playlistsList
  }
})
