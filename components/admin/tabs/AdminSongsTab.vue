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
        Crear canción
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-dark-hover rounded-lg overflow-x-auto">
      <table class="w-full min-w-[600px]">
        <thead class="bg-black/30">
          <tr>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Canción</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Artista</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Álbum</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Visible</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="song in filteredSongs"
            :key="song.id"
            class="border-t border-gray-800 hover:bg-black/20"
          >
            <td class="p-3">
              <div class="flex items-center gap-3">
                <SecureImage :src="song.cover" :alt="song.title" class="w-10 h-10 rounded" />
                <div class="min-w-0">
                  <p class="text-white text-sm font-medium truncate">{{ song.title }}</p>
                  <p class="text-gray-400 text-xs truncate md:hidden">{{ song.artistName }}</p>
                </div>
              </div>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-300 text-sm">{{ song.artistName }}</span>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-400 text-sm">{{ song.albumName || '-' }}</span>
            </td>
            <td class="p-3 text-center">
              <AdminVisibilityToggle
                :is-public="song.isPublic"
                :loading="isUpdating === song.id"
                @toggle="toggleVisibility(song)"
              />
            </td>
            <td class="p-3 text-center">
              <AdminActionButtons
                entity-label="canción"
                :loading="isUpdating === song.id"
                can-delete
                @edit="openEditModal(song)"
                @delete="songToDelete = song"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear -->
    <AdminModal
      v-model:open="showCreateModal"
      title="Crear nueva canción"
      subtitle="Sube el MP3 y rellena los datos. La duración se detecta sola."
      size="lg"
      :loading="isCreating"
      :error="createError"
      submit-label="Crear canción"
      @submit="createSong"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="space-y-5">
          <div class="space-y-1">
            <label class="block text-sm text-white/70">Título <span class="text-red-400">*</span></label>
            <input
              v-model="newSong.title"
              type="text"
              class="w-full bg-dark-hover text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-tiger-500"
              placeholder="Título de la canción"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-sm text-white/70">Artista <span class="text-red-400">*</span></label>
              <select
                v-model="newSong.artistId"
                @change="newSong.albumId = ''"
                class="w-full bg-dark-hover text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                required
              >
                <option value="" disabled>—</option>
                <option v-for="artist in artistsList" :key="artist.id" :value="artist.id">
                  {{ artist.name }}
                </option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="block text-sm text-white/70">Álbum <span class="text-red-400">*</span></label>
              <select
                v-model="newSong.albumId"
                class="w-full bg-dark-hover text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-tiger-500 disabled:opacity-60"
                :disabled="!newSong.artistId"
                required
              >
                <option value="" disabled>{{ newSong.artistId ? '—' : '↑ Artista' }}</option>
                <option v-for="album in filteredAlbumsForSong" :key="album.id" :value="album.id">
                  {{ album.title }}
                </option>
              </select>
            </div>
          </div>

          <FileUpload
            ref="createAudioUpload"
            model-value=""
            type="audio"
            label="Archivo de audio *"
            @duration-detected="newSong.duration = $event"
          />

          <label class="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer select-none">
            <input
              v-model="newSong.isPublic"
              type="checkbox"
              class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
            />
            Visible para todos (público)
          </label>
        </div>

        <div class="space-y-5">
          <TrackPositionPicker
            v-if="newSong.albumId"
            v-model="newSong.trackNumber"
            :album-songs="songsInSelectedAlbum"
          />
          <div v-else class="text-sm text-white/40 bg-dark-hover rounded-lg p-3">
            Selecciona un álbum para elegir el orden
          </div>

          <div class="space-y-1">
            <label class="block text-sm text-white/70">Letra</label>
            <LyricsTextarea v-model="newSong.lyrics" :min-lines="10" />
          </div>
        </div>
      </div>
    </AdminModal>

    <!-- Modal Editar -->
    <AdminModal
      :open="showEditModal && !!editingSong"
      @update:open="(v) => !v && closeEditModal()"
      title="Editar canción"
      size="lg"
      :loading="isEditing"
      :error="editError"
      submit-label="Guardar cambios"
      @submit="saveSongChanges"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="space-y-5">
          <div class="space-y-1">
            <label class="block text-sm text-white/70">Título <span class="text-red-400">*</span></label>
            <input
              v-model="editForm.title"
              type="text"
              class="w-full bg-dark-hover text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-tiger-500"
              required
            />
          </div>

          <FileUpload
            ref="editAudioUpload"
            model-value=""
            type="audio"
            label="Reemplazar audio (opcional)"
            @duration-detected="editForm.duration = $event"
          />

          <label class="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer select-none">
            <input
              v-model="editForm.isPublic"
              type="checkbox"
              class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
            />
            Visible para todos (público)
          </label>
        </div>

        <div class="space-y-5">
          <TrackPositionPicker
            v-if="editingSong"
            v-model="editForm.trackNumber"
            :album-songs="songsInEditedSongAlbum"
            :exclude-song-id="editingSong.id"
          />

          <div class="space-y-1">
            <label class="block text-sm text-white/70">Letra</label>
            <LyricsTextarea v-model="editForm.lyrics" :min-lines="10" />
          </div>
        </div>
      </div>
    </AdminModal>

    <!-- Modal Eliminar -->
    <AdminModal
      :open="!!songToDelete"
      @update:open="(v) => !v && (songToDelete = null, deleteError = '')"
      title="Eliminar canción"
      size="sm"
      :loading="isUpdating === songToDelete?.id"
      :error="deleteError"
      submit-label="Eliminar"
      destructive
      @submit="deleteSong"
    >
      <p class="text-white/80">
        ¿Eliminar <span class="text-white font-semibold">{{ songToDelete?.title }}</span>?
      </p>
      <p class="text-yellow-400 text-sm">
        Esta acción también eliminará la canción de todas las playlists donde esté incluida.
      </p>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
