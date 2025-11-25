<template>
  <div
    class="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/10
           transition-colors duration-200 cursor-pointer"
    @click="handlePlay"
  >
    <!-- Número de posición -->
    <div class="w-8 text-center flex-shrink-0">
      <span
        class="text-2xl font-bold"
        :class="index < 3 ? 'text-tiger-500' : 'text-secondary'"
      >
        {{ index + 1 }}
      </span>
    </div>

    <!-- Cover con overlay -->
    <div class="relative flex-shrink-0">
      <img
        :src="song.cover"
        :alt="song.title"
        class="w-12 h-12 rounded object-cover"
      />
      <div
        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
               transition-opacity duration-200 flex items-center justify-center rounded"
      >
        <IconPlay v-if="!isCurrentlyPlaying" :size="16" class="text-white" />
        <IconPause v-else :size="16" class="text-white" />
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h4
        class="font-semibold truncate transition-colors"
        :class="isCurrent ? 'text-tiger-500' : 'text-primary'"
      >
        {{ song.title }}
      </h4>
      <p class="text-sm text-secondary truncate">{{ song.artistName }}</p>
    </div>

    <!-- Acciones (aparecen en hover) -->
    <div class="flex items-center gap-3">
      <button
        @click.stop="toggleFavorite"
        class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        :class="isFavorite ? 'text-tiger-500 !opacity-100' : 'text-secondary hover:text-white'"
        aria-label="Favorito"
      >
        <IconHeart :size="18" :filled="isFavorite" />
      </button>
      <span class="text-sm text-secondary w-12 text-right">
        {{ formatDuration(song.duration) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  queue: {
    type: Array,
    default: () => []
  }
})

const { playSong, currentSong, isPlaying, formatTime } = usePlayer()
const { toggleFavoriteSong, isFavoriteSong } = useFavorites()
const { addToRecent } = useRecentlyPlayed()

const isCurrent = computed(() => currentSong.value?.id === props.song.id)
const isCurrentlyPlaying = computed(() => isCurrent.value && isPlaying.value)
const isFavorite = computed(() => isFavoriteSong(props.song.id))

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handlePlay = () => {
  playSong(props.song, props.queue.length > 0 ? props.queue : [props.song])
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
