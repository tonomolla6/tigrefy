export const useSidebarResize = () => {
  // Estado del sidebar izquierdo (biblioteca)
  const leftSidebarWidth = useState('leftSidebarWidth', () => 340)
  const leftSidebarCollapsed = useState('leftSidebarCollapsed', () => false)

  // Estado del sidebar derecho (cola/now playing)
  const rightSidebarWidth = useState('rightSidebarWidth', () => 380)

  // Límites
  const LEFT_MIN = 80 // Mínimo con solo portadas
  const LEFT_MAX = 420

  const RIGHT_MIN = 280
  const RIGHT_MAX = 420

  // Toggle colapsar sidebar izquierdo (alterna entre mínimo y tamaño normal)
  const toggleLeftSidebar = () => {
    leftSidebarCollapsed.value = !leftSidebarCollapsed.value
    if (leftSidebarCollapsed.value) {
      leftSidebarWidth.value = LEFT_MIN
    } else {
      leftSidebarWidth.value = 340
    }
  }

  // Resize del sidebar izquierdo - continuo y suave
  const resizeLeftSidebar = (delta: number) => {
    const newWidth = leftSidebarWidth.value + delta

    // Limitar entre min y max, sin colapsar automáticamente
    const clampedWidth = Math.min(LEFT_MAX, Math.max(LEFT_MIN, newWidth))
    leftSidebarWidth.value = clampedWidth

    // Actualizar estado de colapsado basado en el ancho
    leftSidebarCollapsed.value = clampedWidth <= LEFT_MIN + 20
  }

  // Resize del sidebar derecho
  const resizeRightSidebar = (delta: number) => {
    const newWidth = rightSidebarWidth.value - delta // Invertido porque arrastramos desde la izquierda
    rightSidebarWidth.value = Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, newWidth))
  }

  return {
    // Estado
    leftSidebarWidth,
    leftSidebarCollapsed,
    rightSidebarWidth,

    // Acciones
    toggleLeftSidebar,
    resizeLeftSidebar,
    resizeRightSidebar,

    // Constantes
    LEFT_MIN,
    LEFT_MAX,
    RIGHT_MIN,
    RIGHT_MAX
  }
}
