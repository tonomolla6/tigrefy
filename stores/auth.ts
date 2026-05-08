import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFavoritesStore } from './favorites'
import { useUserStore } from './user'

export interface User {
  id: string
  username: string
  displayName: string
  role: 'tigre' | 'user' | 'guest'
  createdAt?: string
}

export const useAuthStore = defineStore('auth', () => {
  // ====================
  // STATE
  // ====================
  const user = ref<User | null>(null)
  const isLoading = ref(true)
  const authError = ref<string | null>(null)

  // ====================
  // GETTERS (computed)
  // ====================
  const isAuthenticated = computed(() => !!user.value)
  const isTigre = computed(() => user.value?.role === 'tigre')
  const isUser = computed(() => user.value?.role === 'user')
  const isGuest = computed(() => user.value?.role === 'guest')

  const canSeeAll = computed(() =>
    ['tigre', 'user'].includes(user.value?.role ?? '')
  )

  const canManage = computed(() => user.value?.role === 'tigre')
  const isAdmin = computed(() => user.value?.role === 'tigre')

  // ====================
  // ACTIONS
  // ====================

  // initAuth es idempotente para toda la vida de la sesión. Múltiples
  // sitios pueden necesitar "esperar a que la auth esté lista" (app.vue,
  // layout default, middlewares) y ninguno debería disparar /me extra:
  //
  //  - inFlightInit: si hay una llamada en vuelo, las concurrentes
  //    esperan a esa misma promesa.
  //  - initialized: tras la primera resolución (éxito o fallo), las
  //    siguientes llamadas devuelven Promise.resolve() de inmediato.
  //
  // logout() resetea `initialized` para permitir un nuevo bootstrap en
  // la siguiente sesión sin recargar la página.
  let inFlightInit: Promise<void> | null = null
  let initialized = false

  function initAuth(): Promise<void> {
    if (inFlightInit) return inFlightInit
    if (initialized) return Promise.resolve()

    isLoading.value = true
    authError.value = null

    inFlightInit = (async () => {
      try {
        const response = await $fetch<User>('/api/auth/me', {
          credentials: 'include'
        })
        user.value = response

        const authCookie = useCookie('tigrefy_auth')
        authCookie.value = '1'
      } catch {
        user.value = null
        const authCookie = useCookie('tigrefy_auth')
        authCookie.value = null
      } finally {
        isLoading.value = false
        inFlightInit = null
        initialized = true
      }
    })()

    return inFlightInit
  }

  async function login(username: string, password: string): Promise<boolean> {
    authError.value = null

    try {
      const response = await $fetch<{
        success: boolean
        user: User
      }>('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      })

      if (response.success) {
        user.value = response.user
        return true
      }

      return false
    } catch (error: any) {
      authError.value =
        error.data?.statusMessage || 'Error al iniciar sesión'
      return false
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch {
      // ignorar
    } finally {
      user.value = null

      const authCookie = useCookie('tigrefy_auth')
      authCookie.value = null

      // Permitir que un futuro initAuth vuelva a hacer bootstrap (p. ej.
      // si el usuario hace login con otra cuenta sin recargar la página).
      initialized = false

      const favoritesStore = useFavoritesStore()
      const userStore = useUserStore()

      favoritesStore.$reset()
      userStore.$reset()
    }
  }

  // ====================
  // EXPORT
  // ====================
  return {
    // state
    user,
    isLoading,
    authError,

    // getters
    isAuthenticated,
    isTigre,
    isUser,
    isGuest,
    canSeeAll,
    canManage,
    isAdmin,

    // actions
    initAuth,
    login,
    logout
  }
})
