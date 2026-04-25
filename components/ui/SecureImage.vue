<script setup lang="ts">
/**
 * Imagen pública servida desde R2 (covers, artistas, playlists).
 * En dev sin R2_MEDIA_DOMAIN configurado, sirve desde /public.
 */

const props = defineProps<{
  src: string | null | undefined
  alt?: string
  class?: string
  fallback?: string
}>()

const { getImageUrl } = useMediaUrl()

const resolvedSrc = computed(() => {
  if (!props.src) return props.fallback ? getImageUrl(props.fallback) : ''
  return getImageUrl(props.src)
})

const hasError = ref(false)

watch(() => props.src, () => {
  hasError.value = false
})

const onError = () => {
  hasError.value = true
}
</script>

<template>
  <img
    v-if="resolvedSrc && !hasError"
    :src="resolvedSrc"
    :alt="alt"
    :class="[props.class, 'object-cover']"
    loading="lazy"
    @error="onError"
  />
  <div
    v-else
    :class="props.class"
    class="bg-dark-lighter flex items-center justify-center"
  >
    <IconMusic class="w-1/3 h-1/3 text-gray-600" />
  </div>
</template>
