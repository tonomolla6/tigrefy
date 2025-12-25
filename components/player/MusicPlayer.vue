<template>
  <div v-if="currentSong" class="fixed bottom-16 md:bottom-0 left-0 right-0 bg-black border-t border-gray-900 z-50">
    <div class="px-3 md:px-4 py-2 md:py-3">
      <div class="flex items-center justify-between gap-3 md:gap-6">
        <!-- Info de la canción (izquierda) - clickable en móvil para abrir fullscreen -->
        <div
          class="flex items-center gap-3 min-w-0 w-[30%] cursor-pointer md:cursor-default"
          @click="openFullscreen"
        >
            <img
              v-if="currentSong.cover"
              :src="currentSong.cover"
              :alt="currentSong.title"
              class="w-14 h-14 rounded object-cover flex-shrink-0"
              @error="handleImageError"
            />
            <div class="flex items-center gap-3 min-w-0">
              <div class="min-w-0">
                <h4 class="text-sm font-medium text-white truncate">
                  <span class="hover:underline cursor-pointer">{{ currentSong.title }}</span>
                </h4>
                <p class="text-xs text-gray-400 truncate">
                  <NuxtLink
                    :to="`/artist/${currentSong.artistId}`"
                    class="hover:text-white hover:underline transition-colors"
                    @click.stop
                  >
                    {{ currentSong.artistName }}
                  </NuxtLink>
                </p>
              </div>
              <button
                @click.stop="toggleFavoriteSong(currentSong.id)"
                class="hidden md:block text-gray-400 hover:text-white transition-all flex-shrink-0"
                :class="{'text-tiger-500 hover:text-tiger-400': isFavoriteSong(currentSong.id)}"
              >
                <IconHeart :size="18" :filled="isFavoriteSong(currentSong.id)" />
              </button>
            </div>
          </div>

          <!-- Controles centrales -->
          <div class="flex flex-col items-center gap-1 w-[40%]">
            <div class="flex items-center gap-4 md:gap-5">
              <button
                @click="toggleShuffle"
                class="hidden md:flex flex-col items-center relative text-gray-400 hover:text-white transition-colors"
                :class="{'text-tiger-500 hover:text-tiger-400': isShuffled}"
                title="Aleatorio"
              >
                <IconShuffle :size="18" />
                <span v-if="isShuffled" class="absolute -bottom-2 w-1 h-1 bg-tiger-500 rounded-full"></span>
              </button>
              <button
                @click="previousSong"
                class="text-gray-400 hover:text-white transition-colors"
                title="Anterior"
              >
                <IconSkipBack :size="20" class="md:hidden" />
                <IconSkipBack :size="22" class="hidden md:block" />
              </button>
              <button
                @click="togglePlay"
                class="bg-white hover:scale-105 text-black rounded-full p-2 transition-transform"
                :title="isPlaying ? 'Pausar' : 'Reproducir'"
              >
                <template v-if="!isPlaying">
                  <IconPlay :size="18" class="md:hidden" />
                  <IconPlay :size="20" class="hidden md:block" />
                </template>
                <template v-else>
                  <IconPause :size="18" class="md:hidden" />
                  <IconPause :size="20" class="hidden md:block" />
                </template>
              </button>
              <button
                @click="nextSong"
                class="text-gray-400 hover:text-white transition-colors"
                title="Siguiente"
              >
                <IconSkipForward :size="20" class="md:hidden" />
                <IconSkipForward :size="22" class="hidden md:block" />
              </button>
              <button
                @click="toggleRepeat"
                class="hidden md:flex flex-col items-center relative text-gray-400 hover:text-white transition-colors"
                :class="{'text-tiger-500 hover:text-tiger-400': repeatMode !== 'off'}"
                :title="repeatMode === 'off' ? 'Repetir' : repeatMode === 'all' ? 'Repetir todo' : 'Repetir una'"
              >
                <IconRepeat :size="18" :mode="repeatMode" />
                <span v-if="repeatMode !== 'off'" class="absolute -bottom-2 w-1 h-1 bg-tiger-500 rounded-full"></span>
              </button>
            </div>

            <!-- Barra de progreso -->
            <div class="hidden md:flex items-center gap-2 w-full">
              <span class="text-[11px] text-gray-400 min-w-[35px] text-right">
                {{ formatTime(currentTime) }}
              </span>
              <div class="relative flex-1 group h-3 flex items-center">
                <div class="h-1 w-full bg-gray-600 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-white group-hover:bg-tiger-500 transition-colors"
                    :style="{ width: progressPercentage + '%' }"
                  ></div>
                </div>
                <input
                  type="range"
                  :value="currentTime"
                  :max="duration || 0"
                  @input="handleSeek"
                  class="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <span class="text-[11px] text-gray-400 min-w-[35px]">
                {{ formatTime(duration) }}
              </span>
            </div>
          </div>

          <!-- Controles de volumen y extras (derecha) -->
          <div class="hidden md:flex items-center gap-3 justify-end w-[30%]">
            <!-- Botón Letra (icono micrófono estilo Spotify) -->
            <button
              v-if="currentSong.lyrics"
              @click="goToLyrics"
              class="flex flex-col items-center relative text-gray-400 hover:text-white transition-colors"
              :class="{'text-tiger-500 hover:text-tiger-400': isLyricsPage}"
              title="Ver letra"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.426 2.574a2.831 2.831 0 0 0-4.797 1.55l3.247 3.247a2.831 2.831 0 0 0 1.55-4.797zM10.5 8.118l-2.619-2.62A63303.13 63303.13 0 0 0 4.74 9.075L2.065 12.12a1.287 1.287 0 0 0 1.816 1.816l3.06-2.688 3.56-3.129zM7.12 4.094a4.331 4.331 0 1 1 4.786 4.786l-3.974 3.493-3.06 2.689a2.787 2.787 0 0 1-3.933-3.933l2.676-3.045 3.505-3.99z"/>
              </svg>
              <span v-if="isLyricsPage" class="absolute -bottom-2 w-1 h-1 bg-tiger-500 rounded-full"></span>
            </button>
            <!-- Botón Cola (icono estilo Spotify) -->
            <button
              @click="toggleQueue"
              class="flex flex-col items-center relative text-gray-400 hover:text-white transition-colors"
              :class="{'text-tiger-500 hover:text-tiger-400': showQueue}"
              title="Ver cola de reproducción"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-14-7A2.5 2.5 0 0 1 3.5 1H11v1.5H3.5a1 1 0 1 0 0 2H11V6H3.5A2.5 2.5 0 0 1 1 3.5z"/>
              </svg>
              <span v-if="showQueue" class="absolute -bottom-2 w-1 h-1 bg-tiger-500 rounded-full"></span>
            </button>
            <!-- Volumen -->
            <div class="flex items-center gap-2 group">
              <button
                @click="toggleMute"
                class="text-gray-400 hover:text-white transition-colors"
              >
                <IconVolume :size="18" :level="volumeLevel" />
              </button>
              <div class="relative w-24 h-3 flex items-center">
                <div class="h-1 w-full bg-gray-600 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-white group-hover:bg-tiger-500 transition-colors"
                    :style="{ width: (volume * 100) + '%' }"
                  ></div>
                </div>
                <input
                  type="range"
                  :value="volume"
                  min="0"
                  max="1"
                  step="0.01"
                  @input="handleVolumeChange"
                  class="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <!-- Botón menú móvil -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden text-secondary hover:text-white transition-colors p-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>

        <!-- Barra de progreso móvil -->
        <div class="md:hidden mt-3">
          <div class="relative group">
            <div class="h-1 bg-dark-card rounded-full overflow-hidden">
              <div 
                class="h-full bg-white transition-all"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <input
              type="range"
              :value="currentTime"
              :max="duration || 0"
              @input="handleSeek"
              class="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <div class="flex justify-between text-xs text-secondary font-medium mt-1.5 px-0.5">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- Menú móvil -->
        <transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 max-h-0"
          leave-to-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-40"
          leave-from-class="opacity-100 max-h-40"
        >
          <div v-if="showMobileMenu" class="md:hidden mt-4 pt-4 border-t border-dark-card">
            <div class="flex items-center justify-around mb-3">
              <button
                @click="toggleShuffle"
                class="flex flex-col items-center gap-1 p-2 text-secondary hover:text-white transition-all"
                :class="{'text-tiger-500': isShuffled}"
              >
                <IconShuffle :size="22" />
                <span class="text-[10px] font-medium">Aleatorio</span>
              </button>
              <button
                @click="toggleRepeat"
                class="flex flex-col items-center gap-1 p-2 text-secondary hover:text-white transition-all"
                :class="{'text-tiger-500': repeatMode !== 'off'}"
              >
                <IconRepeat :size="22" :mode="repeatMode" />
                <span class="text-[10px] font-medium">Repetir</span>
              </button>
              <button
                @click="showAddToPlaylistModal = true"
                class="flex flex-col items-center gap-1 p-2 text-secondary hover:text-white transition-all"
              >
                <IconPlus :size="22" />
                <span class="text-[10px] font-medium">Añadir</span>
              </button>
              <button
                @click="toggleFavoriteSong(currentSong.id)"
                class="flex flex-col items-center gap-1 p-2 text-secondary hover:text-white transition-all"
                :class="{'text-tiger-500': isFavoriteSong(currentSong.id)}"
              >
                <IconHeart :size="22" :filled="isFavoriteSong(currentSong.id)" />
                <span class="text-[10px] font-medium">Me gusta</span>
              </button>
              <button
                v-if="currentSong.lyrics"
                @click="toggleLyrics"
                class="flex flex-col items-center gap-1 p-2 text-secondary hover:text-white transition-all"
                :class="{'text-tiger-500': showLyrics}"
              >
                <span class="text-xl">🎵</span>
                <span class="text-[10px] font-medium">Letras</span>
              </button>
              <button
                @click="toggleNowPlaying"
                class="flex flex-col items-center gap-1 p-2 text-secondary hover:text-white transition-all"
                :class="{'text-tiger-500': showNowPlaying}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="18" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                </svg>
                <span class="text-[10px] font-medium">Info</span>
              </button>
            </div>
          </div>
        </transition>

    </div>

    <!-- Add to Playlist Modal -->
    <AddToPlaylistModal
      v-if="currentSong"
      :isOpen="showAddToPlaylistModal"
      :songId="currentSong.id"
      :songTitle="currentSong.title"
      @close="showAddToPlaylistModal = false"
      @createNew="handleCreateNewPlaylist"
    />

    <!-- Fullscreen Player (móvil) -->
    <FullscreenPlayer
      :isOpen="showFullscreenPlayer"
      @close="showFullscreenPlayer = false"
    />
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const {
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffled,
  repeatMode,
  showQueue,
  togglePlay,
  previousSong,
  nextSong,
  seek,
  setVolume,
  toggleMute,
  toggleShuffle,
  toggleRepeat,
  toggleQueue,
  formatTime
} = usePlayer()

