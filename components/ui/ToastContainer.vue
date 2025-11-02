<template>
  <Teleport to="body">
    <div class="fixed bottom-24 md:bottom-32 right-4 z-[200] space-y-2">
      <TransitionGroup
        enter-active-class="transition-all duration-200"
        leave-active-class="transition-all duration-200"
        enter-from-class="opacity-0 translate-x-full"
        leave-to-class="opacity-0 translate-x-full"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="min-w-[300px] max-w-md px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3"
          :class="{
            'bg-green-600 text-white': toast.type === 'success',
            'bg-red-600 text-white': toast.type === 'error',
            'bg-dark-highlight text-primary border border-gray-700': toast.type === 'info'
          }"
        >
          <IconCheck v-if="toast.type === 'success'" :size="20" class="flex-shrink-0" />
          <IconClose v-if="toast.type === 'error'" :size="20" class="flex-shrink-0" />
          <span class="flex-1">{{ toast.message }}</span>
          <button
            @click="remove(toast.id)"
            class="text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <IconClose :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()
</script>
