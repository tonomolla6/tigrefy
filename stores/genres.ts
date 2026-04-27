import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Genre {
  id: number
  name: string
  songCount: number
  /** Cover representativo (primer álbum visible del género). Puede ser null. */
  coverHint?: string | null
}

export const useGenresStore = defineStore('genres', () => {
  const genres = ref<Genre[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  const genresCount = computed(() => genres.value.length)

  async function loadGenres(forceReload = false) {
    if (!forceReload && isLoaded.value && genres.value.length > 0) return

    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Genre[]>('/api/genres')
      genres.value = data
      isLoaded.value = true
    } catch (e: any) {
      error.value = e.message || 'Error cargando géneros'
      console.error('Error loading genres:', e)
    } finally {
      isLoading.value = false
    }
  }

  function getGenreById(id: number): Genre | undefined {
    return genres.value.find(g => g.id === id)
  }

  function $reset() {
    genres.value = []
    isLoading.value = false
    isLoaded.value = false
    error.value = null
  }

  return {
    genres,
    isLoading,
    isLoaded,
    error,
    genresCount,
    loadGenres,
    getGenreById,
    $reset,
  }
})
