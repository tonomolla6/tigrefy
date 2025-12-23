<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" :fill="filled ? 'currentColor' : 'none'" stroke="currentColor" :stroke-width="filled ? 2.5 : 2" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: Number,
    default: 24
  },
  filled: {
    type: Boolean,
    default: false
  }
})
</script>
