<template>
  <div v-if="playlist" class="min-h-full pb-20 md:pb-0">
    <!-- Mobile Header con perfil -->
    <MobileHeader />

    <!-- Header de la playlist -->
    <div class="bg-gradient-to-b from-tiger-600 to-dark-base px-4 md:px-8 py-4 md:py-6 pb-6 md:pb-8">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        <!-- Portada más grande en móvil -->
        <img
          :src="playlist.cover"
          :alt="playlist.name"
          class="w-52 h-52 md:w-48 md:h-48 lg:w-60 lg:h-60 rounded shadow-2xl flex-shrink-0"
          @error="handleImageError"
        />
        <div class="flex-1 text-center md:text-left md:pb-4 w-full">
          <p class="text-xs md:text-sm font-semibold uppercase">Playlist</p>
          <h1 class="text-2xl md:text-5xl lg:text-6xl font-bold my-2 md:my-4 break-words">{{ playlist.name }}</h1>
          <p class="text-secondary mb-2 text-sm md:text-base line-clamp-2 md:line-clamp-none">{{ playlist.description }}</p>
          <div class="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm flex-wrap">
            <span class="font-semibold">Tigrefy</span>
            <span class="text-secondary">•</span>
            <span class="text-secondary">{{ playlistSongs.length }} canciones</span>
            <span v-if="playlistSongs.length > 0" class="text-secondary">•</span>
            <span v-if="playlistSongs.length > 0" class="text-secondary">{{ totalDuration }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y canciones -->
    <div class="bg-dark-base px-4 md:px-8 py-4 md:py-6">
      <!-- Controles desktop -->
      <div class="hidden md:flex items-center gap-4 md:gap-8 mb-6 md:mb-8 flex-wrap">
        <button
          v-if="playlistSongs.length > 0"
          @click="handlePlayPlaylistButton"
          class="bg-tiger-500 hover:bg-tiger-600 text-white rounded-full p-4 transition-all hover:scale-105"
        >
          <IconPause v-if="isPlaylistPlaying" :size="28" />
          <IconPlay v-else :size="28" />
        </button>
        <!-- Botón guardar en biblioteca -->
        <Tooltip :text="isPlaylistSaved(playlist.id) ? 'Quitar de Tu biblioteca' : 'Guardar en Tu biblioteca'">
          <button
            @click="toggleSavePlaylist(playlist.id)"
            class="border border-gray-600 hover:border-white rounded-full p-2 transition-all hover:scale-105"
            :class="isPlaylistSaved(playlist.id) ? 'bg-tiger-500 border-tiger-500' : ''"
          >
            <IconCheck v-if="isPlaylistSaved(playlist.id)" :size="24" class="text-white" />
            <IconPlus v-else :size="24" class="text-secondary hover:text-white" />
          </button>
        </Tooltip>
      </div>

      <!-- Controles móvil -->
      <div class="flex md:hidden items-center gap-4 mb-6">
        <button
          @click="toggleSavePlaylist(playlist.id)"
          class="p-2 transition-all"
          :class="isPlaylistSaved(playlist.id) ? 'text-tiger-500' : 'text-secondary'"
        >
          <IconHeart :size="28" :filled="isPlaylistSaved(playlist.id)" />
        </button>
        <div class="flex-1" />
        <button
          v-if="playlistSongs.length > 0"
          @click="handlePlayPlaylistButton"
          class="bg-tiger-500 hover:bg-tiger-600 text-black rounded-full p-3 transition-all shadow-lg"
        >
          <IconPause v-if="isPlaylistPlaying" :size="28" />
          <IconPlay v-else :size="28" />
        </button>
      </div>

      <!-- Lista de canciones -->
      <div v-if="playlistSongs.length > 0" class="mb-8">
        <!-- Header desktop -->
        <div class="hidden md:grid gap-4 px-4 py-2 border-b border-gray-800 text-secondary text-sm mb-2" style="grid-template-columns: 40px 1fr 120px 200px 80px;">
          <div class="text-center">#</div>
          <div>Título</div>
          <div class="text-right">Reproducciones</div>
          <div>Álbum</div>
          <div class="flex justify-end">
            <IconClock :size="16" />
          </div>
        </div>

        <!-- Desktop view -->
        <div
          v-for="(song, index) in playlistSongs"
          :key="song.id"
          class="hidden md:grid gap-4 items-center px-4 py-2 rounded hover:bg-dark-hover transition-colors group cursor-pointer"
          style="grid-template-columns: 40px 1fr 120px 200px 80px;"
          @click="handlePlaySong(song)"
        >
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
          <div class="flex items-center gap-3 min-w-0">
            <img
              :src="song.cover"
              :alt="song.title"
              class="w-12 h-12 rounded flex-shrink-0"
              @error="handleImageError"
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
          <div class="text-secondary text-sm text-right">
            {{ formatPlays(song.plays) }}
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
              class="opacity-0 group-hover:opacity-100 text-secondary hover:text-tiger-500 transition-all"
              :class="{ 'opacity-100 text-tiger-500': isFavoriteSong(song.id) }"
            >
              <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
            </button>
            <span class="text-secondary text-sm">{{ formatTime(song.duration) }}</span>
          </div>
        </div>

        <!-- Mobile view -->
        <div
          v-for="(song, index) in playlistSongs"
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

      <div v-else class="text-center py-16 max-w-md mx-auto">
        <div class="mb-6">
          <IconLibrary :size="64" class="text-secondary mx-auto opacity-50" />
        </div>
        <h3 class="text-2xl font-bold mb-2">Esta playlist está vacía</h3>
        <p class="text-secondary mb-6">
          Empieza a añadir canciones para crear tu colección perfecta. Busca tus favoritas o explora nuevas canciones.
        </p>
        <div class="flex gap-3 justify-center">
          <NuxtLink to="/search" class="btn-tiger">
            Buscar canciones
          </NuxtLink>
          <NuxtLink to="/albums" class="px-6 py-3 rounded-full font-semibold border border-gray-700 hover:bg-dark-hover transition-colors">
            Explorar álbumes
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>

  <div v-else class="min-h-full flex items-center justify-center">
    <p class="text-secondary">Cargando playlist...</p>
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
const { data, getPlaylistById, getSongsByIds } = useData()
const { userPlaylists } = useUserPlaylists()
const { playSong, currentSong, isPlaying, formatTime, togglePlay, playbackContext } = usePlayer()
const { toggleSavePlaylist, isPlaylistSaved, toggleFavoriteSong, isFavoriteSong } = useFavorites()

const playlistId = route.params.id as string

// Estado para SongActionSheet
const showSongActions = ref(false)
const selectedSong = ref<any>(null)

const openSongActions = (song: any) => {
  selectedSong.value = song
  showSongActions.value = true
}

const playlist = computed(() => {
  const systemPlaylist = getPlaylistById(playlistId)
  if (systemPlaylist) return systemPlaylist

  return userPlaylists.value.find(p => p.id === playlistId)
})

const playlistSongs = computed(() => {
  if (!playlist.value) return []
  return getSongsByIds(playlist.value.songIds)
})

const totalDuration = computed(() => {
  const totalSeconds = playlistSongs.value.reduce((acc, song) => acc + (song.duration || 0), 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours} h ${minutes} min`
  }
  return `${minutes} min`
})

// Check if this playlist is the current playback context
const isThisPlaylistContext = computed(() =>
  playbackContext.value.type === 'playlist' && playbackContext.value.id === playlistId
)

// Check if this is the current song AND playing from this playlist context (for orange text)
const isCurrentSongInContext = (song: any) => currentSong.value?.id === song.id && isThisPlaylistContext.value
// Only show as playing if: same song AND this playlist is the context AND actually playing (for animation)
const isCurrentAndPlaying = (song: any) => isCurrentSongInContext(song) && isPlaying.value
// Keep isCurrentSong for toggle logic (any context)
const isCurrentSong = (song: any) => currentSong.value?.id === song.id

// Verifica si alguna canción de la playlist se está reproduciendo DESDE ESTA PLAYLIST
const isPlaylistPlaying = computed(() => {
  if (!currentSong.value || !isPlaying.value || !isThisPlaylistContext.value) return false
  return playlistSongs.value.some(song => song.id === currentSong.value.id)
})

// Formatear reproducciones con separador de miles
const formatPlays = (plays: number | undefined) => {
  if (!plays) return '0'
  return plays.toLocaleString('es-ES')
}

const handlePlayPlaylistButton = () => {
  if (isPlaylistPlaying.value) {
    // Si está reproduciendo una canción de la playlist, pausar
    togglePlay()
  } else if (currentSong.value && playlistSongs.value.some(s => s.id === currentSong.value.id)) {
    // Si hay una canción de la playlist pausada, reanudar
    togglePlay()
  } else if (playlistSongs.value.length > 0) {
    // Si no, empezar desde la primera canción
    playSong(playlistSongs.value[0], playlistSongs.value, { type: 'playlist', id: playlistId })
  }
}

const handlePlaySong = (song: any) => {
  // Si es la canción actual, toggle play/pause
  if (isCurrentSong(song)) {
    togglePlay()
  } else {
    playSong(song, playlistSongs.value, { type: 'playlist', id: playlistId })
  }
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
