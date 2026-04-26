<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    class="w-full bg-dark-hover text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-tiger-500 disabled:opacity-60"
  >
    <slot />
  </select>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string | number | null
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
