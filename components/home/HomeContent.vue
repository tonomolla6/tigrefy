<template>
  <NuxtLayout name="default">
    <!-- Loading dots mientras carga -->
    <div v-if="!isLoaded" class="min-h-full flex items-center justify-center py-20">
      <LoadingDots />
    </div>

    <!-- Contenido real cuando está cargado -->
    <div v-else class="min-h-full pb-20 md:pb-0">
      <!-- Mobile Header con perfil -->
      <MobileHeader />

      <!-- Header con gradiente oscuro (solo desktop) -->
      <div class="bg-dark-base md:bg-gradient-to-b md:from-tiger-900/50 md:via-tiger-950/30 md:to-dark-base pt-1 md:pt-6 px-4 md:px-8">
        <!-- Saludo -->
        <div class="mb-4 md:mb-6">
          <h1 class="text-2xl md:text-5xl font-bold mb-1">¡Hola, {{ userName }}!</h1>
          <p class="text-secondary text-base md:text-lg">{{ greeting }}</p>
        </div>

        <!-- Quick Access Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          <!-- Canciones que te gustan -->
          <QuickAccessCard
            title="Canciones que te gustan"
            type="liked-songs"
            id="liked"
            @play="handlePlayLikedSongs"
          />
          <!-- Álbumes y playlists recientes/favoritos -->
          <QuickAccessCard
            v-for="item in quickAccessItems"
            :key="`${item.type}-${item.id}`"
            :image="item.cover"
            :title="item.title"
            :type="item.type"
            :id="item.id"
            @play="handleQuickPlay"
          />
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="px-4 md:px-8 pt-6 pb-6 space-y-6 bg-dark-base">
        <!-- Hero Nueva Canción -->
        <HeroNewRelease
          v-if="latestSong"
          :song="latestSong"
          :queue="topSongs"
        />

        <!-- Álbumes -->
        <MediaSection
          title="Álbumes"
          type="albums"
          :items="albums"
          showAllLink="/section/albums"
        />

        <!-- Listas -->
        <MediaSection
          v-if="visiblePlaylists.length > 0"
          title="Listas"
          type="playlists"
          :items="visiblePlaylists"
          showAllLink="/section/playlists"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { data, getSongsByAlbumId, isLoaded } = useData()
const { playSong } = usePlayer()
const { favoriteSongs } = useFavorites()
const { user, isGuest } = useAuth()

// Nombre del usuario para el saludo
const userName = computed(() => {
  return user.value?.displayName || user.value?.username || 'Tigre'
})

// Datos computados - limitados a 8 elementos para el scroll horizontal
const albums = computed(() => (data.value.albums || []).slice(0, 8))
const playlists = computed(() => data.value.playlists || [])

// Playlists visibles según rol: guest solo ve públicas, el resto ve todas (máx 8)
const visiblePlaylists = computed(() => {
  const filtered = isGuest.value
    ? playlists.value.filter((p: any) => p.isPublic)
    : playlists.value
  return filtered.slice(0, 8)
})

const topSongs = computed(() => {
  return [...(data.value.songs || [])].sort((a, b) => b.plays - a.plays)
})

// Obtener la canción más reciente
const latestSong = computed(() => {
  if (!data.value.songs || data.value.songs.length === 0) return null
  return [...data.value.songs].sort((a, b) => {
    const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
    const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
    return dateB - dateA
  })[0]
})

// Quick Access: primeros álbumes o favoritos
const quickAccessItems = computed(() => {
  const items: any[] = []

  // Añadir álbumes favoritos o los primeros álbumes
  const albumsToShow = albums.value.slice(0, 5)
  albumsToShow.forEach((album: any) => {
    items.push({
      type: 'album',
      id: album.id,
      cover: album.cover,
      title: album.title
    })
  })

  return items
})

// Saludo dinámico
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
})

// Handlers
const handlePlayLikedSongs = () => {
  const likedSongs = data.value.songs.filter((song: any) =>
    favoriteSongs.value.includes(song.id)
  )
  if (likedSongs.length > 0) {
    playSong(likedSongs[0], likedSongs, { type: 'liked-songs' })
  }
}

const handleQuickPlay = (payload: { type: string; id: string }) => {
  if (payload.type === 'album') {
    const songs = getSongsByAlbumId(payload.id)
    if (songs.length > 0) {
      playSong(songs[0], songs, { type: 'album', id: payload.id })
    }
  }
}
</script>
