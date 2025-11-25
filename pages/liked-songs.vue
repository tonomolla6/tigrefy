<template>
  <div class="min-h-full">
    <!-- Header con gradiente morado -->
    <div class="bg-gradient-to-b from-indigo-800 via-indigo-900 to-dark-base px-4 md:px-8 py-6 md:py-8 pb-8">
      <BackButton />
      <div class="flex flex-col md:flex-row items-center md:items-end gap-6">
        <!-- Icono de corazón -->
        <div class="w-48 h-48 md:w-60 md:h-60 rounded-lg shadow-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center">
          <IconHeart :size="80" class="text-white md:hidden" :filled="true" />
          <IconHeart :size="120" class="text-white hidden md:block" :filled="true" />
        </div>
        <div class="flex-1 pb-0 md:pb-4 text-center md:text-left">
          <p class="text-xs md:text-sm font-semibold uppercase text-indigo-300">Playlist</p>
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold my-2 md:my-4">Tus Me Gusta</h1>
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm">
            <span class="text-secondary">{{ likedSongs.length }} {{ likedSongs.length === 1 ? 'canción' : 'canciones' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y canciones -->
    <div class="bg-dark-base px-4 md:px-8 py-6">
      <div v-if="likedSongs.length > 0" class="flex items-center gap-4 md:gap-8 mb-8">
        <button
          @click="handlePlayAll"
          class="bg-tiger-500 hover:bg-tiger-600 hover:scale-105 text-white rounded-full p-4 md:p-5 transition-all shadow-lg"
        >
          <IconPlay :size="24" class="md:hidden" />
          <IconPlay :size="32" class="hidden md:block" />
        </button>
      </div>

      <!-- Lista de canciones -->
      <div v-if="likedSongs.length > 0" class="mb-8">
        <!-- Header (solo desktop) -->
        <div class="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b border-dark-card text-secondary text-sm mb-2">
          <div class="col-span-1">#</div>
          <div class="col-span-7">Título</div>
          <div class="col-span-3">Álbum</div>
          <div class="col-span-1 text-right">Duración</div>
        </div>

        <!-- Canciones -->
        <div
          v-for="(song, index) in likedSongs"
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

          <!-- Título con cover -->
          <div class="col-span-8 md:col-span-7 min-w-0 flex items-center gap-3">
            <img
              :src="song.cover"
              :alt="song.title"
              class="w-10 h-10 rounded object-cover hidden md:block"
            />
            <div class="min-w-0">
              <h4 class="font-semibold text-sm md:text-base truncate" :class="isCurrentSong(song) ? 'text-tiger-500' : 'text-primary'">
                {{ song.title }}
              </h4>
              <p class="text-xs md:text-sm text-secondary truncate">{{ song.artistName }}</p>
            </div>
          </div>

          <!-- Álbum (solo desktop) -->
          <div class="hidden md:block col-span-3 text-secondary text-sm truncate">
            {{ song.albumName }}
          </div>

          <!-- Acciones y duración -->
          <div class="col-span-2 md:col-span-1 flex items-center gap-2 md:gap-4 justify-end">
            <button
              @click.stop="toggleFavoriteSong(song.id)"
              class="text-tiger-500 hover:text-tiger-400 transition-all"
            >
              <IconHeart :size="16" class="md:hidden" :filled="true" />
              <IconHeart :size="18" class="hidden md:block" :filled="true" />
            </button>
            <span class="hidden md:block text-secondary text-sm">{{ formatTime(song.duration) }}</span>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-16">
        <IconHeart :size="64" class="mx-auto text-secondary mb-4" />
        <h3 class="text-xl font-bold mb-2">No tienes canciones guardadas</h3>
        <p class="text-secondary mb-6">Guarda canciones tocando el icono del corazón</p>
        <NuxtLink
          to="/songs"
          class="inline-block bg-tiger-500 hover:bg-tiger-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Explorar canciones
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { data } = useData()
const { playSong, currentSong, isPlaying, formatTime } = usePlayer()
const { favoriteSongs, toggleFavoriteSong } = useFavorites()

// Obtener canciones favoritas
const likedSongs = computed(() => {
  if (!data.value.songs) return []
  return data.value.songs.filter((song: any) =>
    favoriteSongs.value.includes(song.id)
  )
})

const isCurrentSong = (song: any) => currentSong.value?.id === song.id
const isCurrentAndPlaying = (song: any) => isCurrentSong(song) && isPlaying.value

const handlePlayAll = () => {
  if (likedSongs.value.length > 0) {
    playSong(likedSongs.value[0], likedSongs.value)
  }
}

const handlePlaySong = (song: any) => {
  playSong(song, likedSongs.value)
}
</script>
