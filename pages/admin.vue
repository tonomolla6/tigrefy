<template>
  <div class="p-6 pb-40 md:pb-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white mb-2">Panel de Administración</h1>
      <p class="text-gray-400 text-sm">Gestiona usuarios, artistas, álbumes, canciones y playlists</p>
    </div>

    <!-- Stats -->
    <AdminStatsCards />

    <!-- Tabs -->
    <div class="flex gap-2 mb-4 flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="activeTab === tab.value ? 'bg-white text-black' : 'bg-dark-hover text-white hover:bg-gray-700'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading inicial -->
    <div v-if="isLoadingContent" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-tiger-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Tab activo -->
    <template v-else>
      <AdminArtistsTab v-if="activeTab === 'artists'" />
      <AdminAlbumsTab v-else-if="activeTab === 'albums'" />
      <AdminSongsTab v-else-if="activeTab === 'songs'" />
      <AdminGenresTab v-else-if="activeTab === 'genres'" />
      <AdminPlaylistsTab v-else-if="activeTab === 'playlists'" />
      <AdminUsersTab v-else-if="activeTab === 'users'" />
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'tigre',
})

type TabValue = 'artists' | 'albums' | 'songs' | 'genres' | 'playlists' | 'users'

const tabs: Array<{ value: TabValue; label: string }> = [
  { value: 'artists', label: 'Artistas' },
  { value: 'albums', label: 'Álbumes' },
  { value: 'songs', label: 'Canciones' },
  { value: 'genres', label: 'Géneros' },
  { value: 'playlists', label: 'Playlists' },
  { value: 'users', label: 'Usuarios' },
]

const activeTab = ref<TabValue>('artists')

const { isLoadingContent, loadAll } = useAdminData()

onMounted(() => {
  loadAll()
})
</script>
