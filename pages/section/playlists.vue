<template>
  <div class="min-h-full bg-dark-base pb-20 md:pb-0">
    <!-- Mobile Header -->
    <MobileHeader title="Listas" />

    <div class="px-4 md:px-8 py-6">
      <h1 class="text-2xl md:text-3xl font-bold mb-6">Listas</h1>

      <!-- Loading -->
      <div v-if="!isLoaded" class="flex justify-center py-20">
        <LoadingDots />
      </div>

      <!-- Grid responsive alineado arriba -->
      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 items-start">
        <NuxtLink
          v-for="playlist in playlists"
          :key="playlist.id"
          :to="`/playlist/${playlist.id}`"
          class="group/card p-3 rounded-md bg-transparent hover:bg-[#1a1a1a] transition-all duration-300 cursor-pointer block"
        >
          <!-- Imagen con botón play -->
          <div class="relative mb-3">
            <img
              :src="playlist.cover || '/covers/default-playlist.png'"
              :alt="playlist.name"
              class="w-full aspect-square object-cover rounded-md shadow-md"
            />
            <CardPlayButton
              :is-playing="isCurrentlyPlaying(playlist)"
              :is-visible="isCurrentContext(playlist)"
              @click="handlePlay(playlist)"
            />
          </div>

          <!-- Info -->
          <h3 class="font-bold text-base text-white mb-1 line-clamp-2">{{ playlist.name }}</h3>
          <p class="text-sm text-[#a7a7a7] line-clamp-2">{{ playlist.description || 'Playlist' }}</p>
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

const { data, getSongsByIds, isLoaded } = useData()
const { playSong, playbackContext, isPlaying, togglePlay } = usePlayer()
const { isGuest } = useAuth()

const playlists = computed(() => {
  const allPlaylists = data.value.playlists || []
  return isGuest.value
    ? allPlaylists.filter((p: any) => p.isPublic)
    : allPlaylists
})

const isCurrentContext = (playlist: any) => {
  return playbackContext.value.type === 'playlist' && playbackContext.value.id === playlist.id
}

const isCurrentlyPlaying = (playlist: any) => {
  return isCurrentContext(playlist) && isPlaying.value
}

const handlePlay = (playlist: any) => {
  if (isCurrentContext(playlist)) {
    togglePlay()
    return
  }
  const songs = getSongsByIds(playlist.songIds || [])
  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'playlist', id: playlist.id })
  }
}
</script>
