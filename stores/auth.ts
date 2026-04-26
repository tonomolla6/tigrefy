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
  async function initAuth() {
    isLoading.value = true
    authError.value = null

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
    }
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
