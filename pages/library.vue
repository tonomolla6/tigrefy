<template>
  <div class="min-h-screen bg-dark-base pb-20 md:pb-0">
    <!-- Mobile Header con perfil + pills de filtro -->
    <MobileHeader title="Tu biblioteca">
      <template #below>
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
          <FilterButton :active="filterType === null" @click="filterType = null">Todo</FilterButton>
          <FilterButton :active="filterType === 'playlist'" @click="filterType = 'playlist'">Playlists</FilterButton>
          <FilterButton :active="filterType === 'album'" @click="filterType = 'album'">Álbumes</FilterButton>
          <FilterButton :active="filterType === 'artist'" @click="filterType = 'artist'">Artistas</FilterButton>
        </div>
      </template>
    </MobileHeader>


    <!-- Sort Menu Dropdown -->
    <Teleport to="body">
      <div
        v-if="showSortMenu"
        class="fixed inset-0 z-50"
        @click="showSortMenu = false"
      >
        <div class="absolute inset-0 bg-black/60" />
        <div
          class="absolute top-20 right-4 bg-dark-card rounded-lg shadow-xl py-2 min-w-[180px]"
          @click.stop
        >
          <button
            v-for="option in sortOptions"
            :key="option.value"
            @click="selectSort(option.value)"
            class="w-full px-4 py-3 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between"
            :class="sortBy === option.value ? 'text-tiger-500' : 'text-white'"
          >
            {{ option.label }}
            <svg v-if="sortBy === option.value" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Lista de biblioteca -->
    <div class="px-4 pb-32">
      <!-- Estado vacío -->
      <EmptyState
        v-if="libraryItems.length === 0"
        :icon="IconLibrary"
        title="Tu biblioteca está vacía"
        :description="emptyMessage"
        icon-background
      >
        <NuxtLink
          to="/search"
          class="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
        >
          Explorar música
        </NuxtLink>
      </EmptyState>

      <!-- Lista de items -->
      <div v-else class="space-y-1">
        <!-- Canciones que te gustan (siempre primero si no hay filtro) -->
        <NuxtLink
          v-if="filterType === null || filterType === 'playlist'"
          to="/liked-songs"
          class="flex items-center gap-3 p-3 rounded-lg transition-colors"
          :class="isViewingLikedSongs ? 'bg-white/10' : 'hover:bg-white/5 active:bg-white/10'"
        >
          <div class="w-14 h-14 rounded bg-gradient-to-br from-indigo-800 to-blue-400 flex items-center justify-center flex-shrink-0">
            <IconHeart :size="24" filled class="text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-base truncate" :class="isContextLikedSongs ? 'text-tiger-500' : 'text-white'">
              Canciones que te gustan
            </p>
            <p class="text-sm text-gray-400 truncate flex items-center gap-1">
              <svg v-if="isPlayingLikedSongs" class="w-3 h-3 text-tiger-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
              Playlist · {{ favoriteSongsCount }} canciones
            </p>
          </div>
        </NuxtLink>

        <!-- Items de biblioteca -->
        <component
          v-for="item in libraryItems"
          :key="item.id"
          :is="NuxtLink"
          :to="item.route"
          class="flex items-center gap-3 p-3 rounded-lg transition-colors"
          :class="item.isViewing ? 'bg-white/10' : 'hover:bg-white/5 active:bg-white/10'"
        >
          <SecureImage
            :src="item.image"
            :alt="item.name"
            class="w-14 h-14 flex-shrink-0"
            :class="item.type === 'artist' ? 'rounded-full' : 'rounded'"
          />
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-base truncate" :class="item.isContext ? 'text-tiger-500' : 'text-white'">
              {{ item.name }}
            </p>
            <p class="text-sm text-gray-400 truncate flex items-center gap-1">
              <svg v-if="item.isPlaying" class="w-3 h-3 text-tiger-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
              {{ item.subtitle }}
            </p>
          </div>
        </component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconLibrary from '~/components/ui/IconLibrary.vue'

definePageMeta({
  middleware: 'auth'
})

const NuxtLink = resolveComponent('NuxtLink')
const route = useRoute()
const { data } = useData()
const { userPlaylists } = useUserPlaylists()
const { favoriteSongs, favoriteArtists, savedPlaylistIds, savedAlbumIds } = useFavorites()
const { isPlaying, playbackContext } = usePlayer()

const filterType = ref<'playlist' | 'artist' | 'album' | null>(null)
const sortBy = ref<'recent' | 'alphabetical' | 'creator'>('recent')
const showSortMenu = ref(false)

const sortOptions = [
  { value: 'recent' as const, label: 'Recientes' },
  { value: 'alphabetical' as const, label: 'Alfabético' },
  { value: 'creator' as const, label: 'Creador' }
]

const sortLabel = computed(() => {
  return sortOptions.find(o => o.value === sortBy.value)?.label || 'Ordenar'
})

const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value
}

