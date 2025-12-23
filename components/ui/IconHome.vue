<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" :fill="filled ? 'currentColor' : 'none'" stroke="currentColor" :stroke-width="filled ? 0 : 2" xmlns="http://www.w3.org/2000/svg">
    <path v-if="filled" d="M12 2L3 9v11a2 2 0 0 0 2 2h4v-7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7h4a2 2 0 0 0 2-2V9l-9-7z" />
    <template v-else>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </template>
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
