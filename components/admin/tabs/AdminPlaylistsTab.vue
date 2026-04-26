<template>
  <div>
    <!-- Filtros + crear -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="opt in filterOptions"
        :key="opt.value"
        @click="filter = opt.value"
        class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
        :class="filter === opt.value ? opt.activeClass : 'bg-dark-hover text-white hover:bg-gray-700'"
      >
        {{ opt.label }}
      </button>
      <div class="flex-1"></div>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 rounded-full text-sm font-medium bg-tiger-500 text-black hover:bg-tiger-400 transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crear playlist
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-dark-hover rounded-lg overflow-x-auto">
      <table class="w-full min-w-[600px]">
        <thead class="bg-black/30">
          <tr>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Playlist</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Propietario</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Canciones</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Visible</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="playlist in filteredPlaylists"
            :key="playlist.id"
            class="border-t border-gray-800 hover:bg-black/20"
          >
            <td class="p-3">
              <div class="flex items-center gap-3">
                <SecureImage :src="playlist.cover" :alt="playlist.name" class="w-10 h-10 rounded" />
                <div class="min-w-0">
                  <p class="text-white text-sm font-medium truncate">{{ playlist.name }}</p>
                  <p class="text-gray-400 text-xs truncate md:hidden">{{ playlist.ownerName }}</p>
                </div>
              </div>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-300 text-sm">{{ playlist.ownerName }}</span>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-400 text-sm">{{ playlist.songCount }}</span>
            </td>
            <td class="p-3 text-center">
              <AdminVisibilityToggle
                :is-public="playlist.isPublic"
                :loading="isUpdating === playlist.id"
                @toggle="toggleVisibility(playlist)"
              />
            </td>
            <td class="p-3 text-center">
              <AdminActionButtons
                entity-label="playlist"
                :loading="isUpdating === playlist.id"
                can-delete
                @edit="openEditModal(playlist)"
                @delete="playlistToDelete = playlist"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear -->
    <AdminModal
      v-model:open="showCreateModal"
      title="Crear nueva playlist"
      size="md"
      :loading="isCreating"
      :error="createError"
      submit-label="Crear playlist"
      @submit="createPlaylist"
    >
      <div class="space-y-1">
        <label class="block text-sm text-white/70">Nombre <span class="text-red-400">*</span></label>
        <BaseInput v-model="newPlaylist.name" required />
      </div>

      <div class="space-y-1">
        <label class="block text-sm text-white/70">Descripción</label>
        <BaseTextarea v-model="newPlaylist.description" />
      </div>

      <FileUpload
        ref="createCoverUpload"
        v-model="newPlaylist.cover"
        type="cover"
        label="Portada de la playlist"
      />

      <label class="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer select-none">
        <input
          v-model="newPlaylist.isPublic"
          type="checkbox"
          class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
        />
        Visible para todos (público)
      </label>

      <div class="space-y-1.5">
        <label class="block text-sm text-white/70">
          Canciones <span class="text-white/40">({{ newPlaylistSongIds.length }} seleccionadas)</span>
        </label>
        <div class="bg-dark-hover rounded-lg max-h-48 overflow-y-auto">
          <div
            v-for="song in songs"
            :key="song.id"
            @click="togglePlaylistSong(song.id)"
            class="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer transition-colors"
            :class="{ 'bg-tiger-500/15': newPlaylistSongIds.includes(song.id) }"
          >
            <input
              type="checkbox"
              :checked="newPlaylistSongIds.includes(song.id)"
              class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
              @click.stop
              @change="togglePlaylistSong(song.id)"
            />
            <SecureImage :src="song.cover" :alt="song.title" class="w-8 h-8 rounded" />
            <div class="min-w-0 flex-1">
              <p class="text-white text-sm truncate">{{ song.title }}</p>
              <p class="text-white/50 text-xs truncate">{{ song.artistName }}</p>
            </div>
          </div>
          <p v-if="songs.length === 0" class="text-white/40 text-sm p-3 text-center">
            No hay canciones disponibles
          </p>
        </div>
      </div>
    </AdminModal>

    <!-- Modal Editar -->
    <AdminModal
      :open="showEditModal && !!editingPlaylist"
      @update:open="(v) => !v && closeEditModal()"
      :title="`Editar: ${editingPlaylist?.name || ''}`"
      size="xl"
      :error="editError"
      hide-footer
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Columna izquierda: canciones actuales -->
        <div class="space-y-1.5">
          <label class="block text-sm text-white/70">
            En la playlist <span class="text-white/40">({{ editPlaylistSongIds.length }})</span>
          </label>
          <div class="bg-dark-hover rounded-lg max-h-[60vh] overflow-y-auto">
            <div
              v-for="songId in editPlaylistSongIds"
              :key="songId"
              class="flex items-center gap-3 p-2.5 hover:bg-white/5 transition-colors"
            >
              <SecureImage
                :src="getSongById(songId)?.cover"
                :alt="getSongById(songId)?.title"
                class="w-9 h-9 rounded"
              />
              <div class="min-w-0 flex-1">
                <p class="text-white text-sm truncate">{{ getSongById(songId)?.title || 'Canción desconocida' }}</p>
                <p class="text-white/50 text-xs truncate">{{ getSongById(songId)?.artistName || '' }}</p>
              </div>
              <button
                @click="removeFromPlaylist(songId)"
                class="w-8 h-8 rounded-full text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors flex items-center justify-center flex-shrink-0"
                title="Quitar"
              >✕</button>
            </div>
            <p v-if="editPlaylistSongIds.length === 0" class="text-white/40 text-sm p-4 text-center">
              Sin canciones
            </p>
          </div>
        </div>

        <!-- Columna derecha: añadir canciones -->
        <div class="space-y-1.5">
          <label class="block text-sm text-white/70">
            Añadir canciones <span class="text-white/40">({{ availableSongsForEdit.length }})</span>
          </label>
          <div class="bg-dark-hover rounded-lg max-h-[60vh] overflow-y-auto">
            <div
              v-for="song in availableSongsForEdit"
              :key="song.id"
              @click="addToPlaylist(song.id)"
              class="flex items-center gap-3 p-2.5 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <SecureImage :src="song.cover" :alt="song.title" class="w-9 h-9 rounded" />
              <div class="min-w-0 flex-1">
                <p class="text-white text-sm truncate">{{ song.title }}</p>
                <p class="text-white/50 text-xs truncate">{{ song.artistName }}</p>
              </div>
              <span class="text-tiger-400 text-lg leading-none flex-shrink-0">+</span>
            </div>
            <p v-if="availableSongsForEdit.length === 0" class="text-white/40 text-sm p-4 text-center">
              Todas las canciones ya están en la playlist
            </p>
          </div>
        </div>
      </div>
    </AdminModal>

    <!-- Modal Eliminar -->
    <AdminModal
      :open="!!playlistToDelete"
      @update:open="(v) => !v && (playlistToDelete = null, deleteError = '')"
      title="Eliminar playlist"
      size="sm"
      :loading="isUpdating === playlistToDelete?.id"
      :error="deleteError"
      submit-label="Eliminar"
      destructive
      @submit="deletePlaylist"
    >
      <p class="text-white/80">
        ¿Eliminar <span class="text-white font-semibold">{{ playlistToDelete?.name }}</span>?
      </p>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import type { Playlist, FileUploadHandle, VisibilityFilter } from '~/types/admin'

