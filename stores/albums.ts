import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Album {
  id: string
  title: string
  artistId: string
  artistName: string
  cover: string | null
  releaseDate: string | null
  totalTracks: number
  duration: number
  genres: string[]
  isPublic: boolean
}

export const useAlbumsStore = defineStore('albums', () => {
  // ====================
  // STATE
  // ====================
  const albums = ref<Album[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  // ====================
  // GETTERS
  // ====================
  const albumsCount = computed(() => albums.value.length)

  const latestAlbums = computed(() =>
    [...albums.value].sort((a, b) =>
      new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()
    )
  )

  // ====================
  // ACTIONS
  // ====================
  async function loadAlbums(forceReload = false) {
    if (!forceReload && isLoaded.value && albums.value.length > 0) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Album[]>('/api/albums')
      albums.value = data
      isLoaded.value = true
    } catch (e: any) {
      error.value = e.message || 'Error cargando álbumes'
      console.error('Error loading albums:', e)
    } finally {
      isLoading.value = false
    }
  }

  function getAlbumById(id: string): Album | undefined {
    return albums.value.find(album => album.id === id)
  }

  function getAlbumsByArtistId(artistId: string): Album[] {
    return albums.value.filter(album => album.artistId === artistId)
  }

  function $reset() {
    albums.value = []
    isLoading.value = false
    isLoaded.value = false
    error.value = null
  }

  // ====================
  // EXPORT
  // ====================
  return {
    // state
    albums,
    isLoading,
    isLoaded,
    error,

    // getters
    albumsCount,
    latestAlbums,

    // actions
    loadAlbums,
    getAlbumById,
    getAlbumsByArtistId,
    $reset
  }
})
