<template>
  <div class="min-h-full bg-dark-base pb-20 md:pb-0">
    <!-- Mobile Header -->
    <MobileHeader title="Artistas" />

    <div class="px-4 md:px-8 py-6">
      <h1 class="text-2xl md:text-3xl font-bold mb-6">Artistas</h1>

      <!-- Skeleton mientras carga -->
      <CardGridSkeleton v-if="!isLoaded" shape="circle" />

      <!-- Grid responsive -->
      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 items-start">
        <NuxtLink
          v-for="artist in artists"
          :key="artist.id"
          :to="`/artist/${artist.id}`"
          class="group/card p-3 rounded-md bg-transparent hover:bg-[#1a1a1a] transition-all duration-300 cursor-pointer block"
        >
          <!-- Imagen circular -->
          <div class="relative mb-3">
            <SecureImage
              :src="artist.image"
              :alt="artist.name"
              class="w-full aspect-square rounded-full shadow-md"
            />
            <CardPlayButton
              :is-playing="isCurrentlyPlaying(artist)"
              :is-visible="isCurrentContext(artist)"
              @click="handlePlay(artist)"
            />
          </div>

          <!-- Info -->
          <h3 class="font-bold text-base text-white mb-1 text-center truncate">{{ artist.name }}</h3>
          <p class="text-sm text-[#a7a7a7] text-center">Artista</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { data, getSongsByArtistId, isLoaded } = useData()
const { playSong, playbackContext, isPlaying, togglePlay } = usePlayer()

const artists = computed(() => data.value.artists || [])

const isCurrentContext = (artist: any) => {
  return playbackContext.value.type === 'artist' && playbackContext.value.id === artist.id
}

const isCurrentlyPlaying = (artist: any) => {
  return isCurrentContext(artist) && isPlaying.value
}

const handlePlay = (artist: any) => {
  if (isCurrentContext(artist)) {
    togglePlay()
    return
  }
  const songs = getSongsByArtistId(artist.id)
  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'artist', id: artist.id })
  }
}
</script>
