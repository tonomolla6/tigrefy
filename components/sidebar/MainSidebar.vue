<template>
  <aside
    class="bg-black flex flex-col h-full hidden md:flex p-2 pt-0 pr-0 gap-2 relative group/sidebar"
    :style="{ width: `${leftSidebarWidth}px` }"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <!-- Tu Biblioteca -->
    <div class="bg-dark rounded-lg flex-1 flex flex-col min-h-0">
      <!-- Header biblioteca -->
      <div class="px-4 pt-4 pb-2 flex items-center" :class="isCollapsed ? 'justify-center px-3' : ''">
        <!-- Contenedor del toggle + título -->
        <div v-if="!isCollapsed" class="flex items-center relative">
          <!-- Botón toggle (aparece desde la izquierda al hacer hover, posición absoluta) -->
          <button
            @click.prevent="toggleLeftSidebar"
            class="absolute -left-1 p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300 ease-out"
            :class="isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'"
            title="Contraer biblioteca"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <!-- Título (se mueve a la derecha al hacer hover) -->
          <span
            class="font-bold text-white text-base whitespace-nowrap transition-all duration-300 ease-out"
            :class="isHovering ? 'translate-x-9' : 'translate-x-0'"
          >Tu biblioteca</span>
        </div>

        <!-- Botón expandir cuando está colapsado -->
        <button
          v-else
          @click="toggleLeftSidebar"
          class="p-1.5 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
          title="Expandir biblioteca"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Filtros (solo si no está colapsado) -->
      <div v-if="!isCollapsed" class="px-4 pb-2 pt-3 flex gap-2 flex-wrap">
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

      <!-- Barra de búsqueda (solo si no está colapsado) -->
      <div v-if="!isCollapsed" class="px-4 pb-3 pt-3">
        <!-- Input de búsqueda estilo Spotify -->
        <div
          class="flex items-center bg-[#242424] hover:bg-[#2a2a2a] rounded px-3 py-2 gap-2 transition-colors"
        >
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar en Tu biblioteca"
            class="search-input bg-transparent text-white text-sm placeholder-gray-400 flex-1 min-w-0"
            ref="searchInput"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="text-gray-400 hover:text-white flex-shrink-0"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Lista de biblioteca -->
      <div class="flex-1 overflow-y-auto custom-scrollbar pt-2" :class="isCollapsed ? 'px-2' : 'px-2'">
        <!-- Skeleton mientras carga -->
        <template v-if="!isLoaded">
          <div
            v-for="i in 8"
            :key="i"
            class="flex items-center gap-3 p-2 rounded-lg mb-0.5"
            :class="isCollapsed ? 'justify-center' : ''"
          >
            <div class="w-12 h-12 rounded bg-white/10 animate-pulse flex-shrink-0 aspect-square"></div>
            <template v-if="!isCollapsed">
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-white/10 rounded animate-pulse" :style="{ width: `${50 + Math.random() * 40}%` }"></div>
                <div class="h-3 w-24 bg-white/10 rounded animate-pulse"></div>
              </div>
            </template>
          </div>
        </template>

        <!-- Contenido real cuando ya cargó -->
        <template v-else>
          <!-- Canciones que te gustan -->
          <div
            v-if="showLikedSongs"
            class="flex items-center gap-3 p-2 rounded-lg transition-colors group cursor-pointer"
            :class="[
              isViewingLikedSongs ? 'bg-white/10' : 'hover:bg-white/10',
              isCollapsed ? 'justify-center' : ''
            ]"
            :title="isCollapsed ? 'Canciones que te gustan' : ''"
            @click="navigateTo('/liked-songs')"
          >
            <div class="relative flex-shrink-0">
              <div class="w-12 h-12 rounded-md bg-gradient-to-br from-indigo-800 to-blue-400 flex items-center justify-center aspect-square">
                <IconHeart :size="18" filled class="text-white" />
              </div>
              <button
                @click.stop="playLikedSongs"
                class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
              >
                <IconPlay :size="28" class="text-white ml-0.5" />
              </button>
            </div>
            <template v-if="!isCollapsed">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-[15px] truncate" :class="isContextLikedSongs ? 'text-tiger-500' : 'text-white'">Canciones que te gustan</p>
                <p class="text-[13px] text-gray-400 truncate">Lista • {{ favoriteSongsCount }} canciones</p>
              </div>
              <svg v-if="isPlayingLikedSongs" class="w-5 h-5 text-tiger-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </template>
          </div>

          <!-- User Playlists -->
          <div
            v-for="playlist in filteredUserPlaylists"
            :key="playlist.id"
            class="flex items-center gap-3 p-2 rounded-lg transition-colors group cursor-pointer"
            :class="[
              isViewingPlaylist(playlist.id) ? 'bg-white/10' : 'hover:bg-white/10',
              isCollapsed ? 'justify-center' : ''
            ]"
            :title="isCollapsed ? playlist.name : ''"
            @click="navigateTo(`/playlist/${playlist.id}`)"
          >
            <div class="relative flex-shrink-0">
              <img
                :src="playlist.cover || '/covers/default-playlist.png'"
                :alt="playlist.name"
                class="w-12 h-12 rounded-md object-cover aspect-square"
              />
              <button
                @click.stop="playUserPlaylist(playlist)"
                class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
              >
                <IconPlay :size="28" class="text-white ml-0.5" />
              </button>
            </div>
            <template v-if="!isCollapsed">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-[15px] truncate" :class="isContextPlaylist(playlist.id) ? 'text-tiger-500' : 'text-white'">{{ playlist.name }}</p>
                <p class="text-[13px] text-gray-400 truncate">Lista • {{ playlist.songIds?.length || 0 }} canciones</p>
              </div>
              <svg v-if="isPlayingPlaylist(playlist.id)" class="w-5 h-5 text-tiger-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </template>
          </div>

          <!-- Favorite Artists -->
          <div
            v-for="artist in filteredFavoriteArtists"
            :key="artist.id"
            class="flex items-center gap-3 p-2 rounded-lg transition-colors group cursor-pointer"
            :class="[
              isViewingArtist(artist.id) ? 'bg-white/10' : 'hover:bg-white/10',
              isCollapsed ? 'justify-center' : ''
            ]"
            :title="isCollapsed ? artist.name : ''"
            @click="navigateTo(`/artist/${artist.id}`)"
          >
            <div class="relative flex-shrink-0">
              <img
                :src="artist.image"
                :alt="artist.name"
                class="w-12 h-12 rounded-full object-cover aspect-square"
              />
              <button
                @click.stop="playArtist(artist)"
                class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              >
                <IconPlay :size="28" class="text-white ml-0.5" />
              </button>
            </div>
            <template v-if="!isCollapsed">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-[15px] truncate" :class="isContextArtist(artist.id) ? 'text-tiger-500' : 'text-white'">{{ artist.name }}</p>
                <p class="text-[13px] text-gray-400 truncate">Artista</p>
              </div>
              <svg v-if="isPlayingArtist(artist.id)" class="w-5 h-5 text-tiger-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </template>
          </div>

          <!-- Playlists guardadas -->
          <div
            v-for="playlist in filteredSavedPlaylists"
            :key="playlist.id"
            class="flex items-center gap-3 p-2 rounded-lg transition-colors group cursor-pointer"
            :class="[
              isViewingPlaylist(playlist.id) ? 'bg-white/10' : 'hover:bg-white/10',
              isCollapsed ? 'justify-center' : ''
            ]"
            :title="isCollapsed ? playlist.name : ''"
            @click="navigateTo(`/playlist/${playlist.id}`)"
          >
            <div class="relative flex-shrink-0">
              <img
                :src="playlist.cover"
                :alt="playlist.name"
                class="w-12 h-12 rounded-md object-cover aspect-square"
              />
              <button
                @click.stop="playSavedPlaylist(playlist)"
                class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
              >
                <IconPlay :size="28" class="text-white ml-0.5" />
              </button>
            </div>
            <template v-if="!isCollapsed">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-[15px] truncate" :class="isContextPlaylist(playlist.id) ? 'text-tiger-500' : 'text-white'">{{ playlist.name }}</p>
                <p class="text-[13px] text-gray-400 truncate">Lista • {{ playlist.songIds?.length || 0 }} canciones</p>
              </div>
              <svg v-if="isPlayingPlaylist(playlist.id)" class="w-5 h-5 text-tiger-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </template>
          </div>

          <!-- Álbumes guardados -->
          <div
            v-for="album in filteredSavedAlbums"
            :key="album.id"
            class="flex items-center gap-3 p-2 rounded-lg transition-colors group cursor-pointer"
            :class="[
              isViewingAlbum(album.id) ? 'bg-white/10' : 'hover:bg-white/10',
              isCollapsed ? 'justify-center' : ''
            ]"
            :title="isCollapsed ? album.title : ''"
            @click="navigateTo(`/album/${album.id}`)"
          >
            <div class="relative flex-shrink-0">
              <img
                :src="album.cover"
                :alt="album.title"
                class="w-12 h-12 rounded-md object-cover aspect-square"
              />
              <button
                @click.stop="playAlbum(album)"
                class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
              >
                <IconPlay :size="28" class="text-white ml-0.5" />
              </button>
            </div>
            <template v-if="!isCollapsed">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-[15px] truncate" :class="isContextAlbum(album.id) ? 'text-tiger-500' : 'text-white'">{{ album.title }}</p>
                <p class="text-[13px] text-gray-400 truncate">Álbum • {{ album.artistName }}</p>
              </div>
              <svg v-if="isPlayingAlbum(album.id)" class="w-5 h-5 text-tiger-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </template>
          </div>
        </template>
      </div>
    </div>

    <!-- Resize handle (siempre visible para poder expandir/contraer arrastrando) -->
    <div
      class="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-white/20 transition-colors z-10"
      @mousedown="startResize"
    ></div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const { data, isLoaded } = useData()
