<template>
  <div class="min-h-full bg-dark-base">
    <div class="px-8 py-6">
      <!-- Barra de búsqueda -->
      <div class="mb-8">
        <div class="relative max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="¿Qué quieres escuchar?"
            class="w-full bg-white text-black rounded-full py-3 px-12 focus:outline-none focus:ring-2 focus:ring-tiger-500"
            @input="handleSearch"
          />
          <IconSearch class="absolute left-4 top-1/2 -translate-y-1/2 text-black" :size="20" />
        </div>
      </div>

      <!-- Resultados de búsqueda -->
      <div v-if="searchQuery && hasResults">
        <!-- Canciones -->
        <section v-if="results.songs.length > 0" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Canciones</h2>
          <div class="bg-dark-highlight rounded-lg p-4">
            <SongCard
              v-for="song in results.songs.slice(0, 10)"
              :key="song.id"
              :song="song"
              :playlist="results.songs"
            />
          </div>
        </section>

        <!-- Artistas -->
        <section v-if="results.artists.length > 0" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Artistas</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <ArtistCard v-for="artist in results.artists" :key="artist.id" :artist="artist" />
          </div>
        </section>

        <!-- Álbumes -->
        <section v-if="results.albums.length > 0" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Álbumes</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AlbumCard v-for="album in results.albums" :key="album.id" :album="album" />
          </div>
        </section>

        <!-- Playlists -->
        <section v-if="results.playlists.length > 0" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Playlists</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <PlaylistCard v-for="playlist in results.playlists" :key="playlist.id" :playlist="playlist" />
          </div>
        </section>
      </div>

      <!-- Sin resultados -->
      <div v-else-if="searchQuery && !hasResults" class="text-center py-12">
        <p class="text-xl text-secondary">No se encontraron resultados para "{{ searchQuery }}"</p>
      </div>

      <!-- Explorar categorías (cuando no hay búsqueda) -->
      <div v-else>
        <h2 class="text-2xl font-bold mb-4">Explorar todo</h2>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="category in categories"
            :key="category.name"
            class="aspect-square rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
            :style="{ backgroundColor: category.color }"
            @click="handleCategoryClick(category)"
          >
            <h3 class="text-xl font-bold">{{ category.name }}</h3>
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

const { searchAll } = useData()

const searchQuery = ref('')
const results = ref({
  songs: [],
  albums: [],
  artists: [],
  playlists: []
})

const categories = [
  { name: 'Pop', color: '#f97316' },
  { name: 'Hip Hop', color: '#ea580c' },
  { name: 'R&B', color: '#fb923c' },
  { name: 'Rock', color: '#c2410c' },
  { name: 'Reggaeton', color: '#fdba74' },
  { name: 'Electrónica', color: '#9a3412' },
  { name: 'Jazz', color: '#7c2d12' },
  { name: 'Clásica', color: '#fed7aa' }
]

const hasResults = computed(() => {
  return results.value.songs.length > 0 ||
         results.value.albums.length > 0 ||
         results.value.artists.length > 0 ||
         results.value.playlists.length > 0
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    results.value = searchAll(searchQuery.value.trim())
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
  searchQuery.value = category.name
  handleSearch()
}
</script>
