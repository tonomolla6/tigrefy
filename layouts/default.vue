<template>
  <div class="h-screen flex flex-col overflow-hidden bg-dark-base">
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar (Desktop) -->
      <MainSidebar />

      <!-- Contenido principal -->
      <main class="flex-1 overflow-y-auto pb-36 md:pb-28">
        <slot />
      </main>
    </div>

    <!-- Reproductor -->
    <MusicPlayer />

    <!-- Navegación Móvil -->
    <MobileNav />

    <!-- Modal Global -->
    <Modal />

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
const { loadData } = useData()
const { loadFavorites } = useFavorites()
const { loadUserPlaylists } = useUserPlaylists()

onMounted(async () => {
  await loadData()
  loadFavorites()
  loadUserPlaylists()
})
</script>
