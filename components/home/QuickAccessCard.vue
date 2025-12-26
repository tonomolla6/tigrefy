<template>
  <div
    class="group relative flex items-center gap-3 bg-white/10 hover:bg-white/20
           rounded-md overflow-hidden cursor-pointer transition-colors duration-200
           h-12 md:h-14"
    @click="handleClick"
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
        :src="image"
        :alt="title"
        class="h-full w-full object-cover rounded-l-md"
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

const emit = defineEmits(['play'])
const router = useRouter()
const { playbackContext, isPlaying, togglePlay } = usePlayer()

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
