<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="opt in options"
      :key="opt.id"
      type="button"
      @click="toggle(opt.id)"
      :class="[
        'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
        selected.includes(opt.id)
          ? 'bg-tiger-500 text-black'
          : 'bg-dark-hover text-white hover:bg-gray-700'
      ]"
    >
      {{ opt.name }}
    </button>
    <p v-if="options.length === 0" class="text-xs text-white/40">
      No hay géneros. Crea alguno desde la pestaña Géneros.
    </p>
  </div>
</template>

<script setup lang="ts">
interface GenreOption {
  id: number
  name: string
}

const props = defineProps<{
  modelValue: number[]
  options: GenreOption[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>()

const selected = computed(() => props.modelValue ?? [])

const toggle = (id: number) => {
  const set = new Set(selected.value)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  emit('update:modelValue', Array.from(set))
}
</script>
