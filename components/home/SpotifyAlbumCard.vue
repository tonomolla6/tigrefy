<template>
  <NuxtLink
    :to="`/album/${album.id}`"
    class="group bg-dark-card hover:bg-dark-hover p-4 rounded-lg
           transition-colors duration-200 cursor-pointer w-44 md:w-48 flex-shrink-0
           snap-start block"
  >
    <!-- Contenedor de imagen con botón play -->
    <div class="relative mb-4">
      <img
        :src="album.cover"
        :alt="album.title"
        class="w-full aspect-square object-cover rounded-md shadow-lg"
      />

      <!-- Botón play flotante -->
      <button
        @click.prevent="handlePlay"
        class="absolute bottom-2 right-2 bg-tiger-500 hover:bg-tiger-400 rounded-full p-3
               shadow-xl transition-opacity duration-200"
        :class="isCurrentContext ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        aria-label="Reproducir álbum"
      >
        <IconPause v-if="isCurrentlyPlaying" :size="24" class="text-white" />
        <IconPlay v-else :size="24" class="text-white ml-0.5" />
      </button>
    </div>

    <!-- Info -->
    <h3 class="font-bold text-base truncate mb-1">{{ album.title }}</h3>
    <p class="text-sm text-secondary truncate">{{ album.artistName }}</p>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
  album: {
    type: Object,
    required: true
  }
})

const { playSong, playbackContext, isPlaying, togglePlay } = usePlayer()
const { data } = useData()
const { addToRecent } = useRecentlyPlayed()

// Check if this album is the current playback context
const isCurrentContext = computed(() =>
  playbackContext.value.type === 'album' && playbackContext.value.id === props.album.id
)

// Check if currently playing from this album
const isCurrentlyPlaying = computed(() =>
  isCurrentContext.value && isPlaying.value
)

const getSongsByAlbumId = (albumId: string) => {
  return (data.value.songs || []).filter((song: any) => song.albumId === albumId)
}

const handlePlay = () => {
  // If this is the current context, toggle play/pause
  if (isCurrentContext.value) {
    togglePlay()
    return
  }

  const songs = getSongsByAlbumId(props.album.id)
  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'album', id: props.album.id })
    addToRecent({
      type: 'album',
      id: props.album.id,
      cover: props.album.cover,
      title: props.album.title,
      artistName: props.album.artistName
    })
  }
}
</script>
