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

      <!-- Header con gradiente dinámico (solo desktop) -->
      <div class="relative pt-1 md:pt-6 px-4 md:px-8">
        <!-- Única capa de gradiente con color interpolado -->
        <div
          class="absolute inset-0"
          :style="gradientStyle"
        />

        <!-- Contenido (sobre las capas de gradiente) -->
        <div class="relative z-10">
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
              @hover-color="handleHoverColor"
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
              @hover-color="handleHoverColor"
            />
          </div>
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

        <!-- Artistas -->
        <MediaSection
          v-if="artists.length > 0"
          title="Artistas"
          type="artists"
          :items="artists"
          showAllLink="/section/artists"
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
const artists = computed(() => (data.value.artists || []).slice(0, 8))

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
  const albumsToShow = albums.value.slice(0, 7)
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

// Color del header dinámico basado en hover de QuickAccessCard
const LIKED_SONGS_COLOR = '#6366f1' // indigo-500
const DEFAULT_GRAY = '#535353'
const hasHoveredOnce = ref(false)

// Color actual interpolado (el que se muestra)
const displayColor = ref(DEFAULT_GRAY)
// Color objetivo al que queremos llegar
const targetColor = ref(DEFAULT_GRAY)
// ID de la animación actual
let animationId: number | null = null

// Convertir hex a RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 83, g: 83, b: 83 }
}

// Convertir RGB a hex
const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')
}

// Interpolar entre dos colores
const lerpColor = (from: string, to: string, t: number) => {
  const f = hexToRgb(from)
  const toRgb = hexToRgb(to)
  return rgbToHex(
    f.r + (toRgb.r - f.r) * t,
    f.g + (toRgb.g - f.g) * t,
    f.b + (toRgb.b - f.b) * t
  )
}

// Animar el cambio de color
const animateToColor = (newTarget: string) => {
  // Cancelar animación anterior
  if (animationId) cancelAnimationFrame(animationId)

  const startColor = displayColor.value
  const startTime = performance.now()
  const duration = 1500 // 1.5 segundos

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    // Ease out cubic para suavidad
    const eased = 1 - Math.pow(1 - progress, 3)

    displayColor.value = lerpColor(startColor, newTarget, eased)

    if (progress < 1) {
      animationId = requestAnimationFrame(animate)
    }
  }

  animationId = requestAnimationFrame(animate)
}

const handleHoverColor = (color: string | null) => {
  // Determinar el color objetivo
  let newTarget: string
  if (color) {
    hasHoveredOnce.value = true
    newTarget = color
  } else {
    newTarget = hasHoveredOnce.value ? LIKED_SONGS_COLOR : DEFAULT_GRAY
  }

  // Solo animar si es diferente
  if (newTarget !== targetColor.value) {
    targetColor.value = newTarget
    animateToColor(newTarget)
  }
}

// Estilo del gradiente
const gradientStyle = computed(() => {
  const color = displayColor.value
  return {
    background: `linear-gradient(to bottom, ${color}80 0%, ${color}40 40%, ${color}15 70%, #121212 100%)`
  }
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
