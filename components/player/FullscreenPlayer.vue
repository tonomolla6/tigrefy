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
          <img
            v-if="currentSong.cover"
            :src="currentSong.cover"
            class="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-110"
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

            <button
              @click="showQueueSheet = true"
              class="p-1.5 text-white/70 hover:text-white transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          <!-- Portada grande -->
          <div class="flex-1 flex items-center justify-center px-8 py-4">
            <div
              class="w-full max-w-[320px] aspect-square transition-all duration-300 delay-50"
              :class="isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
            >
              <img
                v-if="currentSong.cover"
                :src="currentSong.cover"
                :alt="currentSong.title"
                class="w-full h-full object-cover rounded-lg shadow-2xl"
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
                <h2 class="text-2xl font-bold text-white truncate">{{ currentSong.title }}</h2>
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
                class="p-3 transition-colors"
                :class="isShuffled ? 'text-tiger-500' : 'text-white/60 hover:text-white'"
              >
                <IconShuffle :size="24" />
              </button>

              <button
                @click="previousSong"
                class="p-3 text-white hover:scale-105 transition-transform"
              >
                <IconSkipBack :size="32" />
              </button>

              <button
                @click="togglePlay"
                class="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                <IconPlay v-if="!isPlaying" :size="32" class="text-black ml-1" />
                <IconPause v-else :size="32" class="text-black" />
              </button>

              <button
                @click="nextSong"
                class="p-3 text-white hover:scale-105 transition-transform"
              >
                <IconSkipForward :size="32" />
              </button>

              <button
                @click="toggleRepeat"
                class="p-3 transition-colors"
                :class="repeatMode !== 'off' ? 'text-tiger-500' : 'text-white/60 hover:text-white'"
              >
                <IconRepeat :size="24" :mode="repeatMode" />
              </button>
            </div>
          </div>

          <!-- Botones adicionales -->
          <div class="px-8 pb-8 pt-2">
            <div class="flex items-center justify-around">
              <button
                @click="showAddToPlaylistModal = true"
                class="flex flex-col items-center gap-1 p-3 text-white/60 hover:text-white transition-colors"
              >
                <IconPlus :size="22" />
                <span class="text-[10px]">Añadir</span>
              </button>

              <button
                v-if="currentSong.lyrics"
                @click="showLyricsSheet = true"
                class="flex flex-col items-center gap-1 p-3 text-white/60 hover:text-white transition-colors"
              >
                <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span class="text-[10px]">Letra</span>
              </button>

              <button
                @click="showQueueSheet = true"
                class="flex flex-col items-center gap-1 p-3 text-white/60 hover:text-white transition-colors"
              >
                <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span class="text-[10px]">Cola</span>
              </button>

              <NuxtLink
                v-if="currentSong.albumId"
                :to="`/album/${currentSong.albumId}`"
                @click="$emit('close')"
                class="flex flex-col items-center gap-1 p-3 text-white/60 hover:text-white transition-colors"
              >
                <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-[10px]">Álbum</span>
              </NuxtLink>
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
                class="p-2 text-white/70 hover:text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
