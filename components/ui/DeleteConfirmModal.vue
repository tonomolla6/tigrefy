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
        @click="handleCancel"
      >
        <transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="bg-dark-highlight rounded-lg shadow-2xl max-w-md w-full transform"
            @click.stop
          >
            <!-- Header -->
            <div class="p-6">
              <h2 class="text-2xl font-bold text-red-400">{{ title }}</h2>
              <p class="text-secondary mt-3">{{ message }}</p>
              <p v-if="warning" class="text-sm text-red-400 mt-2">{{ warning }}</p>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t border-gray-700 flex gap-3 justify-end">
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
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
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
