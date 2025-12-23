import { getAuthUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Solo proteger rutas /api/user/*
  if (!path.startsWith('/api/user')) {
    return
  }

  const user = await getAuthUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No autorizado. Debes iniciar sesión.'
    })
  }

  // Guardar usuario en el contexto del evento para uso posterior
  event.context.auth = user
})
