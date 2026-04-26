import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

// Playlist del usuario (creada o guardada en biblioteca)
export interface UserPlaylist {
  id: string
  name: string
  description: string | null
  cover: string | null
  ownerId: string | null
  ownerName: string | null
  isPublic: boolean
  isOwner: boolean
  isSaved: boolean
  createdAt: string
  songIds: string[]
}

export const useUserStore = defineStore('user', () => {
  // ====================
  // STATE
  // ====================
  const playlists = ref<UserPlaylist[]>([])
  const searchHistory = ref<string[]>([])
  const isLoadingPlaylists = ref(false)
  const isPlaylistsLoaded = ref(false)

  // ====================
  // GETTERS
  // ====================
  const playlistsCount = computed(() => playlists.value.length)

  // Playlists creadas por el usuario
  const ownedPlaylists = computed(() =>
    playlists.value.filter(p => p.isOwner)
  )

  // Playlists guardadas (no creadas por el usuario)
  const savedPlaylists = computed(() =>
    playlists.value.filter(p => !p.isOwner && p.isSaved)
  )

  // ====================
  // ACTIONS
  // ====================
  async function loadPlaylists(forceReload = false) {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      playlists.value = []
      return
    }

    // Skip if already loaded and not forcing reload
    if (!forceReload && isPlaylistsLoaded.value) {
      return
    }

    isLoadingPlaylists.value = true

    try {
      const data = await $fetch<UserPlaylist[]>('/api/user/playlists', {
        credentials: 'include'
      })
      playlists.value = data
      isPlaylistsLoaded.value = true
    } catch (error) {
      console.error('Error loading playlists:', error)
    } finally {
      isLoadingPlaylists.value = false
    }
  }

  async function savePlaylist(playlistId: string): Promise<boolean> {
    try {
      const result = await $fetch<{ success: boolean, saved: boolean }>(`/api/user/playlists/${playlistId}/save`, {
        method: 'POST',
        credentials: 'include'
      })

      if (result.success) {
        const playlist = playlists.value.find(p => p.id === playlistId)
        if (playlist) {
          playlist.isSaved = result.saved
        } else if (result.saved) {
          // Si se guardó y no estaba en la lista, recargar
          await loadPlaylists()
        }
      }
      return result.saved
    } catch (error) {
      console.error('Error saving playlist:', error)
      return false
    }
  }

  function getPlaylistById(id: string): UserPlaylist | undefined {
    return playlists.value.find(p => p.id === id)
  }

  function addToSearchHistory(query: string) {
    const index = searchHistory.value.indexOf(query)
    if (index > -1) {
      searchHistory.value.splice(index, 1)
    }

    searchHistory.value.unshift(query)

    if (searchHistory.value.length > 10) {
      searchHistory.value.splice(10)
    }
  }

  function clearSearchHistory() {
    searchHistory.value = []
  }

  function $reset() {
    playlists.value = []
    searchHistory.value = []
    isLoadingPlaylists.value = false
    isPlaylistsLoaded.value = false
  }

  // ====================
  // EXPORT
  // ====================
  return {
    // state
    playlists,
    searchHistory,
    isLoadingPlaylists,
    isPlaylistsLoaded,

    // getters
    playlistsCount,
    ownedPlaylists,
    savedPlaylists,

    // actions
    loadPlaylists,
    savePlaylist,
    getPlaylistById,
    addToSearchHistory,
    clearSearchHistory,
    $reset
  }
})
