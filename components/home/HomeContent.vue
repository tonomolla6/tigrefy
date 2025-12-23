<template>
  <NuxtLayout name="default">
    <div class="min-h-full pb-20 md:pb-0">
      <!-- Mobile Header con perfil -->
      <MobileHeader />

      <!-- Header con gradiente oscuro -->
      <div class="bg-gradient-to-b from-tiger-900/50 via-tiger-950/30 to-dark-base pt-4 md:pt-6 pb-8 px-4 md:px-8">
        <!-- Saludo -->
        <div class="mb-6">
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
      <div class="px-4 md:px-8 py-6 space-y-8 bg-dark-base">
        <!-- Hero Nueva Canción -->
        <HeroNewRelease
          v-if="latestSong"
          :song="latestSong"
          :queue="topSongs"
        />

        <!-- Álbumes -->
        <HorizontalScroller
          title="Álbumes"
          showAllLink="/albums"
        >
          <SpotifyAlbumCard
            v-for="album in albums"
            :key="album.id"
            :album="album"
          />
        </HorizontalScroller>

        <!-- Listas -->
        <HorizontalScroller
          v-if="visiblePlaylists.length > 0"
          title="Listas"
        >
          <SpotifyPlaylistCard
            v-for="playlist in visiblePlaylists"
            :key="playlist.id"
            :playlist="playlist"
          />
        </HorizontalScroller>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { data, getSongsByAlbumId } = useData()
const { playSong } = usePlayer()
const { favoriteSongs } = useFavorites()
const { user, isGuest } = useAuth()

// Nombre del usuario para el saludo
const userName = computed(() => {
  return user.value?.displayName || user.value?.username || 'Tigre'
})

// Datos computados
const albums = computed(() => data.value.albums || [])
const playlists = computed(() => data.value.playlists || [])

// Playlists visibles según rol: guest solo ve públicas, el resto ve todas
const visiblePlaylists = computed(() => {
  if (isGuest.value) {
    return playlists.value.filter((p: any) => p.isPublic)
  }
  return playlists.value
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
