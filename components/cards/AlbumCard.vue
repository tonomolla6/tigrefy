<template>
  <NuxtLink :to="`/album/${album.id}`" class="block">
    <div class="bg-dark-highlight p-4 rounded-lg card-hover group">
      <div class="relative mb-4">
        <img
          :src="album.cover"
          :alt="album.title"
          class="w-full aspect-square object-cover rounded-md shadow-lg"
          @error="handleImageError"
        />
        <button
          @click.prevent="handlePlayAlbum"
          class="absolute bottom-2 right-2 bg-tiger-500 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
        >
          <IconPlay :size="24" class="text-white" />
        </button>
      </div>
      <h3 class="font-bold text-primary truncate mb-1">{{ album.title }}</h3>
      <p class="text-sm text-secondary truncate">{{ album.artistName }}</p>
      <div class="flex items-center gap-2 mt-1">
        <p class="text-xs text-secondary">{{ album.releaseDate?.substring(0, 4) }}</p>
        <span v-if="album.genres && album.genres.length > 0" class="text-xs px-2 py-0.5 bg-tiger-500/20 text-tiger-400 rounded-full">
          {{ album.genres[0] }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  album: any
}>()

const { getSongsByAlbumId } = useData()
const { playSong } = usePlayer()

const handlePlayAlbum = () => {
  const songs = getSongsByAlbumId(props.album.id)
  if (songs.length > 0) {
    playSong(songs[0], songs)
  }
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
