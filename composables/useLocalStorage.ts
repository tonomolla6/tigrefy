/**
 * Estado reactivo respaldado en localStorage.
 *
 * - Hidrata desde localStorage en el cliente; en SSR devuelve el default.
 * - Cualquier cambio se persiste automáticamente.
 * - Si el JSON guardado está corrupto, vuelve al default y limpia.
 *
 * Para casos sencillos como historiales o preferencias planas. Para algo más
 * complejo (defaults profundos, partial updates por sección), implementar
 * un composable dedicado (ver useUserPreferences).
 *
 * @example
 *   const recent = useLocalStorage<string[]>('recent_searches', [])
 *   recent.value.push('rock')   // se persiste solo
 */
import { useState, watch } from '#imports'
import type { Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  // useState garantiza una sola instancia entre componentes que comparten la key
  const state = useState<T>(`ls:${key}`, () => defaultValue)

  if (typeof window !== 'undefined') {
    // Hidratar una sola vez con lo que haya en localStorage
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        state.value = JSON.parse(raw) as T
      }
    } catch (err) {
      console.warn(`[useLocalStorage] valor corrupto en "${key}", reseteando`, err)
      window.localStorage.removeItem(key)
    }

    // Persistir cualquier cambio posterior
    watch(state, (value) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (err) {
        console.warn(`[useLocalStorage] no se pudo guardar "${key}"`, err)
      }
    }, { deep: true })
  }

  return state
}
