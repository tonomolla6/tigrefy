import { useDB } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireTigre(event)

  const db = useDB()

  const allArtists = await db.query.artists.findMany({
    orderBy: (artists, { asc }) => [asc(artists.name)]
  })

  return allArtists.map(artist => ({
    id: artist.id,
    name: artist.name,
    image: artist.image
  }))
})
