<template>
  <!-- Mobile: diseño vertical compacto -->
  <div class="md:hidden">
    <div
      class="relative overflow-hidden rounded-xl"
      :style="`background: linear-gradient(135deg, ${dominantColor}cc 0%, ${dominantColor}44 60%, transparent 100%)`"
    >
      <div class="flex items-center gap-4 p-4">
        <!-- Cover -->
        <div class="flex-shrink-0">
          <img
            ref="coverRef"
            :src="song.cover"
            :alt="song.title"
            crossorigin="anonymous"
            class="w-24 h-24 rounded-lg shadow-lg object-cover"
            @load="extractColor"
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
        <div class="flex-shrink-0">
          <img
            ref="coverRefDesktop"
            :src="song.cover"
            :alt="song.title"
            crossorigin="anonymous"
            class="w-48 h-48 rounded-lg shadow-lg object-cover"
            @load="extractColorDesktop"
          />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <!-- Badge -->
          <span class="inline-flex items-center gap-1.5 bg-tiger-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            NUEVO LANZAMIENTO
          </span>

          <!-- Título -->
          <h2 class="text-3xl lg:text-4xl font-bold leading-tight mb-2 line-clamp-2">
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

// Color extraction from cover
const coverRef = ref<HTMLImageElement | null>(null)
const coverRefDesktop = ref<HTMLImageElement | null>(null)
const dominantColor = ref('#ea580c') // tiger-600 as fallback

const extractColorFromImage = (img: HTMLImageElement) => {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 50
    canvas.height = 50
    ctx.drawImage(img, 0, 0, 50, 50)

    const imageData = ctx.getImageData(0, 0, 50, 50).data
    let r = 0, g = 0, b = 0, count = 0

    // Sample pixels to get average color
    for (let i = 0; i < imageData.length; i += 16) {
      r += imageData[i]
      g += imageData[i + 1]
      b += imageData[i + 2]
      count++
    }

    r = Math.round(r / count)
    g = Math.round(g / count)
    b = Math.round(b / count)

    // Make color more saturated for better visibility
    const max = Math.max(r, g, b)
    const boost = 1.3
    r = Math.min(255, Math.round(r * boost))
    g = Math.min(255, Math.round(g * boost))
    b = Math.min(255, Math.round(b * boost))

    dominantColor.value = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  } catch {
    // Keep fallback color on error (CORS, etc.)
  }
}

const extractColor = () => {
  if (coverRef.value) {
    extractColorFromImage(coverRef.value)
  }
}

const extractColorDesktop = () => {
  if (coverRefDesktop.value) {
    extractColorFromImage(coverRefDesktop.value)
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
