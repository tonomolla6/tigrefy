<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-all duration-400 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="translate-y-full opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-full opacity-0 scale-95"
      @enter="onEnter"
      @leave="onLeave"
    >
      <div
        v-if="isOpen && currentSong"
        class="fixed inset-0 z-[100] bg-gradient-to-b from-dark-card to-black flex flex-col"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        :style="{ transform: `translateY(${swipeOffset}px)` }"
      >
        <!-- Background blur de la portada -->
        <div class="absolute inset-0 overflow-hidden">
          <SecureImage
            v-if="currentSong.cover"
            :src="currentSong.cover"
            class="absolute inset-0 w-full h-full blur-3xl opacity-30 scale-110"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
        </div>

        <!-- Contenido -->
        <div class="relative flex flex-col h-full">
          <!-- Header con handle y botón cerrar -->
          <div class="flex items-center justify-between px-3 py-2">
            <!-- Handle para arrastrar -->
            <div class="absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full" />

            <button
              @click="$emit('close')"
              aria-label="Cerrar reproductor"
              class="p-1.5 text-white/70 hover:text-white transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div class="text-center flex-1">
              <p class="text-[10px] text-white/60 uppercase tracking-wider">Reproduciendo desde</p>
              <p class="text-xs text-white font-medium truncate px-3">{{ contextLabel }}</p>
            </div>

          </div>

          <!-- Portada grande -->
          <div class="flex-1 flex items-center justify-center px-8 py-4">
            <div
              class="w-full max-w-[320px] aspect-square transition-all duration-300 delay-50"
              :class="isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
            >
              <SecureImage
                v-if="currentSong.cover"
                :src="currentSong.cover"
                :alt="currentSong.title"
                class="w-full h-full rounded-lg shadow-2xl"
              />
              <div v-else class="w-full h-full bg-dark-hover rounded-lg flex items-center justify-center">
                <svg class="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Info de la canción -->
          <div
            class="px-8 py-4 transition-all duration-300 delay-100"
            :class="isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <NuxtLink
                  v-if="currentSong.albumId"
                  :to="`/album/${currentSong.albumId}`"
                  @click="$emit('close')"
                  class="block"
                >
                  <MarqueeText :text="currentSong.title" class="text-2xl font-bold text-white" />
                </NuxtLink>
                <MarqueeText v-else :text="currentSong.title" class="text-2xl font-bold text-white" />
                <NuxtLink
                  :to="`/artist/${currentSong.artistId}`"
                  @click="$emit('close')"
                  class="text-lg text-white/60 hover:text-white hover:underline truncate mt-1 block transition-colors"
                >
                  {{ currentSong.artistName }}
                </NuxtLink>
              </div>
              <button
                @click="toggleFavoriteSong(currentSong.id)"
                :aria-label="isFavoriteSong(currentSong.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'"
                :aria-pressed="isFavoriteSong(currentSong.id)"
                class="p-2 transition-all"
                :class="isFavoriteSong(currentSong.id) ? 'text-tiger-500' : 'text-white/60 hover:text-white'"
              >
                <IconHeart :size="28" :filled="isFavoriteSong(currentSong.id)" />
              </button>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="px-8 py-2">
            <div class="relative group h-6 flex items-center">
              <div class="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  class="h-full bg-white transition-all"
                  :style="{ width: progressPercentage + '%' }"
                />
              </div>
              <input
                type="range"
                :value="currentTime"
                :max="duration || 0"
                @input="handleSeek"
                aria-label="Progreso de la canción"
                :aria-valuetext="`${formatTime(currentTime)} de ${formatTime(duration)}`"
                class="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <div class="flex justify-between text-xs text-white/60 mt-1">
              <span>{{ formatTime(currentTime) }}</span>
              <span>{{ formatTime(duration) }}</span>
            </div>
          </div>

          <!-- Controles principales -->
          <div
            class="px-8 py-6 transition-all duration-300 delay-150"
            :class="isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
          >
            <div class="flex items-center justify-between">
              <button
                @click="toggleShuffle"
                :aria-label="isShuffled ? 'Desactivar reproducción aleatoria' : 'Activar reproducción aleatoria'"
                :aria-pressed="isShuffled"
                class="p-3 transition-colors"
                :class="isShuffled ? 'text-tiger-500' : 'text-white'"
              >
                <IconShuffle :size="24" />
              </button>

              <button
                @click="previousSong"
                aria-label="Anterior"
                class="p-3 text-white hover:scale-105 transition-transform"
              >
                <IconSkipBack :size="32" />
              </button>

              <button
                @click="togglePlay"
                :aria-label="isPlaying ? 'Pausar' : 'Reproducir'"
                class="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                <IconPlay v-if="!isPlaying" :size="32" class="text-black ml-1" />
                <IconPause v-else :size="32" class="text-black" />
              </button>

              <button
                @click="nextSong"
                aria-label="Siguiente"
                class="p-3 text-white hover:scale-105 transition-transform"
              >
                <IconSkipForward :size="32" />
              </button>

              <button
                @click="toggleRepeat"
                :aria-label="repeatMode === 'off' ? 'Activar repetición' : repeatMode === 'all' ? 'Repetir solo esta canción' : 'Desactivar repetición'"
                class="p-3 transition-colors"
                :class="repeatMode !== 'off' ? 'text-tiger-500' : 'text-white'"
              >
                <IconRepeat :size="24" :mode="repeatMode" />
              </button>
            </div>

            <!-- Botón de cola, esquina inferior derecha -->
            <div class="flex justify-end mt-4">
              <button
                @click="showQueueSheet = true"
                class="p-2 text-white transition-colors"
                aria-label="Cola de reproducción"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

        </div>

        <!-- Queue Sheet -->
        <QueueSheet
          :isOpen="showQueueSheet"
          @close="showQueueSheet = false"
        />

        <!-- Lyrics Sheet -->
        <transition
          enter-active-class="transition-transform duration-300"
          leave-active-class="transition-transform duration-300"
          enter-from-class="translate-y-full"
          leave-to-class="translate-y-full"
        >
          <div
            v-if="showLyricsSheet && currentSong.lyrics"
            class="absolute inset-0 bg-black/95 flex flex-col z-10"
          >
            <div class="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <h3 class="text-lg font-bold text-white">Letra</h3>
              <button
                @click="showLyricsSheet = false"
                aria-label="Cerrar letra"
                class="p-2 text-white/70 hover:text-white"
              >
                <IconClose :size="24" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-6 py-6">
              <p class="text-white/80 text-lg leading-loose whitespace-pre-line">
                {{ currentSong.lyrics }}
              </p>
            </div>
          </div>
        </transition>

        <!-- Add to Playlist Modal -->
        <AddToPlaylistModal
          v-if="currentSong"
          :isOpen="showAddToPlaylistModal"
          :songId="currentSong.id"
          :songTitle="currentSong.title"
          @close="showAddToPlaylistModal = false"
        />
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const {
  currentSong,
  isPlaying,
  currentTime,
  duration,
  isShuffled,
  repeatMode,
  playbackContext,
  togglePlay,
  previousSong,
  nextSong,
  seek,
  toggleShuffle,
  toggleRepeat,
  formatTime
} = usePlayer()

