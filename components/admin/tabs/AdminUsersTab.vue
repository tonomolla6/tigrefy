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
        Crear usuario
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-dark-hover rounded-lg overflow-x-auto">
      <table class="w-full min-w-[500px]">
        <thead class="bg-black/30">
          <tr>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Usuario</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Nombre</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Rol</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in usersList"
            :key="u.id"
            class="border-t border-gray-800 hover:bg-black/20"
          >
            <td class="p-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-tiger-500 flex items-center justify-center text-black font-bold text-sm">
                  {{ (u.displayName || u.username).slice(0, 2).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-white text-sm font-medium truncate">{{ u.username }}</p>
                  <p class="text-gray-400 text-xs truncate md:hidden">{{ u.displayName }}</p>
                </div>
              </div>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-300 text-sm">{{ u.displayName }}</span>
            </td>
            <td class="p-3">
              <select
                :value="u.role"
                @change="changeRole(u, ($event.target as HTMLSelectElement).value as 'tigre' | 'user' | 'guest')"
                :disabled="isUpdating === u.id || u.id === currentUser?.id"
                class="bg-dark-card text-white text-sm rounded px-2 py-1 border border-gray-700 focus:border-tiger-500 focus:outline-none disabled:opacity-50"
                :class="{
                  'text-tiger-400': u.role === 'tigre',
                  'text-blue-400': u.role === 'user',
                  'text-gray-400': u.role === 'guest',
                }"
              >
                <option value="tigre" class="text-tiger-400">Tigre</option>
                <option value="user" class="text-blue-400">User</option>
                <option value="guest" class="text-gray-400">Guest</option>
              </select>
            </td>
            <td class="p-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <AdminActionButtons
                  entity-label="usuario"
                  :loading="isUpdating === u.id"
                  :can-delete="u.id !== currentUser?.id"
                  @edit="openEditModal(u)"
                  @delete="userToDelete = u"
                />
                <span v-if="u.id === currentUser?.id" class="text-gray-500 text-xs">Tú</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear -->
    <BaseModal
      v-model:open="showCreateModal"
      title="Crear nuevo usuario"
      size="md"
      :loading="isCreating"
      :error="createError"
      submit-label="Crear usuario"
      @submit="createUser"
    >
      <div class="space-y-1">
        <label class="block text-sm text-white/70">Username</label>
        <BaseInput v-model="newUser.username" placeholder="Mínimo 3 caracteres" required minlength="3" />
      </div>

      <div class="space-y-1">
        <label class="block text-sm text-white/70">Nombre para mostrar</label>
        <BaseInput v-model="newUser.displayName" placeholder="Opcional" />
      </div>

      <div class="space-y-1">
        <label class="block text-sm text-white/70">Contraseña</label>
        <BaseInput v-model="newUser.password" type="password" placeholder="Mínimo 6 caracteres" required minlength="6" />
      </div>

      <div class="space-y-1">
        <label class="block text-sm text-white/70">Rol</label>
        <BaseSelect v-model="newUser.role">
          <option value="guest">Guest — Solo contenido público</option>
          <option value="user">User — Ve todo el contenido</option>
          <option value="tigre">Tigre — Acceso completo + gestión</option>
        </BaseSelect>
      </div>
    </BaseModal>

    <!-- Modal Editar -->
    <BaseModal
      :open="showEditModal && !!editingUser"
      @update:open="(v) => !v && closeEditModal()"
      title="Editar usuario"
      size="md"
      :loading="isEditing"
      :error="editError"
      submit-label="Guardar cambios"
      @submit="saveUserChanges"
    >
      <div class="space-y-1">
        <label class="block text-sm text-white/70">Username</label>
        <BaseInput v-model="editForm.username" required minlength="3" />
      </div>

      <div class="space-y-1">
        <label class="block text-sm text-white/70">Nombre para mostrar</label>
        <BaseInput v-model="editForm.displayName" />
      </div>

      <div class="space-y-1">
        <label class="block text-sm text-white/70">
          Nueva contraseña <span class="text-white/40">(dejar vacío para mantener)</span>
        </label>
        <BaseInput v-model="editForm.password" type="password" placeholder="Mínimo 6 caracteres" minlength="6" />
      </div>

      <div class="space-y-1">
        <label class="block text-sm text-white/70">Rol</label>
        <BaseSelect v-model="editForm.role" :disabled="editingUser?.id === currentUser?.id">
          <option value="guest">Guest — Solo contenido público</option>
          <option value="user">User — Ve todo el contenido</option>
          <option value="tigre">Tigre — Acceso completo + gestión</option>
        </BaseSelect>
        <p v-if="editingUser?.id === currentUser?.id" class="text-xs text-white/40 mt-1">
          No puedes cambiar tu propio rol
        </p>
      </div>
    </BaseModal>

    <!-- Modal Eliminar -->
    <BaseModal
      :open="!!userToDelete"
      @update:open="(v) => !v && (userToDelete = null)"
      title="Eliminar usuario"
      size="sm"
      :loading="isUpdating === userToDelete?.id"
      submit-label="Eliminar"
      destructive
      @submit="deleteUser"
    >
      <p class="text-white/80">
        ¿Eliminar a <span class="text-white font-semibold">{{ userToDelete?.username }}</span>?
      </p>
      <p class="text-yellow-400 text-sm">Esta acción no se puede deshacer.</p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type { AdminUser } from '~/types/admin'

const { user: currentUser } = useAuth()
const { usersList } = useAdminData()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const isCreating = ref(false)
const isEditing = ref(false)
const isUpdating = ref<string | null>(null)
const createError = ref('')
const editError = ref('')

const editingUser = ref<AdminUser | null>(null)
const userToDelete = ref<AdminUser | null>(null)

const newUser = ref({
  username: '',
  displayName: '',
  password: '',
  role: 'guest' as 'tigre' | 'user' | 'guest',
})

const editForm = ref({
  username: '',
  displayName: '',
  password: '',
  role: 'guest' as 'tigre' | 'user' | 'guest',
})

const openEditModal = (u: AdminUser) => {
  editingUser.value = u
  editForm.value = {
    username: u.username,
    displayName: u.displayName,
    password: '',
    role: u.role,
  }
  editError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = null
  editForm.value = { username: '', displayName: '', password: '', role: 'guest' }
  editError.value = ''
}

const createUser = async () => {
  createError.value = ''
  isCreating.value = true
  try {
    const data = await $fetch<{ success: boolean; user: AdminUser }>('/api/admin/users', {
      method: 'POST',
      credentials: 'include',
      body: {
        username: newUser.value.username,
        password: newUser.value.password,
        displayName: newUser.value.displayName || newUser.value.username,
        role: newUser.value.role,
      },
    })

    if (data.success && data.user) {
      usersList.value.push(data.user)
      showCreateModal.value = false
      newUser.value = { username: '', displayName: '', password: '', role: 'guest' }
    }
  } catch (error: any) {
    createError.value = error?.data?.statusMessage || 'Error al crear usuario'
  } finally {
    isCreating.value = false
  }
}

const changeRole = async (u: AdminUser, newRole: 'tigre' | 'user' | 'guest') => {
  if (u.role === newRole) return
  isUpdating.value = u.id
  try {
    await $fetch(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: { role: newRole },
    })
    u.role = newRole
  } catch (error) {
    console.error('Error updating user role:', error)
  } finally {
    isUpdating.value = null
  }
}

