<template>
  <div class="min-h-full bg-dark-base">
    <div class="px-4 md:px-8 py-6">
      <h1 class="text-4xl md:text-5xl font-bold mb-8">Artistas</h1>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        <div
          v-for="artist in artists"
          :key="artist.id"
          class="group cursor-pointer"
          @click="navigateTo(`/artist/${artist.id}`)"
        >
          <div class="relative mb-4 overflow-hidden rounded-full shadow-2xl aspect-square">
            <img
              :src="artist.image"
              :alt="artist.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              @error="handleImageError"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <button
              @click.stop="handlePlayArtist(artist)"
              class="absolute bottom-4 right-4 bg-tiger-500 hover:bg-tiger-600 rounded-full p-3 shadow-2xl transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
            >
              <font-awesome-icon :icon="['fas', 'play']" class="text-white text-xl" />
            </button>
          </div>
          <h3 class="text-base md:text-lg font-bold mb-1 truncate text-center">{{ artist.name }}</h3>
          <p class="text-xs md:text-sm text-secondary truncate text-center">Artista</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { data, getSongsByArtistId } = useData()
const { playSong } = usePlayer()

const artists = computed(() => data.value.artists || [])

const handlePlayArtist = (artist: any) => {
  const songs = getSongsByArtistId(artist.id)
  if (songs.length > 0) {
    playSong(songs[0], songs)
  }
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
