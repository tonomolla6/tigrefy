/**
 * Mappers de DB row → respuesta API.
 *
 * Antes la misma transformación de song con artist+album estaba copiada en 5
 * endpoints (/songs, /songs/[id], /albums/[id], /artists/[id], /search).
 * Centralizado aquí para tener una única definición del shape canónico.
 */
import { parseJsonField } from '~/server/db'

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
}

export function mapSongResponse(song: SongWithRelations, overrides: SongOverrides = {}) {
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
  genres: string | null
  isPublic: boolean | null
  artist: { name: string }
}

export function mapAlbumResponse(album: AlbumWithArtist) {
  return {
    id: album.id,
    title: album.title,
    artistId: album.artistId,
    artistName: album.artist.name,
    cover: album.cover,
    releaseDate: album.releaseDate,
    totalTracks: album.totalTracks ?? 0,
    duration: album.duration ?? 0,
    genres: parseJsonField<string>(album.genres),
    isPublic: !!album.isPublic,
  }
}

interface ArtistRow {
  id: string
  name: string
  image: string | null
  followers: number | null
  genres: string | null
  bio: string | null
}

export function mapArtistResponse(artist: ArtistRow) {
  return {
    id: artist.id,
    name: artist.name,
    image: artist.image,
    followers: artist.followers ?? 0,
    genres: parseJsonField<string>(artist.genres),
    bio: artist.bio,
  }
}
