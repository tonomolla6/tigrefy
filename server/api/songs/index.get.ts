import { useDB, songs, artists, albums } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const authUser = await getAuthUser(event)

  // Si es tigre o user, mostrar todas las canciones
  // Si es guest o no autenticado, solo públicas
  const showAll = canSeeAllContent(authUser?.role)

  const result = await db.query.songs.findMany({
    where: showAll ? undefined : eq(songs.isPublic, true),
    with: {
      artist: true,
      album: true
    },
    orderBy: (songs, { desc }) => [desc(songs.plays)]
  })

  return result.map(song => ({
    id: song.id,
    title: song.title,
    artistId: song.artistId,
    artistName: song.artist.name,
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
})
