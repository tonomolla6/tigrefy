<template>
  <div>
    <!-- Loading state while checking auth -->
    <div v-if="isLoading" class="h-screen bg-black flex items-center justify-center">
      <LoadingDots />
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
