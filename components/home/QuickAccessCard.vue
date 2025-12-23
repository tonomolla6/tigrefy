<template>
  <div
    class="group relative flex items-center gap-3 bg-white/10 hover:bg-white/20
           rounded-md overflow-hidden cursor-pointer transition-colors duration-200
           h-14 md:h-16"
    @click="handleClick"
  >
    <!-- Imagen cuadrada o gradiente para liked-songs -->
    <div
      v-if="type === 'liked-songs'"
      class="h-full aspect-square bg-gradient-to-br from-indigo-800 via-indigo-600 to-indigo-400 flex items-center justify-center shadow-md"
    >
      <IconHeart :size="24" class="text-white" :filled="true" />
    </div>
    <img
      v-else
      :src="image"
      :alt="title"
      class="h-full aspect-square object-cover shadow-md"
    />

    <!-- Título -->
    <span class="font-semibold text-sm md:text-base truncate pr-12 flex-1">
      {{ title }}
    </span>

    <!-- Botón play (aparece en hover o si es el contexto actual) -->
    <button
      @click.stop="handlePlay"
      class="absolute right-2 bg-tiger-500 hover:bg-tiger-400 rounded-full p-2 shadow-lg
             transition-opacity duration-200"
      :class="isCurrentContext ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
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
