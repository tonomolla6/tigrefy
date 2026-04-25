<template>
  <!-- Mobile: toda la fila es clickeable -->
  <div
    class="md:hidden group flex items-center gap-4 p-3 rounded-lg hover:bg-white/10
           transition-colors duration-200 cursor-pointer"
    @click="handlePlay"
  >
    <div class="w-8 text-center flex-shrink-0">
      <span class="text-2xl font-bold" :class="index < 3 ? 'text-tiger-500' : 'text-secondary'">
        {{ index + 1 }}
      </span>
    </div>
    <SecureImage :src="song.cover" :alt="song.title" class="w-12 h-12 rounded flex-shrink-0" />
    <div class="flex-1 min-w-0">
      <h4 class="font-semibold truncate" :class="isCurrent ? 'text-tiger-500' : 'text-primary'">
        {{ song.title }}
      </h4>
      <span class="text-sm text-secondary truncate block">{{ song.artistName }}</span>
    </div>
    <span class="text-sm text-secondary">{{ formatDuration(song.duration) }}</span>
  </div>

  <!-- Desktop: solo click en imagen reproduce -->
  <div
    class="hidden md:flex group items-center gap-4 p-3 rounded-lg hover:bg-white/10
           transition-colors duration-200"
  >
    <div class="w-8 text-center flex-shrink-0">
      <span class="text-2xl font-bold" :class="index < 3 ? 'text-tiger-500' : 'text-secondary'">
        {{ index + 1 }}
      </span>
    </div>
    <div class="relative flex-shrink-0 cursor-pointer" @click="handlePlay">
      <SecureImage :src="song.cover" :alt="song.title" class="w-12 h-12 rounded" />
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                  transition-opacity duration-200 flex items-center justify-center rounded">
        <IconPlay v-if="!isCurrentlyPlaying" :size="16" class="text-white" />
        <IconPause v-else :size="16" class="text-white" />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <h4 class="font-semibold truncate" :class="isCurrent ? 'text-tiger-500' : 'text-primary'">
        {{ song.title }}
      </h4>
      <NuxtLink
        :to="`/artist/${song.artistId}`"
        class="text-sm text-secondary hover:text-white hover:underline truncate inline-block max-w-full transition-colors"
      >
        {{ song.artistName }}
      </NuxtLink>
    </div>
    <div class="flex items-center gap-3">
      <button
        @click="toggleFavorite"
        class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        :class="isFavorite ? 'text-tiger-500 !opacity-100' : 'text-secondary hover:text-white'"
        aria-label="Favorito"
      >
        <IconHeart :size="18" :filled="isFavorite" />
      </button>
      <span class="text-sm text-secondary w-12 text-right">{{ formatDuration(song.duration) }}</span>
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
  index: {
    type: Number,
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

const { playSong, currentSong, isPlaying, formatTime, togglePlay } = usePlayer()
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
