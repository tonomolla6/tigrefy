<template>
  <div>
    <!-- Botón crear -->
    <div class="flex justify-end mb-4">
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 rounded-full text-sm font-medium bg-tiger-500 text-black hover:bg-tiger-400 transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crear artista
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-dark-hover rounded-lg overflow-x-auto">
      <table class="w-full">
        <thead class="bg-black/30">
          <tr>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Artista</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">ID</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="artist in artistsList"
            :key="artist.id"
            class="border-t border-gray-800 hover:bg-black/20"
          >
            <td class="p-3">
              <div class="flex items-center gap-3">
                <SecureImage :src="artist.image" :alt="artist.name" class="w-10 h-10 rounded-full" />
                <span class="text-white text-sm font-medium">{{ artist.name }}</span>
              </div>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-500 text-xs font-mono">{{ artist.id }}</span>
            </td>
            <td class="p-3 text-center">
              <AdminActionButtons
                entity-label="artista"
                :loading="isUpdating === artist.id"
                can-delete
                @edit="openEditModal(artist)"
                @delete="artistToDelete = artist"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear -->
    <BaseModal
      v-model:open="showCreateModal"
      title="Crear nuevo artista"
      size="md"
      :loading="isCreating"
      :error="createError"
      submit-label="Crear artista"
      @submit="createArtist"
    >
      <div class="space-y-1">
        <label class="block text-sm text-white/70">Nombre <span class="text-red-400">*</span></label>
        <BaseInput v-model="newArtist.name" placeholder="Nombre del artista" required />
      </div>

      <FileUpload
        ref="createImageUpload"
        v-model="newArtist.image"
        type="artist"
        label="Imagen del artista"
      />

      <div class="space-y-1">
        <label class="block text-sm text-white/70">Biografía</label>
        <BaseTextarea v-model="newArtist.bio" placeholder="Descripción del artista..." />
      </div>
    </BaseModal>

    <!-- Modal Editar -->
    <BaseModal
      :open="showEditModal && !!editingArtist"
      @update:open="(v) => !v && closeEditModal()"
      title="Editar artista"
      size="md"
      :loading="isEditing"
      :error="editError"
      submit-label="Guardar cambios"
      @submit="saveArtistChanges"
    >
      <div class="space-y-1">
        <label class="block text-sm text-white/70">Nombre <span class="text-red-400">*</span></label>
        <BaseInput v-model="editForm.name" required />
      </div>

      <FileUpload
        ref="editImageUpload"
        v-model="editForm.image"
        type="artist"
        label="Imagen del artista"
      />

      <div class="space-y-1">
        <label class="block text-sm text-white/70">Biografía</label>
        <BaseTextarea v-model="editForm.bio" />
      </div>
    </BaseModal>

    <!-- Modal Eliminar -->
    <BaseModal
      :open="!!artistToDelete"
      @update:open="(v) => !v && (artistToDelete = null, deleteError = '')"
      title="Eliminar artista"
      size="sm"
      :loading="isUpdating === artistToDelete?.id"
      :error="deleteError"
      submit-label="Eliminar"
      destructive
      @submit="deleteArtist"
    >
      <p class="text-white/80">
        ¿Eliminar a <span class="text-white font-semibold">{{ artistToDelete?.name }}</span>?
      </p>
      <p class="text-yellow-400 text-sm">
        Solo se puede eliminar si no tiene álbumes ni canciones asociadas.
      </p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { Artist, FileUploadHandle } from '~/types/admin'

const { artistsList } = useAdminData()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const isCreating = ref(false)
const isEditing = ref(false)
const isUpdating = ref<string | null>(null)
const createError = ref('')
const editError = ref('')
const deleteError = ref('')

const editingArtist = ref<Artist | null>(null)
const artistToDelete = ref<Artist | null>(null)

const newArtist = ref({ name: '', image: '', bio: '' })
const editForm = ref({ name: '', image: '', bio: '' })

const createImageUpload = ref<FileUploadHandle | null>(null)
const editImageUpload = ref<FileUploadHandle | null>(null)

const openEditModal = (artist: Artist) => {
  editingArtist.value = artist
  editForm.value = {
    name: artist.name,
    image: artist.image || '',
    bio: artist.bio || '',
  }
  editError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingArtist.value = null
  editForm.value = { name: '', image: '', bio: '' }
  editError.value = ''
}

const createArtist = async () => {
  createError.value = ''
  isCreating.value = true
  try {
    let imageUrl = newArtist.value.image
    if (createImageUpload.value?.hasPendingFile()) {
      const uploadedUrl = await createImageUpload.value.uploadPendingFile()
      if (!uploadedUrl) {
        createError.value = 'Error al subir la imagen'
        return
      }
      imageUrl = uploadedUrl
    }

    const data = await $fetch<{ success: boolean; artist: Artist }>('/api/admin/artists', {
      method: 'POST',
      credentials: 'include',
      body: {
        name: newArtist.value.name,
        image: imageUrl || null,
        bio: newArtist.value.bio || null,
      },
    })

    if (data.success && data.artist) {
      artistsList.value.push(data.artist)
      showCreateModal.value = false
      newArtist.value = { name: '', image: '', bio: '' }
    }
  } catch (error: any) {
    createError.value = error?.data?.statusMessage || 'Error al crear artista'
  } finally {
    isCreating.value = false
  }
}

const saveArtistChanges = async () => {
  if (!editingArtist.value) return
  editError.value = ''
  isEditing.value = true
  try {
    let imageUrl = editForm.value.image
    if (editImageUpload.value?.hasPendingFile()) {
      const uploadedUrl = await editImageUpload.value.uploadPendingFile()
      if (!uploadedUrl) {
        editError.value = 'Error al subir la imagen'
        return
      }
      imageUrl = uploadedUrl
    }

    const data = await $fetch<{ success: boolean; artist: Artist }>(
      `/api/admin/artists/${editingArtist.value.id}`,
      {
        method: 'PATCH',
        credentials: 'include',
        body: {
          name: editForm.value.name,
          image: imageUrl || null,
          bio: editForm.value.bio || null,
        },
      }
    )

    if (data.success && data.artist) {
      const idx = artistsList.value.findIndex(a => a.id === editingArtist.value?.id)
      if (idx !== -1) artistsList.value[idx] = data.artist
      closeEditModal()
    }
  } catch (error: any) {
    editError.value = error?.data?.statusMessage || 'Error al guardar cambios'
  } finally {
    isEditing.value = false
  }
}

const deleteArtist = async () => {
  if (!artistToDelete.value) return
  isUpdating.value = artistToDelete.value.id
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/artists/${artistToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    artistsList.value = artistsList.value.filter(a => a.id !== artistToDelete.value?.id)
    artistToDelete.value = null
  } catch (error: any) {
    deleteError.value = error?.data?.statusMessage || 'Error al eliminar artista'
  } finally {
    isUpdating.value = null
  }
}
</script>
