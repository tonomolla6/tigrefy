<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="w-0 opacity-0"
    leave-to-class="w-0 opacity-0"
    enter-to-class="w-[380px] opacity-100"
    leave-from-class="w-[380px] opacity-100"
  >
    <aside
      v-if="showQueue"
      class="hidden md:flex flex-col bg-dark rounded-lg m-2 mt-0 ml-0 overflow-hidden flex-shrink-0 w-[380px]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-4">
        <h3 class="text-base font-bold text-white">Cola</h3>
        <button
          @click="toggleQueue"
          class="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenido scrolleable -->
      <div class="flex-1 overflow-y-auto custom-scrollbar px-2">
        <!-- Skeleton cuando no hay canción -->
        <template v-if="!currentSong">
          <!-- Skeleton Sonando -->
          <div class="px-2 pb-4">
            <div class="h-3 w-16 bg-white/10 rounded mb-3 mx-2 animate-pulse"></div>
            <div class="flex items-center gap-3 p-2 rounded-md bg-white/5">
              <div class="w-12 h-12 rounded bg-white/10 animate-pulse"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
                <div class="h-3 w-24 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <!-- Skeleton Siguiente -->
          <div class="px-2 pb-4">
            <div class="h-3 w-40 bg-white/10 rounded mb-3 mx-2 animate-pulse"></div>
            <div class="space-y-2">
              <div v-for="i in 5" :key="i" class="flex items-center gap-3 p-2 rounded-md">
                <div class="w-5 h-4 bg-white/10 rounded animate-pulse"></div>
                <div class="w-10 h-10 rounded bg-white/10 animate-pulse"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-white/10 rounded animate-pulse" :style="{ width: `${60 + Math.random() * 40}%` }"></div>
                  <div class="h-3 w-20 bg-white/10 rounded animate-pulse"></div>
                </div>
                <div class="h-3 w-8 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </template>

        <!-- Contenido real cuando hay canción -->
        <template v-else>
          <!-- Reproduciendo ahora -->
          <div class="px-2 pb-4">
            <p class="text-[11px] text-white/50 uppercase tracking-wider mb-2 font-bold px-2">Sonando</p>
            <div class="flex items-center gap-3 p-2 rounded-md bg-white/5">
              <img
                :src="currentSong.cover || '/covers/default.png'"
                :alt="currentSong.title"
                class="w-12 h-12 rounded object-cover"
              />
              <div class="min-w-0 flex-1">
                <p class="text-tiger-500 text-sm font-medium truncate">{{ currentSong.title }}</p>
                <p class="text-white/60 text-xs truncate">{{ currentSong.artistName }}</p>
              </div>
              <!-- Playing indicator -->
              <div v-if="isPlaying" class="flex items-end gap-[3px] h-3 mr-1">
                <span class="w-[3px] bg-tiger-500 rounded-sm animate-eq1"></span>
                <span class="w-[3px] bg-tiger-500 rounded-sm animate-eq2"></span>
                <span class="w-[3px] bg-tiger-500 rounded-sm animate-eq3"></span>
              </div>
            </div>
          </div>

          <!-- Siguiente en la cola -->
          <div v-if="upcomingSongs.length > 0" class="px-2 pb-4">
            <p class="text-[11px] text-white/50 uppercase tracking-wider mb-2 font-bold px-2">
              Siguiente de: {{ contextLabel }}
            </p>
            <div class="space-y-0.5">
              <div
                v-for="(song, index) in upcomingSongs"
                :key="`${song.id}-${index}`"
                @click="playFromQueue(index)"
                class="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div class="w-5 flex items-center justify-center">
                  <span class="text-white/40 text-sm group-hover:hidden">{{ index + 1 }}</span>
                  <IconPlay :size="12" class="text-white hidden group-hover:block" />
                </div>
                <img
                  :src="song.cover || '/covers/default.png'"
                  :alt="song.title"
                  class="w-10 h-10 rounded object-cover"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-white text-sm truncate group-hover:text-white transition-colors">{{ song.title }}</p>
                  <p class="text-white/60 text-xs truncate">{{ song.artistName }}</p>
                </div>
                <span class="text-white/40 text-xs">{{ formatTime(song.duration) }}</span>
              </div>
            </div>
          </div>

          <!-- Estado vacío -->
          <div v-else class="flex flex-col items-center justify-center py-12 px-6">
            <svg class="w-12 h-12 text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p class="text-white/50 text-sm text-center">No hay más canciones en la cola</p>
          </div>
        </template>
      </div>
    </aside>
  </transition>
</template>

<script setup lang="ts">
const {
  currentSong,
  isPlaying,
  queue,
  currentIndex,
  playbackContext,
  showQueue,
  toggleQueue,
  playSong,
  formatTime
} = usePlayer()

const { data } = useData()

const upcomingSongs = computed(() => {
  if (!queue.value || currentIndex.value === undefined) return []
  return queue.value.slice(currentIndex.value + 1)
})

const contextLabel = computed(() => {
  const ctx = playbackContext.value
  if (ctx.type === 'liked-songs') return 'CANCIONES QUE TE GUSTAN'
  if (ctx.type === 'album' && ctx.id) {
    const album = data.value?.albums?.find((a: any) => a.id === ctx.id)
    return album?.title?.toUpperCase() || 'ÁLBUM'
  }
  if (ctx.type === 'playlist' && ctx.id) {
    const playlist = data.value?.playlists?.find((p: any) => p.id === ctx.id)
    return playlist?.name?.toUpperCase() || 'PLAYLIST'
  }
  if (ctx.type === 'artist' && ctx.id) {
    const artist = data.value?.artists?.find((a: any) => a.id === ctx.id)
    return artist?.name?.toUpperCase() || 'ARTISTA'
  }
  if (ctx.type === 'search') return 'BÚSQUEDA'
  return 'TU BIBLIOTECA'
})

const playFromQueue = (relativeIndex: number) => {
  const absoluteIndex = currentIndex.value + 1 + relativeIndex
  if (absoluteIndex >= 0 && absoluteIndex < queue.value.length) {
    playSong(queue.value[absoluteIndex], queue.value, playbackContext.value)
  }
}
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 12px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  border: 3px solid transparent;
  background-clip: padding-box;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
  border: 3px solid transparent;
  background-clip: padding-box;
}

.custom-scrollbar::-webkit-scrollbar-button {
  display: none;
}

@keyframes eq1 {
  0%, 100% { height: 4px; }
  50% { height: 12px; }
}

@keyframes eq2 {
  0%, 100% { height: 8px; }
  50% { height: 4px; }
}

@keyframes eq3 {
  0%, 100% { height: 6px; }
  50% { height: 12px; }
}

.animate-eq1 {
  animation: eq1 0.5s ease-in-out infinite;
}

.animate-eq2 {
  animation: eq2 0.5s ease-in-out infinite;
  animation-delay: 0.1s;
}

.animate-eq3 {
  animation: eq3 0.5s ease-in-out infinite;
  animation-delay: 0.2s;
}
</style>
