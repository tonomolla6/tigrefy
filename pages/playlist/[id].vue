<template>
  <div v-if="playlist" class="min-h-full">
    <!-- Header de la playlist -->
    <div class="bg-gradient-to-b from-tiger-600 to-dark-base px-4 md:px-8 py-4 md:py-6 pb-6 md:pb-8">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        <img
          :src="playlist.cover"
          :alt="playlist.name"
          class="w-32 h-32 md:w-48 md:h-48 lg:w-60 lg:h-60 rounded shadow-2xl flex-shrink-0"
          @error="handleImageError"
        />
        <div class="flex-1 text-center md:text-left md:pb-4 w-full">
          <p class="text-xs md:text-sm font-semibold uppercase">Playlist</p>
          <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold my-2 md:my-4 break-words">{{ playlist.name }}</h1>
          <p class="text-secondary mb-2 text-sm md:text-base line-clamp-2 md:line-clamp-none">{{ playlist.description }}</p>
          <div class="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm flex-wrap">
            <span class="font-semibold">Tigrefy</span>
            <span class="text-secondary">•</span>
            <span class="text-secondary">{{ playlistSongs.length }} canciones</span>
            <span v-if="playlistSongs.length > 0" class="text-secondary">•</span>
            <span v-if="playlistSongs.length > 0" class="text-secondary">{{ totalDuration }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y canciones -->
    <div class="bg-dark-base px-4 md:px-8 py-4 md:py-6">
      <div class="flex items-center gap-4 md:gap-8 mb-6 md:mb-8 flex-wrap">
        <button
          v-if="playlistSongs.length > 0"
          @click="handlePlayPlaylist"
          class="bg-tiger-500 hover:bg-tiger-600 text-white rounded-full p-3 md:p-4 transition-all hover:scale-105"
        >
          <IconPlay :size="24" class="md:hidden" />
          <IconPlay :size="28" class="hidden md:block" />
        </button>
        <button
          @click="toggleFavoritePlaylist(playlist.id)"
          class="text-secondary hover:text-tiger-500 transition-colors"
        >
          <IconHeart
            :size="28"
            class="md:hidden"
            :filled="isFavoritePlaylist(playlist.id)"
            :class="{'text-tiger-500': isFavoritePlaylist(playlist.id)}"
          />
          <IconHeart
            :size="32"
            class="hidden md:block"
            :filled="isFavoritePlaylist(playlist.id)"
            :class="{'text-tiger-500': isFavoritePlaylist(playlist.id)}"
          />
        </button>
        <button
          v-if="playlist.isUserCreated"
          @click="handleEditPlaylist"
          class="text-secondary hover:text-primary transition-colors text-xs md:text-sm font-semibold px-3 py-2 md:px-0 md:py-0 border border-gray-700 md:border-0 rounded-full md:rounded-none"
        >
          Editar
        </button>
        <button
          v-if="playlist.isUserCreated"
          @click="handleDeletePlaylist"
          class="text-secondary hover:text-red-500 transition-colors text-xs md:text-sm font-semibold px-3 py-2 md:px-0 md:py-0 border border-gray-700 md:border-0 rounded-full md:rounded-none"
        >
          Eliminar
        </button>
      </div>

      <!-- Lista de canciones -->
      <div v-if="playlistSongs.length > 0" class="mb-8">
        <!-- Header desktop -->
        <div class="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-800 text-secondary text-sm mb-2">
          <div class="col-span-1">#</div>
          <div class="col-span-6">Título</div>
          <div class="col-span-3">Álbum</div>
          <div class="col-span-2">Duración</div>
        </div>

        <!-- Desktop view -->
        <div
          v-for="(song, index) in playlistSongs"
          :key="song.id"
          :draggable="playlist.isUserCreated"
          @dragstart="handleDragStart(index, $event)"
          @dragover="handleDragOver(index, $event)"
          @dragend="handleDragEnd"
          @drop="handleDrop(index)"
          class="hidden md:grid grid-cols-12 gap-4 items-center px-4 py-2 rounded hover:bg-dark-hover transition-colors group"
          :class="{
            'cursor-pointer': !playlist.isUserCreated,
            'cursor-grab active:cursor-grabbing': playlist.isUserCreated,
            'bg-dark-hover border-2 border-tiger-500': draggedIndex === index,
            'border-t-2 border-tiger-500': dropTargetIndex === index && draggedIndex !== index
          }"
          @click="!isDragging && handlePlaySong(song)"
        >
          <div class="col-span-1 text-secondary group-hover:hidden">{{ index + 1 }}</div>
          <div class="col-span-1 hidden group-hover:block">
            <IconPlay v-if="!isCurrentAndPlaying(song)" :size="20" class="text-tiger-500" />
            <IconPause v-else :size="20" class="text-tiger-500" />
          </div>
          <div class="col-span-6 flex items-center gap-3">
            <img
              :src="song.cover"
              :alt="song.title"
              class="w-12 h-12 rounded"
              @error="handleImageError"
            />
            <div class="min-w-0">
              <h4 class="font-semibold truncate" :class="isCurrentSong(song) ? 'text-tiger-500' : 'text-primary'">
                {{ song.title }}
              </h4>
              <p class="text-sm text-secondary truncate">{{ song.artistName }}</p>
            </div>
          </div>
          <div class="col-span-3 text-secondary text-sm truncate">
            {{ song.albumName }}
          </div>
          <div class="col-span-2 flex items-center gap-4 justify-end">
            <button
              @click.stop="toggleFavoriteSong(song.id)"
              class="opacity-0 group-hover:opacity-100 text-secondary hover:text-tiger-500 transition-all"
              :class="{ 'opacity-100 text-tiger-500': isFavoriteSong(song.id) }"
            >
              <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
            </button>
            <button
              v-if="playlist.isUserCreated"
              @click.stop="handleRemoveSong(song.id)"
              class="opacity-0 group-hover:opacity-100 text-secondary hover:text-red-500 transition-all text-xs"
            >
              Quitar
            </button>
            <span class="text-secondary text-sm">{{ formatTime(song.duration) }}</span>
          </div>
        </div>

        <!-- Mobile view -->
        <div
          v-for="(song, index) in playlistSongs"
          :key="`mobile-${song.id}`"
          class="md:hidden flex items-center gap-3 p-3 rounded-lg hover:bg-dark-hover transition-colors group"
          @click="handlePlaySong(song)"
        >
          <div class="relative flex-shrink-0">
            <img
              :src="song.cover"
              :alt="song.title"
              class="w-14 h-14 rounded object-cover"
              @error="handleImageError"
            />
            <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
              <IconPlay v-if="!isCurrentAndPlaying(song)" :size="20" class="text-white" />
              <IconPause v-else :size="20" class="text-white" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold truncate" :class="isCurrentSong(song) ? 'text-tiger-500' : 'text-primary'">
              {{ song.title }}
            </h4>
            <p class="text-xs text-secondary truncate">{{ song.artistName }}</p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              @click.stop="toggleFavoriteSong(song.id)"
              class="text-secondary hover:text-tiger-500 transition-colors"
              :class="{ 'text-tiger-500': isFavoriteSong(song.id) }"
            >
              <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
            </button>
            <button
              v-if="playlist.isUserCreated"
              @click.stop="handleRemoveSong(song.id)"
              class="text-secondary hover:text-red-500 transition-colors"
            >
              <IconClose :size="18" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 max-w-md mx-auto">
        <div class="mb-6">
          <IconLibrary :size="64" class="text-secondary mx-auto opacity-50" />
        </div>
        <h3 class="text-2xl font-bold mb-2">Esta playlist está vacía</h3>
        <p class="text-secondary mb-6">
          Empieza a añadir canciones para crear tu colección perfecta. Busca tus favoritas o explora nuevas canciones.
        </p>
        <div class="flex gap-3 justify-center">
          <NuxtLink to="/search" class="btn-tiger">
            Buscar canciones
          </NuxtLink>
          <NuxtLink to="/albums" class="px-6 py-3 rounded-full font-semibold border border-gray-700 hover:bg-dark-hover transition-colors">
            Explorar álbumes
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Edit Playlist Modal -->
    <EditPlaylistModal
      :isOpen="isEditModalOpen"
      :playlistId="playlistId"
      :currentName="playlist?.name || ''"
      :currentDescription="playlist?.description || ''"
      :currentCover="playlist?.cover || ''"
      @close="isEditModalOpen = false"
      @save="handleSaveEdit"
    />

    <!-- Delete Confirm Modal -->
    <DeleteConfirmModal
      :isOpen="isDeleteModalOpen"
      :title="`¿Eliminar '${playlist?.name}'?`"
      message="Esta playlist será eliminada permanentemente."
      warning="Esta acción no se puede deshacer."
      confirmText="Eliminar playlist"
      @cancel="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />
  </div>

  <div v-else class="min-h-full flex items-center justify-center">
    <p class="text-secondary">Cargando playlist...</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const { data, getPlaylistById, getSongsByIds } = useData()
