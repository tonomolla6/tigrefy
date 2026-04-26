<script setup lang="ts">
/**
 * Modal genérico para los formularios del admin.
 *
 * Mejoras vs modales inline:
 *   - Backdrop click cierra
 *   - ESC cierra
 *   - Header y footer sticky (el body scrollea, los CTAs siempre visibles)
 *   - En móvil: bottom sheet a pantalla completa (más cómodo para el pulgar)
 *   - En desktop: centrado, max-width configurable
 *   - Animaciones suaves
 */

interface Props {
  open: boolean
  title: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  submitLabel?: string
  cancelLabel?: string
  submitDisabled?: boolean
  destructive?: boolean
  hideFooter?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  loading: false,
  submitLabel: 'Guardar',
  cancelLabel: 'Cancelar',
  submitDisabled: false,
  destructive: false,
  hideFooter: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: []
  close: []
}>()

const close = () => {
  if (props.loading) return
  emit('update:open', false)
  emit('close')
}

const handleSubmit = () => {
  if (props.loading || props.submitDisabled) return
  emit('submit')
}

// ESC key
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) close()
}

watch(() => props.open, (open) => {
  if (typeof window === 'undefined') return
  if (open) {
    document.addEventListener('keydown', onKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  if (typeof window === 'undefined') return
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

const sizeClass = computed(() => ({
  sm: 'md:max-w-md',     // confirm dialogs (~450px)
  md: 'md:max-w-2xl',    // formularios estándar (~670px)
  lg: 'md:max-w-4xl',    // formularios grandes (~900px)
  xl: 'md:max-w-6xl',    // gestión amplia (~1150px)
}[props.size]))
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center"
        @click="close"
      >
        <transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="translate-y-full md:translate-y-0 md:scale-95 md:opacity-0"
          leave-to-class="translate-y-full md:translate-y-0 md:scale-95 md:opacity-0"
        >
          <div
            v-if="open"
            class="bg-dark-card w-full md:w-auto md:rounded-xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh] md:max-h-[88vh]"
            :class="[sizeClass, 'md:w-full']"
            @click.stop
          >
            <!-- Header sticky -->
            <header class="flex-shrink-0 px-5 md:px-8 pt-5 md:pt-6 pb-4 border-b border-white/10">
              <!-- Drag handle visual en móvil -->
              <div class="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full" />

              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <h2 class="text-lg md:text-xl font-bold text-white truncate">{{ title }}</h2>
                  <p v-if="subtitle" class="text-sm text-white/60 mt-1">{{ subtitle }}</p>
                </div>
                <button
                  @click="close"
                  class="flex-shrink-0 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  :disabled="loading"
                  aria-label="Cerrar"
                >
                  <IconClose :size="20" />
                </button>
              </div>
            </header>

            <!-- Body scrollable -->
            <form
              v-if="!hideFooter"
              @submit.prevent="handleSubmit"
              class="flex-1 flex flex-col min-h-0"
            >
              <div class="flex-1 overflow-y-auto px-5 md:px-8 py-5 md:py-6 space-y-5">
                <slot />

                <!-- Error global -->
                <div v-if="error" class="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2">
                  {{ error }}
                </div>
              </div>

              <!-- Footer sticky -->
              <footer class="flex-shrink-0 px-5 md:px-8 py-4 border-t border-white/10 bg-dark-card flex flex-col-reverse md:flex-row gap-2 md:gap-3 md:justify-end">
                <button
                  type="button"
                  @click="close"
                  :disabled="loading"
                  class="px-5 py-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium disabled:opacity-50"
                >
                  {{ cancelLabel }}
                </button>
                <button
                  type="submit"
                  :disabled="loading || submitDisabled"
                  class="px-5 py-2.5 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  :class="destructive
                    ? 'bg-red-500 hover:bg-red-400 text-white'
                    : 'bg-tiger-500 hover:bg-tiger-400 text-black'"
                >
                  <svg v-if="loading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="60" stroke-dashoffset="20" />
                  </svg>
                  <span>{{ submitLabel }}</span>
                </button>
              </footer>
            </form>

            <!-- Sin footer (modo solo body, ej. listas o info) -->
            <div v-else class="flex-1 overflow-y-auto px-5 md:px-8 py-5 md:py-6 space-y-5">
              <slot />
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>
