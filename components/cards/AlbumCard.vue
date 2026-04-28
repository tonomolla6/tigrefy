<template>
  <BaseContentCard
    kind="album"
    :id="album.id"
    :title="album.title"
    :image="album.cover"
    :get-songs="() => getSongsByAlbumId(album.id)"
  >
    <p class="text-sm text-secondary truncate">{{ album.artistName }}</p>
    <p class="text-xs text-secondary mt-1">{{ album.releaseDate?.substring(0, 4) }}</p>
  </BaseContentCard>
</template>

<script setup lang="ts">
defineProps<{
  album: any
}>()

const { getSongsByAlbumId } = useData()
</script>
