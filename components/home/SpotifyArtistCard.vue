<template>
  <NuxtLink
    :to="`/artist/${artist.id}`"
    class="group flex flex-col items-center p-4 bg-dark-card hover:bg-dark-hover
           rounded-lg transition-colors duration-200 w-40 md:w-44 flex-shrink-0
           snap-start"
  >
    <!-- Imagen circular -->
    <div class="relative mb-4">
      <SecureImage
        :src="artist.image"
        :alt="artist.name"
        class="w-32 h-32 md:w-36 md:h-36 rounded-full shadow-lg"
      />

      <!-- Botón play -->
      <button
        @click.prevent="handlePlay"
        class="absolute bottom-1 right-1 bg-tiger-500 hover:bg-tiger-400 rounded-full p-3
               shadow-xl transition-opacity duration-200"
        :class="isCurrentContext ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        aria-label="Reproducir artista"
      >
        <IconPause v-if="isCurrentlyPlaying" :size="20" class="text-white" />
        <IconPlay v-else :size="20" class="text-white ml-0.5" />
      </button>
    </div>

    <!-- Info -->
    <h3 class="font-bold text-base truncate w-full text-center">{{ artist.name }}</h3>
    <p class="text-sm text-secondary">Artista</p>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
  artist: {
    type: Object,
    required: true
  }
})

const { playSong, playbackContext, isPlaying, togglePlay } = usePlayer()
const { data } = useData()
const { addToRecent } = useRecentlyPlayed()

// Check if this artist is the current playback context
const isCurrentContext = computed(() =>
  playbackContext.value.type === 'artist' && playbackContext.value.id === props.artist.id
)

// Check if currently playing from this artist
const isCurrentlyPlaying = computed(() =>
  isCurrentContext.value && isPlaying.value
)

const handlePlay = () => {
  // If this is the current context, toggle play/pause
  if (isCurrentContext.value) {
    togglePlay()
    return
  }

  const songs = data.value.songs.filter((song: any) => song.artistId === props.artist.id)
  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'artist', id: props.artist.id })
    addToRecent({
      type: 'artist',
      id: props.artist.id,
      cover: props.artist.image,
      title: props.artist.name
    })
  }
}
</script>
