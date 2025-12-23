import { useAuthStore } from '~/stores/auth'
import { useFavoritesStore } from '~/stores/favorites'
import { useUserStore } from '~/stores/user'
import { useDataStore } from '~/stores/data'

export const useAuth = () => {
  const store = useAuthStore()
  const favoritesStore = useFavoritesStore()
  const userStore = useUserStore()
  const dataStore = useDataStore()
  const { stopAndReset: stopPlayer } = usePlayer()
  const router = useRouter()

  const login = async (username: string, password: string) => {
    const success = await store.login(username, password)
    if (success) {
      // Recargar datos con el nuevo usuario (filtrado por rol)
      await dataStore.loadAllData(true)
      favoritesStore.loadFavorites()
      userStore.loadPlaylists()

      // Si estamos en una página protegida y no tenemos permiso, redirigir
      const route = useRoute()
      if (route.path === '/admin') {
        const newUser = store.user
        if (!newUser || newUser.role !== 'tigre') {
          await router.push('/')
        }
      }
    }
    return success
  }

  const logout = async () => {
    // Detener la música y limpiar el reproductor
    stopPlayer()

    // Guardar la ruta actual antes del logout
    const route = useRoute()
    const currentPath = route.path

    await store.logout()
    // Resetear favoritos y playlists del usuario
    favoritesStore.$reset()
    userStore.playlists = []
    // Recargar datos públicos
    await dataStore.loadAllData(true)

    // Si estamos en una página protegida, redirigir a home
    if (currentPath === '/admin') {
      await router.push('/')
    }
  }

  return {
    // Estado
    user: computed(() => store.user),
    isAuthenticated: computed(() => store.isAuthenticated),
    isLoading: computed(() => store.isLoading),
    authError: computed(() => store.authError),

    // Roles
    isTigre: computed(() => store.isTigre),
    isUser: computed(() => store.isUser),
    isGuest: computed(() => store.isGuest),
    isAdmin: computed(() => store.isAdmin),

    // Permisos
    canSeeAll: computed(() => store.canSeeAll),
    canManage: computed(() => store.canManage),

    // Métodos
    initAuth: () => store.initAuth(),
    checkAuth: () => store.initAuth(),
    login,
    register: (username: string, password: string, masterKey: string, displayName?: string, role?: 'tigre' | 'user' | 'guest') =>
      store.register(username, password, masterKey, displayName, role),
    logout,

    // Legacy
    getAuthHeaders: () => ({})
  }
}
