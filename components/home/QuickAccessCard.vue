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
    <div class="h-full aspect-square relative overflow-hidden rounded-l-md bg-dark-lighter">
      <div
        v-if="type === 'liked-songs'"
        class="h-full w-full bg-gradient-to-br from-indigo-800 via-indigo-600 to-indigo-400 flex items-center justify-center"
      >
        <IconHeart :size="24" class="text-white" :filled="true" />
      </div>
      <template v-else>
        <div
          v-if="!imgLoaded"
          class="absolute inset-0 bg-white/5 animate-pulse"
        ></div>
        <img
          ref="imgRef"
          :src="resolvedImage"
          :alt="title"
          crossorigin="anonymous"
          class="h-full w-full object-cover transition-opacity duration-300"
          :class="imgLoaded ? 'opacity-100' : 'opacity-0'"
          @load="onLoad"
        />
      </template>
    </div>

    <!-- Título -->
    <span class="font-semibold text-xs md:text-sm pr-10 flex-1 line-clamp-2 leading-tight">
      {{ title }}
    </span>

    <!-- Animación de ondas cuando se reproduce (visible sin hover) -->
    <div
      v-if="isCurrentlyPlaying"
      class="absolute right-3 group-hover:opacity-0 transition-opacity"
    >
      <PlayingIndicator size="sm" />
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
import { extractDominantColor } from '~/utils/image'

const { getImageUrl } = useMediaUrl()

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

const resolvedImage = computed(() => getImageUrl(props.image))

// Color extraction
const imgRef = ref<HTMLImageElement | null>(null)
const extractedColor = ref<string | null>(null)
const imgLoaded = ref(false)

watch(resolvedImage, () => {
  imgLoaded.value = false
})

const onLoad = () => {
  imgLoaded.value = true
  if (imgRef.value) {
    extractedColor.value = extractDominantColor(imgRef.value)
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