const { userPlaylists } = useUserPlaylists()
const { favoriteSongs, favoriteArtists, savedPlaylistIds, savedAlbumIds } = useFavorites()
const { isPlaying, playbackContext, playSong } = usePlayer()
const { leftSidebarWidth, leftSidebarCollapsed, toggleLeftSidebar, resizeLeftSidebar, resetCollapseThreshold } = useSidebarResize()

const isCollapsed = computed(() => leftSidebarCollapsed.value)
const isHovering = ref(false)

const filterType = ref<'playlist' | 'artist' | 'album' | null>(null)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

// Resize handling
let isResizing = false
let startX = 0

const startResize = (e: MouseEvent) => {
  isResizing = true
  startX = e.clientX
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const onResize = (e: MouseEvent) => {
  if (!isResizing) return
  const delta = e.clientX - startX
  startX = e.clientX
  resizeLeftSidebar(delta)
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  resetCollapseThreshold()
}

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

// Función para filtrar por búsqueda
const matchesSearch = (name: string) => {
  if (!searchQuery.value) return true
  return name.toLowerCase().includes(searchQuery.value.toLowerCase())
}

// Mostrar "Canciones que te gustan" solo si coincide con la búsqueda
const showLikedSongs = computed(() => {
  if (filterType.value !== null) return false
  return matchesSearch('Canciones que te gustan')
})

const filteredUserPlaylists = computed(() => {
  if (filterType.value === 'artist' || filterType.value === 'album') return []
  const playlists = userPlaylists.value || []
  return playlists.filter((p: any) => matchesSearch(p.name))
})

const filteredFavoriteArtists = computed(() => {
  if (filterType.value === 'playlist' || filterType.value === 'album') return []
  const artistsList = data.value?.artists || []
  const favArtistIds = favoriteArtists?.value || []
  return favArtistIds
    .map(id => artistsList.find((a: any) => a.id === id))
    .filter(Boolean)
    .filter((a: any) => matchesSearch(a.name))
})

const filteredSavedPlaylists = computed(() => {
  if (filterType.value === 'artist' || filterType.value === 'album') return []
  const playlistsList = data.value?.playlists || []
  const savedIds = savedPlaylistIds.value || []
  const userPlaylistIds = (userPlaylists.value || []).map((p: any) => p.id)
  return savedIds
    .filter((id: string) => !userPlaylistIds.includes(id))
    .map((id: string) => playlistsList.find((p: any) => p.id === id))
    .filter(Boolean)
    .filter((p: any) => matchesSearch(p.name))
})

const filteredSavedAlbums = computed(() => {
  if (filterType.value === 'playlist' || filterType.value === 'artist') return []
  const albumsList = data.value?.albums || []
  const savedIds = savedAlbumIds.value || []
  return savedIds
    .map((id: string) => albumsList.find((a: any) => a.id === id))
    .filter(Boolean)
    .filter((a: any) => matchesSearch(a.title))
})

// Funciones de reproducción
const playLikedSongs = () => {
  const songsList = data.value?.songs || []
  const likedSongIds = favoriteSongs.value || []
  const songs = likedSongIds
    .map((id: string) => songsList.find((s: any) => s.id === id))
    .filter(Boolean)

  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'liked-songs', id: 'liked-songs' })
  }
}

