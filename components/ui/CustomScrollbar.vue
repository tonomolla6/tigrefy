<template>
  <div
    class="relative h-full"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div
      ref="scrollContainer"
      class="h-full overflow-y-auto scrollbar-none"
      @scroll="onScroll"
    >
      <slot />
    </div>
    <!-- Custom scrollbar -->
    <div
      v-if="showScrollbar"
      class="absolute top-0 right-0 bottom-0 w-3 pointer-events-none transition-opacity duration-200"
      :class="isHovering || isDragging ? 'opacity-100' : 'opacity-0'"
    >
      <div
        class="absolute w-full bg-[#ffffff4d] hover:bg-[#ffffff80] transition-colors pointer-events-auto"
        :style="scrollThumbStyle"
        @mousedown="startDrag"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  scroll: [scrollTop: number]
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const scrollHeight = ref(0)
const clientHeight = ref(0)
const isDragging = ref(false)
const dragStartY = ref(0)
const dragStartScrollTop = ref(0)
const isHovering = ref(false)

const showScrollbar = computed(() => scrollHeight.value > clientHeight.value)

const scrollThumbStyle = computed(() => {
  if (!showScrollbar.value) return {}
  const trackHeight = clientHeight.value
  const thumbHeight = Math.max(48, (clientHeight.value / scrollHeight.value) * trackHeight)
  const maxScroll = scrollHeight.value - clientHeight.value
  const scrollRatio = maxScroll > 0 ? scrollTop.value / maxScroll : 0
  const thumbTop = scrollRatio * (trackHeight - thumbHeight)
  return {
    height: `${thumbHeight}px`,
    top: `${thumbTop}px`
  }
})

const onScroll = () => {
  if (scrollContainer.value) {
    scrollTop.value = scrollContainer.value.scrollTop
    scrollHeight.value = scrollContainer.value.scrollHeight
    clientHeight.value = scrollContainer.value.clientHeight
    emit('scroll', scrollTop.value)
  }
}

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  dragStartY.value = e.clientY
  dragStartScrollTop.value = scrollTop.value
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !scrollContainer.value) return
  const trackHeight = clientHeight.value
  const thumbHeight = Math.max(48, (clientHeight.value / scrollHeight.value) * trackHeight)
  const maxScroll = scrollHeight.value - clientHeight.value
  const deltaY = e.clientY - dragStartY.value
  const scrollDelta = (deltaY / (trackHeight - thumbHeight)) * maxScroll
  scrollContainer.value.scrollTop = dragStartScrollTop.value + scrollDelta
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

onMounted(() => {
  nextTick(() => {
    onScroll()
  })
})

const scrollToTop = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
}

// Exponer métodos para uso desde fuera
defineExpose({
  refresh: onScroll,
  scrollToTop
})
</script>

<style scoped>
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
