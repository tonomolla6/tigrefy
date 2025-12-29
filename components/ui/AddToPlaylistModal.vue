<template>
  <BaseModal
    :is-open="isOpen"
    title="Añadir a playlist"
    :subtitle="songTitle"
    max-width="md"
    :scrollable="false"
    body-class="p-4"
    @close="handleClose"
  >
    <!-- Playlists List -->
    <div v-if="userPlaylists.length === 0" class="text-center py-8">
      <p class="text-secondary mb-4">No tienes playlists todavía</p>
      <button @click="handleCreateNew" class="btn-tiger">
        Crear tu primera playlist
      </button>
    </div>

    <div v-else class="space-y-2">
      <button
        v-for="playlist in userPlaylists"
        :key="playlist.id"
        @click="handleAddToPlaylist(playlist.id)"
        :disabled="playlist.songIds.includes(currentSongId)"
        class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{ 'bg-dark-hover': playlist.songIds.includes(currentSongId) }"
      >
        <img
          :src="playlist.cover"
          :alt="playlist.name"
          class="w-12 h-12 rounded object-cover"
        />
        <div class="flex-1 text-left">
          <p class="font-semibold">{{ playlist.name }}</p>
          <p class="text-sm text-secondary">{{ playlist.songIds.length }} canciones</p>
        </div>
        <IconCheck
          v-if="playlist.songIds.includes(currentSongId)"
          :size="20"
          class="text-tiger-500"
        />
      </button>
    </div>

    <template #footer>
      <button
        @click="handleCreateNew"
        class="w-full flex items-center justify-center gap-2 p-2.5 md:p-3 rounded-lg border border-gray-700 hover:bg-dark-hover transition-colors text-sm md:text-base"
      >
        <IconPlus :size="18" class="md:hidden" />
        <IconPlus :size="20" class="hidden md:block" />
        <span class="font-semibold">Crear nueva playlist</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  songId: string
  songTitle: string
}>()

const emit = defineEmits<{
  close: []
  createNew: []
}>()

const { userPlaylists, addSongToPlaylist } = useUserPlaylists()
const { success, error } = useToast()

const currentSongId = computed(() => props.songId)

const handleClose = () => {
  emit('close')
}

const handleAddToPlaylist = (playlistId: string) => {
  const playlist = userPlaylists.value.find(p => p.id === playlistId)
  const added = addSongToPlaylist(playlistId, props.songId)

  if (added) {
    success(`Añadida a "${playlist?.name}"`)
    handleClose()
  } else {
    error(`Esta canción ya está en "${playlist?.name}"`)
  }
}

const handleCreateNew = () => {
  emit('createNew')
  handleClose()
}
</script>
