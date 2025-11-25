<template>
  <div>
    <LoginScreen v-if="!isAuthenticated" />
    <template v-else>
      <NuxtRouteAnnouncer />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, checkAuth } = useAuth()

onMounted(() => {
  checkAuth()
})
</script>
