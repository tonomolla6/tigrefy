<template>
  <div class="min-h-full bg-dark-base">
    <div class="px-4 md:px-8 py-4 md:py-6">
      <!-- Barra de búsqueda -->
      <div class="mb-6 md:mb-8">
        <div class="relative max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="¿Qué quieres escuchar?"
            class="w-full bg-white text-black rounded-full py-3 px-12 focus:outline-none focus:ring-2 focus:ring-tiger-500"
            @input="handleSearchInput"
            @focus="showHistory = true"
            @blur="hideHistory"
          />
          <IconSearch class="absolute left-4 top-1/2 -translate-y-1/2 text-black" :size="20" />

          <!-- Historial de búsqueda -->
          <div
            v-if="showHistory && !searchQuery && searchHistory.length > 0"
            class="absolute top-full mt-2 w-full bg-dark-card rounded-lg shadow-lg overflow-hidden z-10"
          >
            <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <span class="text-sm font-semibold">Búsquedas recientes</span>
              <button
                @click="clearAllHistory"
                class="text-xs text-tiger-500 hover:text-tiger-400"
              >
                Limpiar todo
              </button>
            </div>
            <div class="max-h-60 overflow-y-auto">
              <div
                v-for="(item, index) in searchHistory"
                :key="index"
                class="flex items-center justify-between px-4 py-2 hover:bg-dark-hover cursor-pointer group"
                @click="selectHistoryItem(item)"
              >
                <div class="flex items-center gap-3">
                  <IconSearch :size="16" class="text-gray-400" />
                  <span>{{ item }}</span>
                </div>
                <button
                  @click.stop="removeHistoryItem(item)"
                  class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros avanzados -->
        <div class="mt-4">
          <button
            @click="showFilters = !showFilters"
            class="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span>{{ showFilters ? '▼' : '▶' }} Filtros avanzados</span>
            <span v-if="hasActiveFilters" class="bg-tiger-500 text-white text-xs px-2 py-0.5 rounded-full">
              {{ activeFiltersCount }}
            </span>
          </button>

          <div v-if="showFilters" class="mt-4 bg-dark-card rounded-lg p-4 space-y-4">
            <!-- Filtro de géneros -->
            <div>
              <label class="block text-sm font-semibold mb-2">Géneros</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="genre in availableGenres"
                  :key="genre"
                  @click="toggleGenreFilter(genre)"
                  :class="[
                    'px-3 py-1 rounded-full text-sm transition-colors',
                    filters.genres.includes(genre)
                      ? 'bg-tiger-500 text-white'
                      : 'bg-dark-hover text-gray-300 hover:bg-dark-lighter'
                  ]"
                >
                  {{ genre }}
                </button>
              </div>
            </div>

            <!-- Filtro de rango de años -->
            <div>
              <label class="block text-sm font-semibold mb-2">Año de lanzamiento</label>
              <div class="flex items-center gap-4">
                <input
                  v-model.number="filters.yearFrom"
                  type="number"
                  placeholder="Desde"
                  min="1900"
                  :max="currentYear"
                  class="w-24 bg-dark-hover text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tiger-500"
                />
                <span class="text-gray-400">—</span>
                <input
                  v-model.number="filters.yearTo"
                  type="number"
                  placeholder="Hasta"
                  min="1900"
                  :max="currentYear"
                  class="w-24 bg-dark-hover text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tiger-500"
                />
              </div>
            </div>

            <!-- Filtro de duración -->
            <div>
              <label class="block text-sm font-semibold mb-2">Duración</label>
              <div class="flex gap-2">
                <button
                  v-for="duration in durationOptions"
                  :key="duration.value"
                  @click="filters.durationRange = filters.durationRange === duration.value ? undefined : duration.value"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm transition-colors',
                    filters.durationRange === duration.value
                      ? 'bg-tiger-500 text-white'
                      : 'bg-dark-hover text-gray-300 hover:bg-dark-lighter'
                  ]"
                >
                  {{ duration.label }}
                </button>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex gap-2 pt-2">
              <button
                @click="applyFilters"
                class="px-4 py-2 bg-tiger-500 text-white rounded-lg hover:bg-tiger-600 transition-colors text-sm font-semibold"
              >
                Aplicar filtros
              </button>
              <button
                v-if="hasActiveFilters"
                @click="clearFilters"
                class="px-4 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-lighter transition-colors text-sm"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Indicador de búsqueda activa -->
      <div v-if="searchQuery || selectedGenre || hasActiveFilters" class="mb-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div class="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-gray-400">
            <span v-if="searchQuery">Buscando: <strong class="text-white">{{ searchQuery }}</strong></span>
            <span v-if="selectedGenre && !searchQuery">Género: <strong class="text-white">{{ selectedGenre }}</strong></span>
            <span v-if="(searchQuery || selectedGenre) && hasActiveFilters">•</span>
            <span v-if="hasActiveFilters">Con {{ activeFiltersCount }} filtro(s) activo(s)</span>
          </div>
          <button
            v-if="selectedGenre && !searchQuery"
            @click="selectedGenre = ''"
            class="text-xs sm:text-sm text-tiger-500 hover:text-tiger-400 transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            ← Volver a géneros
          </button>
        </div>
      </div>

      <!-- Resultados de búsqueda -->
      <div v-if="(searchQuery || selectedGenre || hasActiveFilters) && hasResults">
        <!-- Canciones -->
        <section v-if="displayResults.songs.length > 0" class="mb-6 md:mb-8">
          <h2 class="text-xl md:text-2xl font-bold mb-3 md:mb-4">Canciones</h2>
          <div class="bg-dark-highlight rounded-lg p-2 md:p-4">
            <SongCard
              v-for="song in displayResults.songs.slice(0, 20)"
              :key="song.id"
              :song="song"
              :playlist="displayResults.songs"
            />
          </div>
        </section>

        <!-- Artistas -->
        <section v-if="displayResults.artists.length > 0" class="mb-6 md:mb-8">
          <h2 class="text-xl md:text-2xl font-bold mb-3 md:mb-4">Artistas</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            <ArtistCard v-for="artist in displayResults.artists" :key="artist.id" :artist="artist" />
          </div>
        </section>

        <!-- Álbumes -->
        <section v-if="displayResults.albums.length > 0" class="mb-6 md:mb-8">
          <h2 class="text-xl md:text-2xl font-bold mb-3 md:mb-4">Álbumes</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            <AlbumCard v-for="album in displayResults.albums" :key="album.id" :album="album" />
          </div>
        </section>

        <!-- Playlists -->
        <section v-if="displayResults.playlists.length > 0" class="mb-6 md:mb-8">
          <h2 class="text-xl md:text-2xl font-bold mb-3 md:mb-4">Playlists</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            <PlaylistCard v-for="playlist in displayResults.playlists" :key="playlist.id" :playlist="playlist" />
          </div>
        </section>
      </div>

      <!-- Sin resultados -->
      <div v-else-if="(searchQuery || selectedGenre || hasActiveFilters) && !hasResults" class="text-center py-12">
        <IconSearch :size="64" class="text-gray-600 mx-auto mb-4" />
        <p class="text-xl text-secondary mb-2">No se encontraron resultados</p>
        <p class="text-sm text-gray-400">
          {{ searchQuery ? `para "${searchQuery}"` : selectedGenre ? `para el género "${selectedGenre}"` : 'con los filtros aplicados' }}
        </p>
        <button
          v-if="hasActiveFilters || selectedGenre"
          @click="selectedGenre ? selectedGenre = '' : clearFilters()"
          class="mt-4 px-4 py-2 bg-tiger-500 text-white rounded-lg hover:bg-tiger-600 transition-colors text-sm"
        >
          {{ selectedGenre ? 'Volver a géneros' : 'Limpiar filtros' }}
        </button>
      </div>

      <!-- Explorar categorías (cuando no hay búsqueda ni filtros) -->
      <div v-else>
        <h2 class="text-xl md:text-2xl font-bold mb-4">Explorar por género</h2>

        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <div
            v-for="category in categories"
            :key="category.name"
            class="aspect-square rounded-lg p-4 md:p-6 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden group flex flex-col justify-between"
            :style="{ backgroundColor: category.color }"
            @click="handleCategoryClick(category)"
          >
            <h3 class="text-lg md:text-2xl font-bold text-white drop-shadow-lg z-10">{{ category.name }}</h3>
            <div class="transform rotate-12 self-end opacity-80">
              <font-awesome-icon :icon="category.icon" class="text-white text-4xl md:text-5xl lg:text-6xl" />
            </div>
            <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { searchAll, searchByGenre, applyAdvancedFilters } = useData()
