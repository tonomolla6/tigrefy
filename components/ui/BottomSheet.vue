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
        class="fixed inset-0 z-[200] flex flex-col justify-end"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60" />

        <!-- Sheet -->
        <transition
          enter-active-class="transition-transform duration-300 ease-out"
          leave-active-class="transition-transform duration-200 ease-in"
          enter-from-class="translate-y-full"
          leave-to-class="translate-y-full"
          appear
        >
          <div
            v-if="isOpen"
            class="relative bg-dark-card rounded-t-2xl max-h-[85vh] flex flex-col"
            @click.stop
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            :style="{ transform: `translateY(${swipeOffset}px)` }"
          >
            <!-- Handle -->
            <div class="flex justify-center py-3">
              <div class="w-10 h-1 bg-white/30 rounded-full" />
            </div>

            <!-- Header (opcional) -->
            <div v-if="title || $slots.header" class="px-4 pb-3 border-b border-white/10">
              <slot name="header">
                <h3 class="text-lg font-bold text-white text-center">{{ title }}</h3>
              </slot>
            </div>

            <!-- Contenido -->
            <div class="flex-1 overflow-y-auto overscroll-contain">
              <slot />
            </div>

            <!-- Footer (opcional) -->
            <div v-if="$slots.footer" class="border-t border-white/10 p-4 pb-safe">
              <slot name="footer" />
            </div>

            <!-- Safe area bottom padding si no hay footer -->
            <div v-else class="pb-safe" />
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  title?: string
  closeOnBackdrop?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// Swipe down to close
const touchStartY = ref(0)
const swipeOffset = ref(0)
const isDragging = ref(false)

const handleBackdropClick = () => {
  if (props.closeOnBackdrop !== false) {
    emit('close')
  }
}

const handleTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY
  isDragging.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  const diff = e.touches[0].clientY - touchStartY.value
  if (diff > 0) {
    swipeOffset.value = diff
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
  if (swipeOffset.value > 100) {
    emit('close')
  }
  swipeOffset.value = 0
}
</script>
