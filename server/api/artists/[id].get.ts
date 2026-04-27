import { useDB, artists } from '~/server/db'
import { requireParam } from '~/server/utils/params'
import { mapSongResponse, mapAlbumResponse } from '~/server/utils/mappers'
import { getArtistGenres, getAlbumsGenresMap } from '~/server/utils/genres'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = requireParam(event, 'id', 'ID de artista')
  const db = useDB()

  const result = await db.query.artists.findFirst({
    where: eq(artists.id, id),
    with: {
      albums: { with: { artist: true } },
      songs: {
        with: {
          album: true,
          genres: { with: { genre: true } }
        }
      }
    }
  })

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Artista no encontrado'
    })
  }

  const [artistGenres, albumGenresMap] = await Promise.all([
    getArtistGenres(result.id),
    getAlbumsGenresMap(result.albums.map(a => a.id))
  ])

  return {
    id: result.id,
    name: result.name,
    image: result.image,
    followers: result.followers,
    genres: artistGenres,
    bio: result.bio,
    albums: result.albums.map(album => mapAlbumResponse(album, {
      genres: albumGenresMap.get(album.id) ?? []
    })),
    songs: result.songs.map(song =>
      mapSongResponse({ ...song, artist: { name: result.name } })
    )
  }
})
