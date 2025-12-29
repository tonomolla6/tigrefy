<template>
  <button
    @click="$emit('click')"
    class="px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors flex-shrink-0"
    :class="active ? 'bg-white text-black' : 'bg-dark-hover text-white hover:bg-dark-card'"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  active?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>
