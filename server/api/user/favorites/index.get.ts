import { useDB, userFavorites } from '~/server/db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId

  const db = useDB()

  const result = await db
    .select({ itemType: userFavorites.itemType, itemId: userFavorites.itemId })
    .from(userFavorites)
    .where(eq(userFavorites.userId, userId))
    .orderBy(desc(userFavorites.createdAt))

  // Agrupar por tipo (singular en BD → plural en respuesta)
  const favorites = {
    songs: [] as string[],
    albums: [] as string[],
    artists: [] as string[],
    playlists: [] as string[]
  }

  const typeMap: Record<string, keyof typeof favorites> = {
    song: 'songs',
    album: 'albums',
    artist: 'artists',
    playlist: 'playlists'
  }

  for (const row of result) {
    const pluralType = typeMap[row.itemType]
    if (pluralType && favorites[pluralType]) {
      favorites[pluralType].push(row.itemId)
    }
  }

  return favorites
})
