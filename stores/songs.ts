import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Song {
  id: string
  title: string
  artistId: string
  artistName: string
  albumId: string | null
  albumName: string | null
  trackNumber: number | null
  duration: number
  cover: string | null
  audioUrl: string
  lyrics: string | null
  plays: number
  releaseDate: string | null
  isPublic: boolean
}

export const useSongsStore = defineStore('songs', () => {
  // ====================
  // STATE
  // ====================
  const songs = ref<Song[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  // ====================
  // GETTERS
  // ====================
  const songsCount = computed(() => songs.value.length)

  const topSongs = computed(() =>
    [...songs.value].sort((a, b) => b.plays - a.plays)
  )

  const latestSong = computed(() => {
    if (songs.value.length === 0) return null
    return [...songs.value].sort((a, b) =>
      new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()
    )[0]
  })

  // ====================
  // ACTIONS
  // ====================
  async function loadSongs(forceReload = false) {
    if (!forceReload && isLoaded.value && songs.value.length > 0) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Song[]>('/api/songs')
      songs.value = data
      isLoaded.value = true
    } catch (e: any) {
      error.value = e.message || 'Error cargando canciones'
      console.error('Error loading songs:', e)
    } finally {
      isLoading.value = false
    }
  }

  function getSongById(id: string): Song | undefined {
    return songs.value.find(song => song.id === id)
  }

  function getSongsByAlbumId(albumId: string): Song[] {
    return songs.value
      .filter(song => song.albumId === albumId)
      .sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0))
  }

  function getSongsByArtistId(artistId: string): Song[] {
    return songs.value.filter(song => song.artistId === artistId)
  }

  function getSongsByIds(ids: string[]): Song[] {
    return songs.value.filter(song => ids.includes(song.id))
  }

  function updateSongPlays(songId: string, newPlays: number) {
    const song = songs.value.find(s => s.id === songId)
    if (song) {
      song.plays = newPlays
    }
  }

  function $reset() {
    songs.value = []
    isLoading.value = false
    isLoaded.value = false
    error.value = null
  }

  // ====================
  // EXPORT
  // ====================
  return {
    // state
    songs,
    isLoading,
    isLoaded,
    error,

    // getters
    songsCount,
    topSongs,
    latestSong,

    // actions
    loadSongs,
    getSongById,
    getSongsByAlbumId,
    getSongsByArtistId,
    getSongsByIds,
    updateSongPlays,
    $reset
  }
})
