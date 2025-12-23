import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useSongsStore, type Song } from './songs'
import { useAlbumsStore, type Album } from './albums'
import { useArtistsStore, type Artist } from './artists'
import { usePlaylistsStore, type Playlist } from './playlists'

export interface SearchResults {
  songs: Song[]
  albums: Album[]
  artists: Artist[]
  playlists: Playlist[]
}

export interface AdvancedFilters {
  genres?: string[]
  yearFrom?: number
  yearTo?: number
  durationRange?: 'short' | 'medium' | 'long'
}

export const useDataStore = defineStore('data', () => {
  const songsStore = useSongsStore()
  const albumsStore = useAlbumsStore()
  const artistsStore = useArtistsStore()
  const playlistsStore = usePlaylistsStore()

  // ====================
  // UNIFIED STATE
  // ====================
  const isLoading = computed(() =>
    songsStore.isLoading || albumsStore.isLoading ||
    artistsStore.isLoading || playlistsStore.isLoading
  )

  const isLoaded = computed(() =>
    songsStore.isLoaded && albumsStore.isLoaded &&
    artistsStore.isLoaded && playlistsStore.isLoaded
  )

  // Acceso directo a los datos
  const songs = computed(() => songsStore.songs)
  const albums = computed(() => albumsStore.albums)
  const artists = computed(() => artistsStore.artists)
  const playlists = computed(() => playlistsStore.playlists)

  // ====================
  // ACTIONS
  // ====================
  async function loadAllData(forceReload = false) {
    await Promise.all([
      songsStore.loadSongs(forceReload),
      albumsStore.loadAlbums(forceReload),
      artistsStore.loadArtists(forceReload),
      playlistsStore.loadPlaylists(forceReload)
    ])
  }

  // ====================
  // SEARCH FUNCTIONS
  // ====================
  function searchAll(query: string): SearchResults {
    const lowerQuery = query.toLowerCase()

    return {
      songs: songsStore.songs.filter(song => {
        const matchTitle = song.title.toLowerCase().includes(lowerQuery)
        const matchArtist = song.artistName.toLowerCase().includes(lowerQuery)
        const matchAlbum = song.albumName?.toLowerCase().includes(lowerQuery)
        const matchLyrics = song.lyrics?.toLowerCase().includes(lowerQuery)
        return matchTitle || matchArtist || matchAlbum || matchLyrics
      }),
      albums: albumsStore.albums.filter(album => {
        const matchTitle = album.title.toLowerCase().includes(lowerQuery)
        const matchArtist = album.artistName.toLowerCase().includes(lowerQuery)
        const matchGenres = album.genres?.some(genre =>
          genre.toLowerCase().includes(lowerQuery)
        )
        return matchTitle || matchArtist || matchGenres
      }),
      artists: artistsStore.artists.filter(artist => {
        const matchName = artist.name.toLowerCase().includes(lowerQuery)
        const matchGenres = artist.genres?.some(genre =>
          genre.toLowerCase().includes(lowerQuery)
        )
        return matchName || matchGenres
      }),
      playlists: playlistsStore.playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(lowerQuery)
      )
    }
  }

  function searchByGenre(genre: string): SearchResults {
    const lowerGenre = genre.toLowerCase()

    const matchingArtists = artistsStore.artists.filter(artist =>
      artist.genres?.some(g => g.toLowerCase() === lowerGenre)
    )

    const matchingAlbums = albumsStore.albums.filter(album =>
      album.genres?.some(g => g.toLowerCase() === lowerGenre)
    )

    const matchingSongs = songsStore.songs.filter(song => {
      const album = albumsStore.getAlbumById(song.albumId || '')
      if (album?.genres?.length) {
        return album.genres.some(g => g.toLowerCase() === lowerGenre)
      }
      const artist = artistsStore.getArtistById(song.artistId)
      return artist?.genres?.some(g => g.toLowerCase() === lowerGenre)
    })

    return {
      songs: matchingSongs,
      albums: matchingAlbums,
      artists: matchingArtists,
      playlists: []
    }
  }

  function applyAdvancedFilters(results: SearchResults, filters: AdvancedFilters): SearchResults {
    let filteredResults = { ...results }

    if (filters.genres && filters.genres.length > 0) {
      const lowerGenres = filters.genres.map(g => g.toLowerCase())

      filteredResults.songs = results.songs.filter(song => {
        const album = albumsStore.getAlbumById(song.albumId || '')
        const artist = artistsStore.getArtistById(song.artistId)
        const songGenres = [
          ...(album?.genres || []),
          ...(artist?.genres || [])
        ].map(g => g.toLowerCase())
        return lowerGenres.some(fg => songGenres.includes(fg))
      })

      filteredResults.albums = results.albums.filter(album =>
        album.genres?.some(g => lowerGenres.includes(g.toLowerCase()))
      )

      filteredResults.artists = results.artists.filter(artist =>
        artist.genres?.some(g => lowerGenres.includes(g.toLowerCase()))
      )
    }

    if (filters.yearFrom || filters.yearTo) {
      const filterByYear = (item: { releaseDate?: string | null }) => {
        if (!item.releaseDate) return false
        const year = new Date(item.releaseDate).getFullYear()
        if (filters.yearFrom && year < filters.yearFrom) return false
        if (filters.yearTo && year > filters.yearTo) return false
        return true
      }

      filteredResults.songs = filteredResults.songs.filter(filterByYear)
      filteredResults.albums = filteredResults.albums.filter(filterByYear)
    }

    if (filters.durationRange) {
      filteredResults.songs = filteredResults.songs.filter(song => {
        const durationInMinutes = song.duration / 60
        switch (filters.durationRange) {
          case 'short':
            return durationInMinutes < 3
          case 'medium':
            return durationInMinutes >= 3 && durationInMinutes <= 5
          case 'long':
            return durationInMinutes > 5
          default:
            return true
        }
      })
    }

    return filteredResults
  }

  function $reset() {
    songsStore.$reset()
    albumsStore.$reset()
    artistsStore.$reset()
    playlistsStore.$reset()
  }

  // ====================
  // EXPORT
  // ====================
  return {
    // state
    isLoading,
    isLoaded,

    // direct access to data
    songs,
    albums,
    artists,
    playlists,

    // actions
    loadAllData,
    searchAll,
    searchByGenre,
    applyAdvancedFilters,

    // delegate to sub-stores
    getSongById: (id: string) => songsStore.getSongById(id),
    getAlbumById: (id: string) => albumsStore.getAlbumById(id),
    getArtistById: (id: string) => artistsStore.getArtistById(id),
    getPlaylistById: (id: string) => playlistsStore.getPlaylistById(id),
    getSongsByAlbumId: (albumId: string) => songsStore.getSongsByAlbumId(albumId),
    getSongsByArtistId: (artistId: string) => songsStore.getSongsByArtistId(artistId),
    getAlbumsByArtistId: (artistId: string) => albumsStore.getAlbumsByArtistId(artistId),
    getSongsByIds: (ids: string[]) => songsStore.getSongsByIds(ids),
    updateSongPlays: (songId: string, newPlays: number) => songsStore.updateSongPlays(songId, newPlays),

    $reset
  }
})
