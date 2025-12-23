import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Playlists del sistema (sin owner)
export interface Playlist {
  id: string
  name: string
  description: string | null
  cover: string | null
  ownerId: string | null
  isPublic: boolean
  createdAt: string
  songIds: string[]
}

export const usePlaylistsStore = defineStore('playlists', () => {
  // ====================
  // STATE
  // ====================
  const playlists = ref<Playlist[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  // ====================
  // GETTERS
  // ====================
  const playlistsCount = computed(() => playlists.value.length)

  // ====================
  // ACTIONS
  // ====================
  async function loadPlaylists(forceReload = false) {
    if (!forceReload && isLoaded.value && playlists.value.length > 0) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Playlist[]>('/api/playlists')
      playlists.value = data
      isLoaded.value = true
    } catch (e: any) {
      error.value = e.message || 'Error cargando playlists'
      console.error('Error loading playlists:', e)
    } finally {
      isLoading.value = false
    }
  }

  function getPlaylistById(id: string): Playlist | undefined {
    return playlists.value.find(playlist => playlist.id === id)
  }

  function $reset() {
    playlists.value = []
    isLoading.value = false
    isLoaded.value = false
    error.value = null
  }

  // ====================
  // EXPORT
  // ====================
  return {
    // state
    playlists,
    isLoading,
    isLoaded,
    error,

    // getters
    playlistsCount,

    // actions
    loadPlaylists,
    getPlaylistById,
    $reset
  }
})
