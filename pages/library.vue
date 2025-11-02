<template>
  <div class="min-h-full bg-dark-base">
    <div class="px-8 py-6">
      <h1 class="text-4xl font-bold mb-8">Tu biblioteca</h1>

      <!-- Pestañas -->
      <div class="flex gap-2 mb-6 border-b border-gray-800">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-2 font-semibold transition-colors border-b-2"
          :class="activeTab === tab.id ? 'text-tiger-500 border-tiger-500' : 'text-secondary border-transparent hover:text-primary'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Contenido de playlists -->
      <div v-if="activeTab === 'playlists'">
        <div v-if="allPlaylists.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <PlaylistCard v-for="playlist in allPlaylists" :key="playlist.id" :playlist="playlist" />
          <div
            @click="isCreateModalOpen = true"
            class="bg-dark-highlight p-4 rounded-lg cursor-pointer hover:bg-dark-press transition-colors flex flex-col items-center justify-center aspect-square"
          >
            <IconPlus :size="48" class="text-secondary mb-2" />
            <p class="font-semibold">Crear playlist</p>
          </div>
        </div>
        <div v-else class="text-center py-16 max-w-md mx-auto">
          <div class="mb-6">
            <IconLibrary :size="64" class="text-secondary mx-auto opacity-50" />
          </div>
          <h3 class="text-2xl font-bold mb-2">Crea tu primera playlist</h3>
          <p class="text-secondary mb-6">
            Las playlists te permiten organizar tus canciones favoritas como tú quieras. Crea una ahora y empieza a añadir música.
          </p>
          <button @click="isCreateModalOpen = true" class="btn-tiger">
            Crear playlist
          </button>
        </div>
      </div>

      <!-- Contenido de álbumes favoritos -->
      <div v-if="activeTab === 'albums'">
        <div v-if="favoriteAlbumsList.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AlbumCard v-for="album in favoriteAlbumsList" :key="album.id" :album="album" />
        </div>
        <div v-else class="text-center py-12">
          <p class="text-secondary mb-4">No tienes álbumes favoritos aún</p>
          <NuxtLink to="/" class="btn-tiger">
            Explorar álbumes
          </NuxtLink>
        </div>
      </div>

      <!-- Contenido de artistas favoritos -->
      <div v-if="activeTab === 'artists'">
        <div v-if="favoriteArtistsList.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <ArtistCard v-for="artist in favoriteArtistsList" :key="artist.id" :artist="artist" />
        </div>
        <div v-else class="text-center py-12">
          <p class="text-secondary mb-4">No tienes artistas favoritos aún</p>
          <NuxtLink to="/" class="btn-tiger">
            Explorar artistas
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Create Playlist Modal -->
    <CreatePlaylistModal
      :isOpen="isCreateModalOpen"
      @close="isCreateModalOpen = false"
      @create="handleCreatePlaylist"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { data, getAlbumById, getArtistById } = useData()
const { userPlaylists, createPlaylist } = useUserPlaylists()
const { favoriteAlbums, favoriteArtists } = useFavorites()

const activeTab = ref('playlists')
const isCreateModalOpen = ref(false)

const tabs = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'albums', label: 'Álbumes' },
  { id: 'artists', label: 'Artistas' }
]

const allPlaylists = computed(() => {
  return [...data.value.playlists, ...userPlaylists.value]
})

const favoriteAlbumsList = computed(() => {
  return favoriteAlbums.value.map(id => getAlbumById(id)).filter(Boolean)
})

const favoriteArtistsList = computed(() => {
  return favoriteArtists.value.map(id => getArtistById(id)).filter(Boolean)
})

const handleCreatePlaylist = (name: string, description: string, cover: string) => {
  const newPlaylist = createPlaylist(name, description, cover)
  navigateTo(`/playlist/${newPlaylist.id}`)
}
</script>
