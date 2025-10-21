<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <polygon points="5 4 15 12 5 20 5 4" />
    <polygon points="19 5 19 19 17 19 17 5 19 5" />
  </svg>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: Number,
    default: 24
  }
})
</script>
