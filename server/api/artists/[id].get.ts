import { useDB, artists, parseJsonField } from '~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de artista requerido'
    })
  }

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
    songs: result.songs.map(song => ({
      id: song.id,
      title: song.title,
      artistId: result.id,
      artistName: result.name,
      albumId: song.albumId,
      albumName: song.album?.title || null,
      trackNumber: song.trackNumber,
      duration: song.duration,
      cover: song.album?.cover || null,
      audioUrl: song.audioUrl,
      lyrics: song.lyrics,
      plays: song.plays,
      releaseDate: song.album?.releaseDate || null,
      isPublic: song.isPublic
    }))
  }
})
