import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { GenreRef } from '~/types/song'

export interface Artist {
  id: string
  name: string
  image: string | null
  followers: number
  genres: GenreRef[]
  bio: string | null
}

export const useArtistsStore = defineStore('artists', () => {
  // ====================
  // STATE
  // ====================
  const artists = ref<Artist[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  // ====================
  // GETTERS
  // ====================
  const artistsCount = computed(() => artists.value.length)

  // ====================
  // ACTIONS
  // ====================
  async function loadArtists(forceReload = false) {
    if (!forceReload && isLoaded.value && artists.value.length > 0) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Artist[]>('/api/artists')
      artists.value = data
      isLoaded.value = true
    } catch (e: any) {
      error.value = e.message || 'Error cargando artistas'
      console.error('Error loading artists:', e)
    } finally {
      isLoading.value = false
    }
  }

  function getArtistById(id: string): Artist | undefined {
    return artists.value.find(artist => artist.id === id)
  }

  function $reset() {
    artists.value = []
    isLoading.value = false
    isLoaded.value = false
    error.value = null
  }

  // ====================
  // EXPORT
  // ====================
  return {
    // state
    artists,
    isLoading,
    isLoaded,
    error,

    // getters
    artistsCount,

    // actions
    loadArtists,
    getArtistById,
    $reset
  }
})