import type { AdminSong as Song } from '~/types/song'
import type { FileUploadHandle, VisibilityFilter } from '~/types/admin'

const { artistsList, albums, songs, stats, recomputeVisibilityStats } = useAdminData()

const filter = ref<VisibilityFilter>('all')
const filterOptions = [
  { value: 'all' as const, label: 'Todas', activeClass: 'bg-tiger-500 text-black' },
  { value: 'public' as const, label: 'Públicas', activeClass: 'bg-green-500 text-black' },
  { value: 'private' as const, label: 'Privadas', activeClass: 'bg-red-500 text-white' },
]

const filteredSongs = computed(() => {
  if (filter.value === 'public') return songs.value.filter(s => s.isPublic)
  if (filter.value === 'private') return songs.value.filter(s => !s.isPublic)
  return songs.value
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const isCreating = ref(false)
const isEditing = ref(false)
const isUpdating = ref<string | null>(null)
const createError = ref('')
const editError = ref('')
const deleteError = ref('')

const editingSong = ref<Song | null>(null)
const songToDelete = ref<Song | null>(null)

const newSong = ref({
  title: '',
  artistId: '',
  albumId: '',
  trackNumber: null as number | null,
  duration: 0,
  lyrics: '',
  isPublic: false,
})

const editForm = ref({
  title: '',
  trackNumber: null as number | null,
  duration: 0,
  lyrics: '',
  isPublic: false,
})

const createAudioUpload = ref<FileUploadHandle | null>(null)
const editAudioUpload = ref<FileUploadHandle | null>(null)

const filteredAlbumsForSong = computed(() => {
  if (!newSong.value.artistId) return []
  return albums.value.filter(a => a.artistId === newSong.value.artistId)
})

const songsInSelectedAlbum = computed(() => {
  if (!newSong.value.albumId) return []
  return songs.value
    .filter(s => s.albumId === newSong.value.albumId)
    .map(s => ({ id: s.id, title: s.title, trackNumber: s.trackNumber ?? null }))
})

const songsInEditedSongAlbum = computed(() => {
  if (!editingSong.value?.albumId) return []
  return songs.value
    .filter(s => s.albumId === editingSong.value!.albumId)
    .map(s => ({ id: s.id, title: s.title, trackNumber: s.trackNumber ?? null }))
})

const toggleVisibility = async (song: Song) => {
  isUpdating.value = song.id
  try {
    await $fetch(`/api/admin/songs/${song.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: { isPublic: !song.isPublic },
    })
    song.isPublic = !song.isPublic
    recomputeVisibilityStats()
  } catch (error) {
    console.error('Error updating song:', error)
  } finally {
    isUpdating.value = null
  }
}

const openEditModal = (song: Song) => {
  editingSong.value = song
  editForm.value = {
    title: song.title,
    trackNumber: song.trackNumber || null,
    duration: 0,
    lyrics: '',
    isPublic: song.isPublic,
  }
  editError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingSong.value = null
  editForm.value = { title: '', trackNumber: null, duration: 0, lyrics: '', isPublic: false }
  editError.value = ''
}

const createSong = async () => {
  createError.value = ''
  isCreating.value = true
  try {
    if (!createAudioUpload.value?.hasPendingFile()) {
      createError.value = 'Debes seleccionar un archivo de audio'
      return
    }

    const trackId = await createAudioUpload.value.uploadPendingFile()
    if (!trackId) {
      createError.value = 'Error al subir el archivo de audio'
      return
    }

    const uploadResponse = createAudioUpload.value.lastUploadResponse?.()
    const duration = uploadResponse?.duration ?? 0

    const data = await $fetch<{ success: boolean; song: Song }>('/api/admin/songs', {
      method: 'POST',
      credentials: 'include',
      body: {
        id: trackId,
        title: newSong.value.title,
        artistId: newSong.value.artistId,
        albumId: newSong.value.albumId,
        trackNumber: newSong.value.trackNumber || null,
        duration,
        lyrics: newSong.value.lyrics || null,
        isPublic: newSong.value.isPublic,
      },
    })

    if (data.success && data.song) {
      songs.value.unshift(data.song)
      if (stats.value) {
        stats.value.totalSongs++
        if (data.song.isPublic) stats.value.publicSongs++
        else stats.value.privateSongs++
      }
      const album = albums.value.find(a => a.id === newSong.value.albumId)
      if (album) album.totalTracks++
      showCreateModal.value = false
      newSong.value = { title: '', artistId: '', albumId: '', trackNumber: null, duration: 0, lyrics: '', isPublic: false }
    }
  } catch (error: any) {
    createError.value = error?.data?.statusMessage || 'Error al crear canción'
  } finally {
    isCreating.value = false
  }
}

const saveSongChanges = async () => {
  if (!editingSong.value) return
  editError.value = ''
  isEditing.value = true
  try {
    let newDuration: number | undefined
    if (editAudioUpload.value?.hasPendingFile()) {
      const uploaded = await editAudioUpload.value.uploadPendingFile(editingSong.value.id)
      if (!uploaded) {
        editError.value = 'Error al subir el audio'
        return
      }
      const uploadResponse = editAudioUpload.value.lastUploadResponse?.()
      newDuration = uploadResponse?.duration
    }

    const data = await $fetch<{ success: boolean; song: Song }>(
      `/api/admin/songs/${editingSong.value.id}`,
      {
        method: 'PATCH',
        credentials: 'include',
        body: {
          title: editForm.value.title,
          trackNumber: editForm.value.trackNumber || null,
          ...(newDuration !== undefined ? { duration: newDuration } : {}),
          lyrics: editForm.value.lyrics || null,
          isPublic: editForm.value.isPublic,
        },
      }
    )

    if (data.success && data.song) {
      const idx = songs.value.findIndex(s => s.id === editingSong.value?.id)
      if (idx !== -1) songs.value[idx] = data.song
      recomputeVisibilityStats()
      closeEditModal()
    }
  } catch (error: any) {
    editError.value = error?.data?.statusMessage || 'Error al guardar cambios'
  } finally {
    isEditing.value = false
  }
}

const deleteSong = async () => {
  if (!songToDelete.value) return
  isUpdating.value = songToDelete.value.id
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/songs/${songToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (songToDelete.value.albumId) {
      const album = albums.value.find(a => a.id === songToDelete.value?.albumId)
      if (album) album.totalTracks--
    }

    songs.value = songs.value.filter(s => s.id !== songToDelete.value?.id)
    if (stats.value) {
      stats.value.totalSongs--
      if (songToDelete.value.isPublic) stats.value.publicSongs--
      else stats.value.privateSongs--
    }
    songToDelete.value = null
  } catch (error: any) {
    deleteError.value = error?.data?.statusMessage || 'Error al eliminar canción'
  } finally {
    isUpdating.value = null
  }
}
</script>
