<template>
  <div
    class="flex items-center gap-3 md:gap-4 p-2 rounded hover:bg-dark-hover transition-colors group cursor-pointer"
    @click="handlePlay"
  >
    <div class="relative flex-shrink-0">
      <img
        :src="song.cover"
        :alt="song.title"
        class="w-10 h-10 md:w-12 md:h-12 rounded object-cover"
        @error="handleImageError"
      />
      <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
        <IconPlay v-if="!isCurrentAndPlaying" :size="16" class="text-white md:hidden" />
        <IconPlay v-if="!isCurrentAndPlaying" :size="20" class="text-white hidden md:block" />
        <IconPause v-if="isCurrentAndPlaying" :size="16" class="text-white md:hidden" />
        <IconPause v-if="isCurrentAndPlaying" :size="20" class="text-white hidden md:block" />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-semibold truncate" :class="isCurrentSong ? 'text-tiger-500' : 'text-primary'">
        {{ song.title }}
      </h4>
      <p class="text-xs text-secondary truncate">{{ song.artistName }}</p>
    </div>

    <!-- Duración (visible siempre) -->
    <div class="text-xs text-secondary flex-shrink-0">{{ formatTime(song.duration) }}</div>

    <!-- Actions Container (solo desktop) -->
    <div class="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <!-- Add to Playlist Button -->
      <button
        @click.stop="showAddToPlaylist"
        class="text-secondary hover:text-primary transition-colors"
        title="Añadir a playlist"
      >
        <IconPlus :size="18" />
      </button>

      <!-- Favorite Button -->
      <button
        @click.stop="toggleFavoriteSong(song.id)"
        class="text-secondary hover:text-tiger-500 transition-colors"
        :class="{ 'opacity-100 !text-tiger-500': isFavoriteSong(song.id) }"
      >
        <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
      </button>

      <!-- Context Menu -->
      <SongContextMenu
        :songId="song.id"
        :isFavorite="isFavoriteSong(song.id)"
        :showRemove="showRemoveOption"
        @addToPlaylist="showAddToPlaylist"
        @toggleFavorite="toggleFavoriteSong(song.id)"
        @remove="handleRemoveFromPlaylist"
      />
    </div>
  </div>

  <!-- Add to Playlist Modal -->
  <AddToPlaylistModal
    :isOpen="isAddToPlaylistModalOpen"
    :songId="song.id"
    :songTitle="song.title"
    @close="isAddToPlaylistModalOpen = false"
    @createNew="handleCreateNewPlaylist"
  />
</template>

<script setup lang="ts">
import type { PlaybackContext } from '~/composables/usePlayer'

const props = defineProps<{
  song: any
  playlist?: any[]
  showRemoveOption?: boolean
  playlistId?: string
  context?: PlaybackContext
}>()

const emit = defineEmits<{
  removeFromPlaylist?: [songId: string]
}>()

const { playSong, currentSong, isPlaying, formatTime, togglePlay } = usePlayer()
const { toggleFavoriteSong, isFavoriteSong } = useFavorites()

const isCurrentSong = computed(() => currentSong.value?.id === props.song.id)
const isCurrentAndPlaying = computed(() => isCurrentSong.value && isPlaying.value)

const isAddToPlaylistModalOpen = ref(false)

const handlePlay = () => {
  // Si es la canción actual, toggle play/pause
  if (isCurrentSong.value) {
    togglePlay()
  } else {
    playSong(props.song, props.playlist, props.context)
  }
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

const showAddToPlaylist = () => {
  isAddToPlaylistModalOpen.value = true
}

const handleCreateNewPlaylist = () => {
  // TODO: Implement create playlist modal
  console.log('Create playlist')
}

const handleRemoveFromPlaylist = () => {
  if (props.showRemoveOption && props.playlistId) {
    emit('removeFromPlaylist', props.song.id)
  }
}
</script>
