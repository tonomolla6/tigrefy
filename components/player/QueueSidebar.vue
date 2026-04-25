<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="w-0 opacity-0"
    leave-to-class="w-0 opacity-0"
    :enter-to-class="`opacity-100`"
    :leave-from-class="`opacity-100`"
  >
    <!-- Mostrar si hay canción reproduciéndose -->
    <aside
      v-if="currentSong"
      class="hidden md:flex flex-col bg-dark rounded-lg m-2 mt-0 ml-0 mb-0 overflow-hidden flex-shrink-0 relative transition-all duration-300 group/sidebar"
      :style="{ width: isCompact ? '52px' : `${rightSidebarWidth}px` }"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <!-- MODO COMPACTO -->
      <template v-if="isCompact">
        <div
          @click="expandSidebar"
          class="flex flex-col items-center justify-center h-full cursor-pointer"
        >
          <!-- Flecha para expandir con animación de hover -->
          <div
            class="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300 ease-out"
            :class="isHovering ? 'opacity-100 scale-100' : 'opacity-40 scale-90'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </div>
      </template>

      <!-- MODO EXPANDIDO -->
      <template v-else>
        <!-- Resize handle (left edge) -->
        <div
          class="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-white/20 transition-colors z-10"
          @mousedown="startResize"
        ></div>

        <!-- MODO COLA: Cuando showQueue está activo (con animación slide-up) -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 translate-y-4"
          leave-to-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-from-class="opacity-100 translate-y-0"
        >
          <div v-if="showQueue" class="absolute inset-0 flex flex-col bg-dark z-20 overflow-hidden">
            <!-- Header Cola -->
            <div class="flex items-center justify-between px-4 py-4">
              <h3 class="text-base font-bold text-white">Cola</h3>
              <Tooltip text="Cerrar">
                <button
                  @click="toggleQueue"
                  class="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Tooltip>
            </div>

            <!-- Contenido Cola -->
            <CustomScrollbar class="flex-1 min-h-0 px-2">
              <!-- Sonando ahora -->
              <div class="mb-6 px-2">
                <p class="text-base font-bold text-white mb-2">Sonando</p>
                <div class="-mx-2">
                  <transition
                    enter-active-class="transition-all duration-300 ease-out"
                    leave-active-class="transition-all duration-200 ease-in"
                    enter-from-class="opacity-0 -translate-y-3"
                    leave-to-class="opacity-0 translate-y-3"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-from-class="opacity-100 translate-y-0"
                    mode="out-in"
                  >
                    <div
                      :key="currentSong.id"
                      class="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors group"
                    >
                    <div class="relative flex-shrink-0">
                      <SecureImage
                        :src="currentSong.cover"
                        :alt="currentSong.title"
                        class="w-12 h-12 rounded"
                      />
                      <button
                        @click="togglePlay"
                        class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                      >
                        <IconPause v-if="isPlaying" :size="24" class="text-white" />
                        <IconPlay v-else :size="24" class="text-white ml-0.5" />
                      </button>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-tiger-500 font-medium text-[15px] truncate">{{ currentSong.title }}</p>
                      <NuxtLink
                        v-if="currentSong.artistId"
                        :to="`/artist/${currentSong.artistId}`"
                        @click.stop
                        class="text-gray-400 text-[13px] truncate hover:text-white hover:underline transition-colors inline-block max-w-full"
                      >
                        {{ currentSong.artistName }}
                      </NuxtLink>
                      <p v-else class="text-gray-400 text-[13px] truncate">{{ currentSong.artistName }}</p>
                    </div>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- Siguiente en la cola -->
              <div v-if="upcomingSongs.length > 0" class="px-2">
                <p class="text-base font-bold text-white mb-2">
                  Siguiente de: {{ contextLabel }}
                </p>
                <transition-group
                  tag="div"
                  class="space-y-0.5 -mx-2"
                  enter-active-class="transition-all duration-300 ease-out"
                  leave-active-class="transition-all duration-200 ease-in absolute w-full"
                  enter-from-class="opacity-0 -translate-y-3"
                  leave-to-class="opacity-0 -translate-y-6"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-from-class="opacity-100 translate-y-0"
                  move-class="transition-transform duration-300 ease-out"
                >
                  <div
                    v-for="(song, index) in upcomingSongs"
                    :key="song.id"
                    @click="playFromQueue(index)"
                    class="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <div class="relative flex-shrink-0">
                      <SecureImage
                        :src="song.cover"
                        :alt="song.title"
                        class="w-12 h-12 rounded"
                      />
                      <div
                        class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                      >
                        <IconPlay :size="24" class="text-white ml-0.5" />
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-white font-medium text-[15px] truncate">{{ song.title }}</p>
                      <NuxtLink
                        v-if="song.artistId"
                        :to="`/artist/${song.artistId}`"
                        @click.stop
                        class="text-gray-400 text-[13px] truncate hover:text-white hover:underline transition-colors inline-block max-w-full"
                      >
                        {{ song.artistName }}
                      </NuxtLink>
                      <p v-else class="text-gray-400 text-[13px] truncate">{{ song.artistName }}</p>
                    </div>
                  </div>
                </transition-group>
              </div>
            </CustomScrollbar>
          </div>
        </transition>

        <!-- MODO INFO: Siempre visible debajo de la cola -->
        <div class="flex flex-col h-full overflow-hidden">
          <!-- Header Info con botón de compactar a la izquierda -->
          <div class="flex items-center px-4 py-4">
            <!-- Contenedor del botón + título con animación -->
            <div class="flex items-center relative flex-1 min-w-0">
              <!-- Botón toggle (aparece desde la izquierda al hacer hover) -->
              <Tooltip text="Compactar">
                <button
                  @click="compactSidebar"
                  class="absolute -left-1 p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300 ease-out"
                  :class="isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Tooltip>
              <!-- Título (se mueve a la derecha al hacer hover) -->
              <h3
                class="text-base font-bold text-white truncate whitespace-nowrap transition-all duration-300 ease-out"
                :class="isHovering ? 'translate-x-9' : 'translate-x-0'"
              >{{ contextLabelForInfo }}</h3>
            </div>
          </div>

          <!-- Contenido Info -->
          <CustomScrollbar class="flex-1 min-h-0 px-2">
            <!-- Card: Imagen grande + Info de la canción actual -->
            <div class="bg-[#1a1a1a] rounded-lg p-3 mx-2 mb-4">
              <SecureImage
                :src="currentSong.cover"
                :alt="currentSong.title"
                class="w-full aspect-square rounded-lg shadow-xl mb-4"
              />

              <!-- Info de la canción -->
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

            <!-- Card: Info del artista -->
            <div v-if="currentSongArtist" class="bg-[#1a1a1a] rounded-lg p-3 mx-2 mb-4">
              <p class="text-[11px] text-white/50 uppercase tracking-wider mb-3 font-bold">Información sobre el artista</p>
              <NuxtLink
                :to="`/artist/${currentSongArtist.id}`"
                class="block rounded-lg overflow-hidden hover:brightness-110 transition-all"
              >
                <div class="relative">
                  <SecureImage
                    :src="currentSongArtist.image"
                    :alt="currentSongArtist.name"
                    class="w-full h-40 rounded-lg"
                  />
                  <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                    <p class="text-white font-bold">{{ currentSongArtist.name }}</p>
                    <p v-if="currentSongArtist.followers" class="text-white/60 text-sm">
                      {{ formatFollowers(currentSongArtist.followers) }} seguidores
                    </p>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <!-- Card: A continuación en la cola -->
            <div v-if="nextSong" class="bg-[#1a1a1a] rounded-lg p-3 mx-2 mb-4">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-semibold text-white">A continuación en la cola</p>
                <button
                  @click="toggleQueue"
                  class="text-xs font-semibold text-white/70 hover:text-white transition-colors"
                >
                  Abrir cola
                </button>
              </div>
              <div
                @click="playFromQueue(0)"
                class="flex items-center gap-3 cursor-pointer group"
              >
                <SecureImage
                  :src="nextSong.cover"
                  :alt="nextSong.title"
                  class="w-12 h-12 rounded"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-white text-sm truncate group-hover:underline">{{ nextSong.title }}</p>
                  <p class="text-white/60 text-xs truncate">{{ nextSong.artistName }}</p>
                </div>
              </div>
            </div>
          </CustomScrollbar>
        </div>
      </template>
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
  togglePlay,
  playSong,
  formatTime
} = usePlayer()

