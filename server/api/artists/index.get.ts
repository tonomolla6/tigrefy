import { useDB, artists, parseJsonField } from '~/server/db'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDB()

  const result = await db.select().from(artists).orderBy(asc(artists.name))

  return result.map(artist => ({
    id: artist.id,
    name: artist.name,
    image: artist.image,
    followers: artist.followers,
    genres: parseJsonField<string>(artist.genres),
    bio: artist.bio
  }))
})
