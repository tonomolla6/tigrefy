<template>
  <div class="overflow-hidden">
    <div
      ref="textRef"
      class="whitespace-nowrap"
      :class="shouldMarquee ? 'animate-marquee' : 'truncate'"
      :style="shouldMarquee ? `--marquee-duration: ${marqueeDuration}s` : ''"
    >
      <template v-if="shouldMarquee">
        <span class="inline-block">
          <slot>{{ text }}</slot>
        </span>
        <span class="inline-block w-16" />
        <span class="inline-block">
          <slot>{{ text }}</slot>
        </span>
        <span class="inline-block w-16" />
      </template>
      <template v-else>
        <slot>{{ text }}</slot>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string
}>()

const textRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const textWidth = ref(0)
const shouldMarquee = ref(false)

// Velocidad: ~25px/s
const marqueeDuration = computed(() => {
  const scrollDistance = textWidth.value + 64
  return Math.max(8, scrollDistance / 25)
})

const checkMarquee = () => {
  if (!textRef.value) {
    shouldMarquee.value = false
    return
  }

  // Desactivar para medir el texto sin duplicar
  shouldMarquee.value = false

  nextTick(() => {
    const container = textRef.value?.parentElement
    if (container && textRef.value) {
      containerWidth.value = container.offsetWidth
      const firstSpan = textRef.value.querySelector('span') || textRef.value
      textWidth.value = firstSpan.scrollWidth
      shouldMarquee.value = textWidth.value > containerWidth.value - 10
    }
  })
}

watch(() => props.text, () => {
  shouldMarquee.value = false
  setTimeout(checkMarquee, 100)
})

onMounted(() => {
  checkMarquee()
  window.addEventListener('resize', checkMarquee)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMarquee)
})
</script>

<style scoped>
@keyframes marquee {
  0%, 15% { transform: translateX(0); }
  85%, 100% { transform: translateX(-50%); }
}

.animate-marquee {
  display: inline-flex;
  animation: marquee var(--marquee-duration, 8s) linear infinite;
  will-change: transform;
}
</style>
