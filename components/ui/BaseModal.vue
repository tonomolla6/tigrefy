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
        @click="$emit('close')"
      >
        <transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="bg-dark-highlight rounded-lg shadow-2xl transform"
            :class="[maxWidthClass, { 'max-h-[90vh] overflow-y-auto': scrollable, 'max-h-[80vh] flex flex-col': !scrollable }]"
            @click.stop
          >
            <!-- Header -->
            <div v-if="$slots.header || title" class="p-4 md:p-6 border-b border-gray-700">
              <slot name="header">
                <h2 class="text-xl md:text-2xl font-bold" :class="titleClass">{{ title }}</h2>
                <p v-if="subtitle" class="text-secondary mt-1 text-sm md:text-base">{{ subtitle }}</p>
              </slot>
            </div>

            <!-- Body -->
            <div :class="['flex-1', scrollable ? '' : 'overflow-y-auto', bodyClass]">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="p-4 md:p-6 border-t border-gray-700">
              <slot name="footer" />
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
  subtitle?: string
  titleClass?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  scrollable?: boolean
  bodyClass?: string
}>(), {
  maxWidth: 'lg',
  scrollable: true,
  bodyClass: 'p-4 md:p-6'
})

defineEmits<{
  close: []
}>()

const maxWidthClass = computed(() => {
  const classes: Record<string, string> = {
    sm: 'max-w-sm w-full',
    md: 'max-w-md w-full',
    lg: 'max-w-lg w-full',
    xl: 'max-w-xl w-full'
  }
  return classes[props.maxWidth]
})
</script>
