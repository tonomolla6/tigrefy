<template>
  <BaseContentCard
    kind="playlist"
    :id="playlist.id"
    :title="playlist.name"
    :image="playlist.cover"
    :get-songs="() => getSongsByIds(playlist.songIds)"
  >
    <p class="text-sm text-secondary line-clamp-2">{{ playlist.description }}</p>
  </BaseContentCard>
</template>

<script setup lang="ts">
defineProps<{
  playlist: any
}>()

const { getSongsByIds } = useData()
</script>
