<template>
  <div v-if="currentSong" class="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 md:bg-black">
    <!-- Desktop Player - altura 90px con más padding como Spotify -->
    <div class="hidden md:flex items-center justify-between h-[90px] px-4">
      <!-- Info de la canción (izquierda) - min-width 180px, width 30% -->
      <div class="flex items-center gap-3 min-w-[180px] w-[30%]">
        <SecureImage
          v-if="currentSong.cover"
          :src="currentSong.cover"
          :alt="currentSong.title"
          class="w-14 h-14 rounded object-cover flex-shrink-0"
        />
        <div class="flex items-center gap-3 min-w-0">
          <div class="min-w-0">
            <h4 class="text-[15px] font-medium text-white truncate leading-tight">
              <span class="hover:underline cursor-pointer">{{ currentSong.title }}</span>
            </h4>
            <p class="text-[13px] text-[#b3b3b3] truncate leading-tight">
              <NuxtLink
                :to="`/artist/${currentSong.artistId}`"
                class="hover:text-white hover:underline transition-colors"
                @click.stop
              >
                {{ currentSong.artistName }}
              </NuxtLink>
            </p>
          </div>
          <Tooltip :text="isFavoriteSong(currentSong.id) ? 'Quitar de Favoritos' : 'Añadir a Favoritos'">
            <button
              @click.stop="toggleFavoriteSong(currentSong.id)"
              :aria-label="isFavoriteSong(currentSong.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'"
              :aria-pressed="isFavoriteSong(currentSong.id)"
              class="text-[#b3b3b3] hover:text-white transition-all flex-shrink-0"
              :class="{'!text-tiger-500 hover:!text-tiger-400': isFavoriteSong(currentSong.id)}"
            >
              <IconHeart :size="16" :filled="isFavoriteSong(currentSong.id)" />
            </button>
          </Tooltip>
        </div>
      </div>

      <!-- Controles centrales - max-width 722px, width 40% -->
      <div class="flex flex-col items-center justify-center gap-2 max-w-[722px] w-[40%]">
        <!-- Botones de control -->
        <div class="flex items-center gap-5">
          <Tooltip :text="isShuffled ? 'Desactivar reproducción aleatoria' : 'Activar reproducción aleatoria'">
            <button
              @click="toggleShuffle"
              :aria-label="isShuffled ? 'Desactivar reproducción aleatoria' : 'Activar reproducción aleatoria'"
              :aria-pressed="isShuffled"
              class="flex items-center justify-center w-8 h-8 text-[#b3b3b3] hover:text-white transition-colors relative"
              :class="{'!text-tiger-500 hover:!text-tiger-400': isShuffled}"
            >
              <IconShuffle :size="20" />
              <span v-if="isShuffled" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-tiger-500 rounded-full"></span>
            </button>
          </Tooltip>
          <Tooltip text="Anterior">
            <button
              @click="previousSong"
              aria-label="Anterior"
              class="flex items-center justify-center w-8 h-8 text-[#b3b3b3] hover:text-white transition-colors"
            >
              <IconSkipBack :size="24" />
            </button>
          </Tooltip>
          <Tooltip :text="isPlaying ? 'Pausar' : 'Reproducir'">
            <button
              @click="togglePlay"
              :aria-label="isPlaying ? 'Pausar' : 'Reproducir'"
              class="flex items-center justify-center w-8 h-8 bg-white hover:scale-105 hover:bg-white text-black rounded-full transition-transform"
            >
              <IconPlay v-if="!isPlaying" :size="26"/>
              <IconPause v-else :size="22" />
            </button>
          </Tooltip>
          <Tooltip text="Siguiente">
            <button
              @click="nextSong"
              aria-label="Siguiente"
              class="flex items-center justify-center w-8 h-8 text-[#b3b3b3] hover:text-white transition-colors"
            >
              <IconSkipForward :size="24" />
            </button>
          </Tooltip>
          <Tooltip :text="repeatTooltip">
            <button
              @click="toggleRepeat"
              :aria-label="repeatTooltip"
              class="flex items-center justify-center w-8 h-8 text-[#b3b3b3] hover:text-white transition-colors relative"
              :class="{'!text-tiger-500 hover:!text-tiger-400': repeatMode !== 'off'}"
            >
              <IconRepeat :size="20" :mode="repeatMode" />
              <span v-if="repeatMode !== 'off'" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-tiger-500 rounded-full"></span>
            </button>
          </Tooltip>
        </div>

        <!-- Barra de progreso -->
        <div class="flex items-center gap-2 w-full">
          <span class="text-[11px] font-medium text-[#b3b3b3] min-w-[40px] text-right tabular-nums">
            {{ formatTime(currentTime) }}
          </span>
          <div class="relative flex-1 group h-3 flex items-center">
            <div class="h-1 w-full bg-[#4d4d4d] rounded-full overflow-hidden">
              <div
                class="h-full bg-white group-hover:bg-tiger-500 transition-colors"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <!-- Thumb indicator -->
            <div
              class="absolute w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              :style="{ left: `calc(${progressPercentage}% - 6px)` }"
            ></div>
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
          <span class="text-[11px] font-medium text-[#b3b3b3] min-w-[40px] tabular-nums">
            {{ formatTime(duration) }}
          </span>
        </div>
      </div>

      <!-- Controles de volumen y extras (derecha) - min-width 180px, width 30% -->
      <div class="flex items-center gap-2 justify-end min-w-[180px] w-[30%]">
        <!-- Botón Letra -->
        <Tooltip :text="isLyricsPage ? 'Ocultar letra' : 'Ver letra'">
          <button
            v-if="currentSong.lyrics"
            @click="goToLyrics"
            :aria-label="isLyricsPage ? 'Ocultar letra' : 'Ver letra'"
            :aria-pressed="isLyricsPage"
            class="flex items-center justify-center w-8 h-8 text-[#b3b3b3] hover:text-white transition-colors relative"
            :class="{'!text-tiger-500 hover:!text-tiger-400': isLyricsPage}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.426 2.574a2.831 2.831 0 0 0-4.797 1.55l3.247 3.247a2.831 2.831 0 0 0 1.55-4.797zM10.5 8.118l-2.619-2.62A63303.13 63303.13 0 0 0 4.74 9.075L2.065 12.12a1.287 1.287 0 0 0 1.816 1.816l3.06-2.688 3.56-3.129zM7.12 4.094a4.331 4.331 0 1 1 4.786 4.786l-3.974 3.493-3.06 2.689a2.787 2.787 0 0 1-3.933-3.933l2.676-3.045 3.505-3.99z"/>
            </svg>
            <span v-if="isLyricsPage" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-tiger-500 rounded-full"></span>
          </button>
        </Tooltip>
        <!-- Botón Cola -->
        <Tooltip :text="showQueue ? 'Ocultar cola' : 'Ver cola'">
          <button
            @click="handleQueueToggle"
            :aria-label="showQueue ? 'Ocultar cola de reproducción' : 'Ver cola de reproducción'"
            :aria-pressed="showQueue"
            class="flex items-center justify-center w-8 h-8 text-[#b3b3b3] hover:text-white transition-colors relative"
            :class="{'!text-tiger-500 hover:!text-tiger-400': showQueue}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-14-7A2.5 2.5 0 0 1 3.5 1H11v1.5H3.5a1 1 0 1 0 0 2H11V6H3.5A2.5 2.5 0 0 1 1 3.5z"/>
            </svg>
            <span v-if="showQueue" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-tiger-500 rounded-full"></span>
          </button>
        </Tooltip>
        <!-- Volumen -->
        <div class="flex items-center gap-2 group/volume">
          <Tooltip :text="isMuted ? 'Activar sonido' : 'Silenciar'">
            <button
              @click="toggleMute"
              :aria-label="isMuted ? 'Activar sonido' : 'Silenciar'"
              :aria-pressed="isMuted"
              class="flex items-center justify-center w-8 h-8 text-[#b3b3b3] hover:text-white transition-colors"
            >
              <IconVolume :size="16" :level="volumeLevel" />
            </button>
          </Tooltip>
          <div class="relative w-[70px] h-3 flex items-center">
            <div class="h-1 w-full bg-[#4d4d4d] rounded-full overflow-hidden">
              <div
                class="h-full bg-white group-hover/volume:bg-tiger-500 transition-colors"
                :style="{ width: (volume * 100) + '%' }"
              ></div>
            </div>
            <!-- Thumb indicator -->
            <div
              class="absolute w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/volume:opacity-100 transition-opacity pointer-events-none"
              :style="{ left: `calc(${volume * 100}% - 6px)` }"
            ></div>
            <input
              type="range"
              :value="volume"
              min="0"
              max="1"
              step="0.01"
              @input="handleVolumeChange"
              aria-label="Volumen"
              :aria-valuetext="`${Math.round(volume * 100)}%`"
              class="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Player - Isla flotante -->
    <div class="md:hidden mx-2 mb-1 rounded-lg bg-[#382820] overflow-hidden">
      <!-- Contenido del reproductor -->
      <div class="flex items-center justify-between px-3 py-1.5">
        <!-- Info de la canción (izquierda) - swipe para cambiar canción -->
        <div
          class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer overflow-hidden"
          @click="handleMobileInfoClick"
          @touchstart.passive="handleSwipeStart"
          @touchmove.passive="handleSwipeMove"
          @touchend.passive="handleSwipeEnd"
        >
          <!-- Portada con animación de cambio -->
          <div class="relative w-11 h-11 flex-shrink-0">
            <SecureImage
              v-if="currentSong.cover"
              :src="currentSong.cover"
              :alt="currentSong.title"
              :class="[
                'w-11 h-11 rounded-md object-cover transition-all duration-200',
                isChangingSong ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
              ]"
            />
          </div>
          <!-- Texto con swipe - contenedor con clip -->
          <div class="min-w-0 flex-1 overflow-hidden">
            <div
              :style="{
                transform: `translateX(${swipeOffset * 0.8}px)`,
                opacity: Math.max(0, 1 - Math.abs(swipeOffset) / 100),
                transition: isDragging ? 'none' : 'all 0.2s ease-out'
              }"
            >
              <!-- Título con marquee si es largo -->
              <div class="overflow-hidden">
                <h4
                  ref="titleRef"
                  class="text-[14px] font-semibold text-white leading-tight whitespace-nowrap"
                  :class="shouldMarquee ? 'animate-marquee' : ''"
                  :style="shouldMarquee ? `--marquee-duration: ${marqueeDuration}s` : ''"
                >
                  <span class="inline-block">{{ currentSong.title }}</span><span v-if="shouldMarquee" class="inline-block w-16"></span><span v-if="shouldMarquee" class="inline-block">{{ currentSong.title }}</span><span v-if="shouldMarquee" class="inline-block w-16"></span>
                </h4>
              </div>
              <p class="text-[12px] text-white/70 truncate leading-tight">
                {{ currentSong.artistName }}
              </p>
            </div>
          </div>
        </div>

        <!-- Controles compactos (derecha) -->
        <div class="flex items-center gap-2">
          <!-- Botón Play/Pause -->
          <button
            @click.stop="togglePlay"
            :aria-label="isPlaying ? 'Pausar' : 'Reproducir'"
            class="p-1 text-white"
          >
            <IconPlay v-if="!isPlaying" :size="38" />
            <IconPause v-else :size="38" />
          </button>
        </div>
      </div>

      <!-- Barra de progreso abajo (no interactiva, abre fullscreen) -->
      <div
        class="h-[3px] bg-white/20 mx-3 rounded-full cursor-pointer"
        @click="openFullscreen"
      >
        <div
          class="h-full bg-white rounded-full transition-all duration-100"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
    </div>

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

