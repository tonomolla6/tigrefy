<template>
  <aside class="w-[340px] bg-black flex flex-col h-full hidden md:flex p-2 pt-0 gap-2">
    <!-- Tu Biblioteca -->
    <div class="bg-dark rounded-lg flex-1 flex flex-col min-h-0">
      <!-- Header biblioteca -->
      <div class="px-4 py-3 flex items-center justify-between">
        <span class="font-bold text-white">Tu biblioteca</span>
      </div>

      <!-- Filtros -->
      <div class="px-3 pb-2 flex gap-2 flex-wrap">
        <button
          @click="filterType = null"
          class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
          :class="filterType === null ? 'bg-white text-black' : 'bg-dark-hover text-white hover:bg-gray-700'"
        >
          Todo
        </button>
        <button
          @click="filterType = 'playlist'"
          class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
          :class="filterType === 'playlist' ? 'bg-white text-black' : 'bg-dark-hover text-white hover:bg-gray-700'"
        >
          Listas
        </button>
        <button
          @click="filterType = 'album'"
          class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
          :class="filterType === 'album' ? 'bg-white text-black' : 'bg-dark-hover text-white hover:bg-gray-700'"
        >
          Álbumes
        </button>
      </div>

      <!-- Lista de biblioteca -->
      <div class="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2">
        <!-- Canciones que te gustan -->
        <NuxtLink
          v-if="filterType === null"
          to="/liked-songs"
          class="flex items-center gap-3 p-2 rounded-md transition-colors group"
          :class="isViewingLikedSongs ? 'bg-white/10' : 'hover:bg-white/5'"
        >
          <div class="w-12 h-12 rounded bg-gradient-to-br from-indigo-800 to-blue-400 flex items-center justify-center flex-shrink-0">
            <IconHeart :size="20" filled class="text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-medium text-[15px] truncate" :class="isContextLikedSongs ? 'text-tiger-500' : 'text-white'">Canciones que te gustan</p>
            <p class="text-[13px] text-gray-400 truncate">Lista • {{ favoriteSongsCount }} canciones</p>
          </div>
          <!-- Icono de altavoz solo cuando está sonando -->
          <svg v-if="isPlayingLikedSongs" class="w-5 h-5 text-tiger-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </NuxtLink>

        <!-- User Playlists -->
        <NuxtLink
          v-for="playlist in filteredUserPlaylists"
          :key="playlist.id"
          :to="`/playlist/${playlist.id}`"
          class="flex items-center gap-3 p-2 rounded-md transition-colors group"
          :class="isViewingPlaylist(playlist.id) ? 'bg-white/10' : 'hover:bg-white/5'"
        >
          <img
            :src="playlist.cover || '/covers/default-playlist.png'"
            :alt="playlist.name"
            class="w-12 h-12 rounded object-cover flex-shrink-0"
          />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-[15px] truncate" :class="isContextPlaylist(playlist.id) ? 'text-tiger-500' : 'text-white'">{{ playlist.name }}</p>
            <p class="text-[13px] text-gray-400 truncate">Lista • {{ playlist.songIds?.length || 0 }} canciones</p>
          </div>
          <svg v-if="isPlayingPlaylist(playlist.id)" class="w-5 h-5 text-tiger-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </NuxtLink>

        <!-- Favorite Artists -->
        <NuxtLink
          v-for="artist in filteredFavoriteArtists"
          :key="artist.id"
          :to="`/artist/${artist.id}`"
          class="flex items-center gap-3 p-2 rounded-md transition-colors group"
          :class="isViewingArtist(artist.id) ? 'bg-white/10' : 'hover:bg-white/5'"
        >
          <img
            :src="artist.image"
            :alt="artist.name"
            class="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-[15px] truncate" :class="isContextArtist(artist.id) ? 'text-tiger-500' : 'text-white'">{{ artist.name }}</p>
            <p class="text-[13px] text-gray-400 truncate">Artista</p>
          </div>
          <svg v-if="isPlayingArtist(artist.id)" class="w-5 h-5 text-tiger-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </NuxtLink>

        <!-- Playlists guardadas -->
        <NuxtLink
          v-for="playlist in filteredSavedPlaylists"
          :key="playlist.id"
          :to="`/playlist/${playlist.id}`"
          class="flex items-center gap-3 p-2 rounded-md transition-colors group"
          :class="isViewingPlaylist(playlist.id) ? 'bg-white/10' : 'hover:bg-white/5'"
        >
          <img
            :src="playlist.cover"
            :alt="playlist.name"
            class="w-12 h-12 rounded object-cover flex-shrink-0"
          />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-[15px] truncate" :class="isContextPlaylist(playlist.id) ? 'text-tiger-500' : 'text-white'">{{ playlist.name }}</p>
            <p class="text-[13px] text-gray-400 truncate">Lista • {{ playlist.songIds?.length || 0 }} canciones</p>
          </div>
          <svg v-if="isPlayingPlaylist(playlist.id)" class="w-5 h-5 text-tiger-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </NuxtLink>

        <!-- Álbumes guardados -->
        <NuxtLink
          v-for="album in filteredSavedAlbums"
          :key="album.id"
          :to="`/album/${album.id}`"
          class="flex items-center gap-3 p-2 rounded-md transition-colors group"
          :class="isViewingAlbum(album.id) ? 'bg-white/10' : 'hover:bg-white/5'"
        >
          <img
            :src="album.cover"
            :alt="album.title"
            class="w-12 h-12 rounded object-cover flex-shrink-0"
          />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-[15px] truncate" :class="isContextAlbum(album.id) ? 'text-tiger-500' : 'text-white'">{{ album.title }}</p>
            <p class="text-[13px] text-gray-400 truncate">Álbum • {{ album.artistName }}</p>
          </div>
          <svg v-if="isPlayingAlbum(album.id)" class="w-5 h-5 text-tiger-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const { data } = useData()
