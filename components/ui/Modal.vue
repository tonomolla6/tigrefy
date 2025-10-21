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
        @click="handleBackdropClick"
      >
        <transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="bg-dark-highlight rounded-lg shadow-2xl max-w-md w-full p-6 transform"
            @click.stop
          >
            <h2 class="text-2xl font-bold mb-4">{{ modalTitle }}</h2>
            <p class="text-secondary mb-6">{{ modalMessage }}</p>

            <input
              v-if="modalType === 'prompt'"
              v-model="modalInputValue"
              type="text"
              :placeholder="modalInputPlaceholder"
              class="w-full bg-dark-base border border-gray-700 rounded-lg px-4 py-3 mb-6 text-primary focus:outline-none focus:border-tiger-500 transition-colors"
              @keyup.enter="handleConfirm"
              @keyup.esc="handleCancel"
              ref="inputRef"
            />

            <div class="flex gap-3 justify-end">
              <button
                v-if="modalType !== 'alert'"
                @click="handleCancel"
                class="px-6 py-3 rounded-full font-semibold text-secondary hover:text-primary hover:bg-dark-hover transition-all"
              >
                Cancelar
              </button>
              <button
                @click="handleConfirm"
                class="btn-tiger px-8"
              >
                {{ modalType === 'alert' ? 'OK' : 'Confirmar' }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
const {
  isOpen,
  modalType,
  modalTitle,
  modalMessage,
  modalInputValue,
  modalInputPlaceholder,
  handleConfirm,
  handleCancel
} = useModal()

const inputRef = ref<HTMLInputElement | null>(null)

watch(isOpen, (newVal) => {
  if (newVal && modalType.value === 'prompt') {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

const handleBackdropClick = () => {
  if (modalType.value === 'alert') {
    handleConfirm()
  } else {
    handleCancel()
  }
}
</script>