const { userPlaylists, deletePlaylist, removeSongFromPlaylist, updatePlaylist, reorderPlaylistSongs } = useUserPlaylists()
const { playSong, currentSong, isPlaying, formatTime } = usePlayer()
const { toggleFavoritePlaylist, isFavoritePlaylist, toggleFavoriteSong, isFavoriteSong } = useFavorites()

const playlistId = route.params.id as string
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

// Drag and drop state
const draggedIndex = ref<number | null>(null)
const dropTargetIndex = ref<number | null>(null)
const isDragging = ref(false)

const playlist = computed(() => {
  const systemPlaylist = getPlaylistById(playlistId)
  if (systemPlaylist) return systemPlaylist

  return userPlaylists.value.find(p => p.id === playlistId)
})

const playlistSongs = computed(() => {
  if (!playlist.value) return []
  return getSongsByIds(playlist.value.songIds)
})

const totalDuration = computed(() => {
  const totalSeconds = playlistSongs.value.reduce((acc, song) => acc + (song.duration || 0), 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours} h ${minutes} min`
  }
  return `${minutes} min`
})

const isCurrentSong = (song: any) => currentSong.value?.id === song.id
const isCurrentAndPlaying = (song: any) => isCurrentSong(song) && isPlaying.value

const handlePlayPlaylist = () => {
  if (playlistSongs.value.length > 0) {
    playSong(playlistSongs.value[0], playlistSongs.value)
  }
}

const handlePlaySong = (song: any) => {
  playSong(song, playlistSongs.value)
}

const handleEditPlaylist = () => {
  isEditModalOpen.value = true
}

const handleSaveEdit = (id: string, updates: { name: string; description: string; cover: string }) => {
  updatePlaylist(id, updates)
}

const handleDeletePlaylist = () => {
  isDeleteModalOpen.value = true
}

const handleConfirmDelete = () => {
  deletePlaylist(playlistId)
  router.push('/library')
}

const handleRemoveSong = (songId: string) => {
  removeSongFromPlaylist(playlistId, songId)
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

// Drag and drop handlers
const handleDragStart = (index: number, event: DragEvent) => {
  if (!playlist.value?.isUserCreated) return
  draggedIndex.value = index
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

const handleDragOver = (index: number, event: DragEvent) => {
  if (!playlist.value?.isUserCreated) return
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dropTargetIndex.value = index
}

const handleDragEnd = () => {
  draggedIndex.value = null
  dropTargetIndex.value = null
  isDragging.value = false
}

const handleDrop = (dropIndex: number) => {
  if (!playlist.value?.isUserCreated || draggedIndex.value === null) return

  const dragIndex = draggedIndex.value

  if (dragIndex === dropIndex) {
    handleDragEnd()
    return
  }

  // Reorder the song IDs array
  const newSongIds = [...playlist.value.songIds]
  const [draggedSongId] = newSongIds.splice(dragIndex, 1)
  newSongIds.splice(dropIndex, 0, draggedSongId)

  // Update the playlist
  reorderPlaylistSongs(playlistId, newSongIds)

  handleDragEnd()
}
</script>
