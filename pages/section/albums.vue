<template>
  <div class="min-h-full bg-dark-base pb-20 md:pb-0">
    <!-- Mobile Header -->
    <MobileHeader title="Álbumes" />

    <div class="px-4 md:px-8 py-6">
      <h1 class="text-2xl md:text-3xl font-bold mb-6">Álbumes</h1>

      <!-- Loading -->
      <div v-if="!isLoaded" class="flex justify-center py-20">
        <LoadingDots />
      </div>

      <!-- Grid responsive alineado arriba -->
      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 items-start">
        <NuxtLink
          v-for="album in albums"
          :key="album.id"
          :to="`/album/${album.id}`"
          class="group/card p-3 rounded-md bg-transparent hover:bg-[#1a1a1a] transition-all duration-300 cursor-pointer block"
        >
          <!-- Imagen con botón play -->
          <div class="relative mb-3">
            <SecureImage
              :src="album.cover"
              :alt="album.title"
              class="w-full aspect-square rounded-md shadow-md"
            />
            <CardPlayButton
              :is-playing="isCurrentlyPlaying(album)"
              :is-visible="isCurrentContext(album)"
              @click="handlePlay(album)"
            />
          </div>

          <!-- Info -->
          <h3 class="font-bold text-base text-white mb-1 line-clamp-2">{{ album.title }}</h3>
          <NuxtLink
            :to="`/artist/${album.artistId}`"
            class="text-sm text-[#a7a7a7] hover:text-white hover:underline transition-colors block"
            @click.stop
          >
            {{ album.artistName }}
          </NuxtLink>
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

const { data, getSongsByAlbumId, isLoaded } = useData()
const { playSong, playbackContext, isPlaying, togglePlay } = usePlayer()

const albums = computed(() => data.value.albums || [])

const isCurrentContext = (album: any) => {
  return playbackContext.value.type === 'album' && playbackContext.value.id === album.id
}

const isCurrentlyPlaying = (album: any) => {
  return isCurrentContext(album) && isPlaying.value
}

const handlePlay = (album: any) => {
  if (isCurrentContext(album)) {
    togglePlay()
    return
  }
  const songs = getSongsByAlbumId(album.id)
  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'album', id: album.id })
  }
}
</script>