const { playlistsList, songs } = useAdminData()

const filter = ref<VisibilityFilter>('all')
const filterOptions = [
  { value: 'all' as const, label: 'Todas', activeClass: 'bg-tiger-500 text-black' },
  { value: 'public' as const, label: 'Públicas', activeClass: 'bg-green-500 text-black' },
  { value: 'private' as const, label: 'Privadas', activeClass: 'bg-red-500 text-white' },
]

const filteredPlaylists = computed(() => {
  if (filter.value === 'public') return playlistsList.value.filter(p => p.isPublic)
  if (filter.value === 'private') return playlistsList.value.filter(p => !p.isPublic)
  return playlistsList.value
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const isCreating = ref(false)
const isUpdating = ref<string | null>(null)
const createError = ref('')
const editError = ref('')
const deleteError = ref('')

const editingPlaylist = ref<Playlist | null>(null)
const playlistToDelete = ref<Playlist | null>(null)

const newPlaylist = ref({ name: '', description: '', cover: '', isPublic: true })
const newPlaylistSongIds = ref<string[]>([])
const editPlaylistSongIds = ref<string[]>([])

const createCoverUpload = ref<FileUploadHandle | null>(null)

const availableSongsForEdit = computed(() =>
  songs.value.filter(s => !editPlaylistSongIds.value.includes(s.id))
)

const getSongById = (id: string) => songs.value.find(s => s.id === id)

const togglePlaylistSong = (songId: string) => {
  const idx = newPlaylistSongIds.value.indexOf(songId)
  if (idx === -1) newPlaylistSongIds.value.push(songId)
  else newPlaylistSongIds.value.splice(idx, 1)
}

const toggleVisibility = async (playlist: Playlist) => {
  isUpdating.value = playlist.id
  try {
    await $fetch(`/api/admin/playlists/${playlist.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: { isPublic: !playlist.isPublic },
    })
    playlist.isPublic = !playlist.isPublic
  } catch (error) {
    console.error('Error updating playlist:', error)
  } finally {
    isUpdating.value = null
  }
}

const openEditModal = async (playlist: Playlist) => {
  editingPlaylist.value = playlist
  editPlaylistSongIds.value = []
  editError.value = ''
  showEditModal.value = true

  try {
    const data = await $fetch<{ songIds: string[] }>(
      `/api/admin/playlists/${playlist.id}/songs`,
      { credentials: 'include' }
    )
    editPlaylistSongIds.value = data.songIds || []
  } catch (error) {
    console.error('Error loading playlist songs:', error)
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingPlaylist.value = null
  editPlaylistSongIds.value = []
}

const addToPlaylist = async (songId: string) => {
  if (!editingPlaylist.value) return
  try {
    const data = await $fetch<{ success: boolean; songCount: number }>(
      `/api/admin/playlists/${editingPlaylist.value.id}/songs`,
      {
        method: 'POST',
        credentials: 'include',
        body: { songId, action: 'add' },
      }
    )
    if (data.success) {
      editPlaylistSongIds.value.push(songId)
      editingPlaylist.value.songCount = data.songCount
      const playlist = playlistsList.value.find(p => p.id === editingPlaylist.value?.id)
      if (playlist) playlist.songCount = data.songCount
    }
  } catch (error: any) {
    editError.value = error?.data?.statusMessage || 'Error al añadir canción'
  }
}

const removeFromPlaylist = async (songId: string) => {
  if (!editingPlaylist.value) return
  try {
    const data = await $fetch<{ success: boolean; songCount: number }>(
      `/api/admin/playlists/${editingPlaylist.value.id}/songs`,
      {
        method: 'POST',
        credentials: 'include',
        body: { songId, action: 'remove' },
      }
    )
    if (data.success) {
      editPlaylistSongIds.value = editPlaylistSongIds.value.filter(id => id !== songId)
      editingPlaylist.value.songCount = data.songCount
      const playlist = playlistsList.value.find(p => p.id === editingPlaylist.value?.id)
      if (playlist) playlist.songCount = data.songCount
    }
  } catch (error: any) {
    editError.value = error?.data?.statusMessage || 'Error al quitar canción'
  }
}

const createPlaylist = async () => {
  createError.value = ''
  isCreating.value = true
  try {
    let coverUrl = newPlaylist.value.cover
    if (createCoverUpload.value?.hasPendingFile()) {
      const uploadedUrl = await createCoverUpload.value.uploadPendingFile()
      if (!uploadedUrl) {
        createError.value = 'Error al subir la portada'
        return
      }
      coverUrl = uploadedUrl
    }

    const data = await $fetch<{ success: boolean; playlist: Playlist }>('/api/admin/playlists', {
      method: 'POST',
      credentials: 'include',
      body: {
        name: newPlaylist.value.name,
        description: newPlaylist.value.description || null,
        cover: coverUrl || null,
        isPublic: newPlaylist.value.isPublic,
      },
    })

    if (data.success && data.playlist) {
      for (const songId of newPlaylistSongIds.value) {
        await $fetch(`/api/admin/playlists/${data.playlist.id}/songs`, {
          method: 'POST',
          credentials: 'include',
          body: { songId, action: 'add' },
        })
      }
      data.playlist.songCount = newPlaylistSongIds.value.length
      playlistsList.value.unshift(data.playlist)
      showCreateModal.value = false
      newPlaylist.value = { name: '', description: '', cover: '', isPublic: true }
      newPlaylistSongIds.value = []
    }
  } catch (error: any) {
    createError.value = error?.data?.statusMessage || 'Error al crear playlist'
  } finally {
    isCreating.value = false
  }
}

const deletePlaylist = async () => {
  if (!playlistToDelete.value) return
  isUpdating.value = playlistToDelete.value.id
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/playlists/${playlistToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    playlistsList.value = playlistsList.value.filter(p => p.id !== playlistToDelete.value?.id)
    playlistToDelete.value = null
  } catch (error: any) {
    deleteError.value = error?.data?.statusMessage || 'Error al eliminar playlist'
  } finally {
    isUpdating.value = null
  }
}
</script>
