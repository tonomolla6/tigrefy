<template>
  <div class="min-h-full">
    <!-- Header con gradiente oscuro -->
    <div class="bg-gradient-to-b from-tiger-900/50 via-tiger-950/30 to-dark-base pt-6 pb-8 px-4 md:px-8">
      <!-- Saludo -->
      <div class="mb-6">
        <h1 class="text-3xl md:text-5xl font-bold mb-1">¡Hola, Tigre!</h1>
        <p class="text-secondary text-lg">{{ greeting }}</p>
      </div>

      <!-- Quick Access Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        <!-- Tus Me Gusta -->
        <QuickAccessCard
          title="Tus Me Gusta"
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

      <!-- Escuchado Recientemente -->
      <HorizontalScroller
        v-if="recentItems.length > 0"
        title="Escuchado recientemente"
      >
        <SpotifyAlbumCard
          v-for="item in recentItemsAsAlbums"
          :key="`recent-${item.id}`"
          :album="item"
        />
      </HorizontalScroller>

      <!-- Artistas Populares -->
      <HorizontalScroller
        title="Artistas populares"
        showAllLink="/artists"
      >
        <SpotifyArtistCard
          v-for="artist in artists"
          :key="artist.id"
          :artist="artist"
        />
      </HorizontalScroller>

      <!-- Álbumes Destacados -->
      <HorizontalScroller
        title="Álbumes destacados"
        showAllLink="/albums"
      >
        <SpotifyAlbumCard
          v-for="album in albums"
          :key="album.id"
          :album="album"
        />
      </HorizontalScroller>

      <!-- Top Tigres -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl md:text-2xl font-bold">Top Tigres</h2>
          <NuxtLink
            to="/songs"
            class="text-sm font-semibold text-secondary hover:text-primary hover:underline transition-colors"
          >
            Ver todas
          </NuxtLink>
        </div>
        <div class="bg-gradient-to-b from-white/5 to-transparent rounded-xl p-2 md:p-4">
          <TopTrackRow
            v-for="(song, index) in topSongs.slice(0, 5)"
            :key="song.id"
            :song="song"
            :index="index"
            :queue="topSongs"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { data, getSongsByAlbumId } = useData()
const { playSong } = usePlayer()
const { recentItems, loadRecent, addToRecent } = useRecentlyPlayed()
const { favoriteSongs } = useFavorites()

// Cargar historial reciente al montar
onMounted(() => {
  loadRecent()
})

// Datos computados
const albums = computed(() => data.value.albums || [])
const artists = computed(() => data.value.artists || [])

const topSongs = computed(() => {
  return [...(data.value.songs || [])].sort((a, b) => b.plays - a.plays)
})

// Obtener la canción más reciente
const latestSong = computed(() => {
  if (!data.value.songs || data.value.songs.length === 0) return null
  return [...data.value.songs].sort((a, b) => {
    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  })[0]
})

// Convertir items recientes a formato álbum para el carrusel
const recentItemsAsAlbums = computed(() => {
  return recentItems.value.map(item => ({
    id: item.id,
    title: item.title,
    cover: item.cover,
    artistName: item.artistName || ''
  }))
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
    playSong(likedSongs[0], likedSongs)
  }
}

const handleQuickPlay = (payload: { type: string; id: string }) => {
  if (payload.type === 'album') {
    const songs = getSongsByAlbumId(payload.id)
    const album = albums.value.find((a: any) => a.id === payload.id)
    if (songs.length > 0) {
      playSong(songs[0], songs)
      if (album) {
        addToRecent({
          type: 'album',
          id: album.id,
          cover: album.cover,
          title: album.title,
          artistName: album.artistName
        })
      }
    }
  }
}
</script>
