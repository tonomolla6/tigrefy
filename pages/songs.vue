<template>
  <div class="min-h-full bg-dark-base">
    <div class="px-4 md:px-8 py-6">
      <h1 class="text-4xl md:text-5xl font-bold mb-8">Todas las Canciones</h1>

      <!-- Buscador -->
      <div class="mb-8">
        <div class="relative max-w-2xl">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar canciones..."
            class="w-full bg-dark-highlight border border-gray-800 text-primary rounded-full py-4 px-6 pl-14 focus:outline-none focus:border-tiger-500 focus:ring-2 focus:ring-tiger-500/20 transition-all"
          />
          <IconSearch class="absolute left-5 top-1/2 -translate-y-1/2 text-secondary" :size="20" />
        </div>
      </div>

      <!-- Lista de canciones -->
      <div v-if="filteredSongs.length > 0">
        <div class="bg-dark-elevated rounded-lg overflow-hidden">
          <!-- Header -->
          <div class="hidden md:grid gap-4 px-4 py-3 border-b border-gray-800 text-secondary text-sm font-semibold" style="grid-template-columns: 40px 1fr 200px 120px 80px;">
            <div class="text-center">#</div>
            <div>Título</div>
            <div>Álbum</div>
            <div>Reproducciones</div>
            <div class="text-right">Duración</div>
          </div>

          <!-- Canciones -->
          <SongListRow
            v-for="(song, index) in filteredSongs"
            :key="song.id"
            :song="song"
            :index="index + 1"
            :is-playing="isCurrentAndPlaying(song)"
            :is-active="isCurrentSong(song)"
            :is-favorite="isFavoriteSong(song.id)"
            :is-selected="selectedSongId === song.id"
            :show-cover="true"
            :show-artist="true"
            :show-mobile-menu="false"
            grid-columns="40px 1fr 200px 120px 80px"
            @play="handlePlaySong(song)"
            @select="selectedSongId = song.id"
            @toggle-favorite="toggleFavoriteSong(song.id)"
          >
            <template #extra-columns>
              <div class="text-secondary text-sm truncate">
                {{ song.albumName }}
              </div>
              <div class="text-secondary text-sm">
                {{ formatPlays(song.plays) }}
              </div>
            </template>
          </SongListRow>
        </div>
      </div>

      <EmptyState
        v-else
        :icon="IconSearch"
        title="No se encontraron canciones"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTime, formatPlays } from '~/utils/formatting'
import { handleImageError } from '~/utils/image'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { data, searchAll } = useData()
const { playSong, currentSong, isPlaying } = usePlayer()
const { toggleFavoriteSong, isFavoriteSong } = useFavorites()

// Estado para selección de canción (desktop)
const selectedSongId = ref<string | null>(null)

const searchQuery = ref('')
const searchResults = ref<any>(null)

// Debouncing
let searchTimeout: NodeJS.Timeout | null = null

const allSongs = computed(() => data.value.songs || [])

const filteredSongs = computed(() => {
  if (!searchQuery.value.trim()) {
    return allSongs.value
  }

  // Usar resultados del composable si existen
  if (searchResults.value) {
    return searchResults.value.songs || []
  }

  return []
})

const isCurrentSong = (song: any) => currentSong.value?.id === song.id
const isCurrentAndPlaying = (song: any) => isCurrentSong(song) && isPlaying.value

const handlePlaySong = (song: any) => {
  playSong(song, filteredSongs.value, { type: 'search' })
}

// Watch para búsqueda con debouncing
watch(searchQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!newQuery.trim()) {
    searchResults.value = null
    return
  }

  searchTimeout = setTimeout(() => {
    searchResults.value = searchAll(newQuery.trim())
  }, 300) // Debounce de 300ms
})
</script>
