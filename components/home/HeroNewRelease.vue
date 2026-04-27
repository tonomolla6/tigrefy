<template>
  <!-- Mobile: diseño vertical compacto -->
  <div class="md:hidden">
    <div
      class="relative overflow-hidden rounded-xl"
      :style="`background: linear-gradient(135deg, ${dominantColor}cc 0%, ${dominantColor}44 60%, transparent 100%)`"
    >
      <div class="flex items-center gap-4 p-4">
        <!-- Cover -->
        <div class="flex-shrink-0 w-24 h-24 rounded-lg shadow-lg overflow-hidden bg-dark-lighter relative">
          <div
            v-if="!coverLoadedMobile"
            class="absolute inset-0 bg-white/5 animate-pulse"
          ></div>
          <img
            ref="coverRef"
            :key="`mobile-${resolvedCover}-${corsBlocked}`"
            :src="resolvedCover"
            :alt="song.title"
            :crossorigin="corsBlocked ? null : 'anonymous'"
            class="w-full h-full object-cover transition-opacity duration-300"
            :class="coverLoadedMobile ? 'opacity-100' : 'opacity-0'"
            @load="onLoadMobile"
            @error="onError"
          />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <!-- Badge -->
          <span class="inline-flex items-center gap-1 bg-tiger-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
            NUEVO
          </span>

          <!-- Título -->
          <h2 class="text-lg font-bold leading-tight mb-1 line-clamp-2">
            {{ song.title }}
          </h2>
          <p class="text-sm text-white/70">{{ song.artistName }}</p>
        </div>

        <!-- Play button -->
        <button
          @click.stop="handlePlay"
          class="flex-shrink-0 w-12 h-12 bg-tiger-500 hover:bg-tiger-400 rounded-full
                 flex items-center justify-center shadow-md transition-colors"
        >
          <IconPause v-if="isCurrentlyPlaying" :size="22" class="text-white" />
          <IconPlay v-else :size="22" class="text-white ml-0.5" />
        </button>
      </div>
    </div>
  </div>

  <!-- Desktop: diseño horizontal -->
  <div class="hidden md:block">
    <div
      class="relative overflow-hidden rounded-xl"
      :style="`background: linear-gradient(135deg, ${dominantColor}cc 0%, ${dominantColor}44 60%, transparent 100%)`"
    >
      <div class="flex items-center gap-6 p-6">
        <!-- Cover -->
        <div class="flex-shrink-0 w-48 h-48 rounded-lg shadow-lg overflow-hidden bg-dark-lighter relative">
          <div
            v-if="!coverLoadedDesktop"
            class="absolute inset-0 bg-white/5 animate-pulse"
          ></div>
          <img
            ref="coverRefDesktop"
            :key="`desktop-${resolvedCover}-${corsBlocked}`"
            :src="resolvedCover"
            :alt="song.title"
            :crossorigin="corsBlocked ? null : 'anonymous'"
            class="w-full h-full object-cover transition-opacity duration-300"
            :class="coverLoadedDesktop ? 'opacity-100' : 'opacity-0'"
            @load="onLoadDesktop"
            @error="onError"
          />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <!-- Badge -->
          <span class="inline-flex items-center gap-1.5 bg-tiger-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            NUEVO LANZAMIENTO
          </span>

          <!-- Título -->
          <h2 class="text-3xl lg:text-4xl font-bold mb-2">
            {{ song.title }}
          </h2>
          <p class="text-lg text-white/70 mb-5">{{ song.artistName }}</p>

          <!-- Botones de acción -->
          <div class="flex items-center gap-3">
            <button
              @click.stop="handlePlay"
              class="bg-tiger-500 hover:bg-tiger-400 text-white font-bold
                     py-3 px-8 rounded-full flex items-center gap-2 transition-colors"
            >
              <IconPause v-if="isCurrentlyPlaying" :size="22" />
              <IconPlay v-else :size="22" />
              <span>{{ isCurrentlyPlaying ? 'Pausar' : 'Reproducir' }}</span>
            </button>
            <button
              @click.stop="toggleFavorite"
              class="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              :class="isFavorite ? 'text-tiger-500' : 'text-white/80'"
              aria-label="Favorito"
            >
              <IconHeart :size="24" :filled="isFavorite" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlaybackContext } from '~/composables/usePlayer'
import { extractDominantColor } from '~/utils/image'

const { getImageUrl } = useMediaUrl()

const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  queue: {
    type: Array,
    default: () => []
  },
  context: {
    type: Object as () => PlaybackContext,
    default: undefined
  }
})

const { playSong, currentSong, isPlaying, togglePlay } = usePlayer()
const { toggleFavoriteSong, isFavoriteSong } = useFavorites()
const { addToRecent } = useRecentlyPlayed()

const isFavorite = computed(() => isFavoriteSong(props.song.id))
const isCurrent = computed(() => currentSong.value?.id === props.song.id)
const isCurrentlyPlaying = computed(() => isCurrent.value && isPlaying.value)

const resolvedCover = computed(() => getImageUrl(props.song.cover))

// Color extraction from cover
const coverRef = ref<HTMLImageElement | null>(null)
const coverRefDesktop = ref<HTMLImageElement | null>(null)
const dominantColor = ref('#ea580c') // tiger-600 as fallback
const coverLoadedMobile = ref(false)
const coverLoadedDesktop = ref(false)
// Si CORS bloquea la imagen (cache de Cloudflare sin headers, etc.) se reintenta
// sin crossorigin: la cover se ve, pero el canvas queda tainted y la extracción
// de color cae al fallback naranja.
const corsBlocked = ref(false)

watch(resolvedCover, () => {
  coverLoadedMobile.value = false
  coverLoadedDesktop.value = false
  corsBlocked.value = false
})

const onLoadMobile = () => {
  coverLoadedMobile.value = true
  if (coverRef.value && !corsBlocked.value) {
    const color = extractDominantColor(coverRef.value)
    if (color) dominantColor.value = color
  }
}

const onLoadDesktop = () => {
  coverLoadedDesktop.value = true
  if (coverRefDesktop.value && !corsBlocked.value) {
    const color = extractDominantColor(coverRefDesktop.value)
    if (color) dominantColor.value = color
  }
}

const onError = () => {
  if (!corsBlocked.value) {
    corsBlocked.value = true
  }
}

const handlePlay = () => {
  // If this is the current song, toggle play/pause
  if (isCurrent.value) {
    togglePlay()
    return
  }

  playSong(props.song, props.queue.length > 0 ? props.queue : [props.song], props.context)
  addToRecent({
    type: 'song',
    id: props.song.id,
    cover: props.song.cover,
    title: props.song.title,
    artistName: props.song.artistName
  })
}

const toggleFavorite = () => {
  toggleFavoriteSong(props.song.id)
}
</script>
