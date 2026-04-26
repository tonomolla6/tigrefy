<template>
  <div v-if="artist" class="min-h-full">
    <!-- Header del artista (estilo Spotify) -->
    <div class="relative">
      <!-- Imagen de fondo con gradiente -->
      <div class="absolute inset-0 overflow-hidden">
        <SecureImage
          :src="artist.image"
          :alt="artist.name"
          class="w-full h-full object-cover blur-sm scale-110 opacity-60"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-dark-base via-dark-base/70 to-transparent"></div>
      </div>

      <!-- Contenido del header -->
      <div class="relative px-4 md:px-8 pt-16 md:pt-24 pb-6 md:pb-8">
        <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
          <SecureImage
            :src="artist.image"
            :alt="artist.name"
            class="w-40 h-40 md:w-56 md:h-56 rounded-full shadow-2xl object-cover border-4 border-dark-base/50"
          />
          <div class="flex-1 text-center md:text-left md:pb-2">
            <div class="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span class="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Artista verificado</span>
            </div>
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold my-2 md:my-4 drop-shadow-lg">{{ artist.name }}</h1>
            <p class="text-secondary text-sm md:text-base">{{ formatFollowers(artist.followers) }} oyentes mensuales</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y contenido -->
    <div class="bg-dark-base px-4 md:px-8 py-4 md:py-6">
      <div class="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <button
          @click="handlePlayArtistButton"
          class="bg-tiger-500 hover:bg-tiger-600 hover:scale-105 text-white rounded-full p-3 md:p-4 transition-all shadow-lg"
        >
          <template v-if="isArtistPlaying">
            <IconPause :size="24" class="md:hidden" />
            <IconPause :size="28" class="hidden md:block" />
          </template>
          <template v-else>
            <IconPlay :size="24" class="md:hidden" />
            <IconPlay :size="28" class="hidden md:block" />
          </template>
        </button>
        <button
          @click="toggleFavoriteArtist(artist.id)"
          class="text-secondary hover:text-tiger-500 transition-colors hover:scale-105"
          :class="{'text-tiger-500': isFavoriteArtist(artist.id)}"
        >
          <IconHeart :size="28" class="md:hidden" :filled="isFavoriteArtist(artist.id)" />
          <IconHeart :size="32" class="hidden md:block" :filled="isFavoriteArtist(artist.id)" />
        </button>
      </div>

      <!-- Canciones populares -->
      <ArtistTopSongs :artist-id="artistId" class="mb-8 md:mb-12">
        <template #header>
          <h2 class="text-xl md:text-2xl font-bold mb-4">Populares</h2>
        </template>
      </ArtistTopSongs>

      <!-- Discografía -->
      <section class="mb-8 md:mb-12">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl md:text-2xl font-bold">Discografía</h2>
          <NuxtLink
            v-if="artistAlbums.length > 5"
            to="#"
            class="text-secondary hover:text-primary text-sm font-semibold transition-colors"
          >
            Mostrar todo
          </NuxtLink>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AlbumCard v-for="album in artistAlbums" :key="album.id" :album="album" />
        </div>
      </section>

      <!-- Sobre el artista -->
      <section v-if="artist.bio" class="mb-8">
        <h2 class="text-xl md:text-2xl font-bold mb-4">Acerca de</h2>
        <div class="bg-dark-highlight rounded-lg p-4 md:p-6 max-w-2xl">
          <div class="flex gap-4 mb-4">
            <SecureImage
              :src="artist.image"
              :alt="artist.name"
              class="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover"
            />
            <div class="flex-1">
              <p class="text-sm md:text-base text-secondary leading-relaxed">{{ artist.bio }}</p>
            </div>
          </div>
          <div v-if="artist.genres" class="flex flex-wrap gap-2">
            <span
              v-for="genre in artist.genres"
              :key="genre"
              class="bg-dark-base px-3 py-1 rounded-full text-xs md:text-sm"
            >
              {{ genre }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>

  <div v-else class="min-h-full" aria-busy="true" aria-label="Cargando artista">
    <div class="relative">
      <div class="absolute inset-0 bg-dark-card"></div>
      <div class="relative px-4 md:px-8 pt-16 md:pt-24 pb-6 md:pb-8">
        <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
          <div class="w-40 h-40 md:w-56 md:h-56 rounded-full bg-white/5 animate-pulse"></div>
          <div class="flex-1 text-center md:text-left md:pb-2 space-y-3 w-full">
            <div class="h-5 w-32 bg-white/10 rounded-full animate-pulse mx-auto md:mx-0"></div>
            <div class="h-12 md:h-20 w-3/4 bg-white/10 rounded animate-pulse mx-auto md:mx-0"></div>
            <div class="h-4 w-1/3 bg-white/5 rounded animate-pulse mx-auto md:mx-0"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-dark-base px-4 md:px-8 py-6 space-y-6">
      <div class="h-6 w-32 bg-white/10 rounded animate-pulse"></div>
      <div class="space-y-2">
        <div v-for="i in 5" :key="i" class="flex items-center gap-3 py-2">
          <div class="w-10 h-10 bg-white/5 rounded animate-pulse"></div>
          <div class="flex-1 h-4 bg-white/10 rounded animate-pulse" :style="{ maxWidth: `${30 + Math.random() * 40}%` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatFollowers } from '~/utils/formatting'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const { getArtistById, getAlbumsByArtistId, getSongsByArtistId } = useData()
const { playSong, currentSong, isPlaying, togglePlay, playbackContext } = usePlayer()
const { toggleFavoriteArtist, isFavoriteArtist } = useFavorites()

const artistId = route.params.id as string
const artist = computed(() => getArtistById(artistId))
const artistAlbums = computed(() => getAlbumsByArtistId(artistId))
const artistSongs = computed(() => getSongsByArtistId(artistId))
const popularSongs = computed(() =>
  [...artistSongs.value].sort((a, b) => (b.plays || 0) - (a.plays || 0))
)

// Check if this artist is the current playback context
const isThisArtistContext = computed(() =>
  playbackContext.value.type === 'artist' && playbackContext.value.id === artistId
)

// Verifica si alguna canción del artista se está reproduciendo DESDE ESTE ARTISTA
const isArtistPlaying = computed(() => {
  if (!currentSong.value || !isPlaying.value || !isThisArtistContext.value) return false
  return popularSongs.value.some(song => song.id === currentSong.value.id)
})

const handlePlayArtistButton = () => {
  if (isArtistPlaying.value) {
    togglePlay()
  } else if (isThisArtistContext.value && currentSong.value && !isPlaying.value) {
    togglePlay()
  } else if (popularSongs.value.length > 0) {
    playSong(popularSongs.value[0], popularSongs.value, { type: 'artist', id: artistId })
  }
}

// Sticky header al hacer scroll
useDetailStickyHeader({
  title: computed(() => artist.value?.name),
  playing: computed(() => isArtistPlaying.value),
  onPlay: handlePlayArtistButton,
  bgClass: 'bg-tiger-800'
})

</script>

