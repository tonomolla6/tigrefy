<script setup lang="ts">
/**
 * Componente de imagen segura que obtiene URLs firmadas desde R2
 * En modo desarrollo local, usa las rutas directas.
 * Usa el composable useMediaUrl para cachear URLs.
 */

// Flag para activar URLs firmadas (sincronizado con usePlayer.ts)
const useSecureUrls = true // Cambiar a false para desarrollo local

const props = defineProps<{
  src: string | null | undefined
  alt?: string
  class?: string
  fallback?: string
}>()

const { getImageUrl } = useMediaUrl()

const resolvedSrc = ref<string>('')
const isLoading = ref(true)
const hasError = ref(false)

// Resolver URL firmada cuando cambia el src
watch(
  () => props.src,
  async (newSrc) => {
    if (!newSrc) {
      resolvedSrc.value = props.fallback || ''
      isLoading.value = false
      return
    }

    // Si ya es una URL completa (http/https), usarla directamente
    if (newSrc.startsWith('http')) {
      resolvedSrc.value = newSrc
      isLoading.value = false
      return
    }

    // Modo desarrollo: usar path directo
    if (!useSecureUrls) {
      resolvedSrc.value = newSrc.startsWith('/') ? newSrc : `/${newSrc}`
      isLoading.value = false
      return
    }

    // Modo producción: obtener URL firmada
    isLoading.value = true
    hasError.value = false

    try {
      resolvedSrc.value = await getImageUrl(newSrc)
    } catch {
      // Fallback al path original o imagen por defecto
      resolvedSrc.value = props.fallback || newSrc
      hasError.value = true
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true }
)

const onError = () => {
  if (!hasError.value) {
    hasError.value = true
    resolvedSrc.value = props.fallback || ''
  }
}
</script>

<template>
  <!-- Loading skeleton -->
  <div
    v-if="isLoading"
    :class="props.class"
    class="bg-dark-lighter animate-pulse"
  />
  <!-- Image loaded successfully -->
  <img
    v-else-if="resolvedSrc && !hasError"
    :src="resolvedSrc"
    :alt="alt"
    :class="[props.class, 'object-cover']"
    loading="lazy"
    @error="onError"
  />
  <!-- Error or no image fallback -->
  <div
    v-else
    :class="props.class"
    class="bg-dark-lighter flex items-center justify-center"
  >
    <IconMusic class="w-1/3 h-1/3 text-gray-600" />
  </div>
</template>
