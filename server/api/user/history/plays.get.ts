import { useDB, userPlayHistory } from '~/server/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)

  const db = useDB()

  const result = await db.query.userPlayHistory.findMany({
    where: eq(userPlayHistory.userId, userId),
    with: {
      song: {
        with: {
          artist: true,
          album: true
        }
      }
    },
    orderBy: (history, { desc }) => [desc(history.playedAt)],
    limit
  })

  return result.map(row => ({
    id: row.songId,
    title: row.song.title,
    artistId: row.song.artistId,
    artistName: row.song.artist.name,
    albumId: row.song.albumId,
    albumName: row.song.album?.title || null,
    trackNumber: row.song.trackNumber,
    duration: row.song.duration,
    cover: row.song.album?.cover || null,
    audioUrl: row.song.audioUrl,
    plays: row.song.plays,
    playedAt: row.playedAt
  }))
})
