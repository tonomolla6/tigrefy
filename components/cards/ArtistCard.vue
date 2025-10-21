<template>
  <NuxtLink :to="`/artist/${artist.id}`" class="block">
    <div class="bg-dark-highlight p-4 rounded-lg card-hover group">
      <div class="relative mb-4">
        <img
          :src="artist.image"
          :alt="artist.name"
          class="w-full aspect-square object-cover rounded-full shadow-lg"
          @error="handleImageError"
        />
        <button
          @click.prevent="handlePlayArtist"
          class="absolute bottom-2 right-2 bg-tiger-500 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
        >
          <IconPlay :size="24" class="text-white" />
        </button>
      </div>
      <h3 class="font-bold text-primary truncate mb-1">{{ artist.name }}</h3>
      <p class="text-sm text-secondary truncate">Artista</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  artist: any
}>()

const { getSongsByArtistId } = useData()
const { playSong } = usePlayer()

const handlePlayArtist = () => {
  const songs = getSongsByArtistId(props.artist.id)
  if (songs.length > 0) {
    playSong(songs[0], songs)
  }
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/covers/default.jpg'
}
</script>
