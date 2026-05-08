/**
 * Para páginas con vista pública (landing) y vista privada (home con datos
 * del usuario): si había una sesión activa pero ya no es válida, redirige
 * a /login para que el usuario re-autentique en lugar de aterrizar en la
 * landing de marketing como si fuera la primera vez.
 *
 * Distingue por la cookie no-httpOnly `tigrefy_auth` que se setea a '1'
 * tras un /me exitoso y se limpia cuando /me devuelve 401. La leemos
 * ANTES de awaitar initAuth porque el catch de initAuth la borra.
 */
export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, isLoading, initAuth } = useAuth()

  const hadSession = useCookie('tigrefy_auth').value === '1'

  if (isLoading.value) {
    await initAuth()
  }

  if (!isAuthenticated.value && hadSession) {
    return navigateTo('/login')
  }
})
