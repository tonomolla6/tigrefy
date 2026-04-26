/**
 * Forma canónica de una canción tal como vive en el cliente
 * (devuelta por /api/songs, /api/albums/[id], etc).
 *
 * Para tipos del panel de administración (Artist, Album, Playlist,
 * AdminUser, Stats) ver `~/types/admin.ts`.
 */
export interface Song {
  id: string
  title: string
  artistId: string
  artistName: string
  albumId: string | null
  albumName: string | null
  trackNumber: number | null
  duration: number
  cover: string | null
  lyrics: string | null
  plays: number
  releaseDate: string | null
  isPublic: boolean
}

/**
 * Vista reducida que devuelve /api/admin/content (sin lyrics, plays, etc).
 * El admin solo necesita identificar la canción y mostrar su orden / portada.
 */
export type AdminSong = Pick<
  Song,
  'id' | 'title' | 'artistId' | 'artistName' | 'albumId' | 'albumName' | 'trackNumber' | 'cover' | 'isPublic'
>
