<template>
  <div v-if="currentSong" class="fixed bottom-16 md:bottom-0 left-0 right-0 bg-dark-base border-t border-dark-card z-50 shadow-2xl">
    <div class="px-3 md:px-6 py-3 md:py-4">
      <div class="flex items-center justify-between gap-3 md:gap-6">
        <!-- Info de la canción (izquierda) -->
        <div class="flex items-center gap-3 md:gap-4 flex-1 min-w-0 md:w-[30%]">
            <img
              v-if="currentSong.cover"
              :src="currentSong.cover"
              :alt="currentSong.title"
              class="w-14 h-14 md:w-16 md:h-16 rounded-lg shadow-xl object-cover flex-shrink-0 border border-dark-card"
              @error="handleImageError"
            />
            <div class="flex-1 min-w-0">
              <h4 class="text-sm md:text-base font-bold text-white truncate hover:underline cursor-pointer">
                {{ currentSong.title }}
              </h4>
              <p class="text-xs md:text-sm text-secondary truncate hover:text-white hover:underline cursor-pointer transition-colors">
                {{ currentSong.artistName }}
              </p>
            </div>
            <button
              @click="toggleFavoriteSong(currentSong.id)"
              class="hidden md:block text-secondary hover:text-tiger-500 transition-all flex-shrink-0 hover:scale-110"
            >
              <IconHeart :size="22" :filled="isFavoriteSong(currentSong.id)" :class="{'text-tiger-500': isFavoriteSong(currentSong.id)}" />
            </button>
          </div>

          <!-- Controles centrales -->
          <div class="flex flex-col items-center gap-2 md:gap-3 md:w-[40%]">
            <div class="flex items-center gap-3 md:gap-6">
              <button
                @click="toggleShuffle"
                class="hidden md:block text-secondary hover:text-white transition-all hover:scale-110"
                :class="{'text-tiger-500 hover:text-tiger-400': isShuffled}"
                title="Aleatorio"
              >
                <IconShuffle :size="20" />
              </button>
              <button
                @click="previousSong"
                class="text-secondary hover:text-white transition-all hover:scale-110"
                title="Anterior"
              >
                <IconSkipBack :size="22" class="md:hidden" />
                <IconSkipBack :size="26" class="hidden md:block" />
              </button>
              <button
                @click="togglePlay"
                class="bg-white hover:bg-gray-100 hover:scale-110 text-black rounded-full p-2.5 md:p-3.5 transition-all shadow-2xl"
                :title="isPlaying ? 'Pausar' : 'Reproducir'"
              >
                <template v-if="!isPlaying">
                  <IconPlay :size="22" class="md:hidden" />
                  <IconPlay :size="26" class="hidden md:block" />
                </template>
                <template v-else>
                  <IconPause :size="22" class="md:hidden" />
                  <IconPause :size="26" class="hidden md:block" />
                </template>
              </button>
              <button
                @click="nextSong"
                class="text-secondary hover:text-white transition-all hover:scale-110"
                title="Siguiente"
              >
                <IconSkipForward :size="22" class="md:hidden" />
                <IconSkipForward :size="26" class="hidden md:block" />
              </button>
              <button
                @click="toggleRepeat"
                class="hidden md:block text-secondary hover:text-white transition-all hover:scale-110"
                :class="{'text-tiger-500 hover:text-tiger-400': repeatMode !== 'off'}"
                :title="repeatMode === 'off' ? 'Repetir' : repeatMode === 'all' ? 'Repetir todo' : 'Repetir una'"
              >
                <IconRepeat :size="20" :mode="repeatMode" />
              </button>
            </div>

            <!-- Barra de progreso -->
            <div class="hidden md:flex items-center gap-2 w-full max-w-2xl">
              <span class="text-xs text-secondary font-medium min-w-[40px] text-right">
                {{ formatTime(currentTime) }}
              </span>
              <div class="relative flex-1 group">
                <div class="h-1 bg-dark-card rounded-full overflow-hidden">
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
              <span class="text-xs text-secondary font-medium min-w-[40px]">
                {{ formatTime(duration) }}
              </span>
            </div>
          </div>

          <!-- Controles de volumen y extras (derecha) -->
          <div class="hidden md:flex items-center gap-4 flex-1 justify-end md:w-[30%]">
            <button
              @click="showAddToPlaylistModal = true"
              class="text-secondary hover:text-white transition-all hover:scale-110"
              title="Añadir a playlist"
            >
              <IconPlus :size="22" />
            </button>
            <button
              v-if="currentSong.lyrics"
              @click="toggleLyrics"
              class="text-secondary hover:text-white transition-all text-sm font-semibold whitespace-nowrap hover:scale-105 px-3 py-1.5 rounded-full border border-dark-card hover:border-tiger-500"
              :class="{'text-white border-tiger-500 bg-tiger-500/20': showLyrics}"
            >
              <span class="hidden lg:inline">Letras</span>
              <span class="lg:hidden">🎵</span>
            </button>
            <div class="flex items-center gap-2 group">
              <button
                @click="toggleMute"
                class="text-secondary hover:text-white transition-all hover:scale-110"
              >
                <IconVolume :size="22" :level="volumeLevel" />
              </button>
              <div class="relative w-24 lg:w-32">
                <div class="h-1 bg-dark-card rounded-full overflow-hidden">
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
            <!-- Botón Now Playing Sidebar -->
            <button
              @click="toggleNowPlaying"
              class="text-secondary hover:text-white transition-all hover:scale-110 p-2 rounded-lg"
              :class="{'text-tiger-500 bg-tiger-500/20': showNowPlaying}"
              title="Ver detalles de la canción"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="18" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
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

        <!-- Panel de letras -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="max-h-0 opacity-0"
          leave-to-class="max-h-0 opacity-0"
          enter-to-class="max-h-80 md:max-h-96 opacity-100"
          leave-from-class="max-h-80 md:max-h-96 opacity-100"
        >
          <div v-if="showLyrics && currentSong.lyrics" class="border-t border-dark-card mt-4">
            <div class="px-4 md:px-6 py-4 md:py-6 max-h-80 md:max-h-96 overflow-y-auto custom-scrollbar bg-dark-elevated/50">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-base md:text-xl font-bold text-white flex items-center gap-2">
                    <span class="text-2xl">🎵</span>
                    Letra
                  </h3>
                  <p class="text-xs md:text-sm text-secondary mt-1">{{ currentSong.title }}</p>
                </div>
                <button 
                  @click="toggleLyrics" 
                  class="text-secondary hover:text-white hover:bg-dark-card p-2 rounded-full transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div class="prose prose-invert max-w-none">
                <p class="text-secondary whitespace-pre-line text-sm md:text-base leading-relaxed md:leading-loose">
                  {{ currentSong.lyrics }}
                </p>
              </div>
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
  </div>
</template>

<script setup lang="ts">
const {
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffled,
  repeatMode,
  showLyrics,
  showNowPlaying,
  togglePlay,
  previousSong,
  nextSong,
  seek,
  setVolume,
  toggleMute,
  toggleShuffle,
  toggleRepeat,
  toggleLyrics,
  toggleNowPlaying,
  formatTime
} = usePlayer()

const { toggleFavoriteSong, isFavoriteSong } = useFavorites()
const showMobileMenu = ref(false)
const showAddToPlaylistModal = ref(false)

const handleCreateNewPlaylist = () => {
  // Navigate to library page which has create playlist functionality
  navigateTo('/library')
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
