<template>
  <section>
    <slot name="header" />

    <SongList
      :songs="displayedSongs"
      preset="artist"
      context-type="artist"
      :context-id="artistId"
      :show-mobile-menu="false"
      :show-plays-on-mobile="true"
    />

    <button
      v-if="popularSongs.length > 5 && !showAllSongs"
      @click="showAllSongs = true"
      class="text-secondary hover:text-primary text-sm font-semibold mt-4 transition-colors"
    >
      Ver más
    </button>
    <button
      v-if="showAllSongs"
      @click="showAllSongs = false"
      class="text-secondary hover:text-primary text-sm font-semibold mt-4 transition-colors"
    >
      Mostrar menos
    </button>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  artistId: string
  excludeSongId?: string
}>()

const { getSongsByArtistId } = useData()

const popularSongs = computed(() =>
  getSongsByArtistId(props.artistId)
    .filter(s => !props.excludeSongId || s.id !== props.excludeSongId)
    .sort((a, b) => (b.plays || 0) - (a.plays || 0))
    .slice(0, 10)
)

const showAllSongs = ref(false)
const displayedSongs = computed(() =>
  showAllSongs.value ? popularSongs.value : popularSongs.value.slice(0, 5)
)
</script>
