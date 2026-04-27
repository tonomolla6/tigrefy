<template>
  <div v-if="album" class="min-h-full pb-20 md:pb-0">
    <!-- Mobile Header con perfil -->
    <MobileHeader />

    <!-- Header del álbum -->
    <div class="bg-gradient-to-b from-tiger-800 via-tiger-900 to-dark-base px-4 md:px-8 py-6 md:py-8 pb-8">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        <SecureImage
          :src="album.cover"
          :alt="album.title"
          class="w-56 h-56 md:w-60 md:h-60 rounded-lg shadow-2xl"
        />
        <div class="flex-1 pb-0 md:pb-4 text-center md:text-left">
          <p class="text-xs md:text-sm font-semibold uppercase text-tiger-300">Álbum</p>
          <h1 class="text-3xl md:text-6xl lg:text-7xl font-bold my-2 md:my-4">{{ album.title }}</h1>
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm">
            <ArtistChip
              :artist-id="album.artistId"
              :name="album.artistName"
              :image="artist?.image"
            />
            <span class="text-secondary">•</span>
            <span class="text-secondary">{{ album.releaseDate?.substring(0, 4) }}</span>
            <span class="text-secondary">•</span>
            <span class="text-secondary">{{ album.totalTracks }} {{ album.totalTracks === 1 ? 'canción' : 'canciones' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y canciones -->
    <div class="bg-dark-base px-4 md:px-8 py-6">
      <!-- Controles (ocultos en móvil) -->
      <div class="hidden md:flex items-center gap-4 md:gap-8 mb-8">
        <PlayButton :playing="isContextPlaying(albumSongs)" size="lg" @click="handlePlayContext(albumSongs)" />
        <Tooltip :text="isAlbumSaved(album.id) ? 'Quitar de Tu biblioteca' : 'Guardar en Tu biblioteca'">
          <button
            @click="toggleSaveAlbum(album.id)"
            class="border border-gray-600 hover:border-white rounded-full p-2 transition-all hover:scale-105"
            :class="isAlbumSaved(album.id) ? 'bg-tiger-500 border-tiger-500' : ''"
          >
            <IconCheck v-if="isAlbumSaved(album.id)" :size="24" class="text-white" />
            <IconPlus v-else :size="24" class="text-secondary hover:text-white" />
          </button>
        </Tooltip>
      </div>

      <!-- Controles móvil -->
      <div class="flex md:hidden items-center gap-4 mb-6">
        <button
          @click="toggleSaveAlbum(album.id)"
          class="p-2 transition-all"
          :class="isAlbumSaved(album.id) ? 'text-tiger-500' : 'text-secondary'"
        >
          <IconHeart :size="28" :filled="isAlbumSaved(album.id)" />
        </button>
        <div class="flex-1" />
        <PlayButton :playing="isContextPlaying(albumSongs)" size="lg" @click="handlePlayContext(albumSongs)" />
      </div>

      <!-- Lista de canciones -->
      <div class="mb-8">
        <SongList
          :songs="albumSongs"
          preset="album"
          context-type="album"
          :context-id="albumId"
          @open-menu="openSongActions"
        />
      </div>

      <!-- Información adicional -->
      <div class="text-secondary text-sm space-y-2">
        <p>{{ album.releaseDate }}</p>
        <p v-if="album.genres && album.genres.length > 0" class="flex flex-wrap gap-2 items-center">
          <span class="text-primary font-semibold">Géneros:</span>
          <NuxtLink
            v-for="genre in album.genres"
            :key="genre.id"
            :to="`/genre/${genre.id}`"
            class="bg-dark-highlight hover:bg-tiger-500/30 px-3 py-1 rounded-full text-xs transition-colors"
          >
            {{ genre.name }}
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>

  <div v-else class="min-h-full pb-20 md:pb-0" aria-busy="true" aria-label="Cargando álbum">
    <MobileHeader />
    <div class="bg-gradient-to-b from-dark-card via-dark-card to-dark-base px-4 md:px-8 py-6 md:py-8 pb-8">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        <div class="w-56 h-56 md:w-60 md:h-60 rounded-lg bg-white/5 animate-pulse"></div>
        <div class="flex-1 pb-0 md:pb-4 text-center md:text-left space-y-3 w-full">
          <div class="h-3 w-12 bg-white/10 rounded animate-pulse mx-auto md:mx-0"></div>
          <div class="h-12 md:h-20 w-3/4 bg-white/10 rounded animate-pulse mx-auto md:mx-0"></div>
          <div class="h-4 w-1/2 bg-white/10 rounded animate-pulse mx-auto md:mx-0"></div>
        </div>
      </div>
    </div>
    <div class="bg-dark-base px-4 md:px-8 py-6 space-y-3">
      <div v-for="i in 6" :key="i" class="flex items-center gap-3 py-2">
        <div class="w-4 h-4 bg-white/5 rounded animate-pulse"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-white/10 rounded animate-pulse" :style="{ width: `${30 + Math.random() * 40}%` }"></div>
          <div class="h-3 w-24 bg-white/5 rounded animate-pulse"></div>
        </div>
        <div class="h-3 w-10 bg-white/5 rounded animate-pulse"></div>
      </div>
    </div>
  </div>

  <!-- Song Action Sheet -->
  <SongActionSheet
    :isOpen="showSongActions"
    :song="selectedSong"
    @close="showSongActions = false"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const { getAlbumById, getSongsByAlbumId, getArtistById } = useData()
const { toggleSaveAlbum, isAlbumSaved } = useFavorites()

const albumId = route.params.id as string
const album = computed(() => getAlbumById(albumId))
const albumSongs = computed(() => getSongsByAlbumId(albumId))
const artist = computed(() => album.value ? getArtistById(album.value.artistId) : null)

// Usar composable de contexto de reproducción
const {
  isContextPlaying,
  handlePlayContext
} = useContextPlayback('album', albumId)

// Sticky header al hacer scroll
useDetailStickyHeader({
  title: computed(() => album.value?.title),
  playing: computed(() => isContextPlaying(albumSongs.value)),
  onPlay: () => handlePlayContext(albumSongs.value),
  bgClass: 'bg-tiger-800'
})

// Estado para SongActionSheet
const showSongActions = ref(false)
const selectedSong = ref<any>(null)

const openSongActions = (song: any) => {
  selectedSong.value = song
  showSongActions.value = true
}
</script>
