<template>
  <div class="h-screen flex flex-col overflow-hidden bg-dark-base">
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar Izquierdo (Desktop) -->
      <MainSidebar />

      <!-- Contenido principal -->
      <main class="flex-1 min-w-0 overflow-y-auto pb-36 md:pb-28">
        <slot />
      </main>

      <!-- Sidebar Derecho - Now Playing (Desktop) -->
      <NowPlayingSidebar />
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