const { loadHistory, addSearch, getHistory, clearHistory, removeItem } = useSearchHistory()

// Estados
const searchQuery = ref('')
const selectedGenre = ref('')
const results = ref({
  songs: [],
  albums: [],
  artists: [],
  playlists: []
})

const showHistory = ref(false)
const showFilters = ref(false)

const filters = reactive({
  genres: [] as string[],
  yearFrom: undefined as number | undefined,
  yearTo: undefined as number | undefined,
  durationRange: undefined as 'short' | 'medium' | 'long' | undefined
})

// Géneros reales de db.json
const categories = [
  { name: 'Party', color: '#f97316', icon: 'glass-cheers' },
  { name: 'Electronic', color: '#ea580c', icon: 'bolt' },
  { name: 'Urban', color: '#fb923c', icon: 'microphone' },
  { name: 'Festival', color: '#c2410c', icon: 'flag' }
]

const availableGenres = ['Party', 'Electronic', 'Urban', 'Festival']

const durationOptions = [
  { value: 'short' as const, label: 'Cortas (<3min)' },
  { value: 'medium' as const, label: 'Medias (3-5min)' },
  { value: 'long' as const, label: 'Largas (>5min)' }
]

const currentYear = new Date().getFullYear()

// Debouncing
let searchTimeout: NodeJS.Timeout | null = null

