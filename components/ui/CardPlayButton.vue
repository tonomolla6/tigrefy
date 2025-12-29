<template>
  <button
    @click.prevent.stop="$emit('click')"
    class="absolute bg-tiger-500 hover:bg-tiger-400 hover:scale-105 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center"
    :class="[sizeClass, positionClass, visibilityClass]"
    :aria-label="ariaLabel"
  >
    <IconPause v-if="isPlaying" :size="iconSize" class="text-white" />
    <IconPlay v-else :size="iconSize" class="text-white ml-0.5" />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  isPlaying?: boolean
  isVisible?: boolean
  size?: 'sm' | 'md' | 'lg'
  position?: 'bottom-right' | 'center'
  ariaLabel?: string
}>(), {
  isPlaying: false,
  isVisible: false,
  size: 'md',
  position: 'bottom-right',
  ariaLabel: 'Reproducir'
})

defineEmits<{
  click: []
}>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-10 h-10'
    case 'lg': return 'w-14 h-14'
    default: return 'w-12 h-12'
  }
})

const iconSize = computed(() => {
  switch (props.size) {
    case 'sm': return 18
    case 'lg': return 26
    default: return 22
  }
})

const positionClass = computed(() => {
  switch (props.position) {
    case 'center': return 'bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2'
    default: return 'bottom-2 right-2'
  }
})

const visibilityClass = computed(() => {
  return props.isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0'
})
</script>
