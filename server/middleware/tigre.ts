import { getAuthUser, canManageContent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // Solo aplicar a rutas /api/admin/*
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/admin')) {
    return
  }

  const user = await getAuthUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No autorizado. Debes iniciar sesión.'
    })
  }

  if (!canManageContent(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado. Se requiere rol tigre.'
    })
  }

  // Guardar usuario en contexto para uso posterior
  event.context.auth = user
})
