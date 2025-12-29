<template>
  <div class="min-h-full pb-20 md:pb-0">
    <!-- Mobile Header con perfil -->
    <MobileHeader />

    <!-- Header con gradiente morado -->
    <div class="bg-gradient-to-b from-indigo-800 via-indigo-900 to-dark-base px-4 md:px-8 py-4 md:py-6 pb-6 md:pb-8">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        <!-- Icono de corazón - más grande en móvil -->
        <div class="w-52 h-52 md:w-48 md:h-48 lg:w-60 lg:h-60 rounded-lg shadow-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center flex-shrink-0">
          <IconHeart :size="90" class="text-white md:hidden" :filled="true" />
          <IconHeart :size="120" class="text-white hidden md:block" :filled="true" />
        </div>
        <div class="flex-1 text-center md:text-left md:pb-4 w-full">
          <p class="text-xs md:text-sm font-semibold uppercase text-indigo-300">Playlist</p>
          <h1 class="text-2xl md:text-5xl lg:text-6xl font-bold my-2 md:my-4 break-words">Canciones que te gustan</h1>
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs md:text-sm">
            <span class="text-secondary">{{ likedSongs.length }} {{ likedSongs.length === 1 ? 'canción' : 'canciones' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y canciones -->
    <div class="bg-dark-base px-4 md:px-8 py-4 md:py-6">
      <!-- Controles desktop -->
      <div v-if="likedSongs.length > 0" class="hidden md:flex items-center gap-4 md:gap-8 mb-6 md:mb-8">
        <button
          @click="handlePlayAll"
          class="bg-tiger-500 hover:bg-tiger-600 hover:scale-105 text-white rounded-full p-4 transition-all shadow-lg"
        >
          <IconPause v-if="isLikedSongsPlaying" :size="28" />
          <IconPlay v-else :size="28" />
        </button>
      </div>

      <!-- Controles móvil -->
      <div v-if="likedSongs.length > 0" class="flex md:hidden items-center gap-4 mb-6">
        <div class="flex-1" />
        <button
          @click="handlePlayAll"
          class="bg-tiger-500 hover:bg-tiger-600 text-black rounded-full p-3 transition-all shadow-lg"
        >
          <IconPause v-if="isLikedSongsPlaying" :size="28" />
          <IconPlay v-else :size="28" />
        </button>
      </div>

      <!-- Lista de canciones -->
      <div v-if="likedSongs.length > 0" class="mb-8">
        <!-- Header desktop -->
        <div class="hidden md:grid gap-4 px-4 py-2 border-b border-gray-800 text-secondary text-sm mb-2" style="grid-template-columns: 40px 1fr 200px 80px;">
          <div class="text-center">#</div>
          <div>Título</div>
          <div>Álbum</div>
          <div class="flex justify-end">
            <IconClock :size="16" />
          </div>
        </div>

        <!-- Desktop view -->
        <div
          v-for="(song, index) in likedSongs"
          :key="song.id"
          class="hidden md:grid gap-4 items-center px-4 py-2 rounded hover:bg-dark-hover transition-colors group cursor-pointer"
          style="grid-template-columns: 40px 1fr 200px 80px;"
          @click="handlePlaySong(song)"
        >
          <div class="flex items-center justify-center">
            <!-- Animación de barras cuando está reproduciendo (sin hover) -->
            <PlayingIndicator v-if="isCurrentAndPlaying(song)" class="group-hover:hidden" />
            <!-- Número cuando NO es la canción actual (sin hover) -->
            <span v-else class="text-secondary group-hover:hidden">{{ index + 1 }}</span>
            <!-- Iconos en hover -->
            <div class="hidden group-hover:block">
              <IconPause v-if="isCurrentAndPlaying(song)" :size="20" class="text-tiger-500" />
              <IconPlay v-else :size="20" class="text-tiger-500" />
            </div>
          </div>
          <div class="flex items-center gap-3 min-w-0">
            <img
              :src="song.cover"
              :alt="song.title"
              class="w-12 h-12 rounded flex-shrink-0"
            />
            <div class="min-w-0">
              <h4 class="font-semibold truncate" :class="isCurrentSongInContext(song) ? 'text-tiger-500' : 'text-primary'">
                {{ song.title }}
              </h4>
              <NuxtLink
                :to="`/artist/${song.artistId}`"
                @click.stop
                class="text-sm text-secondary hover:text-white hover:underline truncate block transition-colors"
              >
                {{ song.artistName }}
              </NuxtLink>
            </div>
          </div>
          <div class="text-secondary text-sm truncate">
            <NuxtLink
              :to="`/album/${song.albumId}`"
              @click.stop
              class="hover:text-primary hover:underline transition-colors"
            >
              {{ song.albumName }}
            </NuxtLink>
          </div>
          <div class="flex items-center gap-2 justify-end">
            <button
              @click.stop="toggleFavoriteSong(song.id)"
              class="text-tiger-500 hover:text-tiger-400 transition-all"
            >
              <IconHeart :size="18" :filled="true" />
            </button>
            <span class="text-secondary text-sm">{{ formatTime(song.duration) }}</span>
          </div>
        </div>

        <!-- Mobile view -->
        <div
          v-for="(song, index) in likedSongs"
          :key="`mobile-${song.id}`"
          class="md:hidden flex items-center gap-3 px-2 py-3 rounded-lg active:bg-dark-highlight transition-colors"
          @click="handlePlaySong(song)"
        >
          <!-- Número/Play -->
          <div class="w-8 flex items-center justify-center flex-shrink-0">
            <PlayingIndicator v-if="isCurrentAndPlaying(song)" size="sm" />
            <span v-else class="text-secondary text-sm">{{ index + 1 }}</span>
          </div>

          <!-- Info de canción -->
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-sm truncate" :class="isCurrentSongInContext(song) ? 'text-tiger-500' : 'text-primary'">
              {{ song.title }}
            </h4>
            <NuxtLink
              :to="`/artist/${song.artistId}`"
              @click.stop
              class="text-xs text-secondary hover:text-white hover:underline truncate block transition-colors"
            >
              {{ song.artistName }}
            </NuxtLink>
          </div>

          <!-- Menú de acciones -->
          <button
            @click.stop="openSongActions(song)"
            class="p-2 text-secondary hover:text-white transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-16">
        <IconHeart :size="64" class="mx-auto text-secondary mb-4" />
        <h3 class="text-xl font-bold mb-2">No tienes canciones guardadas</h3>
        <p class="text-secondary mb-6">Guarda canciones tocando el icono del corazón</p>
        <NuxtLink
          to="/songs"
          class="inline-block bg-tiger-500 hover:bg-tiger-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Explorar canciones
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- Song Action Sheet -->
  <SongActionSheet
    :isOpen="showSongActions"
    :song="selectedSong"
    @close="showSongActions = false"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { data } = useData()
const { playSong, currentSong, isPlaying, formatTime, togglePlay, playbackContext } = usePlayer()
const { favoriteSongs, toggleFavoriteSong } = useFavorites()

// Estado para SongActionSheet
const showSongActions = ref(false)
const selectedSong = ref<any>(null)

const openSongActions = (song: any) => {
  selectedSong.value = song
  showSongActions.value = true
}

// Obtener canciones favoritas
const likedSongs = computed(() => {
  if (!data.value.songs) return []
  return data.value.songs.filter((song: any) =>
    favoriteSongs.value.includes(song.id)
  )
})

// Check if liked-songs is the current playback context
const isLikedSongsContext = computed(() =>
  playbackContext.value.type === 'liked-songs'
)

// Check if this is the current song AND playing from liked-songs context (for orange text)
const isCurrentSongInContext = (song: any) => currentSong.value?.id === song.id && isLikedSongsContext.value
// Only show as playing if: same song AND liked-songs is the context AND actually playing (for animation)
const isCurrentAndPlaying = (song: any) => isCurrentSongInContext(song) && isPlaying.value
// Keep isCurrentSong for toggle logic (any context)
const isCurrentSong = (song: any) => currentSong.value?.id === song.id

// Check if currently playing from liked-songs
const isLikedSongsPlaying = computed(() => {
  if (!currentSong.value || !isPlaying.value || !isLikedSongsContext.value) return false
  return likedSongs.value.some((song: any) => song.id === currentSong.value.id)
})

const handlePlayAll = () => {
  if (isLikedSongsPlaying.value) {
    togglePlay()
  } else if (currentSong.value && likedSongs.value.some((s: any) => s.id === currentSong.value.id) && isLikedSongsContext.value) {
    togglePlay()
  } else if (likedSongs.value.length > 0) {
    playSong(likedSongs.value[0], likedSongs.value, { type: 'liked-songs' })
  }
}

const handlePlaySong = (song: any) => {
  if (isCurrentSong(song)) {
    togglePlay()
  } else {
    playSong(song, likedSongs.value, { type: 'liked-songs' })
  }
}
</script>

