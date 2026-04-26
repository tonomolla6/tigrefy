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
        Crear álbum
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-dark-hover rounded-lg overflow-x-auto">
      <table class="w-full min-w-[600px]">
        <thead class="bg-black/30">
          <tr>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Álbum</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Artista</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Pistas</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Visible</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="album in filteredAlbums"
            :key="album.id"
            class="border-t border-gray-800 hover:bg-black/20"
          >
            <td class="p-3">
              <div class="flex items-center gap-3">
                <SecureImage :src="album.cover" :alt="album.title" class="w-10 h-10 rounded" />
                <div class="min-w-0">
                  <p class="text-white text-sm font-medium truncate">{{ album.title }}</p>
                  <p class="text-gray-400 text-xs truncate md:hidden">{{ album.artistName }}</p>
                </div>
              </div>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-300 text-sm">{{ album.artistName }}</span>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-400 text-sm">{{ album.totalTracks }}</span>
            </td>
            <td class="p-3 text-center">
              <AdminVisibilityToggle
                :is-public="album.isPublic"
                :loading="isUpdating === album.id"
                @toggle="toggleVisibility(album)"
              />
            </td>
            <td class="p-3 text-center">
              <AdminActionButtons
                entity-label="álbum"
                :loading="isUpdating === album.id"
                can-delete
                @edit="openEditModal(album)"
                @delete="albumToDelete = album"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear -->
    <BaseModal
      v-model:open="showCreateModal"
      title="Crear nuevo álbum"
      size="md"
      :loading="isCreating"
      :error="createError"
      submit-label="Crear álbum"
      @submit="createAlbum"
    >
      <div class="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
        <FileUpload
          ref="createCoverUpload"
          v-model="newAlbum.cover"
          type="cover"
          label="Portada"
        />
        <div class="space-y-5">
          <div class="space-y-1">
            <label class="block text-sm text-white/70">Título <span class="text-red-400">*</span></label>
            <BaseInput v-model="newAlbum.title" required />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-sm text-white/70">Artista <span class="text-red-400">*</span></label>
              <BaseSelect v-model="newAlbum.artistId" required>
                <option value="" disabled>—</option>
                <option v-for="artist in artistsList" :key="artist.id" :value="artist.id">{{ artist.name }}</option>
              </BaseSelect>
            </div>
            <div class="space-y-1">
              <label class="block text-sm text-white/70">Fecha de lanzamiento</label>
              <BaseInput v-model="newAlbum.releaseDate" type="date" />
            </div>
          </div>

          <label class="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer select-none">
            <input
              v-model="newAlbum.isPublic"
              type="checkbox"
              class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
            />
            Visible para todos (público)
          </label>
        </div>
      </div>
    </BaseModal>

    <!-- Modal Editar -->
    <BaseModal
      :open="showEditModal && !!editingAlbum"
      @update:open="(v) => !v && closeEditModal()"
      title="Editar álbum"
      size="lg"
      :loading="isEditing"
      :error="editError"
      submit-label="Guardar cambios"
      @submit="saveAlbumChanges"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Columna izquierda: metadatos -->
        <div class="space-y-5">
          <div class="grid grid-cols-[200px_1fr] gap-4">
            <FileUpload
              ref="editCoverUpload"
              v-model="editForm.cover"
              type="cover"
              label="Portada"
            />
            <div class="space-y-3">
              <div class="space-y-1">
                <label class="block text-sm text-white/70">Título <span class="text-red-400">*</span></label>
                <BaseInput v-model="editForm.title" required />
              </div>
              <div class="space-y-1">
                <label class="block text-sm text-white/70">Fecha</label>
                <BaseInput v-model="editForm.releaseDate" type="date" />
              </div>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-sm text-white/70">Artista <span class="text-red-400">*</span></label>
            <BaseSelect v-model="editForm.artistId" required>
              <option v-for="artist in artistsList" :key="artist.id" :value="artist.id">{{ artist.name }}</option>
            </BaseSelect>
          </div>

          <label class="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer select-none">
            <input
              v-model="editForm.isPublic"
              type="checkbox"
              class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
            />
            Visible para todos (público)
          </label>
        </div>

        <!-- Columna derecha: orden de canciones -->
        <div v-if="songsInEditedAlbum.length > 0" class="space-y-1.5">
          <label class="block text-sm text-white/70">
            Orden de canciones <span class="text-white/40">({{ songsInEditedAlbum.length }})</span>
          </label>
          <div class="bg-dark-hover rounded-lg divide-y divide-white/5">
            <div
              v-for="(song, idx) in editAlbumSongOrder"
              :key="song.id"
              class="flex items-center gap-2 px-3 py-2.5"
            >
              <span class="text-tiger-400 text-xs font-bold w-7 text-right tabular-nums">#{{ idx + 1 }}</span>
              <span class="text-sm text-white/90 truncate flex-1 min-w-0">{{ song.title }}</span>
              <button
                type="button"
                :disabled="idx === 0"
                @click="moveSongInAlbum(idx, idx - 1)"
                class="w-7 h-7 rounded text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="Subir"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                :disabled="idx === editAlbumSongOrder.length - 1"
                @click="moveSongInAlbum(idx, idx + 1)"
                class="w-7 h-7 rounded text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="Bajar"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          <p v-if="trackOrderChanged" class="text-xs text-tiger-400 px-1">
            Los cambios de orden se guardarán al pulsar Guardar
          </p>
        </div>
        <div v-else class="text-sm text-white/40 bg-dark-hover rounded-lg p-3">
          Este álbum no tiene canciones aún
        </div>
      </div>
    </BaseModal>

    <!-- Modal Eliminar -->
    <BaseModal
      :open="!!albumToDelete"
      @update:open="(v) => !v && (albumToDelete = null, deleteError = '')"
      title="Eliminar álbum"
      size="sm"
      :loading="isUpdating === albumToDelete?.id"
      :error="deleteError"
      submit-label="Eliminar"
      destructive
      @submit="deleteAlbum"
    >
      <p class="text-white/80">
        ¿Eliminar <span class="text-white font-semibold">{{ albumToDelete?.title }}</span>?
      </p>
      <p class="text-yellow-400 text-sm">Solo se puede eliminar si no tiene canciones asociadas.</p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { Album, FileUploadHandle, VisibilityFilter } from '~/types/admin'

