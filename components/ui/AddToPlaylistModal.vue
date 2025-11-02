<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-75"
        @click="handleClose"
      >
        <transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="bg-dark-highlight rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col transform"
            @click.stop
          >
            <!-- Header -->
            <div class="p-4 md:p-6 border-b border-gray-700">
              <h2 class="text-xl md:text-2xl font-bold">Añadir a playlist</h2>
              <p class="text-secondary mt-1 text-sm md:text-base truncate">{{ songTitle }}</p>
            </div>

            <!-- Playlists List -->
            <div class="flex-1 overflow-y-auto p-4">
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
            </div>

            <!-- Footer -->
            <div class="p-3 md:p-4 border-t border-gray-700">
              <button
                @click="handleCreateNew"
                class="w-full flex items-center justify-center gap-2 p-2.5 md:p-3 rounded-lg border border-gray-700 hover:bg-dark-hover transition-colors text-sm md:text-base"
              >
                <IconPlus :size="18" class="md:hidden" />
                <IconPlus :size="20" class="hidden md:block" />
                <span class="font-semibold">Crear nueva playlist</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
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
