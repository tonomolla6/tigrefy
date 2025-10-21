<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    <text v-if="mode === 'one'" x="12" y="15" font-size="10" text-anchor="middle" fill="currentColor" stroke="none">1</text>
  </svg>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: Number,
    default: 24
  },
  mode: {
    type: String as () => 'off' | 'all' | 'one',
    default: 'off'
  }
})
</script>
