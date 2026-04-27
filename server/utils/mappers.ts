/**
 * Mappers de DB row → respuesta API.
 *
 * Antes la misma transformación de song con artist+album estaba copiada en 5
 * endpoints (/songs, /songs/[id], /albums/[id], /artists/[id], /search).
 * Centralizado aquí para tener una única definición del shape canónico.
 */

export interface GenreRef {
  id: number
  name: string
}

// Tipos relajados (la query con relations devuelve estructuras anidadas que no
// modela limpio el schema inferido de Drizzle, así que aceptamos lo necesario).
interface SongWithRelations {
  id: string
  title: string
  artistId: string
  albumId: string | null
  trackNumber: number | null
  duration: number | null
  lyrics: string | null
  plays: number | null
  isPublic: boolean | null
  artist: { name: string }
  album: { title: string; cover: string | null; releaseDate: string | null } | null
  // De la relation `song_genres → genre`. Opcional porque algunos endpoints
  // (admin/content) no lo cargan.
  genres?: Array<{ genre: GenreRef }>
}

/**
 * Overrides cuando el endpoint conoce los datos del álbum padre (p.ej. al
 * pedir un álbum y mapear sus canciones, no hace falta resolverlos otra vez).
 */
interface SongOverrides {
  albumId?: string | null
  albumName?: string | null
  cover?: string | null
  releaseDate?: string | null
  /** Para sobreescribir/inyectar géneros derivados (ej. desde el álbum padre). */
  genres?: GenreRef[]
}

export function mapSongResponse(song: SongWithRelations, overrides: SongOverrides = {}) {
  const genres: GenreRef[] = overrides.genres
    ?? (song.genres?.map(sg => sg.genre).filter(Boolean) ?? [])
  return {
    id: song.id,
    title: song.title,
    artistId: song.artistId,
    artistName: song.artist.name,
    albumId: overrides.albumId ?? song.albumId,
    albumName: overrides.albumName ?? song.album?.title ?? null,
    trackNumber: song.trackNumber,
    duration: song.duration ?? 0,
    cover: overrides.cover ?? song.album?.cover ?? null,
    lyrics: song.lyrics,
    plays: song.plays ?? 0,
    releaseDate: overrides.releaseDate ?? song.album?.releaseDate ?? null,
    isPublic: !!song.isPublic,
    genres,
  }
}

interface AlbumWithArtist {
  id: string
  title: string
  artistId: string
  cover: string | null
  releaseDate: string | null
  totalTracks: number | null
  duration: number | null
  isPublic: boolean | null
  artist: { name: string }
}

interface AlbumExtras {
  /** Géneros agregados de las canciones del álbum (calculados por el endpoint). */
  genres?: GenreRef[]
}

export function mapAlbumResponse(album: AlbumWithArtist, extras: AlbumExtras = {}) {
  return {
    id: album.id,
    title: album.title,
    artistId: album.artistId,
    artistName: album.artist.name,
    cover: album.cover,
    releaseDate: album.releaseDate,
    totalTracks: album.totalTracks ?? 0,
    duration: album.duration ?? 0,
    genres: extras.genres ?? [],
    isPublic: !!album.isPublic,
  }
}

interface ArtistRow {
  id: string
  name: string
  image: string | null
  followers: number | null
  bio: string | null
}

interface ArtistExtras {
  /** Géneros agregados de las canciones del artista (calculados por el endpoint). */
  genres?: GenreRef[]
}

export function mapArtistResponse(artist: ArtistRow, extras: ArtistExtras = {}) {
  return {
    id: artist.id,
    name: artist.name,
    image: artist.image,
    followers: artist.followers ?? 0,
    genres: extras.genres ?? [],
    bio: artist.bio,
  }
}
