<template>
  <input
    :type="type"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    class="w-full bg-dark-hover text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-tiger-500 disabled:opacity-60"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string | number | null
  type?: 'text' | 'password' | 'date' | 'email' | 'number' | 'search' | 'tel' | 'url'
}>(), {
  type: 'text',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
