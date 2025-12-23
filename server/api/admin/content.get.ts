import { useDB, songs, albums, parseJsonField } from '~/server/db'

export default defineEventHandler(async (event) => {
  const db = useDB()

  // Obtener todas las canciones con info del artista y álbum
  const allSongs = await db.query.songs.findMany({
    with: {
      artist: true,
      album: true
    },
    orderBy: (songs, { asc }) => [asc(songs.title)]
  })

  // Obtener todos los álbumes con info del artista
  const allAlbums = await db.query.albums.findMany({
    with: {
      artist: true
    },
    orderBy: (albums, { asc }) => [asc(albums.title)]
  })

  return {
    songs: allSongs.map(song => ({
      id: song.id,
      title: song.title,
      artistId: song.artistId,
      artistName: song.artist.name,
      albumId: song.albumId,
      albumName: song.album?.title || null,
      cover: song.album?.cover || null,
      isPublic: song.isPublic
    })),
    albums: allAlbums.map(album => ({
      id: album.id,
      title: album.title,
      artistId: album.artistId,
      artistName: album.artist.name,
      cover: album.cover,
      totalTracks: album.totalTracks,
      isPublic: album.isPublic
    })),
    stats: {
      totalSongs: allSongs.length,
      publicSongs: allSongs.filter(s => s.isPublic).length,
      privateSongs: allSongs.filter(s => !s.isPublic).length,
      totalAlbums: allAlbums.length,
      publicAlbums: allAlbums.filter(a => a.isPublic).length,
      privateAlbums: allAlbums.filter(a => !a.isPublic).length
    }
  }
})
