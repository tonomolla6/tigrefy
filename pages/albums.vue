<template>
  <div class="min-h-full bg-dark-base">
    <div class="px-4 md:px-8 py-6">
      <h1 class="text-4xl md:text-5xl font-bold mb-8">Todos los Álbumes</h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <div
          v-for="album in albums"
          :key="album.id"
          class="group cursor-pointer"
          @click="navigateTo(`/album/${album.id}`)"
        >
          <div class="relative mb-4 overflow-hidden rounded-lg shadow-2xl">
            <img
              :src="album.cover"
              :alt="album.title"
              class="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
              @error="handleImageError"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div class="w-full">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs text-tiger-300 font-semibold">{{ album.releaseDate?.substring(0, 4) }}</p>
                    <p class="text-xs text-secondary">{{ album.totalTracks }} {{ album.totalTracks === 1 ? 'canción' : 'canciones' }}</p>
                  </div>
                  <button
                    @click.stop="handlePlayAlbum(album)"
                    class="bg-tiger-500 hover:bg-tiger-600 rounded-full p-3 shadow-2xl transition-all"
                  >
                    <IconPlay :size="24" class="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <h3 class="text-xl font-bold mb-1 truncate">{{ album.title }}</h3>
          <p class="text-secondary text-sm truncate">{{ album.artistName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { data, getSongsByAlbumId } = useData()
const { playSong } = usePlayer()

const albums = computed(() => data.value.albums || [])

const handlePlayAlbum = (album: any) => {
  const songs = getSongsByAlbumId(album.id)
  if (songs.length > 0) {
    playSong(songs[0], songs)
  }
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/covers/default.jpg'
}
</script>