const { artistsList, albums, songs, recomputeVisibilityStats, stats } = useAdminData()

const filter = ref<VisibilityFilter>('all')
const filterOptions = [
  { value: 'all' as const, label: 'Todas', activeClass: 'bg-tiger-500 text-black' },
  { value: 'public' as const, label: 'Públicas', activeClass: 'bg-green-500 text-black' },
  { value: 'private' as const, label: 'Privadas', activeClass: 'bg-red-500 text-white' },
]

const filteredAlbums = computed(() => {
  if (filter.value === 'public') return albums.value.filter(a => a.isPublic)
  if (filter.value === 'private') return albums.value.filter(a => !a.isPublic)
  return albums.value
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const isCreating = ref(false)
const isEditing = ref(false)
const isUpdating = ref<string | null>(null)
const createError = ref('')
const editError = ref('')
const deleteError = ref('')

const editingAlbum = ref<Album | null>(null)
const albumToDelete = ref<Album | null>(null)

const newAlbum = ref({ title: '', artistId: '', cover: '', releaseDate: '', isPublic: false })
const editForm = ref({ title: '', artistId: '', cover: '', releaseDate: '', isPublic: false })

const createCoverUpload = ref<FileUploadHandle | null>(null)
const editCoverUpload = ref<FileUploadHandle | null>(null)

// Orden de canciones del álbum editado
const editAlbumSongOrder = ref<Array<{ id: string; title: string; trackNumber: number | null }>>([])
const initialAlbumSongOrder = ref<string[]>([])

const songsInEditedAlbum = computed(() => {
  if (!editingAlbum.value) return []
  return songs.value
    .filter(s => s.albumId === editingAlbum.value!.id)
    .map(s => ({ id: s.id, title: s.title, trackNumber: s.trackNumber ?? null }))
})

const trackOrderChanged = computed(() => {
  if (initialAlbumSongOrder.value.length !== editAlbumSongOrder.value.length) return false
  return editAlbumSongOrder.value.some((s, i) => s.id !== initialAlbumSongOrder.value[i])
})

const moveSongInAlbum = (from: number, to: number) => {
  if (to < 0 || to >= editAlbumSongOrder.value.length) return
  const arr = [...editAlbumSongOrder.value]
  const [moved] = arr.splice(from, 1)
  arr.splice(to, 0, moved)
  editAlbumSongOrder.value = arr
}

const toggleVisibility = async (album: Album) => {
  isUpdating.value = album.id
  try {
    await $fetch(`/api/admin/albums/${album.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: { isPublic: !album.isPublic },
    })
    album.isPublic = !album.isPublic
    recomputeVisibilityStats()
  } catch (error) {
    console.error('Error updating album:', error)
  } finally {
    isUpdating.value = null
  }
}

const openEditModal = (album: Album) => {
  editingAlbum.value = album
  editForm.value = {
    title: album.title,
    artistId: album.artistId,
    cover: album.cover || '',
    releaseDate: album.releaseDate || '',
    isPublic: album.isPublic,
  }
  const ordered = [...songsInEditedAlbum.value].sort(
    (a, b) => (a.trackNumber || 999) - (b.trackNumber || 999)
  )
  editAlbumSongOrder.value = ordered
  initialAlbumSongOrder.value = ordered.map(s => s.id)
  editError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingAlbum.value = null
  editForm.value = { title: '', artistId: '', cover: '', releaseDate: '', isPublic: false }
  editAlbumSongOrder.value = []
  initialAlbumSongOrder.value = []
  editError.value = ''
}

const createAlbum = async () => {
  createError.value = ''
  isCreating.value = true
  try {
    let coverUrl = newAlbum.value.cover
    if (createCoverUpload.value?.hasPendingFile()) {
      const uploadedUrl = await createCoverUpload.value.uploadPendingFile()
      if (!uploadedUrl) {
        createError.value = 'Error al subir la portada'
        return
      }
      coverUrl = uploadedUrl
    }

    const data = await $fetch<{ success: boolean; album: Album }>('/api/admin/albums', {
      method: 'POST',
      credentials: 'include',
      body: {
        title: newAlbum.value.title,
        artistId: newAlbum.value.artistId,
        cover: coverUrl || null,
        releaseDate: newAlbum.value.releaseDate || null,
        isPublic: newAlbum.value.isPublic,
      },
    })

    if (data.success && data.album) {
      albums.value.unshift(data.album)
      if (stats.value) {
        stats.value.totalAlbums++
        if (data.album.isPublic) stats.value.publicAlbums++
        else stats.value.privateAlbums++
      }
      showCreateModal.value = false
      newAlbum.value = { title: '', artistId: '', cover: '', releaseDate: '', isPublic: false }
    }
  } catch (error: any) {
    createError.value = error?.data?.statusMessage || 'Error al crear álbum'
  } finally {
    isCreating.value = false
  }
}

const saveAlbumChanges = async () => {
  if (!editingAlbum.value) return
  editError.value = ''
  isEditing.value = true
  try {
    let coverUrl = editForm.value.cover
    if (editCoverUpload.value?.hasPendingFile()) {
      const uploadedUrl = await editCoverUpload.value.uploadPendingFile()
      if (!uploadedUrl) {
        editError.value = 'Error al subir la portada'
        return
      }
      coverUrl = uploadedUrl
    }

    const data = await $fetch<{ success: boolean; album: Album }>(
      `/api/admin/albums/${editingAlbum.value.id}`,
      {
        method: 'PATCH',
        credentials: 'include',
        body: {
          title: editForm.value.title,
          artistId: editForm.value.artistId,
          cover: coverUrl || null,
          releaseDate: editForm.value.releaseDate || null,
          isPublic: editForm.value.isPublic,
        },
      }
    )

    if (trackOrderChanged.value && editAlbumSongOrder.value.length > 0) {
      await $fetch(`/api/admin/albums/${editingAlbum.value.id}/reorder`, {
        method: 'POST',
        credentials: 'include',
        body: { songIds: editAlbumSongOrder.value.map(s => s.id) },
      })
      editAlbumSongOrder.value.forEach((s, i) => {
        const idx = songs.value.findIndex(x => x.id === s.id)
        if (idx !== -1) songs.value[idx].trackNumber = i + 1
      })
    }

    if (data.success && data.album) {
      const idx = albums.value.findIndex(a => a.id === editingAlbum.value?.id)
      if (idx !== -1) albums.value[idx] = data.album
      recomputeVisibilityStats()
      closeEditModal()
    }
  } catch (error: any) {
    editError.value = error?.data?.statusMessage || 'Error al guardar cambios'
  } finally {
    isEditing.value = false
  }
}

const deleteAlbum = async () => {
  if (!albumToDelete.value) return
  isUpdating.value = albumToDelete.value.id
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/albums/${albumToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    albums.value = albums.value.filter(a => a.id !== albumToDelete.value?.id)
    if (stats.value) {
      stats.value.totalAlbums--
      if (albumToDelete.value.isPublic) stats.value.publicAlbums--
      else stats.value.privateAlbums--
    }
    albumToDelete.value = null
  } catch (error: any) {
    deleteError.value = error?.data?.statusMessage || 'Error al eliminar álbum'
  } finally {
    isUpdating.value = null
  }
}
</script>
