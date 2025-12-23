// Composable para recordar y restaurar la posición del scroll al navegar
const scrollPositions = new Map<string, number>()
let isPopstateNavigation = false

export const useScrollRestore = () => {
  const router = useRouter()

  // Guardar posición antes de navegar
  const init = () => {
    if (typeof window === 'undefined') return

    // Detectar navegación con botones del navegador (popstate)
    window.addEventListener('popstate', () => {
      isPopstateNavigation = true

      // La ruta ya cambió en el history
      const targetPath = window.location.pathname + window.location.search + window.location.hash
      const savedPosition = scrollPositions.get(targetPath)

      if (savedPosition !== undefined && savedPosition > 0) {
        // Ocultar contenido momentáneamente para evitar ver el scroll
        const main = document.querySelector('main')
        if (main) {
          main.style.visibility = 'hidden'
        }

        // Restaurar scroll después de que Vue actualice la ruta
        setTimeout(() => {
          const scrollContainer = document.querySelector('main') || document.documentElement
          scrollContainer.scrollTop = savedPosition

          // Mostrar contenido después de posicionar
          requestAnimationFrame(() => {
            if (main) {
              main.style.visibility = ''
            }
            isPopstateNavigation = false
          })
        }, 20)
      } else {
        isPopstateNavigation = false
      }
    })

    // Guardar posición antes de cualquier navegación
    router.beforeEach((to, from) => {
      const scrollContainer = document.querySelector('main') || document.documentElement
      scrollPositions.set(from.fullPath, scrollContainer.scrollTop)
    })

    // Resetear scroll a 0 en navegación normal (no popstate)
    router.afterEach(() => {
      if (!isPopstateNavigation) {
        // Es navegación normal (click en link), resetear scroll
        nextTick(() => {
          const scrollContainer = document.querySelector('main') || document.documentElement
          scrollContainer.scrollTop = 0
        })
      }
    })
  }

  return {
    init
  }
}
