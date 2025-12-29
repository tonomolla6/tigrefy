<template>
  <div class="song-list">
    <!-- Header (desktop) -->
    <SongListHeader
      v-if="showHeader"
      :columns="columns"
      :grid-template-columns="gridTemplateColumns"
      :hidden-columns="hiddenColumns"
      @toggle-column="toggleColumn"
    />

    <!-- Filas -->
    <div
      v-for="(song, index) in songs"
      :key="song.id"
      class="song-list-item"
    >
      <!-- Desktop Row -->
      <div
        class="list-row hidden md:grid gap-3 items-center px-4 py-2 rounded-lg group hover:bg-dark-hover/50 transition-colors"
        :class="selectedSongId === song.id ? 'bg-dark-hover/70' : ''"
        :style="{ gridTemplateColumns }"
        @click="selectedSongId = song.id"
      >
        <template v-for="column in visibleColumns" :key="column.id">
          <!-- Index -->
          <div v-if="column.id === 'index'" class="flex items-center justify-center">
            <PlayingIndicator v-if="isCurrentAndPlaying(song)" class="group-hover:hidden" />
            <span v-else class="text-secondary group-hover:hidden">{{ index + 1 }}</span>
            <button class="hidden group-hover:block" @click.stop="handlePlay(song)">
              <IconPause v-if="isCurrentAndPlaying(song)" :size="20" class="text-tiger-500" />
              <IconPlay v-else :size="20" class="text-tiger-500" />
            </button>
          </div>

          <!-- Title (incluye cover + título + artista) -->
          <div v-else-if="column.id === 'title'" class="flex items-center gap-3 min-w-0 overflow-hidden">
            <img
              v-if="showCover"
              :src="song.cover"
              :alt="song.title"
              class="w-12 h-12 rounded flex-shrink-0"
              @error="onImageError"
            />
            <div class="min-w-0 overflow-hidden">
              <h4 class="font-semibold truncate" :class="isCurrentSongInContext(song) ? 'text-tiger-500' : 'text-primary'">
                {{ song.title }}
              </h4>
              <NuxtLink
                v-if="showArtist"
                :to="`/artist/${song.artistId}`"
                @click.stop
                class="text-sm text-secondary hover:text-white hover:underline truncate block transition-colors"
              >
                {{ song.artistName }}
              </NuxtLink>
            </div>
          </div>

          <!-- Plays -->
          <div v-else-if="column.id === 'plays'" class="text-secondary text-sm text-center">
            {{ formatPlays(song.plays) }}
          </div>

          <!-- Album -->
          <div v-else-if="column.id === 'album'" class="text-secondary text-sm truncate overflow-hidden">
            <NuxtLink
              :to="`/album/${song.albumId}`"
              @click.stop
              class="hover:text-primary hover:underline transition-colors"
            >
              {{ song.albumName }}
            </NuxtLink>
          </div>

          <!-- Fecha añadido -->
          <div v-else-if="column.id === 'dateAdded'" class="text-secondary text-sm">
            {{ formatDateAdded(song.addedAt) }}
          </div>

          <!-- Favorite -->
          <div v-else-if="column.id === 'favorite'" class="flex items-center justify-center">
            <button
              @click.stop="toggleFavoriteSong(song.id)"
              class="opacity-0 group-hover:opacity-100 text-secondary hover:text-tiger-500 transition-all"
              :class="{ 'opacity-100 text-tiger-500': isFavoriteSong(song.id) }"
            >
              <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
            </button>
          </div>

          <!-- Duration -->
          <div v-else-if="column.id === 'duration'" class="flex items-center justify-center">
            <span class="text-secondary text-sm">{{ formatTime(song.duration) }}</span>
          </div>

          <!-- Menu (vacío) -->
          <div v-else-if="column.id === 'menu'" />
        </template>
      </div>

      <!-- Mobile Row -->
      <div
        class="md:hidden flex items-center gap-3 px-2 py-3 rounded-lg active:bg-dark-highlight transition-colors"
        @click="handlePlay(song)"
      >
        <div class="w-8 flex items-center justify-center flex-shrink-0">
          <PlayingIndicator v-if="isCurrentAndPlaying(song)" size="sm" />
          <span v-else class="text-secondary text-sm">{{ index + 1 }}</span>
        </div>

        <img
          v-if="showCover"
          :src="song.cover"
          :alt="song.title"
          class="w-12 h-12 rounded flex-shrink-0"
          @error="onImageError"
        />

        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-sm truncate" :class="isCurrentSongInContext(song) ? 'text-tiger-500' : 'text-primary'">
            {{ song.title }}
          </h4>
          <span v-if="showArtist" class="text-xs text-secondary truncate block">
            {{ song.artistName }}
          </span>
          <span v-else-if="showPlaysOnMobile" class="text-xs text-secondary">
            {{ formatPlays(song.plays) }}
          </span>
        </div>

        <button
          @click.stop="toggleFavoriteSong(song.id)"
          class="p-2 text-secondary hover:text-tiger-500 transition-all flex-shrink-0"
          :class="{ 'text-tiger-500': isFavoriteSong(song.id) }"
        >
          <IconHeart :size="18" :filled="isFavoriteSong(song.id)" />
        </button>

        <button
          v-if="showMobileMenu"
          @click.stop="$emit('open-menu', song)"
          class="p-2 text-secondary hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTime, formatPlaysDetailed as formatPlays, formatRelativeDate } from '~/utils/formatting'
import { handleImageError } from '~/utils/image'
import type { PresetName } from '~/composables/useSongListColumns'
import { useSongListColumns } from '~/composables/useSongListColumns'

const props = withDefaults(defineProps<{
  songs: any[]
  preset: PresetName
  contextType: 'artist' | 'album' | 'playlist' | 'search' | 'liked'
  contextId: string
  showMobileMenu?: boolean
  showPlaysOnMobile?: boolean
}>(), {
  showMobileMenu: true,
  showPlaysOnMobile: false,
})

defineEmits<{
  'open-menu': [song: any]
}>()

// Sistema de columnas
const { columns, visibleColumns, hiddenColumns, showArtist, showCover, showHeader, gridTemplateColumns, toggleColumn } = useSongListColumns(props.preset)

// Player y favoritos
const { playSong, currentSong, isPlaying, togglePlay, playbackContext } = usePlayer()
const { toggleFavoriteSong, isFavoriteSong } = useFavorites()

// Estado de selección
const selectedSongId = ref<string | null>(null)

// Verificar contexto de reproducción
const isThisContext = computed(() =>
  playbackContext.value.type === props.contextType && playbackContext.value.id === props.contextId
)

const isCurrentSongInContext = (song: any) =>
  currentSong.value?.id === song.id && isThisContext.value

const isCurrentAndPlaying = (song: any) =>
  isCurrentSongInContext(song) && isPlaying.value

const isCurrentSong = (song: any) =>
  currentSong.value?.id === song.id

// Manejar reproducción
const handlePlay = (song: any) => {
  if (isCurrentSong(song)) {
    togglePlay()
  } else {
    playSong(song, props.songs, { type: props.contextType, id: props.contextId })
  }
}

const onImageError = (e: Event) => handleImageError(e)

// Formatear fecha añadido
const formatDateAdded = (date?: string) => {
  if (!date) return ''
  return formatRelativeDate(date)
}
</script>
