<template>
  <NuxtLink
    :to="`/artist/${artistId}`"
    class="inline-flex items-center gap-2 group"
  >
    <SecureImage
      v-if="showImage && image"
      :src="image"
      :alt="name"
      :class="imageClass"
    />
    <span :class="[textClass, hoverUnderline && 'group-hover:underline']">
      {{ name }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  artistId: string
  name: string
  image?: string | null
  showImage?: boolean
  imageClass?: string
  textClass?: string
  hoverUnderline?: boolean
}>(), {
  showImage: true,
  imageClass: 'w-6 h-6 rounded-full',
  textClass: 'font-semibold',
  hoverUnderline: true,
})
</script>