const { data, getArtistById } = useData()

const { rightSidebarWidth, resizeRightSidebar, saveRightSidebarWidth } = useSidebarResize()

// Estado para modo compacto del sidebar derecho
const isCompact = useState('rightSidebarCompact', () => false)

// Estado para hover
const isHovering = ref(false)

// Compactar el sidebar
const compactSidebar = () => {
  isCompact.value = true
}

// Expandir el sidebar
const expandSidebar = () => {
  isCompact.value = false
}

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
  // Guardar el ancho al terminar el drag
  saveRightSidebarWidth()
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

// Siguiente canción en la cola (para el widget)
const nextSong = computed(() => {
  if (!queue.value || currentIndex.value === undefined) return null
  const nextIndex = currentIndex.value + 1
  if (nextIndex < queue.value.length) {
    return queue.value[nextIndex]
  }
  return null
})

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
  if (ctx.type === 'search') return 'Búsqueda'
  return 'Tu biblioteca'
})

// Label para el modo info (título del header)
const contextLabelForInfo = computed(() => {
  const ctx = playbackContext.value
  if (ctx.type === 'liked-songs') return 'Canciones que te gustan'
  if (ctx.type === 'album' && ctx.id) {
    const album = data.value?.albums?.find((a: any) => a.id === ctx.id)
    return album?.title || currentSong.value?.albumName || 'Álbum'
  }
  if (ctx.type === 'playlist' && ctx.id) {
    const playlist = data.value?.playlists?.find((p: any) => p.id === ctx.id)
    return playlist?.name || 'Playlist'
  }
  if (ctx.type === 'artist' && ctx.id) {
    const artist = data.value?.artists?.find((a: any) => a.id === ctx.id)
    return artist?.name || currentSong.value?.artistName || 'Artista'
  }
  return currentSong.value?.artistName || 'Reproduciendo'
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

