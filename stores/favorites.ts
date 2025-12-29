import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useFavoritesStore = defineStore('favorites', () => {
  // ====================
  // STATE
  // ====================
  // Datos completos de likes con fechas
  const likedSongsData = ref<{ songId: string; likedAt: string }[]>([])
  // Computed para compatibilidad hacia atrás
  const likedSongIds = computed(() => likedSongsData.value.map(ls => ls.songId))
  // Artistas favoritos (usa user_favorites legacy)
  const favoriteArtistIds = ref<string[]>([])
  // Guardados en Tu Biblioteca
  const savedPlaylistIds = ref<string[]>([])
  const savedAlbumIds = ref<string[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)

  // ====================
  // GETTERS
  // ====================
  const likedSongsCount = computed(() => likedSongIds.value.length)
  const favoriteArtistsCount = computed(() => favoriteArtistIds.value.length)
  const savedPlaylistsCount = computed(() => savedPlaylistIds.value.length)
  const savedAlbumsCount = computed(() => savedAlbumIds.value.length)

  // Alias para compatibilidad hacia atrás
  const favoriteSongsCount = likedSongsCount
  const favoritePlaylistsCount = savedPlaylistsCount

  // ====================
  // ACTIONS
  // ====================
  async function loadFavorites(forceReload = false) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      $reset()
      return
    }

    // Skip if already loaded and not forcing reload
    if (!forceReload && isLoaded.value) {
      return
    }

    isLoading.value = true

    try {
      // Cargar likes de songs, guardados (playlists y albums), y artistas favoritos
      const [songs, savedPlaylists, savedAlbums, legacyFavorites] = await Promise.all([
        $fetch<{ songId: string; likedAt: string }[]>('/api/user/liked-songs', { credentials: 'include' }),
        $fetch<string[]>('/api/user/saved-playlists', { credentials: 'include' }),
        $fetch<string[]>('/api/user/saved-albums', { credentials: 'include' }),
        $fetch<{ artists: string[] }>(
          '/api/user/favorites',
          { credentials: 'include' }
        ).catch(() => ({ artists: [] }))
      ])

      likedSongsData.value = songs
      savedPlaylistIds.value = savedPlaylists
      savedAlbumIds.value = savedAlbums
      favoriteArtistIds.value = legacyFavorites.artists || []
      isLoaded.value = true
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function toggleSongLike(songId: string): Promise<boolean> {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return false

    const wasLiked = likedSongIds.value.includes(songId)

    // Optimistic update
    if (wasLiked) {
      likedSongsData.value = likedSongsData.value.filter(ls => ls.songId !== songId)
    } else {
      likedSongsData.value.unshift({ songId, likedAt: new Date().toISOString() })
    }

    try {
      await $fetch(`/api/songs/${songId}/like`, {
        method: 'POST',
        credentials: 'include'
      })
      return true
    } catch (error) {
      // Revert on error
      if (wasLiked) {
        likedSongsData.value.unshift({ songId, likedAt: new Date().toISOString() })
      } else {
        likedSongsData.value = likedSongsData.value.filter(ls => ls.songId !== songId)
      }
      console.error('Error toggling song like:', error)
      return false
    }
  }

  // Mantener para compatibilidad (artists y playlists usan API legacy)
  async function toggleFavoriteArtist(artistId: string): Promise<boolean> {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return false

    const wasFavorite = favoriteArtistIds.value.includes(artistId)

    if (wasFavorite) {
      favoriteArtistIds.value = favoriteArtistIds.value.filter(id => id !== artistId)
    } else {
      favoriteArtistIds.value.push(artistId)
    }

    try {
      await $fetch('/api/user/favorites/toggle', {
        method: 'POST',
        credentials: 'include',
        body: { type: 'artist', id: artistId }
      })
      return true
    } catch (error) {
      // Revert
      if (wasFavorite) {
        favoriteArtistIds.value.push(artistId)
      } else {
        favoriteArtistIds.value = favoriteArtistIds.value.filter(id => id !== artistId)
      }
      console.error('Error toggling artist favorite:', error)
      return false
    }
  }

  async function toggleSavePlaylist(playlistId: string): Promise<boolean> {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return false

    const wasSaved = savedPlaylistIds.value.includes(playlistId)

    // Optimistic update
    if (wasSaved) {
      savedPlaylistIds.value = savedPlaylistIds.value.filter(id => id !== playlistId)
    } else {
      savedPlaylistIds.value.push(playlistId)
    }

    try {
      await $fetch(`/api/playlists/${playlistId}/save`, {
        method: 'POST',
        credentials: 'include'
      })
      return true
    } catch (error) {
      // Revert on error
      if (wasSaved) {
        savedPlaylistIds.value.push(playlistId)
      } else {
        savedPlaylistIds.value = savedPlaylistIds.value.filter(id => id !== playlistId)
      }
      console.error('Error toggling playlist save:', error)
      return false
    }
  }

  async function toggleSaveAlbum(albumId: string): Promise<boolean> {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return false

    const wasSaved = savedAlbumIds.value.includes(albumId)

    // Optimistic update
    if (wasSaved) {
      savedAlbumIds.value = savedAlbumIds.value.filter(id => id !== albumId)
    } else {
      savedAlbumIds.value.push(albumId)
    }

    try {
      await $fetch(`/api/albums/${albumId}/save`, {
        method: 'POST',
        credentials: 'include'
      })
      return true
    } catch (error) {
      // Revert on error
      if (wasSaved) {
        savedAlbumIds.value.push(albumId)
      } else {
        savedAlbumIds.value = savedAlbumIds.value.filter(id => id !== albumId)
      }
      console.error('Error toggling album save:', error)
      return false
    }
  }

  // Check methods
  function isSongLiked(songId: string): boolean {
    return likedSongIds.value.includes(songId)
  }

  function isArtistFavorite(artistId: string): boolean {
    return favoriteArtistIds.value.includes(artistId)
  }

  function isPlaylistSaved(playlistId: string): boolean {
    return savedPlaylistIds.value.includes(playlistId)
  }

  function isAlbumSaved(albumId: string): boolean {
    return savedAlbumIds.value.includes(albumId)
  }

  function $reset() {
    likedSongsData.value = []
    favoriteArtistIds.value = []
    savedPlaylistIds.value = []
    savedAlbumIds.value = []
    isLoading.value = false
    isLoaded.value = false
  }

  // ====================
  // BACKWARD COMPATIBILITY ALIASES
  // ====================
  const songs = computed(() => likedSongIds.value)
  const artists = computed(() => favoriteArtistIds.value)
  const playlists = computed(() => savedPlaylistIds.value)
  const albums = computed(() => savedAlbumIds.value)

  // ====================
  // EXPORT
  // ====================
  return {
    // state
    likedSongsData,
    likedSongIds,
    favoriteArtistIds,
    savedPlaylistIds,
    savedAlbumIds,
    isLoading,
    isLoaded,

    // backward compat aliases (para que funcione el código existente)
    songs,
    artists,
    playlists,
    albums,

    // getters
    likedSongsCount,
    favoriteArtistsCount,
    savedPlaylistsCount,
    savedAlbumsCount,
    // backward compat getters
    favoriteSongsCount,
    favoritePlaylistsCount,

    // actions
    loadFavorites,
    toggleSongLike,
    toggleFavoriteArtist,
    toggleSavePlaylist,
    toggleSaveAlbum,

    // backward compat actions
    toggleFavoriteSong: toggleSongLike,
    toggleFavoritePlaylist: toggleSavePlaylist,
    toggleFavoriteAlbum: toggleSaveAlbum,

    // check methods
    isSongLiked,
    isArtistFavorite,
    isPlaylistSaved,
    isAlbumSaved,

    // backward compat checks
    isFavoriteSong: isSongLiked,
    isFavoriteArtist: isArtistFavorite,
    isFavoritePlaylist: isPlaylistSaved,
    isFavoriteAlbum: isAlbumSaved,

    $reset
  }
})
