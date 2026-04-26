<template>
  <button
    @click="$emit('toggle')"
    :disabled="loading"
    class="p-2 rounded-full transition-colors disabled:opacity-50"
    :class="isPublic ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'"
    :title="isPublic ? 'Hacer privado' : 'Hacer público'"
  >
    <span v-if="loading" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
    <span v-else>{{ isPublic ? '🔓' : '🔒' }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isPublic: boolean
  loading?: boolean
}>()

defineEmits<{ toggle: [] }>()
</script>
