import { useDB, genres, songs, songGenres, albums } from '~/server/db'
import { getAuthUser, canSeeAllContent } from '~/server/utils/auth'
import { sql, eq } from 'drizzle-orm'

/**
 * Lista todos los géneros con su conteo de canciones (filtrado por
 * visibilidad) y un cover representativo (la portada del primer álbum
 * visible del género, para decorar las cards en /search y /genres).
 *
 * Para no-tigres, el conteo y el coverHint solo consideran contenido público.
 */
export default defineEventHandler(async (event) => {
  const db = useDB()
  const authUser = await getAuthUser(event)
  const showAll = canSeeAllContent(authUser?.role)

  const rows = await db
    .select({
      id: genres.id,
      name: genres.name,
      songCount: sql<number>`COUNT(DISTINCT CASE WHEN ${
        showAll ? sql`1=1` : eq(songs.isPublic, true)
      } THEN ${songs.id} END)`,
      // Subquery: cover de un álbum del género (visible si no-tigre).
      // ORDER BY RANDOM() para que la portada cambie en cada carga.
      coverHint: sql<string | null>`(
        SELECT a.cover
        FROM songs s2
        INNER JOIN song_genres sg2 ON sg2.song_id = s2.id
        INNER JOIN albums a ON a.id = s2.album_id
        WHERE sg2.genre_id = ${genres.id}
          AND a.cover IS NOT NULL
          ${showAll ? sql`` : sql`AND a.is_public = 1`}
        ORDER BY RANDOM()
        LIMIT 1
      )`
    })
    .from(genres)
    .leftJoin(songGenres, eq(songGenres.genreId, genres.id))
    .leftJoin(songs, eq(songs.id, songGenres.songId))
    .groupBy(genres.id, genres.name)
    .orderBy(genres.name)

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    songCount: Number(r.songCount ?? 0),
    coverHint: r.coverHint ?? null,
  }))
})