// Computeds
const searchHistory = computed(() => getHistory())

const hasResults = computed(() => {
  return displayResults.value.songs.length > 0 ||
         displayResults.value.albums.length > 0 ||
         displayResults.value.artists.length > 0 ||
         displayResults.value.playlists.length > 0
})

const hasActiveFilters = computed(() => {
  return filters.genres.length > 0 ||
         filters.yearFrom !== undefined ||
         filters.yearTo !== undefined ||
         filters.durationRange !== undefined
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.genres.length > 0) count++
  if (filters.yearFrom || filters.yearTo) count++
  if (filters.durationRange) count++
  return count
})

const displayResults = computed(() => {
  if (!hasActiveFilters.value) {
    return results.value
  }
  return applyAdvancedFilters(results.value, filters)
})

// Métodos
const handleSearchInput = () => {
  showHistory.value = false

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    performSearch()
  }, 300) // Debounce de 300ms
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    selectedGenre.value = '' // Limpiar género seleccionado
    results.value = searchAll(searchQuery.value.trim())
    addSearch(searchQuery.value.trim())
  } else {
    results.value = {
      songs: [],
      albums: [],
      artists: [],
      playlists: []
    }
  }
}

const handleCategoryClick = (category: any) => {
  searchQuery.value = ''
  selectedGenre.value = category.name
  results.value = searchByGenre(category.name)
}

const selectHistoryItem = (item: string) => {
  searchQuery.value = item
  selectedGenre.value = '' // Limpiar género seleccionado
  showHistory.value = false
  performSearch()
}

const hideHistory = () => {
  setTimeout(() => {
    showHistory.value = false
  }, 200)
}

const clearAllHistory = () => {
  clearHistory()
}

const removeHistoryItem = (item: string) => {
  removeItem(item)
}

const toggleGenreFilter = (genre: string) => {
  const index = filters.genres.indexOf(genre)
  if (index > -1) {
    filters.genres.splice(index, 1)
  } else {
    filters.genres.push(genre)
  }
}

const applyFilters = () => {
  // Los filtros se aplican automáticamente vía computed displayResults
  // Esta función existe para dar feedback visual al usuario
  if (!searchQuery.value && !hasActiveFilters.value) {
    results.value = {
      songs: [],
      albums: [],
      artists: [],
      playlists: []
    }
  }
}

const clearFilters = () => {
  filters.genres = []
  filters.yearFrom = undefined
  filters.yearTo = undefined
  filters.durationRange = undefined
}

// Lifecycle
onMounted(() => {
  loadHistory()
})
</script>
