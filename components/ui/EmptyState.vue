<template>
  <div class="text-center py-12 md:py-16" :class="{ 'max-w-md mx-auto': centered }">
    <!-- Icon container -->
    <div v-if="$slots.icon || icon" class="mb-4 md:mb-6">
      <slot name="icon">
        <div
          v-if="iconBackground"
          class="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
          :class="iconBackgroundClass"
        >
          <component :is="icon" :size="32" class="text-secondary opacity-50" />
        </div>
        <component v-else :is="icon" :size="64" class="text-secondary mx-auto opacity-50" />
      </slot>
    </div>

    <!-- Title -->
    <h3 v-if="title" class="text-xl md:text-2xl font-bold mb-2">{{ title }}</h3>

    <!-- Description -->
    <p v-if="description" class="text-secondary text-sm md:text-base mb-6">{{ description }}</p>

    <!-- Actions slot -->
    <div v-if="$slots.default" class="flex gap-3 justify-center flex-wrap">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon?: any
  title?: string
  description?: string
  iconBackground?: boolean
  iconBackgroundClass?: string
  centered?: boolean
}>(), {
  iconBackground: false,
  iconBackgroundClass: 'bg-dark-hover',
  centered: false
})
</script>
