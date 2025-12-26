// Flag para saber si ya se inicializaron las preferencias
let layoutPreferencesInitialized = false

export const useSidebarResize = () => {
  const { layoutPreferences, updateLayoutPreferences, initPreferences } = useUserPreferences()

  // Inicializar preferencias una sola vez
  if (!layoutPreferencesInitialized && typeof window !== 'undefined') {
    initPreferences()
    layoutPreferencesInitialized = true
  }

  // Estado del sidebar izquierdo (biblioteca) - cargar desde preferencias
  const leftSidebarWidth = useState('leftSidebarWidth', () => layoutPreferences.value.leftSidebarWidth)
  const leftSidebarCollapsed = useState('leftSidebarCollapsed', () => layoutPreferences.value.leftSidebarCollapsed)

  // Estado del sidebar derecho (cola/now playing)
  const rightSidebarWidth = useState('rightSidebarWidth', () => layoutPreferences.value.rightSidebarWidth)

  // Límites
  const LEFT_COLLAPSED = 80 // Mínimo colapsado (solo iconos)
  const LEFT_MIN = 280 // Mínimo normal (con texto visible)
  const LEFT_MAX = 420

  const RIGHT_MIN = 280
  const RIGHT_MAX = 420

  // Acumulador para detectar intención de colapsar/expandir
  const collapseAccumulator = useState('collapseAccumulator', () => 0)

  // Toggle colapsar sidebar izquierdo (alterna entre mínimo y tamaño normal)
  const toggleLeftSidebar = () => {
    leftSidebarCollapsed.value = !leftSidebarCollapsed.value
    if (leftSidebarCollapsed.value) {
      leftSidebarWidth.value = LEFT_COLLAPSED
    } else {
      leftSidebarWidth.value = 340
    }
    collapseAccumulator.value = 0
    // Persistir preferencias
    updateLayoutPreferences({
      leftSidebarCollapsed: leftSidebarCollapsed.value,
      leftSidebarWidth: leftSidebarWidth.value
    })
  }

  // Resize del sidebar izquierdo - con dos estados
  const resizeLeftSidebar = (delta: number) => {
    if (leftSidebarCollapsed.value) {
      // Si está colapsado, acumular movimiento hacia la derecha para expandir
      if (delta > 0) {
        collapseAccumulator.value += delta
        // Expandir cuando haya arrastrado suficiente
        if (collapseAccumulator.value > 30) {
          leftSidebarCollapsed.value = false
          leftSidebarWidth.value = LEFT_MIN
          collapseAccumulator.value = 0
          // Persistir preferencias
          updateLayoutPreferences({
            leftSidebarCollapsed: false,
            leftSidebarWidth: LEFT_MIN
          })
        }
      }
    } else {
      // Si está expandido
      const newWidth = leftSidebarWidth.value + delta

      if (newWidth < LEFT_MIN) {
        // Si intenta ir por debajo del mínimo, acumular para colapsar
        collapseAccumulator.value += Math.abs(delta)
        // Colapsar cuando haya arrastrado suficiente más allá del mínimo
        if (collapseAccumulator.value > 30) {
          leftSidebarCollapsed.value = true
          leftSidebarWidth.value = LEFT_COLLAPSED
          collapseAccumulator.value = 0
          // Persistir preferencias
          updateLayoutPreferences({
            leftSidebarCollapsed: true,
            leftSidebarWidth: LEFT_COLLAPSED
          })
        }
      } else {
        // Resize normal entre LEFT_MIN y LEFT_MAX
        leftSidebarWidth.value = Math.min(LEFT_MAX, newWidth)
        collapseAccumulator.value = 0
      }
    }
  }

  // Guardar ancho del sidebar izquierdo al terminar el drag
  const saveLeftSidebarWidth = () => {
    if (!leftSidebarCollapsed.value) {
      updateLayoutPreferences({ leftSidebarWidth: leftSidebarWidth.value })
    }
  }

  // Reset del acumulador cuando termina el drag
  const resetCollapseThreshold = () => {
    collapseAccumulator.value = 0
    // Guardar el ancho actual al terminar el drag
    saveLeftSidebarWidth()
  }

  // Resize del sidebar derecho
  const resizeRightSidebar = (delta: number) => {
    const newWidth = rightSidebarWidth.value - delta // Invertido porque arrastramos desde la izquierda
    rightSidebarWidth.value = Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, newWidth))
  }

  // Guardar ancho del sidebar derecho al terminar el drag
  const saveRightSidebarWidth = () => {
    updateLayoutPreferences({ rightSidebarWidth: rightSidebarWidth.value })
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
    resetCollapseThreshold,
    saveRightSidebarWidth,

    // Constantes
    LEFT_COLLAPSED,
    LEFT_MIN,
    LEFT_MAX,
    RIGHT_MIN,
    RIGHT_MAX
  }
}
