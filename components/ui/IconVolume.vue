<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
    <polygon v-if="level !== 'mute'" points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <polygon v-else points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" fill="none" />
    <line v-if="level === 'mute'" x1="23" y1="9" x2="17" y2="15" />
    <line v-if="level === 'mute'" x1="17" y1="9" x2="23" y2="15" />
    <path v-if="level === 'low'" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path v-if="level === 'medium' || level === 'high'" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path v-if="level === 'high'" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: Number,
    default: 24
  },
  level: {
    type: String as () => 'mute' | 'low' | 'medium' | 'high',
    default: 'high'
  }
})
</script>