const { userPlaylists } = useUserPlaylists()
const { favoriteSongs, favoriteArtists, savedPlaylistIds, savedAlbumIds } = useFavorites()
const { isPlaying, playbackContext } = usePlayer()

const filterType = ref<'playlist' | 'artist' | 'album' | null>(null)

const favoriteSongsCount = computed(() => favoriteSongs.value?.length || 0)

// Verificar si estamos viendo una página específica (para el fondo)
const isViewingLikedSongs = computed(() => route.path === '/liked-songs')
const isViewingPlaylist = (playlistId: string) => route.path === `/playlist/${playlistId}`
const isViewingAlbum = (albumId: string) => route.path === `/album/${albumId}`
const isViewingArtist = (artistId: string) => route.path === `/artist/${artistId}`

// Verificar si el contexto actual es "Canciones que te gustan" (para texto naranja - sin importar si está pausado)
const isContextLikedSongs = computed(() => {
  return playbackContext.value.type === 'liked-songs'
})

// Verificar si el contexto actual es una playlist específica (para texto naranja)
const isContextPlaylist = (playlistId: string) => {
  return playbackContext.value.type === 'playlist' && playbackContext.value.id === playlistId
}

// Verificar si el contexto actual es un álbum específico (para texto naranja)
const isContextAlbum = (albumId: string) => {
  return playbackContext.value.type === 'album' && playbackContext.value.id === albumId
}

// Verificar si el contexto actual es un artista específico (para texto naranja)
const isContextArtist = (artistId: string) => {
  return playbackContext.value.type === 'artist' && playbackContext.value.id === artistId
}

// Verificar si se está REPRODUCIENDO desde cada contexto (para el altavoz - solo cuando suena)
const isPlayingLikedSongs = computed(() => {
  return isPlaying.value && playbackContext.value.type === 'liked-songs'
})

const isPlayingPlaylist = (playlistId: string) => {
  return isPlaying.value && playbackContext.value.type === 'playlist' && playbackContext.value.id === playlistId
}

const isPlayingAlbum = (albumId: string) => {
  return isPlaying.value && playbackContext.value.type === 'album' && playbackContext.value.id === albumId
}

const isPlayingArtist = (artistId: string) => {
  return isPlaying.value && playbackContext.value.type === 'artist' && playbackContext.value.id === artistId
}

const filteredUserPlaylists = computed(() => {
  if (filterType.value === 'artist' || filterType.value === 'album') return []
  return userPlaylists.value || []
})

const filteredFavoriteArtists = computed(() => {
  if (filterType.value === 'playlist' || filterType.value === 'album') return []
  const artistsList = data.value?.artists || []
  const favArtistIds = favoriteArtists?.value || []
  return favArtistIds.map(id => artistsList.find((a: any) => a.id === id)).filter(Boolean)
})

const filteredSavedPlaylists = computed(() => {
  if (filterType.value === 'artist' || filterType.value === 'album') return []
  const playlistsList = data.value?.playlists || []
  const savedIds = savedPlaylistIds.value || []
  // Excluir las playlists que ya están en userPlaylists (evitar duplicados)
  const userPlaylistIds = (userPlaylists.value || []).map((p: any) => p.id)
  return savedIds
    .filter((id: string) => !userPlaylistIds.includes(id))
    .map((id: string) => playlistsList.find((p: any) => p.id === id))
    .filter(Boolean)
})

const filteredSavedAlbums = computed(() => {
  if (filterType.value === 'playlist' || filterType.value === 'artist') return []
  const albumsList = data.value?.albums || []
  const savedIds = savedAlbumIds.value || []
  return savedIds
    .map((id: string) => albumsList.find((a: any) => a.id === id))
    .filter(Boolean)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
}
</style>
