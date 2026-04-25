import { useDB, songs, albums, artists, playlists, playlistSongs, parseJsonField } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { eq, or, like, desc, asc, and } from 'drizzle-orm'
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
      const searchLower = q.toLowerCase()
      return (
        song.title.toLowerCase().includes(searchLower) ||
        song.artist.name.toLowerCase().includes(searchLower) ||
        (song.album?.title || '').toLowerCase().includes(searchLower) ||
        (song.lyrics || '').toLowerCase().includes(searchLower)
      )
    })
    .map(song => ({
      id: song.id,
      title: song.title,
      artistId: song.artistId,
      artistName: song.artist.name,
      albumId: song.albumId,
      albumName: song.album?.title || null,
      trackNumber: song.trackNumber,
      duration: song.duration,
      cover: song.album?.cover || null,
      lyrics: song.lyrics,
      plays: song.plays,
      releaseDate: song.album?.releaseDate || null
    }))

  let albumsList = albumsResult
    .filter(album => {
      if (!q) return true
      const searchLower = q.toLowerCase()
      return (
        album.title.toLowerCase().includes(searchLower) ||
        album.artist.name.toLowerCase().includes(searchLower)
      )
    })
    .map(album => ({
      id: album.id,
      title: album.title,
      artistId: album.artistId,
      artistName: album.artist.name,
      cover: album.cover,
      releaseDate: album.releaseDate,
      totalTracks: album.totalTracks,
      duration: album.duration,
      genres: parseJsonField<string>(album.genres)
    }))

  let artistsList = artistsResult.map(artist => ({
    id: artist.id,
    name: artist.name,
    image: artist.image,
    followers: artist.followers,
    genres: parseJsonField<string>(artist.genres),
    bio: artist.bio
  }))

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
