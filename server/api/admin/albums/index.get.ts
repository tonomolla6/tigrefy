import { useDB } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireTigre(event)

  const db = useDB()

  const allAlbums = await db.query.albums.findMany({
    with: {
      artist: true
    },
    orderBy: (albums, { desc }) => [desc(albums.releaseDate)]
  })

  return allAlbums.map(album => ({
    id: album.id,
    title: album.title,
    artistId: album.artistId,
    artistName: album.artist.name,
    cover: album.cover,
    releaseDate: album.releaseDate,
    totalTracks: album.totalTracks,
    isPublic: album.isPublic
  }))
})