const { toggleFavoriteSong, isFavoriteSong } = useFavorites()
const { data } = useData()

const showQueueSheet = ref(false)
const showLyricsSheet = ref(false)
const showAddToPlaylistModal = ref(false)
const isAnimating = ref(false)

// Animaciones de entrada/salida
const onEnter = () => {
  setTimeout(() => {
    isAnimating.value = true
  }, 50)
}

const onLeave = () => {
  isAnimating.value = false
}

// Swipe down to close
const touchStartY = ref(0)
const swipeOffset = ref(0)
const isDragging = ref(false)

const handleTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY
  isDragging.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  const diff = e.touches[0].clientY - touchStartY.value
  if (diff > 0) {
    swipeOffset.value = diff
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
  if (swipeOffset.value > 150) {
    isAnimating.value = false
    emit('close')
  }
  swipeOffset.value = 0
}

const progressPercentage = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const handleSeek = (e: Event) => {
  const target = e.target as HTMLInputElement
  seek(parseFloat(target.value))
}

const contextLabel = computed(() => {
  const ctx = playbackContext.value
  if (ctx.type === 'liked-songs') return 'Canciones que te gustan'
  if (ctx.type === 'album' && ctx.id) {
    const album = data.value?.albums?.find((a: any) => a.id === ctx.id)
    return album?.title || 'Álbum'
  }
  if (ctx.type === 'playlist' && ctx.id) {
    const playlist = data.value?.playlists?.find((p: any) => p.id === ctx.id)
    return playlist?.name || 'Playlist'
  }
  if (ctx.type === 'artist' && ctx.id) {
    const artist = data.value?.artists?.find((a: any) => a.id === ctx.id)
    return artist?.name || 'Artista'
  }
  if (ctx.type === 'search') return 'Resultados de búsqueda'
  return 'Tigrefy'
})
</script>
