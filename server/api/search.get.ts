import { useDB, songs, albums, artists, playlists } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { mapSongResponse, mapAlbumResponse, mapArtistResponse } from '~/server/utils/mappers'
import { eq, or, like, and } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string || '').toLowerCase().trim()
  const genre = (query.genre as string || '').trim()

  if (!q && !genre) {
    return {
      songs: [],
      albums: [],
      artists: [],
      playlists: []
    }
  }

  const db = useDB()
  const authUser = await getAuthUser(event)

  // Si es tigre o user, mostrar todo; si es guest o no autenticado, solo público
  const showAll = canSeeAllContent(authUser?.role)

  // Buscar canciones con relaciones
  const songsResult = await db.query.songs.findMany({
    with: {
      artist: true,
      album: true
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

  // Buscar álbumes con relaciones
  const albumsResult = await db.query.albums.findMany({
    with: {
      artist: true
    },
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

  // Buscar artistas
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

  // Buscar playlists con relaciones
  const playlistsResult = await db.query.playlists.findMany({
    with: {
      songs: true
    },
    where: q
      ? or(
          like(sql`LOWER(${playlists.name})`, `%${q}%`),
          like(sql`LOWER(${playlists.description})`, `%${q}%`)
        )
      : undefined,
    orderBy: (playlists, { desc }) => [desc(playlists.createdAt)],
    limit: 10
  })

  // Mapear resultados - filtrar también por nombre de artista/álbum en memoria
  let songsList = songsResult
    .filter(song => {
      if (!q) return true
      return (
        song.title.toLowerCase().includes(q) ||
        song.artist.name.toLowerCase().includes(q) ||
        (song.album?.title || '').toLowerCase().includes(q) ||
        (song.lyrics || '').toLowerCase().includes(q)
      )
    })
    .map(song => mapSongResponse(song))

  let albumsList = albumsResult
    .filter(album => {
      if (!q) return true
      return (
        album.title.toLowerCase().includes(q) ||
        album.artist.name.toLowerCase().includes(q)
      )
    })
    .map(album => mapAlbumResponse(album))

  let artistsList = artistsResult.map(artist => mapArtistResponse(artist))

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

  // Filtrar por género si se especifica
  if (genre) {
    const genreLower = genre.toLowerCase()

    albumsList = albumsList.filter(album =>
      album.genres.some(g => g.toLowerCase().includes(genreLower))
    )

    artistsList = artistsList.filter(artist =>
      artist.genres.some(g => g.toLowerCase().includes(genreLower))
    )

    // Para canciones, filtrar por el género del álbum asociado
    const albumIdsWithGenre = new Set(albumsList.map(a => a.id))
    songsList = songsList.filter(song => song.albumId && albumIdsWithGenre.has(song.albumId))
  }

  return {
    songs: songsList,
    albums: albumsList,
    artists: artistsList,
    playlists: playlistsList
  }
})
