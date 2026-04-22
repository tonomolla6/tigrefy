<template>
  <button
    @click="$emit('click')"
    class="bg-tiger-500 hover:bg-tiger-600 hover:scale-105 text-white rounded-full transition-all shadow-lg flex items-center justify-center"
    :class="sizeClasses[size]"
  >
    <IconPause v-if="playing" :size="iconSizes[size]" />
    <IconPlay v-else :size="iconSizes[size]" />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  playing?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  playing: false,
  size: 'md',
})

defineEmits<{
  click: []
}>()

const sizeClasses = {
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4 md:p-5',
}

const iconSizes = {
  sm: 20,
  md: 24,
  lg: 28,
}
</script>
