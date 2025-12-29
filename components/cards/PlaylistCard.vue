<template>
  <NuxtLink :to="`/playlist/${playlist.id}`" class="block">
    <div class="bg-dark-highlight p-4 rounded-lg card-hover group/card">
      <div class="relative mb-4">
        <img
          :src="playlist.cover"
          :alt="playlist.name"
          class="w-full aspect-square object-cover rounded-md shadow-lg"
          @error="onImageError"
        />
        <CardPlayButton
          :is-playing="isCurrentlyPlaying"
          :is-visible="isCurrentContext"
          @click="handlePlayPlaylist"
        />
      </div>
      <h3 class="font-bold text-primary truncate mb-1">{{ playlist.name }}</h3>
      <p class="text-sm text-secondary line-clamp-2">{{ playlist.description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { handleImageError } from '~/utils/image'

const props = defineProps<{
  playlist: any
}>()

const { getSongsByIds } = useData()
const { playSong, playbackContext, isPlaying, togglePlay } = usePlayer()

const isCurrentContext = computed(() =>
  playbackContext.value.type === 'playlist' && playbackContext.value.id === props.playlist.id
)

const isCurrentlyPlaying = computed(() =>
  isCurrentContext.value && isPlaying.value
)

const handlePlayPlaylist = () => {
  if (isCurrentContext.value) {
    togglePlay()
    return
  }
  const songs = getSongsByIds(props.playlist.songIds)
  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'playlist', id: props.playlist.id })
  }
}

const onImageError = (e: Event) => handleImageError(e)
</script>
