<template>
  <NuxtLink
    :to="`/artist/${artist.id}`"
    class="group flex flex-col items-center p-4 bg-dark-card hover:bg-dark-hover
           rounded-lg transition-colors duration-200 w-40 md:w-44 flex-shrink-0
           snap-start"
  >
    <!-- Imagen circular -->
    <div class="relative mb-4">
      <img
        :src="artist.image"
        :alt="artist.name"
        class="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover shadow-lg"
      />

      <!-- Botón play -->
      <button
        @click.prevent="handlePlay"
        class="absolute bottom-1 right-1 bg-tiger-500 hover:bg-tiger-400 rounded-full p-3
               shadow-xl opacity-0 group-hover:opacity-100
               transition-opacity duration-200"
        aria-label="Reproducir artista"
      >
        <IconPlay :size="20" class="text-white ml-0.5" />
      </button>
    </div>

    <!-- Info -->
    <h3 class="font-bold text-base truncate w-full text-center">{{ artist.name }}</h3>
    <p class="text-sm text-secondary">Artista</p>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
  artist: {
    type: Object,
    required: true
  }
})

const { playSong } = usePlayer()
const { data } = useData()
const { addToRecent } = useRecentlyPlayed()

const handlePlay = () => {
  const songs = data.value.songs.filter((song: any) => song.artistId === props.artist.id)
  if (songs.length > 0) {
    playSong(songs[0], songs)
    addToRecent({
      type: 'artist',
      id: props.artist.id,
      cover: props.artist.image,
      title: props.artist.name
    })
  }
}
</script>
