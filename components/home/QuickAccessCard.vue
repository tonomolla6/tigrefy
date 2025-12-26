<template>
  <div
    class="group relative flex items-center gap-3 bg-white/10 hover:bg-white/20
           rounded-md overflow-hidden cursor-pointer transition-colors duration-200
           h-12 md:h-14"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Imagen cuadrada o gradiente para liked-songs -->
    <div class="h-full aspect-square">
      <div
        v-if="type === 'liked-songs'"
        class="h-full w-full bg-gradient-to-br from-indigo-800 via-indigo-600 to-indigo-400 flex items-center justify-center rounded-l-md"
      >
        <IconHeart :size="24" class="text-white" :filled="true" />
      </div>
      <img
        v-else
        ref="imgRef"
        :src="image"
        :alt="title"
        crossorigin="anonymous"
        class="h-full w-full object-cover rounded-l-md"
        @load="extractColor"
      />
    </div>

    <!-- Título -->
    <span class="font-semibold text-xs md:text-sm pr-10 flex-1 line-clamp-2 leading-tight">
      {{ title }}
    </span>

    <!-- Animación de ondas cuando se reproduce (visible sin hover) -->
    <div
      v-if="isCurrentlyPlaying"
      class="absolute right-3 flex items-end gap-0.5 h-4 group-hover:opacity-0 transition-opacity"
    >
      <span class="w-0.5 bg-tiger-500 rounded-sm animate-sound-wave-1"></span>
      <span class="w-0.5 bg-tiger-500 rounded-sm animate-sound-wave-2"></span>
      <span class="w-0.5 bg-tiger-500 rounded-sm animate-sound-wave-3"></span>
      <span class="w-0.5 bg-tiger-500 rounded-sm animate-sound-wave-4"></span>
    </div>

    <!-- Botón play (aparece en hover) -->
    <button
      @click.stop="handlePlay"
      class="absolute right-2 bg-tiger-500 hover:bg-tiger-400 hover:scale-105 rounded-full p-2 shadow-lg
             transition-all duration-200 opacity-0 group-hover:opacity-100"
      aria-label="Reproducir"
    >
      <IconPause v-if="isCurrentlyPlaying" :size="16" class="text-white" />
      <IconPlay v-else :size="16" class="text-white" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  image: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String as () => 'album' | 'playlist' | 'artist' | 'liked-songs',
    required: true
  },
  id: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['play', 'hover-color'])
const router = useRouter()
const { playbackContext, isPlaying, togglePlay } = usePlayer()

// Color extraction
const imgRef = ref<HTMLImageElement | null>(null)
const extractedColor = ref<string | null>(null)

const extractColor = () => {
  if (!imgRef.value) return

  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 50
    canvas.height = 50
    ctx.drawImage(imgRef.value, 0, 0, 50, 50)

    const imageData = ctx.getImageData(0, 0, 50, 50).data
    let r = 0, g = 0, b = 0, count = 0

    for (let i = 0; i < imageData.length; i += 16) {
      r += imageData[i]
      g += imageData[i + 1]
      b += imageData[i + 2]
      count++
    }

    r = Math.round(r / count)
    g = Math.round(g / count)
    b = Math.round(b / count)

    // Boost saturation
    const boost = 1.3
    r = Math.min(255, Math.round(r * boost))
    g = Math.min(255, Math.round(g * boost))
    b = Math.min(255, Math.round(b * boost))

    extractedColor.value = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  } catch {
    // CORS error, keep null
  }
}

const handleMouseEnter = () => {
  if (props.type === 'liked-songs') {
    emit('hover-color', '#6366f1') // indigo-500
  } else if (extractedColor.value) {
    emit('hover-color', extractedColor.value)
  }
}

const handleMouseLeave = () => {
  emit('hover-color', null)
}

// Check if this item is the current playback context
const isCurrentContext = computed(() => {
  if (props.type === 'liked-songs') {
    return playbackContext.value.type === 'liked-songs'
  }
  return playbackContext.value.type === props.type && playbackContext.value.id === props.id
})

// Check if currently playing from this context
const isCurrentlyPlaying = computed(() =>
  isCurrentContext.value && isPlaying.value
)

const handleClick = () => {
  if (props.type === 'liked-songs') {
    router.push('/liked-songs')
  } else if (props.type === 'album') {
    router.push(`/album/${props.id}`)
  } else if (props.type === 'playlist') {
    router.push(`/playlist/${props.id}`)
  } else if (props.type === 'artist') {
    router.push(`/artist/${props.id}`)
  }
}

const handlePlay = () => {
  // If this is the current context, toggle play/pause
  if (isCurrentContext.value) {
    togglePlay()
    return
  }

  emit('play', { type: props.type, id: props.id })
}
</script>

<style scoped>
/* Animaciones de ondas de sonido */
@keyframes sound-wave {
  0%, 100% { height: 3px; }
  50% { height: 12px; }
}

.animate-sound-wave-1 {
  animation: sound-wave 0.4s ease-in-out infinite;
  animation-delay: 0s;
}

.animate-sound-wave-2 {
  animation: sound-wave 0.4s ease-in-out infinite;
  animation-delay: 0.1s;
}

.animate-sound-wave-3 {
  animation: sound-wave 0.4s ease-in-out infinite;
  animation-delay: 0.2s;
}

.animate-sound-wave-4 {
  animation: sound-wave 0.4s ease-in-out infinite;
  animation-delay: 0.3s;
}
</style>
