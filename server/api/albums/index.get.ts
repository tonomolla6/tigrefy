import { useDB, albums } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { mapAlbumResponse } from '~/server/utils/mappers'
import { getAlbumsGenresMap } from '~/server/utils/genres'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const authUser = await getAuthUser(event)
  const showAll = canSeeAllContent(authUser?.role)

  const result = await db.query.albums.findMany({
    where: showAll ? undefined : eq(albums.isPublic, true),
    with: {
      artist: true
    },
    orderBy: (albums, { desc }) => [desc(albums.releaseDate)]
  })

  const genresMap = await getAlbumsGenresMap(result.map(a => a.id))

  return result.map(album => mapAlbumResponse(album, {
    genres: genresMap.get(album.id) ?? []
  }))
})
