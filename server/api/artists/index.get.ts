import { useDB, artists } from '~/server/db'
import { mapArtistResponse } from '~/server/utils/mappers'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDB()

  const result = await db.select().from(artists).orderBy(asc(artists.name))

  // En la lista no resolvemos géneros agregados (caro y no se muestra en cards).
  return result.map(artist => mapArtistResponse(artist))
})
