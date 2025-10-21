export const useFavorites = () => {
  const favoriteSongs = useState<string[]>('favoriteSongs', () => [])
  const favoriteAlbums = useState<string[]>('favoriteAlbums', () => [])
  const favoriteArtists = useState<string[]>('favoriteArtists', () => [])
  const favoritePlaylists = useState<string[]>('favoritePlaylists', () => [])

  const loadFavorites = () => {
    if (typeof window === 'undefined') return

    const songs = localStorage.getItem('tigrefy_favorite_songs')
    const albums = localStorage.getItem('tigrefy_favorite_albums')
    const artists = localStorage.getItem('tigrefy_favorite_artists')
    const playlists = localStorage.getItem('tigrefy_favorite_playlists')

    if (songs) favoriteSongs.value = JSON.parse(songs)
    if (albums) favoriteAlbums.value = JSON.parse(albums)
    if (artists) favoriteArtists.value = JSON.parse(artists)
    if (playlists) favoritePlaylists.value = JSON.parse(playlists)
  }

  const saveFavorites = () => {
    if (typeof window === 'undefined') return

    localStorage.setItem('tigrefy_favorite_songs', JSON.stringify(favoriteSongs.value))
    localStorage.setItem('tigrefy_favorite_albums', JSON.stringify(favoriteAlbums.value))
    localStorage.setItem('tigrefy_favorite_artists', JSON.stringify(favoriteArtists.value))
    localStorage.setItem('tigrefy_favorite_playlists', JSON.stringify(favoritePlaylists.value))
  }

  const toggleFavoriteSong = (songId: string) => {
    const index = favoriteSongs.value.indexOf(songId)
    if (index > -1) {
      favoriteSongs.value.splice(index, 1)
    } else {
      favoriteSongs.value.push(songId)
    }
    saveFavorites()
  }

  const toggleFavoriteAlbum = (albumId: string) => {
    const index = favoriteAlbums.value.indexOf(albumId)
    if (index > -1) {
      favoriteAlbums.value.splice(index, 1)
    } else {
      favoriteAlbums.value.push(albumId)
    }
    saveFavorites()
  }

  const toggleFavoriteArtist = (artistId: string) => {
    const index = favoriteArtists.value.indexOf(artistId)
    if (index > -1) {
      favoriteArtists.value.splice(index, 1)
    } else {
      favoriteArtists.value.push(artistId)
    }
    saveFavorites()
  }

  const toggleFavoritePlaylist = (playlistId: string) => {
    const index = favoritePlaylists.value.indexOf(playlistId)
    if (index > -1) {
      favoritePlaylists.value.splice(index, 1)
    } else {
      favoritePlaylists.value.push(playlistId)
    }
    saveFavorites()
  }

  const isFavoriteSong = (songId: string) => {
    return favoriteSongs.value.includes(songId)
  }

  const isFavoriteAlbum = (albumId: string) => {
    return favoriteAlbums.value.includes(albumId)
  }

  const isFavoriteArtist = (artistId: string) => {
    return favoriteArtists.value.includes(artistId)
  }

  const isFavoritePlaylist = (playlistId: string) => {
    return favoritePlaylists.value.includes(playlistId)
  }

  return {
    favoriteSongs,
    favoriteAlbums,
    favoriteArtists,
    favoritePlaylists,
    loadFavorites,
    toggleFavoriteSong,
    toggleFavoriteAlbum,
    toggleFavoriteArtist,
    toggleFavoritePlaylist,
    isFavoriteSong,
    isFavoriteAlbum,
    isFavoriteArtist,
    isFavoritePlaylist
  }
}
