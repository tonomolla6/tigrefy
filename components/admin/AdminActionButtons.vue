<template>
  <div class="flex items-center justify-center gap-2">
    <button
      @click="$emit('edit')"
      :disabled="loading"
      class="p-2 rounded-full bg-tiger-500/20 text-tiger-400 hover:bg-tiger-500/30 transition-colors disabled:opacity-50"
      :title="`Editar ${entityLabel}`"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </button>
    <button
      v-if="canDelete"
      @click="$emit('delete')"
      :disabled="loading"
      class="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
      :title="`Eliminar ${entityLabel}`"
    >
      <span v-if="loading" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  entityLabel: string
  loading?: boolean
  canDelete?: boolean
}>()

defineEmits<{
  edit: []
  delete: []
}>()
</script>