const playUserPlaylist = (playlist: any) => {
  const songsList = data.value?.songs || []
  const playlistSongIds = playlist.songIds || []
  const songs = playlistSongIds
    .map((id: string) => songsList.find((s: any) => s.id === id))
    .filter(Boolean)

  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'playlist', id: playlist.id })
  }
}

const playSavedPlaylist = (playlist: any) => {
  const songsList = data.value?.songs || []
  const playlistSongIds = playlist.songIds || []
  const songs = playlistSongIds
    .map((id: string) => songsList.find((s: any) => s.id === id))
    .filter(Boolean)

  if (songs.length > 0) {
    playSong(songs[0], songs, { type: 'playlist', id: playlist.id })
  }
}

const playArtist = (artist: any) => {
  const songsList = data.value?.songs || []
  const artistSongs = songsList.filter((s: any) => s.artistId === artist.id)

  if (artistSongs.length > 0) {
    playSong(artistSongs[0], artistSongs, { type: 'artist', id: artist.id })
  }
}

const playAlbum = (album: any) => {
  const songsList = data.value?.songs || []
  const albumSongs = songsList.filter((s: any) => s.albumId === album.id)

  if (albumSongs.length > 0) {
    playSong(albumSongs[0], albumSongs, { type: 'album', id: album.id })
  }
}
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

.custom-scrollbar::-webkit-scrollbar-button {
  display: none;
}

/* Quitar el borde azul del focus en el input de búsqueda */
.search-input {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

.search-input:focus {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

.search-input:focus-visible {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}
</style>
