<template>
  <NuxtLink
    :to="`/playlist/${playlist.id}`"
    class="group bg-dark-card hover:bg-dark-hover p-4 rounded-lg
           transition-colors duration-200 cursor-pointer w-44 md:w-48 flex-shrink-0
           snap-start block"
  >
    <!-- Contenedor de imagen con botón play -->
    <div class="relative mb-4">
      <img
        :src="playlist.cover || '/covers/default-playlist.png'"
        :alt="playlist.name"
        class="w-full aspect-square object-cover rounded-md shadow-lg"
      />

      <!-- Botón play flotante -->
      <button
        @click.prevent="handlePlay"
        class="absolute bottom-2 right-2 bg-tiger-500 hover:bg-tiger-400 rounded-full p-3
               shadow-xl transition-opacity duration-200"
        :class="isCurrentContext ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        aria-label="Reproducir playlist"
      >
        <IconPause v-if="isCurrentlyPlaying" :size="24" class="text-white" />
        <IconPlay v-else :size="24" class="text-white ml-0.5" />
      </button>
    </div>

    <!-- Info -->
    <h3 class="font-bold text-base truncate mb-1">{{ playlist.name }}</h3>
    <p class="text-sm text-secondary truncate">{{ playlist.description || 'Playlist' }}</p>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
  playlist: {
    type: Object,
    required: true
  }
})

const { playSong, playbackContext, isPlaying, togglePlay } = usePlayer()
const { getSongsByIds } = useData()

// Check if this playlist is the current playback context
const isCurrentContext = computed(() =>
  playbackContext.value.type === 'playlist' && playbackContext.value.id === props.playlist.id
)

// Check if currently playing from this playlist
const isCurrentlyPlaying = computed(() =>
  isCurrentContext.value && isPlaying.value
)

const handlePlay = () => {
  // If this is the current context, toggle play/pause
  if (isCurrentContext.value) {
    togglePlay()
    return
  }

  const songs = getSongsByIds(props.playlist.songIds || [])
  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'playlist', id: props.playlist.id })
  }
}
</script>
