<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { initAuth } = useAuth()
const { init: initScrollRestore } = useScrollRestore()

// Initialize auth on app load
initAuth()

// Initialize scroll position restore (for browser back/forward navigation)
onMounted(() => {
  initScrollRestore()
})
</script>
