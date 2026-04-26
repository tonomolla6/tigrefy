import { useDB, artists, parseJsonField } from '~/server/db'
import { requireParam } from '~/server/utils/params'
import { mapSongResponse } from '~/server/utils/mappers'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = requireParam(event, 'id', 'ID de artista')
  const db = useDB()

  const result = await db.query.artists.findFirst({
    where: eq(artists.id, id),
    with: {
      albums: true,
      songs: {
        with: {
          album: true
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

  return {
    id: result.id,
    name: result.name,
    image: result.image,
    followers: result.followers,
    genres: parseJsonField<string>(result.genres),
    bio: result.bio,
    albums: result.albums.map(album => ({
      id: album.id,
      title: album.title,
      artistId: result.id,
      artistName: result.name,
      cover: album.cover,
      releaseDate: album.releaseDate,
      totalTracks: album.totalTracks,
      duration: album.duration,
      genres: parseJsonField<string>(album.genres),
      isPublic: album.isPublic
    })),
    songs: result.songs.map(song =>
      // El artista ya lo conocemos (es result), pero el mapper espera el shape
      // {artist: {name}}, así que lo inyectamos para reutilizarlo.
      mapSongResponse({ ...song, artist: { name: result.name } })
    )
  }
})
