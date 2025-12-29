<template>
  <div v-if="album" class="min-h-full pb-20 md:pb-0">
    <!-- Mobile Header con perfil -->
    <MobileHeader />

    <!-- Header del álbum -->
    <div class="bg-gradient-to-b from-tiger-800 via-tiger-900 to-dark-base px-4 md:px-8 py-6 md:py-8 pb-8">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        <img
          :src="album.cover"
          :alt="album.title"
          class="w-56 h-56 md:w-60 md:h-60 rounded-lg shadow-2xl"
          @error="onImageError"
        />
        <div class="flex-1 pb-0 md:pb-4 text-center md:text-left">
          <p class="text-xs md:text-sm font-semibold uppercase text-tiger-300">Álbum</p>
          <h1 class="text-3xl md:text-6xl lg:text-7xl font-bold my-2 md:my-4">{{ album.title }}</h1>
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm">
            <NuxtLink
              :to="`/artist/${album.artistId}`"
              class="font-semibold hover:underline transition-colors"
            >
              {{ album.artistName }}
            </NuxtLink>
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
        <button
          @click="handlePlayContext(albumSongs)"
          class="bg-tiger-500 hover:bg-tiger-600 hover:scale-105 text-white rounded-full p-4 md:p-5 transition-all shadow-lg"
        >
          <IconPause v-if="isContextPlaying(albumSongs)" :size="32" />
          <IconPlay v-else :size="32" />
        </button>
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
        <button
          @click="handlePlayContext(albumSongs)"
          class="bg-tiger-500 hover:bg-tiger-600 text-black rounded-full p-3 transition-all shadow-lg"
        >
          <IconPause v-if="isContextPlaying(albumSongs)" :size="28" />
          <IconPlay v-else :size="28" />
        </button>
      </div>

      <!-- Lista de canciones -->
      <div class="mb-8">
        <!-- Header (solo desktop) -->
        <div class="hidden md:grid gap-4 px-4 py-2 border-b border-gray-800 text-secondary text-sm mb-2" style="grid-template-columns: 40px 1fr 80px;">
          <div class="text-center">#</div>
          <div>Título</div>
          <div class="flex justify-end">
            <IconClock :size="16" />
          </div>
        </div>

        <!-- Canciones usando SongListRow -->
        <SongListRow
          v-for="(song, index) in albumSongs"
          :key="song.id"
          :song="song"
          :index="index + 1"
          :is-playing="isCurrentAndPlaying(song)"
          :is-active="isCurrentSongInContext(song)"
          :is-favorite="isFavoriteSong(song.id)"
          :is-selected="selectedSongId === song.id"
          :show-cover="false"
          @play="handlePlaySong(song, albumSongs)"
          @select="selectedSongId = song.id"
          @toggle-favorite="toggleFavoriteSong(song.id)"
          @open-menu="openSongActions(song)"
        />
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

  <!-- Song Action Sheet -->
  <SongActionSheet
    :isOpen="showSongActions"
    :song="selectedSong"
    @close="showSongActions = false"
  />
</template>

<script setup lang="ts">
import { handleImageError } from '~/utils/image'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const { getAlbumById, getSongsByAlbumId } = useData()
const { toggleFavoriteSong, isFavoriteSong, toggleSaveAlbum, isAlbumSaved } = useFavorites()

const albumId = route.params.id as string
const album = computed(() => getAlbumById(albumId))
const albumSongs = computed(() => getSongsByAlbumId(albumId))

// Usar composable de contexto de reproducción
const {
  isCurrentSongInContext,
  isCurrentAndPlaying,
  isContextPlaying,
  handlePlaySong,
  handlePlayContext
} = useContextPlayback('album', albumId)

// Estado para selección de canción (desktop)
const selectedSongId = ref<string | null>(null)

// Estado para SongActionSheet
const showSongActions = ref(false)
const selectedSong = ref<any>(null)

const openSongActions = (song: any) => {
  selectedSong.value = song
  showSongActions.value = true
}

const onImageError = (e: Event) => handleImageError(e)
</script>
