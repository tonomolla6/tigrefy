<template>
  <BaseContentCard
    kind="artist"
    :id="artist.id"
    :title="artist.name"
    :image="artist.image"
    :get-songs="() => getSongsByArtistId(artist.id)"
  >
    <div class="flex items-center gap-2">
      <p class="text-sm text-secondary truncate">Artista</p>
      <span
        v-if="artist.genres && artist.genres.length > 0"
        class="text-xs px-2 py-0.5 bg-tiger-500/20 text-tiger-400 rounded-full"
      >
        {{ artist.genres[0].name }}
      </span>
    </div>
  </BaseContentCard>
</template>

<script setup lang="ts">
defineProps<{
  artist: any
}>()

const { getSongsByArtistId } = useData()
</script>
