<template>
  <BaseModal
    :is-open="isOpen"
    max-width="md"
    body-class="p-0"
    @close="handleCancel"
  >
    <template #header>
      <h2 class="text-2xl font-bold text-red-400">{{ title }}</h2>
      <p class="text-secondary mt-3">{{ message }}</p>
      <p v-if="warning" class="text-sm text-red-400 mt-2">{{ warning }}</p>
    </template>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <button
          @click="handleCancel"
          class="px-6 py-3 rounded-full font-semibold text-secondary hover:text-primary hover:bg-dark-hover transition-all"
        >
          Cancelar
        </button>
        <button
          @click="handleConfirm"
          class="px-8 py-3 rounded-full font-semibold bg-red-600 hover:bg-red-700 transition-colors"
        >
          {{ confirmText }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  isOpen: boolean
  title?: string
  message?: string
  warning?: string
  confirmText?: string
}>(), {
  title: '¿Estás seguro?',
  message: 'Esta acción no se puede deshacer.',
  confirmText: 'Eliminar'
})

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

const handleCancel = () => {
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>
