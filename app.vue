<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Overlay de carga mientras se inicializa auth -->
    <div
      v-if="isLoading"
      class="fixed inset-0 z-[200] bg-black flex items-center justify-center"
    >
      <LoadingDots />
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoading, initAuth } = useAuth()
const { init: initScrollRestore } = useScrollRestore()

// Initialize auth on app load
initAuth()

// Initialize scroll position restore (for browser back/forward navigation)
onMounted(() => {
  initScrollRestore()
})
</script>
