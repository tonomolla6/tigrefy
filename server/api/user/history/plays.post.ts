import { useDB, userPlayHistory } from '~/server/db'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const body = await readBody(event)

  const { songId } = body

  if (!songId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'songId es requerido'
    })
  }

  const db = useDB()

  // Registrar reproducción
  await db.insert(userPlayHistory).values({
    userId,
    songId
  })

  return {
    success: true
  }
})
