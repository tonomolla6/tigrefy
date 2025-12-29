<template>
  <!-- Desktop -->
  <div
    class="hidden md:grid gap-4 items-center px-4 py-3 rounded-lg hover:bg-dark-highlight transition-colors group cursor-pointer"
    :style="{ gridTemplateColumns: gridColumns }"
    @click="$emit('play')"
  >
    <!-- Número/Play/Animación -->
    <div class="flex items-center justify-center">
      <PlayingIndicator v-if="isPlaying" class="group-hover:hidden" />
      <span v-else class="text-secondary group-hover:hidden">{{ index }}</span>
      <div class="hidden group-hover:block">
        <IconPause v-if="isPlaying" :size="20" class="text-tiger-500" />
        <IconPlay v-else :size="20" class="text-tiger-500" />
      </div>
    </div>

    <!-- Título y artista -->
    <div class="flex items-center gap-3 min-w-0">
      <img
        v-if="showCover"
        :src="song.cover"
        :alt="song.title"
        class="w-12 h-12 rounded flex-shrink-0"
        @error="onImageError"
      />
      <div class="min-w-0">
        <h4 class="font-semibold truncate" :class="isActive ? 'text-tiger-500' : 'text-primary'">
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

    <!-- Slot para columnas adicionales (reproducciones, álbum, etc.) -->
    <slot name="extra-columns" />

    <!-- Acciones y duración -->
    <div class="flex items-center gap-4 justify-end">
      <button
        v-if="showFavorite"
        @click.stop="$emit('toggle-favorite')"
        class="opacity-0 group-hover:opacity-100 text-secondary hover:text-tiger-500 transition-all"
        :class="{ 'opacity-100 text-tiger-500': isFavorite }"
      >
        <IconHeart :size="18" :filled="isFavorite" />
      </button>
      <span class="text-secondary text-sm">{{ formattedDuration }}</span>
    </div>
  </div>

  <!-- Mobile -->
  <div
    class="md:hidden flex items-center gap-3 px-2 py-3 rounded-lg active:bg-dark-highlight transition-colors"
    @click="$emit('play')"
  >
    <!-- Número/Play -->
    <div class="w-8 flex items-center justify-center flex-shrink-0">
      <PlayingIndicator v-if="isPlaying" size="sm" />
      <span v-else class="text-secondary text-sm">{{ index }}</span>
    </div>

    <!-- Info de canción -->
    <div class="flex-1 min-w-0">
      <h4 class="font-semibold text-sm truncate" :class="isActive ? 'text-tiger-500' : 'text-primary'">
        {{ song.title }}
      </h4>
      <NuxtLink
        v-if="showArtist"
        :to="`/artist/${song.artistId}`"
        @click.stop
        class="text-xs text-secondary hover:text-white hover:underline truncate block transition-colors"
      >
        {{ song.artistName }}
      </NuxtLink>
    </div>

    <!-- Menú de acciones móvil -->
    <button
      v-if="showMobileMenu"
      @click.stop="$emit('open-menu')"
      class="p-2 text-secondary hover:text-white transition-colors"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '~/utils/formatting'
import { handleImageError } from '~/utils/image'

const props = withDefaults(defineProps<{
  song: any
  index: number
  isPlaying?: boolean
  isActive?: boolean
  isFavorite?: boolean
  showCover?: boolean
  showArtist?: boolean
  showFavorite?: boolean
  showMobileMenu?: boolean
  gridColumns?: string
}>(), {
  isPlaying: false,
  isActive: false,
  isFavorite: false,
  showCover: false,
  showArtist: true,
  showFavorite: true,
  showMobileMenu: true,
  gridColumns: '40px 1fr 80px'
})

defineEmits<{
  play: []
  'toggle-favorite': []
  'open-menu': []
}>()

const formattedDuration = computed(() => formatTime(props.song.duration))

const onImageError = (e: Event) => handleImageError(e)
</script>