const { toggleFavoriteSong, isFavoriteSong } = useFavorites()
const showMobileMenu = ref(false)

// Detectar si estamos en la página de letras
const isLyricsPage = computed(() => route.path === '/lyrics')

// Navegar a la página de letras o volver si ya estamos ahí
const goToLyrics = () => {
  if (isLyricsPage.value) {
    router.back()
  } else {
    router.push('/lyrics')
  }
}
const showAddToPlaylistModal = ref(false)
const showFullscreenPlayer = ref(false)

// Detectar si es móvil
const isMobile = ref(false)
onMounted(() => {
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
})

const openFullscreen = () => {
  if (isMobile.value) {
    showFullscreenPlayer.value = true
  }
}

const handleCreateNewPlaylist = () => {
  // TODO: Implement create playlist modal
  console.log('Create playlist')
}

const volumeLevel = computed(() => {
  if (isMuted.value || volume.value === 0) return 'mute'
  if (volume.value < 0.3) return 'low'
  if (volume.value < 0.7) return 'medium'
  return 'high'
})

const progressPercentage = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const handleSeek = (e: Event) => {
  const target = e.target as HTMLInputElement
  seek(parseFloat(target.value))
}

const handleVolumeChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  setVolume(parseFloat(target.value))
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

// Cerrar menú móvil cuando cambia la canción
watch(currentSong, () => {
  showMobileMenu.value = false
})
</script>
