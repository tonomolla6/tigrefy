<template>
  <NuxtLink :to="linkTo" class="block">
    <div class="bg-dark-highlight p-4 rounded-lg card-hover group/card">
      <div class="relative mb-4">
        <SecureImage
          :src="image"
          :alt="alt || title"
          :class="['w-full aspect-square object-cover shadow-lg', imageRounded]"
        />
        <CardPlayButton
          :is-playing="isCurrentlyPlaying"
          :is-visible="isCurrentContext"
          @click="handlePlay"
        />
      </div>
      <h3 class="font-bold text-primary truncate mb-1">{{ title }}</h3>
      <slot />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Song } from '~/types/song'

type Kind = 'album' | 'artist' | 'playlist'

const props = defineProps<{
  kind: Kind
  id: string
  title: string
  image: string | null | undefined
  alt?: string
  /** Función que devuelve las canciones a reproducir cuando se pulsa play */
  getSongs: () => Song[]
}>()

const { playSong, playbackContext, isPlaying, togglePlay } = usePlayer()

const linkTo = computed(() => `/${props.kind}/${props.id}`)

const imageRounded = computed(() =>
  // Los artistas son círculos como en Spotify; álbumes y playlists, cuadrados
  props.kind === 'artist' ? 'rounded-full' : 'rounded-md'
)

const isCurrentContext = computed(() =>
  playbackContext.value.type === props.kind && playbackContext.value.id === props.id
)

const isCurrentlyPlaying = computed(() => isCurrentContext.value && isPlaying.value)

const handlePlay = () => {
  if (isCurrentContext.value) {
    togglePlay()
    return
  }
  const songs = props.getSongs()
  if (songs.length > 0) {
    playSong(songs[0], songs, { type: props.kind, id: props.id })
  }
}
</script>