const selectSort = (value: 'recent' | 'alphabetical' | 'creator') => {
  sortBy.value = value
  showSortMenu.value = false
}

const favoriteSongsCount = computed(() => favoriteSongs.value?.length || 0)

// Verificar estados de reproducción y contexto
const isViewingLikedSongs = computed(() => route.path === '/liked-songs')
const isContextLikedSongs = computed(() => playbackContext.value.type === 'liked-songs')
const isPlayingLikedSongs = computed(() => isPlaying.value && playbackContext.value.type === 'liked-songs')

const emptyMessage = computed(() => {
  if (filterType.value === 'playlist') return 'Guarda playlists para verlas aquí'
  if (filterType.value === 'album') return 'Guarda álbumes para verlos aquí'
  if (filterType.value === 'artist') return 'Sigue artistas para verlos aquí'
  return 'Guarda música para verla aquí'
})

interface LibraryItem {
  id: string
  type: 'playlist' | 'album' | 'artist'
  name: string
  subtitle: string
  image: string
  route: string
  isViewing: boolean
  isContext: boolean
  isPlaying: boolean
  sortKey: string
  creator?: string
}

const libraryItems = computed<LibraryItem[]>(() => {
  const items: LibraryItem[] = []

  // User Playlists
  if (filterType.value === null || filterType.value === 'playlist') {
    for (const playlist of userPlaylists.value || []) {
      items.push({
        id: playlist.id,
        type: 'playlist',
        name: playlist.name,
        subtitle: `Playlist · ${playlist.songIds?.length || 0} canciones`,
        image: playlist.cover,
        route: `/playlist/${playlist.id}`,
        isViewing: route.path === `/playlist/${playlist.id}`,
        isContext: playbackContext.value.type === 'playlist' && playbackContext.value.id === playlist.id,
        isPlaying: isPlaying.value && playbackContext.value.type === 'playlist' && playbackContext.value.id === playlist.id,
        sortKey: playlist.name.toLowerCase(),
        creator: 'Tú'
      })
    }
  }

  // Saved Playlists (no creadas por el usuario)
  if (filterType.value === null || filterType.value === 'playlist') {
    const playlistsList = data.value?.playlists || []
    const userPlaylistIds = (userPlaylists.value || []).map((p: any) => p.id)
    for (const id of savedPlaylistIds.value || []) {
      if (userPlaylistIds.includes(id)) continue
      const playlist = playlistsList.find((p: any) => p.id === id)
      if (!playlist) continue
      items.push({
        id: playlist.id,
        type: 'playlist',
        name: playlist.name,
        subtitle: `Playlist · ${playlist.songIds?.length || 0} canciones`,
        image: playlist.cover,
        route: `/playlist/${playlist.id}`,
        isViewing: route.path === `/playlist/${playlist.id}`,
        isContext: playbackContext.value.type === 'playlist' && playbackContext.value.id === playlist.id,
        isPlaying: isPlaying.value && playbackContext.value.type === 'playlist' && playbackContext.value.id === playlist.id,
        sortKey: playlist.name.toLowerCase(),
        creator: 'Tigrefy'
      })
    }
  }

  // Favorite Artists
  if (filterType.value === null || filterType.value === 'artist') {
    const artistsList = data.value?.artists || []
    for (const id of favoriteArtists.value || []) {
      const artist = artistsList.find((a: any) => a.id === id)
      if (!artist) continue
      items.push({
        id: artist.id,
        type: 'artist',
        name: artist.name,
        subtitle: 'Artista',
        image: artist.image,
        route: `/artist/${artist.id}`,
        isViewing: route.path === `/artist/${artist.id}`,
        isContext: playbackContext.value.type === 'artist' && playbackContext.value.id === artist.id,
        isPlaying: isPlaying.value && playbackContext.value.type === 'artist' && playbackContext.value.id === artist.id,
        sortKey: artist.name.toLowerCase(),
        creator: ''
      })
    }
  }

  // Saved Albums
  if (filterType.value === null || filterType.value === 'album') {
    const albumsList = data.value?.albums || []
    for (const id of savedAlbumIds.value || []) {
      const album = albumsList.find((a: any) => a.id === id)
      if (!album) continue
      items.push({
        id: album.id,
        type: 'album',
        name: album.title,
        subtitle: `Álbum · ${album.artistName}`,
        image: album.cover,
        route: `/album/${album.id}`,
        isViewing: route.path === `/album/${album.id}`,
        isContext: playbackContext.value.type === 'album' && playbackContext.value.id === album.id,
        isPlaying: isPlaying.value && playbackContext.value.type === 'album' && playbackContext.value.id === album.id,
        sortKey: album.title.toLowerCase(),
        creator: album.artistName
      })
    }
  }

  // Ordenar
  if (sortBy.value === 'alphabetical') {
    items.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  } else if (sortBy.value === 'creator') {
    items.sort((a, b) => (a.creator || '').localeCompare(b.creator || ''))
  }
  // 'recent' mantiene el orden original (por ahora)

  return items
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
