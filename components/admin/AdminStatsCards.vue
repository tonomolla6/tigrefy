<template>
  <div v-if="stats" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
    <div class="bg-dark-hover rounded-lg p-4">
      <p class="text-gray-400 text-xs">Artistas</p>
      <p class="text-2xl font-bold text-white">{{ artistsList.length }}</p>
    </div>
    <div class="bg-dark-hover rounded-lg p-4">
      <p class="text-gray-400 text-xs">Álbumes</p>
      <p class="text-2xl font-bold text-white">{{ stats.totalAlbums }}</p>
      <p class="text-xs text-gray-500">{{ stats.publicAlbums }} públicos · {{ stats.privateAlbums }} privados</p>
    </div>
    <div class="bg-dark-hover rounded-lg p-4">
      <p class="text-gray-400 text-xs">Canciones</p>
      <p class="text-2xl font-bold text-white">{{ stats.totalSongs }}</p>
      <p class="text-xs text-gray-500">{{ stats.publicSongs }} públicas · {{ stats.privateSongs }} privadas</p>
    </div>
    <div class="bg-dark-hover rounded-lg p-4">
      <p class="text-gray-400 text-xs">Playlists</p>
      <p class="text-2xl font-bold text-white">{{ playlistsList.length }}</p>
    </div>
    <div class="bg-dark-hover rounded-lg p-4">
      <p class="text-gray-400 text-xs">Usuarios</p>
      <p class="text-2xl font-bold text-white">{{ usersList.length }}</p>
      <p class="text-xs text-gray-500">{{ usersByRole.tigre }} tigre · {{ usersByRole.user }} user · {{ usersByRole.guest }} guest</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { artistsList, playlistsList, usersList, stats, usersByRole } = useAdminData()
</script>
