<template>
  <div class="min-h-full pb-20 md:pb-0">
    <!-- Mobile Header con perfil -->
    <MobileHeader />

    <!-- Header con gradiente morado -->
    <div class="bg-gradient-to-b from-indigo-800 via-indigo-900 to-dark-base px-4 md:px-8 py-4 md:py-6 pb-6 md:pb-8">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        <!-- Icono de corazón - más grande en móvil -->
        <div class="w-52 h-52 md:w-48 md:h-48 lg:w-60 lg:h-60 rounded-lg shadow-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center flex-shrink-0">
          <IconHeart :size="90" class="text-white md:hidden" :filled="true" />
          <IconHeart :size="120" class="text-white hidden md:block" :filled="true" />
        </div>
        <div class="flex-1 text-center md:text-left md:pb-4 w-full">
          <p class="text-xs md:text-sm font-semibold uppercase text-indigo-300">Playlist</p>
          <h1 class="text-2xl md:text-5xl lg:text-6xl font-bold my-2 md:my-4 break-words">Canciones que te gustan</h1>
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs md:text-sm">
            <span class="text-secondary">{{ likedSongs.length }} {{ likedSongs.length === 1 ? 'canción' : 'canciones' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y canciones -->
    <div class="bg-dark-base px-4 md:px-8 py-4 md:py-6">
      <!-- Controles desktop -->
      <div v-if="likedSongs.length > 0" class="hidden md:flex items-center gap-4 md:gap-8 mb-6 md:mb-8">
        <button
          @click="handlePlayAll"
          class="bg-tiger-500 hover:bg-tiger-600 hover:scale-105 text-white rounded-full p-4 transition-all shadow-lg"
        >
          <IconPause v-if="isLikedSongsPlaying" :size="28" />
          <IconPlay v-else :size="28" />
        </button>
      </div>

      <!-- Controles móvil -->
      <div v-if="likedSongs.length > 0" class="flex md:hidden items-center gap-4 mb-6">
        <div class="flex-1" />
        <button
          @click="handlePlayAll"
          class="bg-tiger-500 hover:bg-tiger-600 text-black rounded-full p-3 transition-all shadow-lg"
        >
          <IconPause v-if="isLikedSongsPlaying" :size="28" />
          <IconPlay v-else :size="28" />
        </button>
      </div>

      <!-- Lista de canciones -->
      <div v-if="likedSongs.length > 0" class="mb-8">
        <SongList
          :songs="likedSongs"
          preset="liked"
          context-type="liked"
          context-id="liked-songs"
          @open-menu="openSongActions"
        />
      </div>

      <!-- Estado vacío -->
      <EmptyState
        v-else
        :icon="IconHeart"
        title="No tienes canciones guardadas"
        description="Guarda canciones tocando el icono del corazón"
      >
        <NuxtLink to="/songs" class="btn-tiger">
          Explorar canciones
        </NuxtLink>
      </EmptyState>
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

const { data } = useData()
const { playSong, currentSong, isPlaying, togglePlay, playbackContext } = usePlayer()
const { favoriteSongs } = useFavorites()

// Estado para SongActionSheet
const showSongActions = ref(false)
const selectedSong = ref<any>(null)

const openSongActions = (song: any) => {
  selectedSong.value = song
  showSongActions.value = true
}

// Obtener canciones favoritas
const likedSongs = computed(() => {
  if (!data.value.songs) return []
  return data.value.songs.filter((song: any) =>
    favoriteSongs.value.includes(song.id)
  )
})

// Check if liked-songs is the current playback context
const isLikedSongsContext = computed(() =>
  playbackContext.value.type === 'liked' || playbackContext.value.type === 'liked-songs'
)

// Check if currently playing from liked-songs
const isLikedSongsPlaying = computed(() => {
  if (!currentSong.value || !isPlaying.value || !isLikedSongsContext.value) return false
  return likedSongs.value.some((song: any) => song.id === currentSong.value.id)
})

const handlePlayAll = () => {
  if (isLikedSongsPlaying.value) {
    togglePlay()
  } else if (currentSong.value && likedSongs.value.some((s: any) => s.id === currentSong.value.id) && isLikedSongsContext.value) {
    togglePlay()
  } else if (likedSongs.value.length > 0) {
    playSong(likedSongs.value[0], likedSongs.value, { type: 'liked', id: 'liked-songs' })
  }
}
</script>

