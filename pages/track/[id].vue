<template>
  <div v-if="song" class="min-h-full pb-20 md:pb-0">
    <!-- Mobile Header -->
    <MobileHeader />

    <!-- Header de la canción -->
    <div class="bg-gradient-to-b from-tiger-800 via-tiger-900 to-dark-base px-4 md:px-8 py-6 md:py-8 pb-8">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        <SecureImage
          :src="coverSrc"
          :alt="song.title"
          class="w-56 h-56 md:w-60 md:h-60 rounded-lg shadow-2xl"
        />
        <div class="flex-1 pb-0 md:pb-4 text-center md:text-left">
          <p class="text-xs md:text-sm font-semibold uppercase text-tiger-300">Canción</p>
          <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold my-2 md:my-4">{{ song.title }}</h1>
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm">
            <ArtistChip
              :artist-id="song.artistId"
              :name="song.artistName"
              :image="artist?.image"
            />
            <span class="text-secondary">•</span>
            <NuxtLink
              :to="`/album/${song.albumId}`"
              class="text-secondary hover:text-white hover:underline transition-colors"
            >
              {{ song.albumName }}
            </NuxtLink>
            <span class="text-secondary">•</span>
            <span class="text-secondary">{{ releaseYear }}</span>
            <span class="text-secondary">•</span>
            <span class="text-secondary">{{ formatDuration(song.duration) }}</span>
            <span class="text-secondary">•</span>
            <span class="text-secondary">{{ formattedPlays }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y contenido -->
    <div class="bg-dark-base px-4 md:px-8 py-6">
      <!-- Controles -->
      <div class="flex items-center gap-4 md:gap-8 mb-8">
        <button
          @click="handlePlay"
          class="bg-tiger-500 hover:bg-tiger-600 hover:scale-105 text-white rounded-full p-4 md:p-5 transition-all shadow-lg"
        >
          <IconPause v-if="isCurrentSongPlaying" :size="32" />
          <IconPlay v-else :size="32" />
        </button>
        <Tooltip :text="isFavoriteSong(song.id) ? 'Quitar de Favoritos' : 'Añadir a Favoritos'">
          <button
            @click="toggleFavoriteSong(song.id)"
            class="p-2 transition-all hover:scale-105"
            :class="isFavoriteSong(song.id) ? 'text-tiger-500' : 'text-secondary hover:text-white'"
          >
            <IconHeart :size="32" :filled="isFavoriteSong(song.id)" />
          </button>
        </Tooltip>
      </div>

      <!-- Letra si existe -->
      <div v-if="song.lyrics" class="mb-8">
        <h2 class="text-xl font-bold mb-4">Letra</h2>
        <p
          class="text-gray-300 whitespace-pre-line leading-relaxed overflow-hidden"
          :class="showFullLyrics ? 'max-h-none' : 'max-h-64'"
        >{{ song.lyrics }}</p>
        <button
          @click="showFullLyrics = !showFullLyrics"
          class="mt-2 text-sm font-bold text-white hover:underline transition-colors"
        >
          {{ showFullLyrics ? 'Mostrar menos' : '...Mostrar más' }}
        </button>
      </div>

      <!-- Información del artista -->
      <NuxtLink
        v-if="artist"
        :to="`/artist/${artist.id}`"
        class="group flex items-center gap-4 mb-8 p-4 rounded-md hover:bg-white/5 transition-colors"
      >
        <SecureImage
          :src="artist.image"
          :alt="artist.name"
          class="w-20 h-20 rounded-full"
        />
        <div>
          <p class="text-sm font-semibold">Artista</p>
          <p class="font-bold text-lg hover:underline">{{ artist.name }}</p>
        </div>
      </NuxtLink>

      <!-- Canciones populares del artista -->
      <ArtistTopSongs
        v-if="artist"
        :artist-id="artist.id"
        :exclude-song-id="song.id"
        class="mb-8"
      >
        <template #header>
          <p class="text-sm text-secondary">Canciones populares de</p>
          <h2 class="text-2xl md:text-3xl font-bold mb-4">{{ artist.name }}</h2>
        </template>
      </ArtistTopSongs>

      <!-- Del álbum -->
      <div v-if="album && albumSongs.length > 0" class="mb-8">
        <NuxtLink
          :to="`/album/${album.id}`"
          class="flex items-stretch overflow-hidden rounded-t-md bg-dark-highlight hover:bg-dark-press transition-colors mb-1"
        >
          <SecureImage
            :src="album.cover"
            :alt="album.title"
            class="w-20 h-20 flex-shrink-0"
          />
          <div class="flex flex-col justify-center px-4 min-w-0">
            <p class="text-xs text-secondary">Del álbum</p>
            <p class="font-bold text-base truncate hover:underline">{{ album.title }}</p>
          </div>
        </NuxtLink>
        <SongList
          :songs="albumSongs"
          preset="album"
          context-type="album"
          :context-id="album.id"
          hide-header
        />
      </div>
    </div>
  </div>

  <div v-else class="min-h-full" aria-busy="true" aria-label="Cargando canción">
    <div class="bg-gradient-to-b from-dark-card via-dark-card to-dark-base px-4 md:px-8 py-8 pb-8">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        <div class="w-56 h-56 md:w-60 md:h-60 rounded-lg bg-white/5 animate-pulse"></div>
        <div class="flex-1 pb-0 md:pb-4 text-center md:text-left space-y-3 w-full">
          <div class="h-3 w-16 bg-white/10 rounded animate-pulse mx-auto md:mx-0"></div>
          <div class="h-12 md:h-20 w-3/4 bg-white/10 rounded animate-pulse mx-auto md:mx-0"></div>
          <div class="h-4 w-1/2 bg-white/5 rounded animate-pulse mx-auto md:mx-0"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTime, formatPlaysDetailed } from '~/utils/formatting'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const { getSongById, getArtistById, getAlbumById, getSongsByAlbumId } = useData()
const { toggleFavoriteSong, isFavoriteSong } = useFavorites()
const { playSong, currentSong, isPlaying, togglePlay } = usePlayer()

const trackId = computed(() => route.params.id as string)
const song = computed(() => getSongById(trackId.value))
const artist = computed(() => song.value ? getArtistById(song.value.artistId) : null)
const album = computed(() => song.value?.albumId ? getAlbumById(song.value.albumId) : null)
const albumSongs = computed(() => song.value ? getSongsByAlbumId(song.value.albumId!) : [])

const coverSrc = computed(() => song.value?.cover || album.value?.cover || null)
const showFullLyrics = ref(false)

const releaseYear = computed(() => song.value?.releaseDate?.substring(0, 4) || '')
const formattedPlays = computed(() => {
  if (!song.value?.plays) return '0'
  return formatPlaysDetailed(song.value.plays)
})

const isCurrentSongPlaying = computed(() =>
  currentSong.value?.id === song.value?.id && isPlaying.value
)

const handlePlay = () => {
  if (!song.value) return

  if (currentSong.value?.id === song.value.id) {
    togglePlay()
  } else {
    playSong(song.value, albumSongs.value, { type: 'album', id: song.value.albumId! })
  }
}

const formatDuration = (seconds: number) => formatTime(seconds)

// Sticky header al hacer scroll
useDetailStickyHeader({
  title: computed(() => song.value?.title),
  playing: computed(() => isCurrentSongPlaying.value),
  onPlay: () => handlePlay(),
  bgClass: 'bg-tiger-800'
})
</script>
