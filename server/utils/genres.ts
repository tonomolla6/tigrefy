/**
 * Helpers para resolver géneros agregados en álbumes y artistas.
 *
 * En Tigrefy los géneros se almacenan a nivel de canción (`song_genres`).
 * Los géneros del álbum/artista se derivan agregando los géneros únicos de
 * sus canciones — no se almacenan duplicados.
 */
import { useDB } from '~/server/db'
import { sql } from 'drizzle-orm'
import type { GenreRef } from './mappers'

/** Géneros únicos de las canciones de UN álbum, ordenados por nombre. */
export async function getAlbumGenres(albumId: string): Promise<GenreRef[]> {
  const db = useDB()
  const result = await db.run(sql`
    SELECT DISTINCT g.id, g.name
    FROM genres g
    INNER JOIN song_genres sg ON sg.genre_id = g.id
    INNER JOIN songs s ON s.id = sg.song_id
    WHERE s.album_id = ${albumId}
    ORDER BY g.name
  `)
  return (result.rows as Array<{ id: number; name: string }>).map(r => ({
    id: Number(r.id),
    name: String(r.name),
  }))
}

/** Géneros únicos por álbum para una lista de albumIds. Map albumId → GenreRef[]. */
export async function getAlbumsGenresMap(albumIds: string[]): Promise<Map<string, GenreRef[]>> {
  const map = new Map<string, GenreRef[]>()
  if (albumIds.length === 0) return map

  const db = useDB()
  const result = await db.run(sql`
    SELECT DISTINCT s.album_id as albumId, g.id as genreId, g.name as genreName
    FROM songs s
    INNER JOIN song_genres sg ON sg.song_id = s.id
    INNER JOIN genres g ON g.id = sg.genre_id
    WHERE s.album_id IN (${sql.join(albumIds.map(id => sql`${id}`), sql`, `)})
    ORDER BY g.name
  `)

  for (const row of result.rows as Array<{ albumId: string; genreId: number; genreName: string }>) {
    const list = map.get(row.albumId) ?? []
    list.push({ id: Number(row.genreId), name: String(row.genreName) })
    map.set(row.albumId, list)
  }
  return map
}

/** Géneros únicos de las canciones de UN artista, ordenados por nombre. */
export async function getArtistGenres(artistId: string): Promise<GenreRef[]> {
  const db = useDB()
  const result = await db.run(sql`
    SELECT DISTINCT g.id, g.name
    FROM genres g
    INNER JOIN song_genres sg ON sg.genre_id = g.id
    INNER JOIN songs s ON s.id = sg.song_id
    WHERE s.artist_id = ${artistId}
    ORDER BY g.name
  `)
  return (result.rows as Array<{ id: number; name: string }>).map(r => ({
    id: Number(r.id),
    name: String(r.name),
  }))
}
