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
const isLoaded = ref(false)

watch(() => resolvedSrc.value, () => {
  hasError.value = false
  isLoaded.value = false
})

const onError = () => {
  hasError.value = true
}

const onLoad = () => {
  isLoaded.value = true
}
</script>

<template>
  <!-- Wrapper que mantiene la forma (rounded, aspect-ratio…) y aloja placeholder + img -->
  <div :class="[props.class, 'relative overflow-hidden bg-dark-lighter']">
    <!-- Placeholder con shimmer mientras la imagen no ha cargado -->
    <div
      v-if="resolvedSrc && !hasError && !isLoaded"
      class="absolute inset-0 bg-white/5 animate-pulse"
    ></div>

    <!-- Imagen real (fade-in cuando carga) -->
    <img
      v-if="resolvedSrc && !hasError"
      :src="resolvedSrc"
      :alt="alt"
      class="w-full h-full object-cover transition-opacity duration-300"
      :class="isLoaded ? 'opacity-100' : 'opacity-0'"
      loading="lazy"
      @load="onLoad"
      @error="onError"
    />

    <!-- Fallback si no hay src o error -->
    <div
      v-if="!resolvedSrc || hasError"
      class="absolute inset-0 flex items-center justify-center"
    >
      <IconMusic class="w-1/3 h-1/3 text-gray-600" />
    </div>
  </div>
</template>
