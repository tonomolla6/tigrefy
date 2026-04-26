<template>
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    :class="[
      'w-full bg-dark-hover text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-tiger-500',
      resize ? 'resize-y' : 'resize-none',
    ]"
    :style="`min-height: ${minHeight}`"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string | null
  /** Altura mínima en CSS (default 7rem ~ 4-5 líneas) */
  minHeight?: string
  /** Permite que el usuario redimensione manualmente */
  resize?: boolean
}>(), {
  minHeight: '7rem',
  resize: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
