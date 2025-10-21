<template>
  <div v-if="album" class="min-h-full">
    <!-- Header del álbum -->
    <div class="bg-gradient-to-b from-tiger-800 via-tiger-900 to-dark-base px-4 md:px-8 py-6 md:py-8 pb-8">
      <BackButton />
      <div class="flex flex-col md:flex-row items-center md:items-end gap-6">
        <img
          :src="album.cover"
          :alt="album.title"
          class="w-48 h-48 md:w-60 md:h-60 rounded-lg shadow-2xl"
          @error="handleImageError"
        />
        <div class="flex-1 pb-0 md:pb-4 text-center md:text-left">
          <p class="text-xs md:text-sm font-semibold uppercase text-tiger-300">Álbum</p>
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold my-2 md:my-4">{{ album.title }}</h1>
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm">
            <span class="font-semibold">{{ album.artistName }}</span>
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
      <div class="flex items-center gap-4 md:gap-8 mb-8">
        <button
          @click="handlePlayAlbum"
          class="bg-tiger-500 hover:bg-tiger-600 hover:scale-105 text-white rounded-full p-4 md:p-5 transition-all shadow-lg"
        >
          <IconPlay :size="24" class="md:hidden" />
          <IconPlay :size="32" class="hidden md:block" />
        </button>
        <button
          @click="toggleFavoriteAlbum(album.id)"
          class="text-secondary hover:text-tiger-500 transition-colors"
        >
          <IconHeart
            :size="28"
            class="md:hidden"
            :filled="isFavoriteAlbum(album.id)"
            :class="{'text-tiger-500': isFavoriteAlbum(album.id)}"
          />
          <IconHeart
            :size="36"
            class="hidden md:block"
            :filled="isFavoriteAlbum(album.id)"
            :class="{'text-tiger-500': isFavoriteAlbum(album.id)}"
          />
        </button>
      </div>

      <!-- Lista de canciones -->
      <div class="mb-8">
        <!-- Header (solo desktop) -->
        <div class="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-800 text-secondary text-sm mb-2">
          <div class="col-span-1">#</div>
          <div class="col-span-7">Título</div>
          <div class="col-span-3">Reproducciones</div>
          <div class="col-span-1 text-right">Duración</div>
        </div>

        <!-- Canciones -->
        <div
          v-for="(song, index) in albumSongs"
          :key="song.id"
          class="grid grid-cols-12 gap-2 md:gap-4 items-center px-2 md:px-4 py-3 rounded-lg hover:bg-dark-highlight transition-colors group cursor-pointer"
          @click="handlePlaySong(song)"
        >
          <!-- Número/Play -->
          <div class="col-span-2 md:col-span-1">
            <span class="text-secondary group-hover:hidden text-sm md:text-base">{{ index + 1 }}</span>
            <div class="hidden group-hover:block">
              <IconPlay v-if="!isCurrentAndPlaying(song)" :size="20" class="text-tiger-500" />
              <IconPause v-else :size="20" class="text-tiger-500" />
            </div>
          </div>

          <!-- Título -->
          <div class="col-span-8 md:col-span-7 min-w-0">
            <h4 class="font-semibold text-sm md:text-base truncate" :class="isCurrentSong(song) ? 'text-tiger-500' : 'text-primary'">
              {{ song.title }}
            </h4>
            <p class="text-xs md:text-sm text-secondary truncate md:hidden">{{ formatTime(song.duration) }}</p>
            <p class="hidden md:block text-sm text-secondary truncate">{{ song.artistName }}</p>
          </div>

          <!-- Reproducciones (solo desktop) -->
          <div class="hidden md:block col-span-3 text-secondary text-sm">
            {{ formatPlays(song.plays) }}
          </div>

          <!-- Acciones y duración -->
          <div class="col-span-2 md:col-span-1 flex items-center gap-2 md:gap-4 justify-end">
            <button
              @click.stop="toggleFavoriteSong(song.id)"
              class="opacity-0 group-hover:opacity-100 text-secondary hover:text-tiger-500 transition-all"
              :class="{ 'opacity-100 text-tiger-500': isFavoriteSong(song.id) }"
            >
              <IconHeart :size="16" class="md:hidden" :filled="isFavoriteSong(song.id)" />
              <IconHeart :size="18" class="hidden md:block" :filled="isFavoriteSong(song.id)" />
            </button>
            <span class="hidden md:block text-secondary text-sm">{{ formatTime(song.duration) }}</span>
          </div>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="text-secondary text-sm space-y-2">
        <p>{{ album.releaseDate }}</p>
        <p v-if="album.genres" class="flex flex-wrap gap-2">
          <span class="text-primary font-semibold">Géneros:</span>
          <span v-for="genre in album.genres" :key="genre" class="bg-dark-highlight px-3 py-1 rounded-full text-xs">
            {{ genre }}
          </span>
        </p>
      </div>
    </div>
  </div>

  <div v-else class="min-h-full flex items-center justify-center">
    <p class="text-secondary">Cargando álbum...</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const { getAlbumById, getSongsByAlbumId } = useData()
const { playSong, currentSong, isPlaying, formatTime } = usePlayer()
const { toggleFavoriteAlbum, isFavoriteAlbum, toggleFavoriteSong, isFavoriteSong } = useFavorites()

const albumId = route.params.id as string
const album = computed(() => getAlbumById(albumId))
const albumSongs = computed(() => getSongsByAlbumId(albumId))

const isCurrentSong = (song: any) => currentSong.value?.id === song.id
const isCurrentAndPlaying = (song: any) => isCurrentSong(song) && isPlaying.value

const handlePlayAlbum = () => {
  if (albumSongs.value.length > 0) {
    playSong(albumSongs.value[0], albumSongs.value)
  }
}

const handlePlaySong = (song: any) => {
  playSong(song, albumSongs.value)
}

const formatPlays = (plays: number) => {
  if (plays >= 1000000) {
    return `${(plays / 1000000).toFixed(1)}M`
  }
  if (plays >= 1000) {
    return `${(plays / 1000).toFixed(1)}K`
  }
  return plays.toString()
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
