<template>
  <div class="min-h-full bg-gradient-to-b from-tiger-900 via-tiger-950 to-dark-base">
    <div class="px-4 md:px-8 py-6">
      <!-- Saludo -->
      <div class="mb-8">
        <h1 class="text-4xl md:text-6xl font-bold mb-2">¡Hola, Tigre!</h1>
        <p class="text-secondary text-lg">{{ greeting }}</p>
      </div>

      <!-- Banner Destacado - Nueva Canción (COMPACTO Y PROFESIONAL) -->
      <section v-if="latestSong" class="mb-8">
        <div 
          class="relative overflow-hidden rounded-xl bg-gradient-to-r from-tiger-600/20 to-tiger-800/20 backdrop-blur-sm border border-tiger-500/30 cursor-pointer group hover:border-tiger-500/50 transition-all"
          @click="handlePlaySong(latestSong)"
        >
          <div class="flex flex-row items-center gap-4 p-4 md:p-6">
            <!-- Imagen más pequeña -->
            <div class="flex-shrink-0">
              <img
                :src="latestSong.cover"
                :alt="latestSong.title"
                class="w-20 h-20 md:w-24 md:h-24 rounded-lg shadow-lg object-cover"
                @error="handleImageError"
              />
            </div>
            <!-- Contenido compacto -->
            <div class="flex-1 min-w-0">
              <div class="inline-flex items-center gap-2 bg-tiger-500/20 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                <span class="text-tiger-400">●</span>
                NUEVO
              </div>
              <h3 class="text-lg md:text-2xl font-bold mb-1 truncate">{{ latestSong.title }}</h3>
              <p class="text-sm text-secondary truncate">{{ latestSong.artistName }}</p>
            </div>
            <!-- Botón de play compacto -->
            <div class="flex-shrink-0">
              <button 
                @click.stop="handlePlaySong(latestSong)"
                class="bg-tiger-500 hover:bg-tiger-600 rounded-full p-3 md:p-4 shadow-lg transition-all"
              >
                <IconPlay :size="20" class="text-white md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Promoción Artista - MÁS COMPACTO -->
      <section v-if="featuredArtist" class="mb-8">
        <div class="bg-dark-elevated/80 rounded-xl p-4 md:p-6 border border-tiger-500/20">
          <div class="flex flex-row items-center gap-4">
            <img
              :src="featuredArtist.image"
              :alt="featuredArtist.name"
              class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-tiger-500 shadow-lg object-cover"
              @error="handleImageError"
            />
            <div class="flex-1 min-w-0">
              <div class="text-tiger-500 font-semibold text-xs md:text-sm mb-1">🔥 ARTISTA DESTACADO</div>
              <h3 class="text-lg md:text-xl font-bold mb-1 truncate">{{ featuredArtist.name }}</h3>
              <p class="text-secondary text-xs md:text-sm line-clamp-2">{{ featuredArtist.bio }}</p>
            </div>
            <button 
              @click="navigateTo(`/artist/${featuredArtist.id}`)"
              class="hidden md:flex bg-tiger-500 hover:bg-tiger-600 text-white px-4 py-2 rounded-full font-semibold text-sm transition-colors items-center gap-2"
            >
              Ver perfil
            </button>
          </div>
        </div>
      </section>

      <!-- Álbumes Destacados -->
      <section class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl md:text-3xl font-bold">Nuestros Álbumes</h2>
          <button 
            @click="navigateTo('/albums')"
            class="text-tiger-500 hover:text-tiger-400 font-semibold text-sm transition-colors"
          >
            Ver todos
          </button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          <div
            v-for="album in albums"
            :key="album.id"
            class="group cursor-pointer"
            @click="navigateTo(`/album/${album.id}`)"
          >
            <div class="relative mb-3 overflow-hidden rounded-lg shadow-xl">
              <img
                :src="album.cover"
                :alt="album.title"
                class="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                @error="handleImageError"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <button
                @click.stop="handlePlayAlbum(album)"
                class="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-tiger-500 hover:bg-tiger-600 rounded-full p-2 md:p-3 shadow-xl transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
              >
                <IconPlay :size="20" class="text-white" />
              </button>
            </div>
            <h3 class="text-sm md:text-base font-bold mb-1 truncate">{{ album.title }}</h3>
            <p class="text-secondary text-xs truncate">{{ album.artistName }}</p>
          </div>
        </div>
      </section>

      <!-- Canciones Populares -->
      <section class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl md:text-3xl font-bold">🔥 Top Tigres</h2>
          <button 
            @click="navigateTo('/songs')"
            class="text-tiger-500 hover:text-tiger-400 font-semibold text-sm transition-colors"
          >
            Ver todas
          </button>
        </div>
        <div class="bg-dark-elevated/50 backdrop-blur-sm rounded-lg p-3 md:p-4">
          <div
            v-for="(song, index) in topSongs"
            :key="song.id"
            class="flex items-center gap-3 p-2 md:p-3 rounded-lg hover:bg-dark-highlight transition-colors group cursor-pointer"
            @click="handlePlaySong(song)"
          >
            <div class="text-tiger-500 font-bold text-sm md:text-base w-6 text-center flex-shrink-0">
              {{ index + 1 }}
            </div>
            <div class="relative flex-shrink-0">
              <img
                :src="song.cover"
                :alt="song.title"
                class="w-12 h-12 md:w-14 md:h-14 rounded object-cover"
                @error="handleImageError"
              />
              <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                <IconPlay v-if="!isCurrentAndPlaying(song)" :size="16" class="text-white" />
                <IconPause v-else :size="16" class="text-white" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm md:text-base font-semibold truncate" :class="isCurrentSong(song) ? 'text-tiger-500' : 'text-primary'">
                {{ song.title }}
              </h4>
              <p class="text-xs md:text-sm text-secondary truncate">{{ song.artistName }}</p>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click.stop="toggleFavoriteSong(song.id)"
                class="hidden md:block opacity-0 group-hover:opacity-100 text-secondary hover:text-tiger-500 transition-all"
                :class="{ 'opacity-100 text-tiger-500': isFavoriteSong(song.id) }"
              >
                <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
              </button>
              <span class="text-secondary text-xs md:text-sm">{{ formatTime(song.duration) }}</span>
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

// Obtener la canción más reciente
const latestSong = computed(() => {
  if (!data.value.songs || data.value.songs.length === 0) return null
  return [...data.value.songs].sort((a, b) => {
    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  })[0]
})

// Artista destacado (rotativo o aleatorio)
const featuredArtist = computed(() => {
  if (!data.value.artists || data.value.artists.length === 0) return null
  // Rotar entre artistas basado en el día del mes
  const dayOfMonth = new Date().getDate()
  const index = dayOfMonth % data.value.artists.length
  return data.value.artists[index]
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
})

const formatReleaseDate = (dateString: string) => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('es-ES', options)
}

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