// Estado para controlar si el sidebar derecho está compacto
const rightSidebarCompact = useState('rightSidebarCompact', () => false)

// Función para manejar el toggle de la cola
const handleQueueToggle = () => {
  // Si el sidebar está compacto, expandirlo y activar la cola
  if (rightSidebarCompact.value) {
    rightSidebarCompact.value = false
    if (!showQueue.value) {
      toggleQueue()
    }
  } else {
    // Si el sidebar está expandido, solo alternar la cola
    toggleQueue()
  }
}

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
const showFullscreenPlayer = ref(false)

// Detectar si es móvil
const isMobile = ref(false)

// Marquee para títulos largos
const titleRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const titleWidth = ref(0)
const shouldMarquee = ref(false)

const marqueeDuration = computed(() => {
  // Velocidad: ~25px por segundo para un scroll más lento y suave
  // El texto + espacio se desplaza titleWidth + 64px (w-16 = 4rem = 64px)
  const scrollDistance = titleWidth.value + 64
  return Math.max(8, scrollDistance / 25)
})

const checkMarquee = () => {
  if (!titleRef.value || !currentSong.value) {
    shouldMarquee.value = false
    return
  }

  // Primero desactivar marquee para medir el texto sin duplicar
  shouldMarquee.value = false

  nextTick(() => {
    const container = titleRef.value?.parentElement
    if (container && titleRef.value) {
      containerWidth.value = container.offsetWidth
      // Medir el texto original (primer span)
      const firstSpan = titleRef.value.querySelector('span')
      titleWidth.value = firstSpan ? firstSpan.offsetWidth : 0
      shouldMarquee.value = titleWidth.value > containerWidth.value - 10
    }
  })
}

