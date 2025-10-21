export const useData = () => {
  const data = useState('appData', () => ({
    artists: [] as any[],
    albums: [] as any[],
    songs: [] as any[],
    playlists: [] as any[]
  }))

  const loadData = async () => {
    try {
      const response = await fetch('/db.json')
      const jsonData = await response.json()
      data.value = jsonData
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const getSongById = (id: string) => {
    return data.value.songs.find(song => song.id === id)
  }

  const getAlbumById = (id: string) => {
    return data.value.albums.find(album => album.id === id)
  }

  const getArtistById = (id: string) => {
    return data.value.artists.find(artist => artist.id === id)
  }

  const getPlaylistById = (id: string) => {
    return data.value.playlists.find(playlist => playlist.id === id)
  }

  const getSongsByAlbumId = (albumId: string) => {
    return data.value.songs.filter(song => song.albumId === albumId)
  }

  const getAlbumsByArtistId = (artistId: string) => {
    return data.value.albums.filter(album => album.artistId === artistId)
  }

  const getSongsByArtistId = (artistId: string) => {
    return data.value.songs.filter(song => song.artistId === artistId)
  }

  const getSongsByIds = (ids: string[]) => {
    return data.value.songs.filter(song => ids.includes(song.id))
  }

  const searchAll = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return {
      songs: data.value.songs.filter(song =>
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artistName.toLowerCase().includes(lowerQuery)
      ),
      albums: data.value.albums.filter(album =>
        album.title.toLowerCase().includes(lowerQuery) ||
        album.artistName.toLowerCase().includes(lowerQuery)
      ),
      artists: data.value.artists.filter(artist =>
        artist.name.toLowerCase().includes(lowerQuery)
      ),
      playlists: data.value.playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(lowerQuery)
      )
    }
  }

  return {
    data,
    loadData,
    getSongById,
    getAlbumById,
    getArtistById,
    getPlaylistById,
    getSongsByAlbumId,
    getAlbumsByArtistId,
    getSongsByArtistId,
    getSongsByIds,
    searchAll
  }
}
