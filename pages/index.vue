<template>
  <div class="min-h-full bg-gradient-to-b from-tiger-900 via-tiger-950 to-dark-base">
    <div class="px-4 md:px-8 py-6">
      <!-- Saludo -->
      <div class="mb-8">
        <h1 class="text-4xl md:text-6xl font-bold mb-2">¡Hola, Tigre!</h1>
        <p class="text-secondary text-lg">{{ greeting }}</p>
      </div>

      <!-- Álbumes Destacados -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold mb-6">Nuestros Álbumes</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="album in albums"
            :key="album.id"
            class="group cursor-pointer"
            @click="navigateTo(`/album/${album.id}`)"
          >
            <div class="relative mb-4 overflow-hidden rounded-lg shadow-2xl">
              <img
                :src="album.cover"
                :alt="album.title"
                class="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                @error="handleImageError"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <button
                @click.stop="handlePlayAlbum(album)"
                class="absolute bottom-4 right-4 bg-tiger-500 hover:bg-tiger-600 rounded-full p-4 shadow-2xl transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
              >
                <IconPlay :size="28" class="text-white" />
              </button>
            </div>
            <h3 class="text-xl font-bold mb-1 truncate">{{ album.title }}</h3>
            <p class="text-secondary text-sm truncate">{{ album.artistName }}</p>
            <p class="text-secondary text-xs mt-1">{{ album.totalTracks }} {{ album.totalTracks === 1 ? 'canción' : 'canciones' }}</p>
          </div>
        </div>
      </section>

      <!-- Canciones Destacadas -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold mb-6">Canciones Populares</h2>
        <div class="bg-dark-elevated/50 backdrop-blur-sm rounded-lg p-4 md:p-6">
          <div
            v-for="(song, index) in topSongs"
            :key="song.id"
            class="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-highlight transition-colors group cursor-pointer"
            @click="handlePlaySong(song)"
          >
            <div class="text-tiger-500 font-bold text-lg w-8 text-center">
              {{ index + 1 }}
            </div>
            <div class="relative flex-shrink-0">
              <img
                :src="song.cover"
                :alt="song.title"
                class="w-16 h-16 rounded object-cover"
                @error="handleImageError"
              />
              <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                <IconPlay v-if="!isCurrentAndPlaying(song)" :size="24" class="text-white" />
                <IconPause v-else :size="24" class="text-white" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-base md:text-lg font-semibold truncate" :class="isCurrentSong(song) ? 'text-tiger-500' : 'text-primary'">
                {{ song.title }}
              </h4>
              <p class="text-sm text-secondary truncate">{{ song.artistName }}</p>
            </div>
            <div class="hidden md:flex items-center gap-4">
              <button
                @click.stop="toggleFavoriteSong(song.id)"
                class="opacity-0 group-hover:opacity-100 text-secondary hover:text-tiger-500 transition-all"
                :class="{ 'opacity-100 text-tiger-500': isFavoriteSong(song.id) }"
              >
                <IconHeart :size="20" :filled="isFavoriteSong(song.id)" />
              </button>
              <span class="text-secondary text-sm">{{ formatTime(song.duration) }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { data, getSongsByAlbumId } = useData()
const { playSong, currentSong, isPlaying, formatTime } = usePlayer()
const { toggleFavoriteSong, isFavoriteSong } = useFavorites()

const albums = computed(() => data.value.albums || [])
const topSongs = computed(() => {
  return [...data.value.songs].sort((a, b) => b.plays - a.plays)
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
})

const isCurrentSong = (song: any) => currentSong.value?.id === song.id
const isCurrentAndPlaying = (song: any) => isCurrentSong(song) && isPlaying.value

const handlePlayAlbum = (album: any) => {
  const songs = getSongsByAlbumId(album.id)
  if (songs.length > 0) {
    playSong(songs[0], songs)
  }
}

const handlePlaySong = (song: any) => {
  playSong(song, topSongs.value)
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
