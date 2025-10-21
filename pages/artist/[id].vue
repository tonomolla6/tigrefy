<template>
  <div v-if="artist" class="min-h-full">
    <!-- Header del artista -->
    <div class="bg-gradient-to-b from-tiger-700 to-dark-base px-8 py-6 pb-8">
      <div class="flex items-end gap-6">
        <img
          :src="artist.image"
          :alt="artist.name"
          class="w-60 h-60 rounded-full shadow-2xl"
          @error="handleImageError"
        />
        <div class="flex-1 pb-4">
          <p class="text-sm font-semibold uppercase">Artista</p>
          <h1 class="text-6xl font-bold my-4">{{ artist.name }}</h1>
          <p class="text-secondary">{{ formatFollowers(artist.followers) }} seguidores</p>
        </div>
      </div>
    </div>

    <!-- Controles -->
    <div class="bg-dark-base px-8 py-6">
      <div class="flex items-center gap-8 mb-8">
        <button
          @click="handlePlayArtist"
          class="bg-tiger-500 hover:bg-tiger-600 text-white rounded-full p-4 transition-all hover:scale-105"
        >
          <IconPlay :size="28" />
        </button>
        <button
          @click="toggleFavoriteArtist(artist.id)"
          class="text-secondary hover:text-tiger-500 transition-colors"
        >
          <IconHeart
            :size="32"
            :filled="isFavoriteArtist(artist.id)"
            :class="{'text-tiger-500': isFavoriteArtist(artist.id)}"
          />
        </button>
      </div>

      <!-- Canciones populares -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Populares</h2>
        <div>
          <div
            v-for="(song, index) in popularSongs.slice(0, 5)"
            :key="song.id"
            class="grid grid-cols-12 gap-4 items-center px-4 py-2 rounded hover:bg-dark-hover transition-colors group cursor-pointer"
            @click="handlePlaySong(song)"
          >
            <div class="col-span-1 text-secondary group-hover:hidden">{{ index + 1 }}</div>
            <div class="col-span-1 hidden group-hover:block">
              <IconPlay v-if="!isCurrentAndPlaying(song)" :size="20" class="text-tiger-500" />
              <IconPause v-else :size="20" class="text-tiger-500" />
            </div>
            <div class="col-span-1">
              <img
                :src="song.cover"
                :alt="song.title"
                class="w-12 h-12 rounded"
                @error="handleImageError"
              />
            </div>
            <div class="col-span-6">
              <h4 class="font-semibold" :class="isCurrentSong(song) ? 'text-tiger-500' : 'text-primary'">
                {{ song.title }}
              </h4>
            </div>
            <div class="col-span-3 text-secondary text-sm">
              {{ formatPlays(song.plays) }}
            </div>
            <div class="col-span-1 flex items-center gap-4 justify-end">
              <button
                @click.stop="toggleFavoriteSong(song.id)"
                class="opacity-0 group-hover:opacity-100 text-secondary hover:text-tiger-500 transition-all"
                :class="{ 'opacity-100 text-tiger-500': isFavoriteSong(song.id) }"
              >
                <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
              </button>
              <span class="text-secondary text-sm">{{ formatTime(song.duration) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Discografía -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Discografía</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AlbumCard v-for="album in artistAlbums" :key="album.id" :album="album" />
        </div>
      </section>

      <!-- Sobre el artista -->
      <section v-if="artist.bio">
        <h2 class="text-2xl font-bold mb-4">Acerca de</h2>
        <div class="bg-dark-highlight rounded-lg p-6">
          <p class="text-secondary mb-4">{{ artist.bio }}</p>
          <div v-if="artist.genres" class="flex flex-wrap gap-2">
            <span
              v-for="genre in artist.genres"
              :key="genre"
              class="bg-dark-hover px-3 py-1 rounded-full text-sm"
            >
              {{ genre }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>

  <div v-else class="min-h-full flex items-center justify-center">
    <p class="text-secondary">Cargando artista...</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const { getArtistById, getAlbumsByArtistId, getSongsByArtistId } = useData()
const { playSong, currentSong, isPlaying, formatTime } = usePlayer()
const { toggleFavoriteArtist, isFavoriteArtist, toggleFavoriteSong, isFavoriteSong } = useFavorites()

const artistId = route.params.id as string
const artist = computed(() => getArtistById(artistId))
const artistAlbums = computed(() => getAlbumsByArtistId(artistId))
const artistSongs = computed(() => getSongsByArtistId(artistId))
const popularSongs = computed(() => {
  return [...artistSongs.value].sort((a, b) => b.plays - a.plays)
})

const isCurrentSong = (song: any) => currentSong.value?.id === song.id
const isCurrentAndPlaying = (song: any) => isCurrentSong(song) && isPlaying.value

const handlePlayArtist = () => {
  if (popularSongs.value.length > 0) {
    playSong(popularSongs.value[0], popularSongs.value)
  }
}

const handlePlaySong = (song: any) => {
  playSong(song, popularSongs.value)
}

const formatFollowers = (followers: number) => {
  if (followers >= 1000000) {
    return `${(followers / 1000000).toFixed(1)}M`
  }
  if (followers >= 1000) {
    return `${(followers / 1000).toFixed(1)}K`
  }
  return followers.toString()
}

const formatPlays = (plays: number) => {
  if (plays >= 1000000000) {
    return `${(plays / 1000000000).toFixed(1)}B`
  }
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
