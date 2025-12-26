<template>
  <NuxtLink
    :to="`/album/${album.id}`"
    class="group p-3 rounded-md bg-transparent hover:bg-[#1a1a1a]
           transition-all duration-300 cursor-pointer w-[200px] flex-shrink-0
           snap-start block"
  >
    <!-- Contenedor de imagen con botón play -->
    <div class="relative mb-3">
      <img
        :src="album.cover"
        :alt="album.title"
        class="w-full aspect-square object-cover rounded-md shadow-md"
      />

      <!-- Botón play flotante - estilo Spotify -->
      <button
        @click.prevent="handlePlay"
        class="absolute bottom-2 right-2 bg-tiger-500 hover:bg-tiger-400 hover:scale-105 rounded-full w-12 h-12
               shadow-xl transition-all duration-300 flex items-center justify-center"
        :class="isCurrentContext
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'"
        aria-label="Reproducir álbum"
      >
        <IconPause v-if="isCurrentlyPlaying" :size="22" class="text-black" />
        <IconPlay v-else :size="22" class="text-black ml-0.5" />
      </button>
    </div>

    <!-- Info -->
    <h3 class="font-bold text-base text-white mb-1 line-clamp-2">{{ album.title }}</h3>
    <NuxtLink
      :to="`/artist/${album.artistId}`"
      class="text-sm text-[#a7a7a7] truncate hover:text-white hover:underline transition-colors"
      @click.stop
    >
      {{ album.artistName }}
    </NuxtLink>
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
