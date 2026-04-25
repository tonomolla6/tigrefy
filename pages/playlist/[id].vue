<template>
  <div v-if="playlist" class="min-h-full pb-20 md:pb-0">
    <!-- Mobile Header con perfil -->
    <MobileHeader />

    <!-- Header de la playlist -->
    <div class="bg-gradient-to-b from-tiger-600 to-dark-base px-4 md:px-8 py-4 md:py-6 pb-6 md:pb-8">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
        <SecureImage
          :src="playlist.cover"
          :alt="playlist.name"
          class="w-52 h-52 md:w-48 md:h-48 lg:w-60 lg:h-60 rounded shadow-2xl flex-shrink-0"
        />
        <div class="flex-1 text-center md:text-left md:pb-4 w-full">
          <p class="text-xs md:text-sm font-semibold uppercase">Playlist</p>
          <h1 class="text-2xl md:text-5xl lg:text-6xl font-bold my-2 md:my-4 break-words">{{ playlist.name }}</h1>
          <p class="text-secondary mb-2 text-sm md:text-base line-clamp-2 md:line-clamp-none">{{ playlist.description }}</p>
          <div class="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm flex-wrap">
            <span class="font-semibold">Tigrefy</span>
            <span class="text-secondary">•</span>
            <span class="text-secondary">{{ playlistSongs.length }} canciones</span>
            <span v-if="playlistSongs.length > 0" class="text-secondary">•</span>
            <span v-if="playlistSongs.length > 0" class="text-secondary">{{ totalDuration }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles y canciones -->
    <div class="bg-dark-base px-4 md:px-8 py-4 md:py-6">
      <!-- Controles desktop -->
      <div class="hidden md:flex items-center gap-4 md:gap-8 mb-6 md:mb-8 flex-wrap">
        <PlayButton
          v-if="playlistSongs.length > 0"
          :playing="isContextPlaying(playlistSongs)"
          size="lg"
          @click="handlePlayContext(playlistSongs)"
        />
        <Tooltip :text="isPlaylistSaved(playlist.id) ? 'Quitar de Tu biblioteca' : 'Guardar en Tu biblioteca'">
          <button
            @click="toggleSavePlaylist(playlist.id)"
            class="border border-gray-600 hover:border-white rounded-full p-2 transition-all hover:scale-105"
            :class="isPlaylistSaved(playlist.id) ? 'bg-tiger-500 border-tiger-500' : ''"
          >
            <IconCheck v-if="isPlaylistSaved(playlist.id)" :size="24" class="text-white" />
            <IconPlus v-else :size="24" class="text-secondary hover:text-white" />
          </button>
        </Tooltip>
      </div>

      <!-- Controles móvil -->
      <div class="flex md:hidden items-center gap-4 mb-6">
        <button
          @click="toggleSavePlaylist(playlist.id)"
          class="p-2 transition-all"
          :class="isPlaylistSaved(playlist.id) ? 'text-tiger-500' : 'text-secondary'"
        >
          <IconHeart :size="28" :filled="isPlaylistSaved(playlist.id)" />
        </button>
        <div class="flex-1" />
        <PlayButton
          v-if="playlistSongs.length > 0"
          :playing="isContextPlaying(playlistSongs)"
          size="lg"
          @click="handlePlayContext(playlistSongs)"
        />
      </div>

      <!-- Lista de canciones -->
      <div v-if="playlistSongs.length > 0" class="mb-8">
        <SongList
          :songs="playlistSongs"
          preset="playlist"
          context-type="playlist"
          :context-id="playlistId"
          @open-menu="openSongActions"
        />
      </div>

      <EmptyState
        v-else
        :icon="IconLibrary"
        title="Esta playlist está vacía"
        description="Empieza a añadir canciones para crear tu colección perfecta. Busca tus favoritas o explora nuevas canciones."
        centered
      >
        <NuxtLink to="/search" class="btn-tiger">
          Buscar canciones
        </NuxtLink>
        <NuxtLink to="/albums" class="px-6 py-3 rounded-full font-semibold border border-gray-700 hover:bg-dark-hover transition-colors">
          Explorar álbumes
        </NuxtLink>
      </EmptyState>
    </div>
  </div>

  <div v-else class="min-h-full flex items-center justify-center">
    <p class="text-secondary">Cargando playlist...</p>
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
import { formatDuration } from '~/utils/formatting'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const { getPlaylistById, getSongsByIds } = useData()
const { userPlaylists } = useUserPlaylists()
const { toggleSavePlaylist, isPlaylistSaved } = useFavorites()

const playlistId = route.params.id as string

const playlist = computed(() => {
  const systemPlaylist = getPlaylistById(playlistId)
  if (systemPlaylist) return systemPlaylist
  return userPlaylists.value.find(p => p.id === playlistId)
})

const playlistSongs = computed(() => {
  if (!playlist.value) return []
  return getSongsByIds(playlist.value.songIds)
})

const totalDuration = computed(() => {
  const totalSeconds = playlistSongs.value.reduce((acc, song) => acc + (song.duration || 0), 0)
  return formatDuration(totalSeconds)
})

// Usar composable de contexto de reproducción
const {
  isContextPlaying,
  handlePlayContext
} = useContextPlayback('playlist', playlistId)

// Sticky header al hacer scroll
useDetailStickyHeader({
  title: computed(() => playlist.value?.name),
  playing: computed(() => isContextPlaying(playlistSongs.value)),
  onPlay: () => handlePlayContext(playlistSongs.value),
  bgClass: 'bg-tiger-600'
})

// Estado para SongActionSheet
const showSongActions = ref(false)
const selectedSong = ref<any>(null)

const openSongActions = (song: any) => {
  selectedSong.value = song
  showSongActions.value = true
}

const onImageError = (e: Event) => handleImageError(e)
</script>
