export default defineNuxtRouteMiddleware(async (to, from) => {
  const { canManage, isAuthenticated, isLoading, initAuth } = useAuth()

  // Si está cargando, esperar a que termine la inicialización de auth
  if (isLoading.value) {
    await initAuth()
  }

  // Si no está autenticado o no es tigre, redirigir a home
  if (!isAuthenticated.value || !canManage.value) {
    return navigateTo('/')
  }
})
