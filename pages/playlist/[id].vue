<template>
  <div v-if="playlist" class="min-h-full">
    <!-- Header de la playlist -->
    <div class="bg-gradient-to-b from-tiger-600 to-dark-base px-8 py-6 pb-8">
      <div class="flex items-end gap-6">
        <img
          :src="playlist.cover"
          :alt="playlist.name"
          class="w-60 h-60 rounded shadow-2xl"
          @error="handleImageError"
        />
        <div class="flex-1 pb-4">
          <p class="text-sm font-semibold uppercase">Playlist</p>
          <h1 class="text-6xl font-bold my-4">{{ playlist.name }}</h1>
          <p class="text-secondary mb-2">{{ playlist.description }}</p>
          <div class="flex items-center gap-2 text-sm">
            <span class="font-semibold">Tigrefy</span>
            <span class="text-secondary">•</span>
            <span class="text-secondary">{{ playlistSongs.length }} canciones</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y canciones -->
    <div class="bg-dark-base px-8 py-6">
      <div class="flex items-center gap-8 mb-8">
        <button
          v-if="playlistSongs.length > 0"
          @click="handlePlayPlaylist"
          class="bg-tiger-500 hover:bg-tiger-600 text-white rounded-full p-4 transition-all hover:scale-105"
        >
          <IconPlay :size="28" />
        </button>
        <button
          @click="toggleFavoritePlaylist(playlist.id)"
          class="text-secondary hover:text-tiger-500 transition-colors"
        >
          <IconHeart
            :size="32"
            :filled="isFavoritePlaylist(playlist.id)"
            :class="{'text-tiger-500': isFavoritePlaylist(playlist.id)}"
          />
        </button>
        <button
          v-if="playlist.isUserCreated"
          @click="handleEditPlaylist"
          class="text-secondary hover:text-primary transition-colors text-sm font-semibold"
        >
          Editar
        </button>
        <button
          v-if="playlist.isUserCreated"
          @click="handleDeletePlaylist"
          class="text-secondary hover:text-red-500 transition-colors text-sm font-semibold"
        >
          Eliminar
        </button>
      </div>

      <!-- Lista de canciones -->
      <div v-if="playlistSongs.length > 0" class="mb-8">
        <div class="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-800 text-secondary text-sm mb-2">
          <div class="col-span-1">#</div>
          <div class="col-span-6">Título</div>
          <div class="col-span-3">Álbum</div>
          <div class="col-span-2">Duración</div>
        </div>
        <div
          v-for="(song, index) in playlistSongs"
          :key="song.id"
          class="grid grid-cols-12 gap-4 items-center px-4 py-2 rounded hover:bg-dark-hover transition-colors group cursor-pointer"
          @click="handlePlaySong(song)"
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
            <div>
              <h4 class="font-semibold" :class="isCurrentSong(song) ? 'text-tiger-500' : 'text-primary'">
                {{ song.title }}
              </h4>
              <p class="text-sm text-secondary">{{ song.artistName }}</p>
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
      </div>

      <div v-else class="text-center py-12">
        <p class="text-secondary mb-4">Esta playlist está vacía</p>
        <NuxtLink to="/search" class="btn-tiger">
          Buscar canciones
        </NuxtLink>
      </div>
    </div>
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
const { userPlaylists, deletePlaylist, removeSongFromPlaylist, updatePlaylist } = useUserPlaylists()
const { playSong, currentSong, isPlaying, formatTime } = usePlayer()
const { toggleFavoritePlaylist, isFavoritePlaylist, toggleFavoriteSong, isFavoriteSong } = useFavorites()

const playlistId = route.params.id as string

const playlist = computed(() => {
  const systemPlaylist = getPlaylistById(playlistId)
  if (systemPlaylist) return systemPlaylist

  return userPlaylists.value.find(p => p.id === playlistId)
})

const playlistSongs = computed(() => {
  if (!playlist.value) return []
  return getSongsByIds(playlist.value.songIds)
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
  const newName = prompt('Nuevo nombre de la playlist:', playlist.value?.name)
  if (newName) {
    const newDescription = prompt('Nueva descripción:', playlist.value?.description)
    updatePlaylist(playlistId, {
      name: newName,
      description: newDescription || playlist.value?.description
    })
  }
}

const handleDeletePlaylist = () => {
  if (confirm(`¿Estás seguro de que quieres eliminar "${playlist.value?.name}"?`)) {
    deletePlaylist(playlistId)
    router.push('/library')
  }
}

const handleRemoveSong = (songId: string) => {
  removeSongFromPlaylist(playlistId, songId)
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
