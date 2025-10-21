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
          <div class="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-800 text-secondary text-sm font-semibold">
            <div class="col-span-1">#</div>
            <div class="col-span-5">Título</div>
            <div class="col-span-3">Álbum</div>
            <div class="col-span-2">Reproducciones</div>
            <div class="col-span-1 text-right">Duración</div>
          </div>

          <!-- Canciones -->
          <div
            v-for="(song, index) in filteredSongs"
            :key="song.id"
            class="grid grid-cols-12 gap-4 items-center px-4 md:px-6 py-3 hover:bg-dark-highlight transition-colors group cursor-pointer"
            @click="handlePlaySong(song)"
          >
            <!-- Número/Play en desktop -->
            <div class="hidden md:block col-span-1">
              <span class="text-secondary group-hover:hidden">{{ index + 1 }}</span>
              <div class="hidden group-hover:block">
                <IconPlay v-if="!isCurrentAndPlaying(song)" :size="20" class="text-tiger-500" />
                <IconPause v-else :size="20" class="text-tiger-500" />
              </div>
            </div>

            <!-- Título y portada -->
            <div class="col-span-10 md:col-span-5 flex items-center gap-3">
              <div class="relative flex-shrink-0">
                <img
                  :src="song.cover"
                  :alt="song.title"
                  class="w-12 h-12 md:w-14 md:h-14 rounded object-cover"
                  @error="handleImageError"
                />
                <div class="md:hidden absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                  <IconPlay v-if="!isCurrentAndPlaying(song)" :size="20" class="text-white" />
                  <IconPause v-else :size="20" class="text-white" />
                </div>
              </div>
              <div class="min-w-0">
                <h4 class="font-semibold truncate" :class="isCurrentSong(song) ? 'text-tiger-500' : 'text-primary'">
                  {{ song.title }}
                </h4>
                <p class="text-sm text-secondary truncate">{{ song.artistName }}</p>
              </div>
            </div>

            <!-- Álbum (hidden on mobile) -->
            <div class="hidden md:block col-span-3 text-secondary text-sm truncate">
              {{ song.albumName }}
            </div>

            <!-- Reproducciones (hidden on mobile) -->
            <div class="hidden md:block col-span-2 text-secondary text-sm">
              {{ formatPlays(song.plays) }}
            </div>

            <!-- Duración y favorito -->
            <div class="col-span-2 md:col-span-1 flex items-center justify-end gap-3">
              <button
                @click.stop="toggleFavoriteSong(song.id)"
                class="opacity-0 group-hover:opacity-100 text-secondary hover:text-tiger-500 transition-all"
                :class="{ 'opacity-100 text-tiger-500': isFavoriteSong(song.id) }"
              >
                <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
              </button>
              <span class="text-secondary text-sm">{{ formatTime(song.duration) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <IconSearch :size="64" class="text-secondary mx-auto mb-4" />
        <p class="text-xl text-secondary">No se encontraron canciones</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { data } = useData()
const { playSong, currentSong, isPlaying, formatTime } = usePlayer()
const { toggleFavoriteSong, isFavoriteSong } = useFavorites()

const searchQuery = ref('')

const allSongs = computed(() => data.value.songs || [])

const filteredSongs = computed(() => {
  if (!searchQuery.value.trim()) {
    return allSongs.value
  }

  const query = searchQuery.value.toLowerCase()
  return allSongs.value.filter(song =>
    song.title.toLowerCase().includes(query) ||
    song.artistName.toLowerCase().includes(query) ||
    song.albumName.toLowerCase().includes(query)
  )
})

const isCurrentSong = (song: any) => currentSong.value?.id === song.id
const isCurrentAndPlaying = (song: any) => isCurrentSong(song) && isPlaying.value

const handlePlaySong = (song: any) => {
  playSong(song, filteredSongs.value)
}

const formatPlays = (plays: number) => {
  if (plays >= 1000000) {
    return `${(plays / 1000000).toFixed(1)}M`
  }
  if (plays >= 1000) {
    return `${(plays / 1000).toFixed(1)}K`
  }
  return plays.toString()
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
