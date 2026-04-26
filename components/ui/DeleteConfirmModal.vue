<template>
  <BaseModal
    :open="isOpen"
    @update:open="(v) => !v && handleCancel()"
    :title="title"
    size="sm"
    :submit-label="confirmText"
    cancel-label="Cancelar"
    destructive
    @submit="handleConfirm"
  >
    <p class="text-white/80">{{ message }}</p>
    <p v-if="warning" class="text-sm text-yellow-400">{{ warning }}</p>
  </BaseModal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
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

const handleCancel = () => emit('cancel')
const handleConfirm = () => emit('confirm')
</script>
