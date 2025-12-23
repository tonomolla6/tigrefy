export default defineEventHandler(async (event) => {
  // Eliminar cookies
  deleteCookie(event, 'tigrefy_token', {
    path: '/'
  })
  deleteCookie(event, 'tigrefy_auth', {
    path: '/'
  })

  return {
    success: true,
    message: 'Sesión cerrada correctamente'
  }
})
