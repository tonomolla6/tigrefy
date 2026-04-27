import { useDB, genres, songGenres } from '~/server/db'
import { requireTigre } from '~/server/utils/auth'
import { eq, sql } from 'drizzle-orm'

/** Lista todos los géneros con su conteo total de canciones (para el admin). */
export default defineEventHandler(async (event) => {
  await requireTigre(event)
  const db = useDB()

  const rows = await db
    .select({
      id: genres.id,
      name: genres.name,
      songCount: sql<number>`COUNT(${songGenres.songId})`
    })
    .from(genres)
    .leftJoin(songGenres, eq(songGenres.genreId, genres.id))
    .groupBy(genres.id, genres.name)
    .orderBy(genres.name)

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    songCount: Number(r.songCount ?? 0)
  }))
})
