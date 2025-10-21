<template>
  <div
    class="flex items-center gap-4 p-2 rounded hover:bg-dark-hover transition-colors group cursor-pointer"
    @click="handlePlay"
  >
    <div class="relative">
      <img
        :src="song.cover"
        :alt="song.title"
        class="w-12 h-12 rounded object-cover"
        @error="handleImageError"
      />
      <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
        <IconPlay v-if="!isCurrentAndPlaying" :size="20" class="text-white" />
        <IconPause v-else :size="20" class="text-white" />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-semibold truncate" :class="isCurrentSong ? 'text-tiger-500' : 'text-primary'">
        {{ song.title }}
      </h4>
      <p class="text-xs text-secondary truncate">{{ song.artistName }}</p>
    </div>
    <div class="text-xs text-secondary">{{ formatTime(song.duration) }}</div>
    <button
      @click.stop="toggleFavoriteSong(song.id)"
      class="opacity-0 group-hover:opacity-100 text-secondary hover:text-tiger-500 transition-all"
      :class="{ 'opacity-100 text-tiger-500': isFavoriteSong(song.id) }"
    >
      <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  song: any
  playlist?: any[]
}>()

const { playSong, currentSong, isPlaying, formatTime } = usePlayer()
const { toggleFavoriteSong, isFavoriteSong } = useFavorites()

const isCurrentSong = computed(() => currentSong.value?.id === props.song.id)
const isCurrentAndPlaying = computed(() => isCurrentSong.value && isPlaying.value)

const handlePlay = () => {
  playSong(props.song, props.playlist)
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
