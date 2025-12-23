<template>
  <NuxtLink :to="`/playlist/${playlist.id}`" class="block">
    <div class="bg-dark-highlight p-4 rounded-lg card-hover group">
      <div class="relative mb-4">
        <img
          :src="playlist.cover"
          :alt="playlist.name"
          class="w-full aspect-square object-cover rounded-md shadow-lg"
          @error="handleImageError"
        />
        <button
          @click.prevent="handlePlayPlaylist"
          class="absolute bottom-2 right-2 bg-tiger-500 rounded-full p-3 shadow-lg transform translate-y-2 transition-all duration-300"
          :class="isCurrentContext ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 group-hover:translate-y-0'"
        >
          <IconPause v-if="isCurrentlyPlaying" :size="24" class="text-white" />
          <IconPlay v-else :size="24" class="text-white" />
        </button>
      </div>
      <h3 class="font-bold text-primary truncate mb-1">{{ playlist.name }}</h3>
      <p class="text-sm text-secondary line-clamp-2">{{ playlist.description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  playlist: any
}>()

const { getSongsByIds } = useData()
const { playSong, playbackContext, isPlaying, togglePlay } = usePlayer()

// Check if this playlist is the current playback context
const isCurrentContext = computed(() =>
  playbackContext.value.type === 'playlist' && playbackContext.value.id === props.playlist.id
)

// Check if currently playing from this playlist
const isCurrentlyPlaying = computed(() =>
  isCurrentContext.value && isPlaying.value
)

const handlePlayPlaylist = () => {
  // If this is the current context, toggle play/pause
  if (isCurrentContext.value) {
    togglePlay()
    return
  }

  // Otherwise, start playing this playlist
  const songs = getSongsByIds(props.playlist.songIds)
  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'playlist', id: props.playlist.id })
  }
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
