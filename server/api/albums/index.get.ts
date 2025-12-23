import { useDB, albums, parseJsonField } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const authUser = getAuthUser(event)

  // Si es tigre o user, mostrar todos los álbumes
  // Si es guest o no autenticado, solo públicos
  const showAll = canSeeAllContent(authUser?.role)

  const result = await db.query.albums.findMany({
    where: showAll ? undefined : eq(albums.isPublic, true),
    with: {
      artist: true
    },
    orderBy: (albums, { desc }) => [desc(albums.releaseDate)]
  })

  return result.map(album => ({
    id: album.id,
    title: album.title,
    artistId: album.artistId,
    artistName: album.artist.name,
    cover: album.cover,
    releaseDate: album.releaseDate,
    totalTracks: album.totalTracks,
    duration: album.duration,
    genres: parseJsonField<string>(album.genres),
    isPublic: album.isPublic
  }))
})
