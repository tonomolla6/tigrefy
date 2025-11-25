<template>
  <div
    class="relative overflow-hidden rounded-xl cursor-pointer group
           bg-gradient-to-r from-tiger-900 via-tiger-950 to-dark-base"
    @click="handlePlay"
  >
    <!-- Overlay -->
    <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />

    <div class="relative flex items-center gap-6 p-6 md:p-8">
      <!-- Cover con sombra -->
      <div class="relative flex-shrink-0">
        <img
          :src="song.cover"
          :alt="song.title"
          class="w-28 h-28 md:w-40 md:h-40 rounded-lg shadow-2xl object-cover"
        />
        <!-- Badge NUEVO -->
        <span
          class="absolute -top-2 -right-2 bg-tiger-500 text-white text-xs
                 font-bold px-3 py-1 rounded-full shadow-lg"
        >
          NUEVO
        </span>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <p class="text-tiger-400 text-xs md:text-sm font-semibold uppercase tracking-wider mb-2">
          Nuevo Lanzamiento
        </p>
        <h2 class="text-2xl md:text-4xl font-bold mb-2 truncate">
          {{ song.title }}
        </h2>
        <p class="text-lg text-secondary mb-4">{{ song.artistName }}</p>

        <!-- Botones de acción -->
        <div class="flex items-center gap-4">
          <button
            @click.stop="handlePlay"
            class="bg-tiger-500 hover:bg-tiger-400 text-white font-bold
                   py-3 px-6 md:px-8 rounded-full flex items-center gap-2
                   transition-colors duration-200 shadow-lg"
          >
            <IconPlay :size="20" />
            <span class="hidden sm:inline">Reproducir</span>
          </button>
          <button
            @click.stop="toggleFavorite"
            class="p-3 rounded-full border-2 border-white/30 hover:border-white
                   transition-colors duration-200"
            :class="isFavorite ? 'border-tiger-500 text-tiger-500' : ''"
            aria-label="Favorito"
          >
            <IconHeart :size="24" :filled="isFavorite" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  queue: {
    type: Array,
    default: () => []
  }
})

const { playSong } = usePlayer()
const { toggleFavoriteSong, isFavoriteSong } = useFavorites()
const { addToRecent } = useRecentlyPlayed()

const isFavorite = computed(() => isFavoriteSong(props.song.id))

const handlePlay = () => {
  playSong(props.song, props.queue.length > 0 ? props.queue : [props.song])
  addToRecent({
    type: 'song',
    id: props.song.id,
    cover: props.song.cover,
    title: props.song.title,
    artistName: props.song.artistName
  })
}

const toggleFavorite = () => {
  toggleFavoriteSong(props.song.id)
}
</script>