const saveUserChanges = async () => {
  if (!editingUser.value) return
  editError.value = ''
  isEditing.value = true
  try {
    const body: Record<string, any> = {}

    if (editForm.value.username !== editingUser.value.username) body.username = editForm.value.username
    if (editForm.value.displayName !== editingUser.value.displayName) body.displayName = editForm.value.displayName
    if (editForm.value.password) body.password = editForm.value.password
    if (
      editingUser.value.id !== currentUser.value?.id &&
      editForm.value.role !== editingUser.value.role
    ) {
      body.role = editForm.value.role
    }

    if (Object.keys(body).length === 0) {
      closeEditModal()
      return
    }

    const data = await $fetch<{ success: boolean; user: AdminUser }>(
      `/api/admin/users/${editingUser.value.id}`,
      {
        method: 'PATCH',
        credentials: 'include',
        body,
      }
    )

    if (data.success && data.user) {
      const idx = usersList.value.findIndex(u => u.id === editingUser.value?.id)
      if (idx !== -1) {
        usersList.value[idx] = { ...usersList.value[idx], ...data.user }
      }
      closeEditModal()
    }
  } catch (error: any) {
    editError.value = error?.data?.statusMessage || 'Error al guardar cambios'
  } finally {
    isEditing.value = false
  }
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  isUpdating.value = userToDelete.value.id
  try {
    await $fetch(`/api/admin/users/${userToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    usersList.value = usersList.value.filter(u => u.id !== userToDelete.value?.id)
    userToDelete.value = null
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    isUpdating.value = null
  }
}
</script>
