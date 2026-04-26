<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[200]"
    >
      <div
        class="absolute inset-0 bg-black/60"
        @click="emit('close')"
      />

      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        leave-active-class="transition-transform duration-300 ease-in"
        enter-from-class="translate-y-full"
        leave-to-class="translate-y-full"
        appear
        @after-leave="isVisible = false"
      >
        <div
          v-if="isOpen"
          class="absolute bottom-0 left-0 right-0 bg-dark-card rounded-t-2xl max-h-[85vh] flex flex-col"
          :style="swipeOffset > 0 ? { transform: `translateY(${swipeOffset}px)` } : undefined"
          @click.stop
        >
          <!-- Handle: única zona de drag para cerrar el sheet.
               touch-action:none impide que el browser haga pull-to-refresh
               mientras se arrastra aquí. -->
          <div
            class="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            style="touch-action: none"
            @touchstart.passive="handleTouchStart"
            @touchmove.passive="handleTouchMove"
            @touchend.passive="handleTouchEnd"
          >
            <div class="w-10 h-1 bg-white/30 rounded-full" />
          </div>

          <!-- Header (opcional) -->
          <div v-if="title || $slots.header" class="px-4 pb-3 border-b border-white/10">
            <slot name="header">
              <h3 class="text-lg font-bold text-white text-center">{{ title }}</h3>
            </slot>
          </div>

          <!-- Contenido (scrollea normal) -->
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
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title?: string
}>()

const emit = defineEmits<{
  close: []
}>()

// El contenedor exterior se mantiene en el DOM hasta que termina la animación
// de leave del sheet (gestionado vía @after-leave). Si bindeáramos el v-if del
// contenedor a isOpen directamente, al cerrar se desmontaría todo de golpe y
// la animación de slide-down del sheet no se vería.
const isVisible = ref(props.isOpen)
watch(() => props.isOpen, (open) => {
  if (open) isVisible.value = true
})

const touchStartY = ref(0)
const swipeOffset = ref(0)
const isDragging = ref(false)

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
