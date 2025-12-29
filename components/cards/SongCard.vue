<template>
  <!-- Mobile: toda la fila es clickeable -->
  <div
    class="md:hidden flex items-center gap-3 p-2 rounded hover:bg-dark-hover transition-colors group cursor-pointer"
    @click="handlePlay"
  >
    <div class="relative flex-shrink-0">
      <img
        :src="song.cover"
        :alt="song.title"
        class="w-10 h-10 rounded object-cover"
        @error="handleImageError"
      />
    </div>
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-semibold truncate" :class="isCurrentSong ? 'text-tiger-500' : 'text-primary'">
        {{ song.title }}
      </h4>
      <span class="text-xs text-secondary truncate block">
        {{ song.artistName }}
      </span>
    </div>
    <div class="text-xs text-secondary flex-shrink-0">{{ formatTime(song.duration) }}</div>
  </div>

  <!-- Desktop: solo el botón de play reproduce -->
  <div
    class="hidden md:flex items-center gap-4 p-2 rounded hover:bg-dark-hover transition-colors group"
  >
    <div class="relative flex-shrink-0 cursor-pointer" @click="handlePlay">
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
      <NuxtLink
        :to="`/artist/${song.artistId}`"
        class="text-xs text-secondary hover:text-white hover:underline truncate inline-block max-w-full transition-colors"
      >
        {{ song.artistName }}
      </NuxtLink>
    </div>

    <!-- Duración -->
    <div class="text-xs text-secondary flex-shrink-0">{{ formatTime(song.duration) }}</div>

    <!-- Actions Container -->
    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <!-- Add to Playlist Button -->
      <Tooltip text="Añadir a playlist">
        <button
          @click.stop="showAddToPlaylist"
          class="text-secondary hover:text-primary transition-colors"
        >
          <IconPlus :size="18" />
        </button>
      </Tooltip>

      <!-- Favorite Button -->
      <Tooltip :text="isFavoriteSong(song.id) ? 'Quitar de Favoritos' : 'Añadir a Favoritos'">
        <button
          @click.stop="toggleFavoriteSong(song.id)"
          class="text-secondary hover:text-tiger-500 transition-colors"
          :class="{ 'opacity-100 !text-tiger-500': isFavoriteSong(song.id) }"
        >
          <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
        </button>
      </Tooltip>

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
import { formatTime } from '~/utils/formatting'
import { handleImageError } from '~/utils/image'

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

const { playSong, currentSong, isPlaying, togglePlay } = usePlayer()
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
