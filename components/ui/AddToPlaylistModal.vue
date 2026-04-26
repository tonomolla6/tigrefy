<template>
  <BaseModal
    :open="isOpen"
    @update:open="(v) => !v && handleClose()"
    title="Añadir a playlist"
    :subtitle="songTitle"
    size="md"
    hide-footer
  >
    <!-- Lista de playlists -->
    <div v-if="userPlaylists.length === 0" class="text-center py-8">
      <p class="text-white/60 mb-4">No tienes playlists todavía</p>
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
        class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{ 'bg-white/5': playlist.songIds.includes(currentSongId) }"
      >
        <SecureImage
          :src="playlist.cover"
          :alt="playlist.name"
          class="w-12 h-12 rounded"
        />
        <div class="flex-1 text-left min-w-0">
          <p class="font-semibold truncate">{{ playlist.name }}</p>
          <p class="text-sm text-white/60">{{ playlist.songIds.length }} canciones</p>
        </div>
        <IconCheck
          v-if="playlist.songIds.includes(currentSongId)"
          :size="20"
          class="text-tiger-500 flex-shrink-0"
        />
      </button>
    </div>

    <!-- Botón crear playlist al final del body (BaseModal está en hide-footer) -->
    <button
      @click="handleCreateNew"
      class="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
    >
      <IconPlus :size="20" />
      <span class="font-semibold">Crear nueva playlist</span>
    </button>
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

const handleClose = () => emit('close')

const handleAddToPlaylist = async (playlistId: string) => {
  const playlist = userPlaylists.value.find(p => p.id === playlistId)
  const added = await addSongToPlaylist(playlistId, props.songId)

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
