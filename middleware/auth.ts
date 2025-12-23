export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, isLoading, initAuth } = useAuth()

  // Si está cargando, esperar a que termine la inicialización de auth
  if (isLoading.value) {
    await initAuth()
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