// Revisar marquee cuando cambia la canción
watch(() => currentSong.value?.id, () => {
  shouldMarquee.value = false
  setTimeout(checkMarquee, 100)
})

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
    checkMarquee()
  })
  setTimeout(checkMarquee, 500)
})

const openFullscreen = () => {
  if (isMobile.value) {
    showFullscreenPlayer.value = true
  }
}

// Swipe para cambiar canción en móvil
const swipeStartX = ref(0)
const swipeOffset = ref(0)
const isDragging = ref(false)
const isChangingSong = ref(false)
const swipeThreshold = 60 // Distancia mínima para cambiar canción

const handleSwipeStart = (e: TouchEvent) => {
  swipeStartX.value = e.touches[0].clientX
  isDragging.value = true
}

const handleSwipeMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  const diff = e.touches[0].clientX - swipeStartX.value
  // Limitar el offset para que no se desplace demasiado
  swipeOffset.value = Math.max(-120, Math.min(120, diff))
}

const handleSwipeEnd = () => {
  isDragging.value = false

  if (Math.abs(swipeOffset.value) > swipeThreshold) {
    // Activar animación de cambio
    isChangingSong.value = true
    const direction = swipeOffset.value > 0 ? 1 : -1

    // Desvanecer el texto
    swipeOffset.value = direction * 100

    setTimeout(() => {
      // Cambiar canción
      if (direction > 0) {
        previousSong()
      } else {
        nextSong()
      }

      // Reset inmediato y mostrar nuevo contenido
      swipeOffset.value = 0
      isChangingSong.value = false
    }, 150)
  } else {
    swipeOffset.value = 0
  }
}

// Click en info del móvil (solo si no fue swipe)
const handleMobileInfoClick = () => {
  // Solo abrir fullscreen si no hubo swipe significativo
  if (Math.abs(swipeOffset.value) < 10 && !isChangingSong.value) {
    openFullscreen()
  }
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


// Tooltip para el botón de repetir
const repeatTooltip = computed(() => {
  switch (repeatMode.value) {
    case 'off':
      return 'Activar repetición'
    case 'all':
      return 'Activar repetición de una canción'
    case 'one':
      return 'Desactivar repetición'
    default:
      return 'Repetir'
  }
})
</script>

<style scoped>
/* Animación marquee para títulos largos */
@keyframes marquee {
  0%, 15% {
    transform: translateX(0);
  }
  85%, 100% {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  display: inline-flex;
  animation: marquee var(--marquee-duration, 8s) linear infinite;
  will-change: transform;
}
</style>
