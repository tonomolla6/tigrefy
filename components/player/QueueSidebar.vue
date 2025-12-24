<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="w-0 opacity-0"
    leave-to-class="w-0 opacity-0"
    :enter-to-class="`opacity-100`"
    :leave-from-class="`opacity-100`"
  >
    <!-- Solo mostrar si hay canción reproduciéndose Y showQueue está activo -->
    <aside
      v-if="showQueue && currentSong"
      class="hidden md:flex flex-col bg-dark rounded-lg m-2 mt-0 ml-0 overflow-hidden flex-shrink-0 relative"
      :style="{ width: `${rightSidebarWidth}px` }"
    >
      <!-- Resize handle (left edge) -->
      <div
        class="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-white/20 transition-colors z-10"
        @mousedown="startResize"
      ></div>
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-4">
        <h3 class="text-base font-bold text-white">{{ currentSongArtist?.name || currentSong.artistName }}</h3>
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
        <!-- Imagen grande de la canción actual -->
        <div class="px-2 pb-4">
          <img
            :src="currentSong.cover || '/covers/default.png'"
            :alt="currentSong.title"
            class="w-full aspect-square rounded-lg object-cover shadow-xl"
          />
        </div>

        <!-- Info de la canción -->
        <div class="px-4 pb-4">
          <div class="flex items-center justify-between">
            <div class="min-w-0 flex-1">
              <h2 class="text-xl font-bold text-white truncate">{{ currentSong.title }}</h2>
              <NuxtLink
                v-if="currentSong.artistId"
                :to="`/artist/${currentSong.artistId}`"
                class="text-white/60 text-sm hover:text-white hover:underline transition-colors"
              >
                {{ currentSong.artistName }}
              </NuxtLink>
              <p v-else class="text-white/60 text-sm">{{ currentSong.artistName }}</p>
            </div>
            <!-- Icono de check verde como Spotify -->
            <div class="w-6 h-6 bg-tiger-500 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
              <svg class="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Info del artista -->
        <div v-if="currentSongArtist" class="px-2 pb-4">
          <NuxtLink
            :to="`/artist/${currentSongArtist.id}`"
            class="block rounded-lg overflow-hidden hover:bg-white/5 transition-colors"
          >
            <div class="p-3">
              <p class="text-[11px] text-white/50 uppercase tracking-wider mb-3 font-bold">Información sobre el artista</p>
              <div class="relative">
                <img
                  :src="currentSongArtist.image || '/covers/default-artist.png'"
                  :alt="currentSongArtist.name"
                  class="w-full h-40 object-cover rounded-lg"
                />
                <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                  <p class="text-white font-bold">{{ currentSongArtist.name }}</p>
                  <p v-if="currentSongArtist.followers" class="text-white/60 text-sm">
                    {{ formatFollowers(currentSongArtist.followers) }} seguidores
                  </p>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Siguiente en la cola (si hay) -->
        <div v-if="upcomingSongs.length > 0" class="px-2 pb-4">
          <p class="text-[11px] text-white/50 uppercase tracking-wider mb-2 font-bold px-2">
            Siguiente de: {{ contextLabel }}
          </p>
          <div class="space-y-0.5">
            <div
              v-for="(song, index) in upcomingSongs.slice(0, 5)"
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

const { data, getArtistById } = useData()

const { rightSidebarWidth, resizeRightSidebar } = useSidebarResize()

// Resize handling
const isResizing = ref(false)
const startX = ref(0)

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  startX.value = e.clientX
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const onResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  const delta = e.clientX - startX.value
  startX.value = e.clientX
  resizeRightSidebar(delta)
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Obtener info del artista de la canción actual
const currentSongArtist = computed(() => {
  if (!currentSong.value?.artistId) return null
  return getArtistById(currentSong.value.artistId)
})

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

const formatFollowers = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

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
