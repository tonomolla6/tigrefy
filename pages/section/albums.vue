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
        <div
          v-for="album in albums"
          :key="album.id"
          class="group p-3 rounded-md bg-transparent hover:bg-[#1a1a1a] transition-all duration-300 cursor-pointer"
        >
          <NuxtLink :to="`/album/${album.id}`" class="block">
            <!-- Imagen con botón play -->
            <div class="relative mb-3">
              <img
                :src="album.cover"
                :alt="album.title"
                class="w-full aspect-square object-cover rounded-md shadow-md"
              />
              <button
                @click.prevent="handlePlay(album)"
                class="absolute bottom-2 right-2 bg-tiger-500 hover:bg-tiger-400 hover:scale-105 rounded-full w-12 h-12
                       shadow-xl transition-all duration-300 flex items-center justify-center
                       opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                aria-label="Reproducir álbum"
              >
                <IconPlay :size="22" class="text-black ml-0.5" />
              </button>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { data, getSongsByAlbumId, isLoaded } = useData()
const { playSong } = usePlayer()

const albums = computed(() => data.value.albums || [])

const handlePlay = (album: any) => {
  const songs = getSongsByAlbumId(album.id)
  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'album', id: album.id })
  }
}
</script>
