import { useFavoritesStore } from '~/stores/favorites'

export const useFavorites = () => {
  const store = useFavoritesStore()

  return {
    // Estado como refs computadas para compatibilidad
    favoriteSongs: computed(() => store.songs),
    favoriteArtists: computed(() => store.artists),
    favoritePlaylists: computed(() => store.playlists),
    favoriteAlbums: computed(() => store.albums),
    savedPlaylistIds: computed(() => store.savedPlaylistIds),
    savedAlbumIds: computed(() => store.savedAlbumIds),
    isLoadingFavorites: computed(() => store.isLoading),

    // Métodos
    loadFavorites: () => store.loadFavorites(),
    toggleFavoriteSong: (songId: string) => store.toggleFavoriteSong(songId),
    toggleFavoriteArtist: (artistId: string) => store.toggleFavoriteArtist(artistId),
    toggleFavoritePlaylist: (playlistId: string) => store.toggleFavoritePlaylist(playlistId),
    toggleFavoriteAlbum: (albumId: string) => store.toggleFavoriteAlbum(albumId),
    // Nuevos nombres más claros
    toggleSavePlaylist: (playlistId: string) => store.toggleSavePlaylist(playlistId),
    toggleSaveAlbum: (albumId: string) => store.toggleSaveAlbum(albumId),

    // Helpers
    isFavoriteSong: (songId: string) => store.isFavoriteSong(songId),
    isFavoriteArtist: (artistId: string) => store.isFavoriteArtist(artistId),
    isFavoritePlaylist: (playlistId: string) => store.isFavoritePlaylist(playlistId),
    isFavoriteAlbum: (albumId: string) => store.isFavoriteAlbum(albumId),
    // Nuevos nombres más claros
    isPlaylistSaved: (playlistId: string) => store.isPlaylistSaved(playlistId),
    isAlbumSaved: (albumId: string) => store.isAlbumSaved(albumId)
  }
}
