<template>
  <BaseContentCard
    kind="album"
    :id="album.id"
    :title="album.title"
    :image="album.cover"
    :get-songs="() => getSongsByAlbumId(album.id)"
  >
    <p class="text-sm text-secondary truncate">{{ album.artistName }}</p>
    <div class="flex items-center gap-2 mt-1">
      <p class="text-xs text-secondary">{{ album.releaseDate?.substring(0, 4) }}</p>
      <span
        v-if="album.genres && album.genres.length > 0"
        class="text-xs px-2 py-0.5 bg-tiger-500/20 text-tiger-400 rounded-full"
      >
        {{ album.genres[0] }}
      </span>
    </div>
  </BaseContentCard>
</template>

<script setup lang="ts">
defineProps<{
  album: any
}>()

const { getSongsByAlbumId } = useData()
</script>
