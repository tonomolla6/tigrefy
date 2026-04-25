<script setup lang="ts">
/**
 * Textarea optimizado para escribir letras:
 * - Crece automáticamente al escribir (min 12 líneas, sin límite máximo)
 * - Fuente legible con line-height generoso
 * - Contador de líneas y caracteres
 * - Acepta paste de letras pegadas con muchos saltos de línea
 */

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  minLines?: number
}>(), {
  placeholder: 'Pega o escribe la letra aquí…\n\nLas líneas en blanco separan estrofas.',
  minLines: 12,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const adjustHeight = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.max(el.scrollHeight, props.minLines * 24)}px`
}

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
  adjustHeight()
}

watch(() => props.modelValue, () => {
  nextTick(adjustHeight)
})

onMounted(() => {
  nextTick(adjustHeight)
})

const stats = computed(() => {
  const text = props.modelValue || ''
  const lines = text.split('\n').filter(l => l.trim().length > 0).length
  return { lines, chars: text.length }
})
</script>

<template>
  <div class="space-y-1.5">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
      class="w-full bg-dark-hover text-white rounded-lg px-4 py-3 leading-7 text-[15px]
             focus:outline-none focus:ring-2 focus:ring-tiger-500 resize-none
             font-sans tracking-wide overflow-hidden"
      :style="`min-height: ${minLines * 24}px`"
      spellcheck="false"
    ></textarea>
    <div class="flex items-center justify-between text-xs text-white/40 px-1">
      <span>Las líneas en blanco separan estrofas</span>
      <span class="tabular-nums">{{ stats.lines }} líneas · {{ stats.chars }} caracteres</span>
    </div>
  </div>
</template>
