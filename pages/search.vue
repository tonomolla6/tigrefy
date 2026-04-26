<template>
  <div class="min-h-full bg-dark-base pb-20 md:pb-0">
    <!-- Mobile Header con perfil y barra de búsqueda -->
    <div class="md:hidden sticky top-0 z-20 bg-dark-base">
      <MobileHeader title="Buscar" />
      <div class="px-4 pb-2">
        <SearchBar />
      </div>
    </div>

    <div class="px-4 md:px-8 py-4 md:py-6">
      <!-- Filtros por tipo (tabs como Spotify) -->
      <div v-if="searchQuery" class="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <FilterButton
          v-for="tab in tabs"
          :key="tab.value"
          :active="activeTab === tab.value"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </FilterButton>
      </div>

      <!-- Resultados de búsqueda -->
      <div v-if="searchQuery && hasResults">
        <!-- Vista "Todo" -->
        <div v-if="activeTab === 'all'" class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          <!-- Columna izquierda: Resultado principal -->
          <div v-if="topResult">
            <h2 class="text-2xl font-bold mb-4">Resultado principal</h2>
            <div
              class="bg-dark-card hover:bg-dark-hover p-5 rounded-lg cursor-pointer transition-colors group relative"
              @click="goToResult(topResult)"
            >
              <SecureImage
                :src="topResult.image || topResult.cover"
                :alt="topResult.name || topResult.title"
                class="w-24 h-24 md:w-28 md:h-28 rounded-full mb-4 shadow-lg"
                :class="{ 'rounded-lg': topResult.type !== 'artist' }"
              />
              <h3 class="text-3xl font-bold mb-2">{{ topResult.name || topResult.title }}</h3>
              <p class="text-gray-400">
                <span class="bg-dark-hover px-3 py-1 rounded-full text-xs font-medium capitalize">
                  {{ topResult.type === 'artist' ? 'Artista' : topResult.type === 'album' ? 'Álbum' : 'Canción' }}
                </span>
                <span v-if="topResult.artistName" class="ml-2">{{ topResult.artistName }}</span>
              </p>
              <!-- Botón play flotante -->
              <button
                v-if="topResult.type === 'artist' || topResult.type === 'song'"
                @click.stop="playTopResult"
                class="absolute bottom-5 right-5 bg-tiger-500 hover:bg-tiger-600 hover:scale-105 text-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
              >
                <IconPlay :size="24" />
              </button>
            </div>
          </div>

          <!-- Columna derecha: Canciones -->
          <div v-if="results.songs.length > 0">
            <h2 class="text-2xl font-bold mb-4">Canciones</h2>
            <div class="space-y-1">
              <div
                v-for="song in results.songs.slice(0, 4)"
                :key="song.id"
                class="flex items-center gap-3 p-2 rounded-md hover:bg-dark-card cursor-pointer group"
                @click="handlePlaySong(song)"
              >
                <SecureImage
                  :src="song.cover"
                  :alt="song.title"
                  class="w-10 h-10 rounded flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="text-white font-medium truncate" :class="{ 'text-tiger-500': isCurrentSong(song) }">
                    {{ song.title }}
                  </h4>
                  <NuxtLink
                    :to="`/artist/${song.artistId}`"
                    @click.stop
                    class="text-gray-400 text-sm truncate block hover:text-white hover:underline transition-colors"
                  >
                    {{ song.artistName }}
                  </NuxtLink>
                </div>
                <span class="text-gray-400 text-sm">{{ formatTime(song.duration) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección Artistas (vista Todo) -->
        <section v-if="activeTab === 'all' && results.artists.length > 0" class="mt-8">
          <h2 class="text-2xl font-bold mb-4">Artistas</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <div
              v-for="artist in results.artists.slice(0, 6)"
              :key="artist.id"
              class="bg-dark-card hover:bg-dark-hover p-4 rounded-lg cursor-pointer transition-colors text-center"
              @click="goToArtist(artist.id)"
            >
              <SecureImage
                :src="artist.image"
                :alt="artist.name"
                class="w-full aspect-square rounded-full mb-4"
              />
              <p class="text-white font-medium truncate">{{ artist.name }}</p>
              <p class="text-gray-400 text-sm">Artista</p>
            </div>
          </div>
        </section>

        <!-- Sección Álbumes (vista Todo) -->
        <section v-if="activeTab === 'all' && results.albums.length > 0" class="mt-8">
          <h2 class="text-2xl font-bold mb-4">Álbumes</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AlbumCard v-for="album in results.albums.slice(0, 6)" :key="album.id" :album="album" />
          </div>
        </section>

        <!-- Sección Playlists (vista Todo) -->
        <section v-if="activeTab === 'all' && results.playlists.length > 0" class="mt-8">
          <h2 class="text-2xl font-bold mb-4">Playlists</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <PlaylistCard v-for="playlist in results.playlists.slice(0, 6)" :key="playlist.id" :playlist="playlist" />
          </div>
        </section>

        <!-- Vista solo Canciones -->
        <div v-if="activeTab === 'songs'" class="space-y-1">
          <div
            v-for="song in results.songs"
            :key="song.id"
            class="flex items-center gap-3 p-2 rounded-md hover:bg-dark-card cursor-pointer group"
            @click="handlePlaySong(song)"
          >
            <SecureImage
              :src="song.cover"
              :alt="song.title"
              class="w-12 h-12 rounded flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <h4 class="text-white font-medium truncate" :class="{ 'text-tiger-500': isCurrentSong(song) }">
                {{ song.title }}
              </h4>
              <NuxtLink
                :to="`/artist/${song.artistId}`"
                @click.stop
                class="text-gray-400 text-sm truncate block hover:text-white hover:underline transition-colors"
              >
                {{ song.artistName }}
              </NuxtLink>
            </div>
            <NuxtLink
              :to="`/album/${song.albumId}`"
              @click.stop
              class="text-gray-400 text-sm hover:text-white hover:underline truncate max-w-[200px] hidden md:block"
            >
              {{ song.albumName }}
            </NuxtLink>
            <button
              @click.stop="toggleFavoriteSong(song.id)"
              class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-tiger-500 transition-all"
              :class="{ 'opacity-100 text-tiger-500': isFavoriteSong(song.id) }"
            >
              <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
            </button>
            <span class="text-gray-400 text-sm w-12 text-right">{{ formatTime(song.duration) }}</span>
          </div>
        </div>

        <!-- Vista solo Artistas -->
        <div v-if="activeTab === 'artists'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <div
            v-for="artist in results.artists"
            :key="artist.id"
            class="bg-dark-card hover:bg-dark-hover p-4 rounded-lg cursor-pointer transition-colors text-center"
            @click="goToArtist(artist.id)"
          >
            <SecureImage
              :src="artist.image"
              :alt="artist.name"
              class="w-full aspect-square rounded-full mb-4"
            />
            <p class="text-white font-medium truncate">{{ artist.name }}</p>
            <p class="text-gray-400 text-sm">Artista</p>
          </div>
        </div>

        <!-- Vista solo Álbumes -->
        <div v-if="activeTab === 'albums'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AlbumCard v-for="album in results.albums" :key="album.id" :album="album" />
        </div>

        <!-- Vista solo Playlists -->
        <div v-if="activeTab === 'playlists'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <PlaylistCard v-for="playlist in results.playlists" :key="playlist.id" :playlist="playlist" />
        </div>
      </div>

      <!-- Sin resultados -->
      <div v-else-if="searchQuery && !hasResults && !isSearching" class="text-center py-16">
        <IconSearch :size="64" class="text-gray-600 mx-auto mb-4" />
        <p class="text-xl text-white mb-2">No se encontraron resultados para "{{ searchQuery }}"</p>
        <p class="text-gray-400">
          Comprueba que no haya errores o intenta buscar con otras palabras.
        </p>
      </div>

      <!-- Buscando... -->
      <div v-else-if="isSearching" class="text-center py-16">
        <div class="animate-spin w-8 h-8 border-2 border-tiger-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-400">Buscando...</p>
      </div>

      <!-- Estado inicial: Explorar por género -->
      <div v-else>
        <!-- Búsquedas recientes -->
        <section v-if="searchHistory.length > 0" class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold">Búsquedas recientes</h2>
            <button
              @click="clearAllHistory"
              class="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Borrar todo
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="item in searchHistory.slice(0, 8)"
              :key="item"
              class="flex items-center gap-2 bg-dark-card hover:bg-dark-hover px-4 py-2 rounded-full cursor-pointer group transition-colors"
              @click="selectHistoryItem(item)"
            >
              <IconClock :size="16" class="text-gray-400" />
              <span class="text-white">{{ item }}</span>
              <button
                @click.stop="removeHistoryItem(item)"
                aria-label="Quitar de historial"
                class="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IconClose :size="16" />
              </button>
            </div>
          </div>
        </section>

        <!-- Explorar por género -->
        <section>
          <h2 class="text-2xl font-bold mb-4">Explorar todo</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              v-for="category in categories"
              :key="category.name"
              class="aspect-[1.5] rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden group"
              :style="{ backgroundColor: category.color }"
              @click="handleCategoryClick(category)"
            >
              <h3 class="text-xl md:text-2xl font-bold text-white drop-shadow-lg z-10 relative">{{ category.name }}</h3>
              <div class="absolute bottom-2 right-2 transform rotate-12 opacity-80">
                <font-awesome-icon :icon="category.icon" class="text-white text-3xl md:text-4xl" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { searchAll, searchByGenre, getSongsByArtistId } = useData()
const { playSong, currentSong, formatTime, togglePlay, isPlaying } = usePlayer()
const { toggleFavoriteSong, isFavoriteSong } = useFavorites()
const { loadHistory, addSearch, getHistory, clearHistory, removeItem } = useSearchHistory()

// Estados
const searchQuery = ref('')
const activeTab = ref('all')
const isSearching = ref(false)
const results = ref<{
  songs: any[]
  albums: any[]
  artists: any[]
  playlists: any[]
}>({
  songs: [],
  albums: [],
  artists: [],
  playlists: []
})

const tabs = [
  { value: 'all', label: 'Todo' },
  { value: 'songs', label: 'Canciones' },
  { value: 'artists', label: 'Artistas' },
  { value: 'albums', label: 'Álbumes' },
  { value: 'playlists', label: 'Listas' }
]

const categories = [
  { name: 'Party', color: '#e91e63', icon: 'glass-cheers' },
  { name: 'Electronic', color: '#9c27b0', icon: 'bolt' },
  { name: 'Urban', color: '#673ab7', icon: 'microphone' },
  { name: 'Festival', color: '#3f51b5', icon: 'flag' },
  { name: 'Pop', color: '#2196f3', icon: 'music' },
  { name: 'Reggaeton', color: '#00bcd4', icon: 'drum' },
  { name: 'Hip Hop', color: '#009688', icon: 'headphones' },
  { name: 'Rock', color: '#4caf50', icon: 'guitar' }
]

// Computeds
const searchHistory = computed(() => getHistory())

const hasResults = computed(() => {
  return results.value.songs.length > 0 ||
    results.value.albums.length > 0 ||
    results.value.artists.length > 0 ||
    results.value.playlists.length > 0
})

const topResult = computed(() => {
  // Priorizar artista, luego canción (si coincide exactamente), luego álbum
  if (results.value.artists.length > 0) {
    return { ...results.value.artists[0], type: 'artist' }
  }
  if (results.value.songs.length > 0) {
    return { ...results.value.songs[0], type: 'song' }
  }
  if (results.value.albums.length > 0) {
    return { ...results.value.albums[0], type: 'album' }
  }
  return null
})

const isCurrentSong = (song: any) => currentSong.value?.id === song.id

// Métodos
const performSearch = () => {
  if (!searchQuery.value.trim()) {
    results.value = { songs: [], albums: [], artists: [], playlists: [] }
    return
  }

  isSearching.value = true
  activeTab.value = 'all'

  // Pequeño delay para mostrar el loading
  setTimeout(() => {
    results.value = searchAll(searchQuery.value.trim())
    addSearch(searchQuery.value.trim())
    isSearching.value = false
  }, 100)
}

const handlePlaySong = (song: any) => {
  if (isCurrentSong(song)) {
    togglePlay()
  } else {
    playSong(song, results.value.songs, { type: 'search' })
  }
}

const playTopResult = () => {
  if (!topResult.value) return

  if (topResult.value.type === 'song') {
    handlePlaySong(topResult.value)
  } else if (topResult.value.type === 'artist') {
    // Reproducir canciones del artista
    const artistSongs = getSongsByArtistId(topResult.value.id)
    if (artistSongs.length > 0) {
      playSong(artistSongs[0], artistSongs, { type: 'artist', id: topResult.value.id })
    }
  }
}

const goToResult = (result: any) => {
  if (result.type === 'artist') {
    router.push(`/artist/${result.id}`)
  } else if (result.type === 'album') {
    router.push(`/album/${result.id}`)
  } else if (result.type === 'song') {
    router.push(`/album/${result.albumId}`)
  }
}

const goToArtist = (id: string) => {
  router.push(`/artist/${id}`)
}

const handleCategoryClick = (category: any) => {
  searchQuery.value = category.name
  router.push({
    path: '/search',
    query: { q: category.name }
  })
}

const selectHistoryItem = (item: string) => {
  router.push({
    path: '/search',
    query: { q: item }
  })
}

const clearAllHistory = () => {
  clearHistory()
}

const removeHistoryItem = (item: string) => {
  removeItem(item)
}

// Watchers para sincronizar con la URL
watch(() => route.query.q, (newQuery) => {
  const query = (newQuery as string) || ''
  if (query !== searchQuery.value) {
    searchQuery.value = query
    if (query) {
      performSearch()
    } else {
      results.value = { songs: [], albums: [], artists: [], playlists: [] }
    }
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadHistory()
})
</script>
