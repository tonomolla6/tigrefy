<template>
  <div>
    <!-- Loading state while checking auth -->
    <div v-if="isLoading" class="h-screen bg-black flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-tiger-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-400 text-sm">Cargando...</span>
      </div>
    </div>
    <!-- Main app -->
    <template v-else>
      <NuxtRouteAnnouncer />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>
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
