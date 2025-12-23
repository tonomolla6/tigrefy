<template>
  <div v-if="album" class="min-h-full pb-20 md:pb-0">
    <!-- Mobile Header con perfil -->
    <MobileHeader />

    <!-- Header del álbum -->
    <div class="bg-gradient-to-b from-tiger-800 via-tiger-900 to-dark-base px-4 md:px-8 py-6 md:py-8 pb-8">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        <!-- Portada más grande en móvil -->
        <img
          :src="album.cover"
          :alt="album.title"
          class="w-56 h-56 md:w-60 md:h-60 rounded-lg shadow-2xl"
          @error="handleImageError"
        />
        <div class="flex-1 pb-0 md:pb-4 text-center md:text-left">
          <p class="text-xs md:text-sm font-semibold uppercase text-tiger-300">Álbum</p>
          <h1 class="text-3xl md:text-6xl lg:text-7xl font-bold my-2 md:my-4">{{ album.title }}</h1>
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm">
            <span class="font-semibold">{{ album.artistName }}</span>
            <span class="text-secondary">•</span>
            <span class="text-secondary">{{ album.releaseDate?.substring(0, 4) }}</span>
            <span class="text-secondary">•</span>
            <span class="text-secondary">{{ album.totalTracks }} {{ album.totalTracks === 1 ? 'canción' : 'canciones' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y canciones -->
    <div class="bg-dark-base px-4 md:px-8 py-6">
      <!-- Controles (ocultos en móvil, usamos FAB) -->
      <div class="hidden md:flex items-center gap-4 md:gap-8 mb-8">
        <button
          @click="handlePlayAlbumButton"
          class="bg-tiger-500 hover:bg-tiger-600 hover:scale-105 text-white rounded-full p-4 md:p-5 transition-all shadow-lg"
        >
          <template v-if="isAlbumPlaying">
            <IconPause :size="32" />
          </template>
          <template v-else>
            <IconPlay :size="32" />
          </template>
        </button>
        <!-- Botón guardar en biblioteca -->
        <button
          @click="toggleSaveAlbum(album.id)"
          class="border border-gray-600 hover:border-white rounded-full p-2 transition-all hover:scale-105"
          :class="isAlbumSaved(album.id) ? 'bg-tiger-500 border-tiger-500' : ''"
          :title="isAlbumSaved(album.id) ? 'Quitar de Tu biblioteca' : 'Guardar en Tu biblioteca'"
        >
          <IconCheck
            v-if="isAlbumSaved(album.id)"
            :size="24"
            class="text-white"
          />
          <IconPlus
            v-if="!isAlbumSaved(album.id)"
            :size="24"
            class="text-secondary hover:text-white"
          />
        </button>
      </div>

      <!-- Controles móvil (inline) -->
      <div class="flex md:hidden items-center gap-4 mb-6">
        <button
          @click="toggleSaveAlbum(album.id)"
          class="p-2 transition-all"
          :class="isAlbumSaved(album.id) ? 'text-tiger-500' : 'text-secondary'"
        >
          <IconHeart :size="28" :filled="isAlbumSaved(album.id)" />
        </button>
        <div class="flex-1" />
        <button
          @click="handlePlayAlbumButton"
          class="bg-tiger-500 hover:bg-tiger-600 text-black rounded-full p-3 transition-all shadow-lg"
        >
          <IconPause v-if="isAlbumPlaying" :size="28" />
          <IconPlay v-else :size="28" />
        </button>
      </div>

      <!-- Lista de canciones -->
      <div class="mb-8">
        <!-- Header (solo desktop) -->
        <div class="hidden md:grid gap-4 px-4 py-2 border-b border-gray-800 text-secondary text-sm mb-2" style="grid-template-columns: 40px 1fr 80px;">
          <div class="text-center">#</div>
          <div>Título</div>
          <div class="flex justify-end">
            <IconClock :size="16" />
          </div>
        </div>

        <!-- Canciones (Desktop) -->
        <div
          v-for="(song, index) in albumSongs"
          :key="song.id"
          class="hidden md:grid gap-4 items-center px-4 py-3 rounded-lg hover:bg-dark-highlight transition-colors group cursor-pointer"
          style="grid-template-columns: 40px 1fr 80px;"
          @click="handlePlaySong(song)"
        >
          <!-- Número/Play/Animación -->
          <div class="flex items-center justify-center">
            <!-- Animación de barras cuando está reproduciendo (sin hover) -->
            <div v-if="isCurrentAndPlaying(song)" class="playing-indicator group-hover:hidden">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <!-- Número cuando NO es la canción actual (sin hover) -->
            <span v-else class="text-secondary group-hover:hidden">{{ index + 1 }}</span>
            <!-- Iconos en hover -->
            <div class="hidden group-hover:block">
              <IconPause v-if="isCurrentAndPlaying(song)" :size="20" class="text-tiger-500" />
              <IconPlay v-else :size="20" class="text-tiger-500" />
            </div>
          </div>

          <!-- Título -->
          <div class="min-w-0">
            <h4 class="font-semibold truncate" :class="isCurrentSongInContext(song) ? 'text-tiger-500' : 'text-primary'">
              {{ song.title }}
            </h4>
            <p class="text-sm text-secondary truncate">{{ song.artistName }}</p>
          </div>

          <!-- Acciones y duración -->
          <div class="flex items-center gap-4 justify-end">
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

        <!-- Canciones (Mobile) -->
        <div
          v-for="(song, index) in albumSongs"
          :key="`mobile-${song.id}`"
          class="md:hidden flex items-center gap-3 px-2 py-3 rounded-lg active:bg-dark-highlight transition-colors"
          @click="handlePlaySong(song)"
        >
          <!-- Número/Play -->
          <div class="w-8 flex items-center justify-center flex-shrink-0">
            <div v-if="isCurrentAndPlaying(song)" class="playing-indicator">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span v-else class="text-secondary text-sm">{{ index + 1 }}</span>
          </div>

          <!-- Título -->
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-sm truncate" :class="isCurrentSongInContext(song) ? 'text-tiger-500' : 'text-primary'">
              {{ song.title }}
            </h4>
            <p class="text-xs text-secondary truncate">{{ song.artistName }}</p>
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

      <!-- Información adicional -->
      <div class="text-secondary text-sm space-y-2">
        <p>{{ album.releaseDate }}</p>
        <p v-if="album.genres" class="flex flex-wrap gap-2">
          <span class="text-primary font-semibold">Géneros:</span>
          <span v-for="genre in album.genres" :key="genre" class="bg-dark-highlight px-3 py-1 rounded-full text-xs">
            {{ genre }}
          </span>
        </p>
      </div>
    </div>
  </div>

  <div v-else class="min-h-full flex items-center justify-center">
    <p class="text-secondary">Cargando álbum...</p>
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

const route = useRoute()
const { getAlbumById, getSongsByAlbumId } = useData()
const { playSong, currentSong, isPlaying, formatTime, togglePlay, playbackContext } = usePlayer()
const { toggleFavoriteSong, isFavoriteSong, toggleSaveAlbum, isAlbumSaved } = useFavorites()

const albumId = route.params.id as string
const album = computed(() => getAlbumById(albumId))
const albumSongs = computed(() => getSongsByAlbumId(albumId))

// Estado para SongActionSheet
const showSongActions = ref(false)
const selectedSong = ref<any>(null)

const openSongActions = (song: any) => {
  selectedSong.value = song
  showSongActions.value = true
}

// Check if this album is the current playback context
const isThisAlbumContext = computed(() =>
  playbackContext.value.type === 'album' && playbackContext.value.id === albumId
)

// Check if this is the current song AND playing from this album context (for orange text)
const isCurrentSongInContext = (song: any) => currentSong.value?.id === song.id && isThisAlbumContext.value
// Only show as playing if: same song AND this album is the context AND actually playing (for animation)
const isCurrentAndPlaying = (song: any) => isCurrentSongInContext(song) && isPlaying.value
// Keep isCurrentSong for toggle logic (any context)
const isCurrentSong = (song: any) => currentSong.value?.id === song.id

// Verifica si alguna canción del álbum se está reproduciendo DESDE ESTE ÁLBUM
const isAlbumPlaying = computed(() => {
  if (!currentSong.value || !isPlaying.value || !isThisAlbumContext.value) return false
  return albumSongs.value.some(song => song.id === currentSong.value.id)
})

const handlePlayAlbumButton = () => {
  if (isAlbumPlaying.value) {
    // Si está reproduciendo una canción del álbum, pausar
    togglePlay()
  } else if (currentSong.value && albumSongs.value.some(s => s.id === currentSong.value.id)) {
    // Si hay una canción del álbum pausada, reanudar
    togglePlay()
  } else if (albumSongs.value.length > 0) {
    // Si no, empezar desde la primera canción
    playSong(albumSongs.value[0], albumSongs.value, { type: 'album', id: albumId })
  }
}

const handlePlaySong = (song: any) => {
  // Si es la canción actual, toggle play/pause
  if (isCurrentSong(song)) {
    togglePlay()
  } else {
    playSong(song, albumSongs.value, { type: 'album', id: albumId })
  }
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

<style scoped>
.playing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.playing-indicator span {
  width: 3px;
  background-color: #f97316;
  border-radius: 1px;
  animation: playing-bar 0.8s ease-in-out infinite;
}

.playing-indicator span:nth-child(1) {
  height: 30%;
  animation-delay: 0s;
}

.playing-indicator span:nth-child(2) {
  height: 60%;
  animation-delay: 0.2s;
}

.playing-indicator span:nth-child(3) {
  height: 40%;
  animation-delay: 0.4s;
}

.playing-indicator span:nth-child(4) {
  height: 80%;
  animation-delay: 0.1s;
}

@keyframes playing-bar {
  0%, 100% {
    height: 30%;
  }
  50% {
    height: 100%;
  }
}
</style>
