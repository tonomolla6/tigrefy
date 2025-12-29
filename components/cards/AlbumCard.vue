<template>
  <NuxtLink :to="`/album/${album.id}`" class="block">
    <div class="bg-dark-highlight p-4 rounded-lg card-hover group/card">
      <div class="relative mb-4">
        <img
          :src="album.cover"
          :alt="album.title"
          class="w-full aspect-square object-cover rounded-md shadow-lg"
          @error="onImageError"
        />
        <CardPlayButton
          :is-playing="isCurrentlyPlaying"
          :is-visible="isCurrentContext"
          @click="handlePlayAlbum"
        />
      </div>
      <h3 class="font-bold text-primary truncate mb-1">{{ album.title }}</h3>
      <p class="text-sm text-secondary truncate">{{ album.artistName }}</p>
      <div class="flex items-center gap-2 mt-1">
        <p class="text-xs text-secondary">{{ album.releaseDate?.substring(0, 4) }}</p>
        <span v-if="album.genres && album.genres.length > 0" class="text-xs px-2 py-0.5 bg-tiger-500/20 text-tiger-400 rounded-full">
          {{ album.genres[0] }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { handleImageError } from '~/utils/image'

const props = defineProps<{
  album: any
}>()

const { getSongsByAlbumId } = useData()
const { playSong, playbackContext, isPlaying, togglePlay } = usePlayer()

const isCurrentContext = computed(() =>
  playbackContext.value.type === 'album' && playbackContext.value.id === props.album.id
)

const isCurrentlyPlaying = computed(() =>
  isCurrentContext.value && isPlaying.value
)

const handlePlayAlbum = () => {
  if (isCurrentContext.value) {
    togglePlay()
    return
  }
  const songs = getSongsByAlbumId(props.album.id)
  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'album', id: props.album.id })
  }
}

const onImageError = (e: Event) => handleImageError(e)
</script>
