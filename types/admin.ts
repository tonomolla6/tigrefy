/**
 * Tipos compartidos por el panel de administración (/admin) y sus tabs.
 * Las formas reflejan exactamente lo que devuelven los endpoints /api/admin/*.
 */
export interface Artist {
  id: string
  name: string
  image: string | null
  bio?: string | null
}

export interface Album {
  id: string
  title: string
  artistId: string
  artistName: string
  cover: string | null
  totalTracks: number
  isPublic: boolean
  releaseDate?: string | null
}

export interface Playlist {
  id: string
  name: string
  description: string | null
  cover: string | null
  ownerId: string | null
  ownerName: string
  isPublic: boolean
  songCount: number
}

export interface AdminUser {
  id: string
  username: string
  displayName: string
  role: 'tigre' | 'user' | 'guest'
  createdAt?: string
  lastLoginAt?: string
}

export interface Stats {
  totalSongs: number
  publicSongs: number
  privateSongs: number
  totalAlbums: number
  publicAlbums: number
  privateAlbums: number
}

/**
 * Filtro de visibilidad usado en las pestañas de canciones, álbumes y playlists.
 */
export type VisibilityFilter = 'all' | 'public' | 'private'

/**
 * Interfaz que exponen los <FileUpload> via `defineExpose` — permite al padre
 * disparar la subida pendiente y comprobar si hay archivo encolado.
 */
export interface FileUploadHandle {
  uploadPendingFile: (id?: string) => Promise<string | null>
  hasPendingFile: () => boolean
  lastUploadResponse?: () => { duration?: number } | undefined
}
