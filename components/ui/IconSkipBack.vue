<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <polygon points="19 20 9 12 19 4 19 20" />
    <polygon points="5 19 5 5 7 5 7 19 5 19" />
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
