<template>
  <div
    ref="triggerRef"
    class="contents"
    @mouseenter="show"
    @mouseleave="hide"
  >
    <slot />
  </div>
  <Teleport to="body">
    <div
      v-if="visible && text"
      class="fixed z-[9999] px-2 py-1.5 text-sm font-medium text-white bg-[#282828] rounded-md shadow-lg whitespace-nowrap pointer-events-none"
      :style="tooltipStyle"
    >
      {{ text }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  delay: 300
})

const visible = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref({ top: '0px', left: '0px', transform: '' })
let timeout: ReturnType<typeof setTimeout> | null = null

const updatePosition = () => {
  if (!triggerRef.value) return

  // Buscar el primer elemento hijo real
  const trigger = triggerRef.value.firstElementChild as HTMLElement
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const gap = 8

  let top = 0
  let left = 0
  let transform = ''

  switch (props.position) {
    case 'top':
      top = rect.top - gap
      left = rect.left + rect.width / 2
      transform = 'translate(-50%, -100%)'
      break
    case 'bottom':
      top = rect.bottom + gap
      left = rect.left + rect.width / 2
      transform = 'translate(-50%, 0)'
      break
    case 'left':
      top = rect.top + rect.height / 2
      left = rect.left - gap
      transform = 'translate(-100%, -50%)'
      break
    case 'right':
      top = rect.top + rect.height / 2
      left = rect.right + gap
      transform = 'translate(0, -50%)'
      break
  }

  // Ajustar si se sale de la pantalla
  // Para top/bottom, asegurar que no se salga por los lados
  if (props.position === 'top' || props.position === 'bottom') {
    // Estimar ancho del tooltip (aproximado basado en el texto)
    const estimatedWidth = props.text.length * 8 + 16
    const minLeft = estimatedWidth / 2 + 8
    const maxLeft = window.innerWidth - estimatedWidth / 2 - 8

    if (left < minLeft) {
      left = minLeft
    } else if (left > maxLeft) {
      left = maxLeft
    }
  }

  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    transform
  }
}

const show = () => {
  timeout = setTimeout(() => {
    updatePosition()
    visible.value = true
  }, props.delay)
}

const hide = () => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  visible.value = false
}

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout)
  }
})
</script>
