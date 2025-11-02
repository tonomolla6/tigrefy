export interface Song {
  id: string
  title: string
  artistId: string
  artistName: string
  albumId: string
  albumName: string
  duration: number
  cover: string
  audioUrl: string
  lyrics?: string
  plays: number
  releaseDate: string
}

export interface Album {
  id: string
  title: string
  artistId: string
  artistName: string
  cover: string
  releaseDate: string
  totalTracks: number
  duration: number
  genres: string[]
}

export interface Artist {
  id: string
  name: string
  image: string
  followers: number
  genres: string[]
  bio: string
}

export interface Playlist {
  id: string
  name: string
  description: string
  cover: string
  songIds: string[]
  public: boolean
  collaborative: boolean
  createdAt: string
  isUserCreated?: boolean
}

export interface UserPlaylist extends Playlist {
  isUserCreated: true
}

export interface AppData {
  artists: Artist[]
  albums: Album[]
  songs: Song[]
  playlists: Playlist[]
}
