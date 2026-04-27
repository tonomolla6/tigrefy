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
        Crear género
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-dark-hover rounded-lg overflow-x-auto">
      <table class="w-full min-w-[400px]">
        <thead class="bg-black/30">
          <tr>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Género</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Canciones</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="g in genresList"
            :key="g.id"
            class="border-t border-gray-800 hover:bg-black/20"
          >
            <td class="p-3">
              <span class="text-white text-sm font-medium">{{ g.name }}</span>
            </td>
            <td class="p-3 text-center">
              <span class="text-gray-300 text-sm">{{ g.songCount }}</span>
            </td>
            <td class="p-3 text-center">
              <AdminActionButtons
                entity-label="género"
                :loading="isUpdating === g.id"
                can-delete
                @edit="openEditModal(g)"
                @delete="genreToDelete = g"
              />
            </td>
          </tr>
          <tr v-if="genresList.length === 0">
            <td colspan="3" class="p-6 text-center text-white/40 text-sm">
              No hay géneros. Crea el primero con el botón de arriba.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear -->
    <BaseModal
      v-model:open="showCreateModal"
      title="Crear nuevo género"
      size="sm"
      :loading="isCreating"
      :error="createError"
      submit-label="Crear género"
      @submit="createGenre"
    >
      <div class="space-y-1">
        <label class="block text-sm text-white/70">Nombre <span class="text-red-400">*</span></label>
        <BaseInput v-model="newGenre.name" placeholder="Ej: Tech House" required />
      </div>
    </BaseModal>

    <!-- Modal Editar -->
    <BaseModal
      :open="showEditModal && !!editingGenre"
      @update:open="(v) => !v && closeEditModal()"
      title="Editar género"
      size="sm"
      :loading="isEditing"
      :error="editError"
      submit-label="Guardar cambios"
      @submit="saveGenreChanges"
    >
      <div class="space-y-1">
        <label class="block text-sm text-white/70">Nombre <span class="text-red-400">*</span></label>
        <BaseInput v-model="editForm.name" required />
      </div>
    </BaseModal>

    <!-- Modal Eliminar -->
    <BaseModal
      :open="!!genreToDelete"
      @update:open="(v) => !v && (genreToDelete = null, deleteError = '')"
      title="Eliminar género"
      size="sm"
      :loading="isUpdating === genreToDelete?.id"
      :error="deleteError"
      submit-label="Eliminar"
      destructive
      @submit="deleteGenre"
    >
      <p class="text-white/80">
        ¿Eliminar el género <span class="text-white font-semibold">{{ genreToDelete?.name }}</span>?
      </p>
      <p v-if="genreToDelete && genreToDelete.songCount > 0" class="text-yellow-400 text-sm">
        Esto desasignará el género de
        <span class="font-semibold">{{ genreToDelete.songCount }}</span>
        {{ genreToDelete.songCount === 1 ? 'canción' : 'canciones' }}.
      </p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { Genre } from '~/stores/genres'

const { genresList, loadGenres } = useAdminData()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const isCreating = ref(false)
const isEditing = ref(false)
const isUpdating = ref<number | null>(null)
const createError = ref('')
const editError = ref('')
const deleteError = ref('')

const editingGenre = ref<Genre | null>(null)
const genreToDelete = ref<Genre | null>(null)

const newGenre = ref({ name: '' })
const editForm = ref({ name: '' })

const openEditModal = (g: Genre) => {
  editingGenre.value = g
  editForm.value = { name: g.name }
  editError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingGenre.value = null
  editForm.value = { name: '' }
  editError.value = ''
}

const createGenre = async () => {
  createError.value = ''
  isCreating.value = true
  try {
    const data = await $fetch<{ success: boolean; genre: Genre }>('/api/admin/genres', {
      method: 'POST',
      credentials: 'include',
      body: { name: newGenre.value.name },
    })
    if (data.success && data.genre) {
      genresList.value.push({ ...data.genre, songCount: 0 })
      genresList.value.sort((a, b) => a.name.localeCompare(b.name))
      showCreateModal.value = false
      newGenre.value = { name: '' }
    }
  } catch (error: any) {
    createError.value = error?.data?.statusMessage || 'Error al crear género'
  } finally {
    isCreating.value = false
  }
}

const saveGenreChanges = async () => {
  if (!editingGenre.value) return
  editError.value = ''
  isEditing.value = true
  try {
    const data = await $fetch<{ success: boolean; genre: Genre }>(
      `/api/admin/genres/${editingGenre.value.id}`,
      { method: 'PATCH', credentials: 'include', body: { name: editForm.value.name } }
    )
    if (data.success && data.genre) {
      const idx = genresList.value.findIndex(g => g.id === editingGenre.value?.id)
      if (idx !== -1) genresList.value[idx] = { ...genresList.value[idx], name: data.genre.name }
      genresList.value.sort((a, b) => a.name.localeCompare(b.name))
      closeEditModal()
    }
  } catch (error: any) {
    editError.value = error?.data?.statusMessage || 'Error al guardar cambios'
  } finally {
    isEditing.value = false
  }
}

const deleteGenre = async () => {
  if (!genreToDelete.value) return
  isUpdating.value = genreToDelete.value.id
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/genres/${genreToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    genresList.value = genresList.value.filter(g => g.id !== genreToDelete.value?.id)
    genreToDelete.value = null
    // Recargar canciones porque el shape de song.genres puede haber cambiado.
    await loadGenres()
  } catch (error: any) {
    deleteError.value = error?.data?.statusMessage || 'Error al eliminar género'
  } finally {
    isUpdating.value = null
  }
}
</script>
