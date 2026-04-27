import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useSongsStore, type Song } from './songs'
import { useAlbumsStore, type Album } from './albums'
import { useArtistsStore, type Artist } from './artists'
import { usePlaylistsStore, type Playlist } from './playlists'
import { useGenresStore } from './genres'

export interface SearchResults {
  songs: Song[]
  albums: Album[]
  artists: Artist[]
  playlists: Playlist[]
}

export interface AdvancedFilters {
  /** IDs de géneros canónicos a aplicar como filtro. */
  genreIds?: number[]
  yearFrom?: number
  yearTo?: number
  durationRange?: 'short' | 'medium' | 'long'
}

export const useDataStore = defineStore('data', () => {
  const songsStore = useSongsStore()
  const albumsStore = useAlbumsStore()
  const artistsStore = useArtistsStore()
  const playlistsStore = usePlaylistsStore()
  const genresStore = useGenresStore()

  const isLoading = computed(() =>
    songsStore.isLoading || albumsStore.isLoading ||
    artistsStore.isLoading || playlistsStore.isLoading || genresStore.isLoading
  )

  const isLoaded = computed(() =>
    songsStore.isLoaded && albumsStore.isLoaded &&
    artistsStore.isLoaded && playlistsStore.isLoaded && genresStore.isLoaded
  )

  const songs = computed(() => songsStore.songs)
  const albums = computed(() => albumsStore.albums)
  const artists = computed(() => artistsStore.artists)
  const playlists = computed(() => playlistsStore.playlists)
  const genres = computed(() => genresStore.genres)

  async function loadAllData(forceReload = false) {
    await Promise.all([
      songsStore.loadSongs(forceReload),
      albumsStore.loadAlbums(forceReload),
      artistsStore.loadArtists(forceReload),
      playlistsStore.loadPlaylists(forceReload),
      genresStore.loadGenres(forceReload),
    ])
  }

  function searchAll(query: string): SearchResults {
    const lowerQuery = query.toLowerCase()

    return {
      songs: songsStore.songs.filter(song => {
        const matchTitle = song.title.toLowerCase().includes(lowerQuery)
        const matchArtist = song.artistName.toLowerCase().includes(lowerQuery)
        const matchAlbum = song.albumName?.toLowerCase().includes(lowerQuery)
        const matchLyrics = song.lyrics?.toLowerCase().includes(lowerQuery)
        const matchGenre = song.genres?.some(g => g.name.toLowerCase().includes(lowerQuery))
        return matchTitle || matchArtist || matchAlbum || matchLyrics || matchGenre
      }),
      albums: albumsStore.albums.filter(album => {
        const matchTitle = album.title.toLowerCase().includes(lowerQuery)
        const matchArtist = album.artistName.toLowerCase().includes(lowerQuery)
        const matchGenres = album.genres?.some(g => g.name.toLowerCase().includes(lowerQuery))
        return matchTitle || matchArtist || matchGenres
      }),
      artists: artistsStore.artists.filter(artist => {
        const matchName = artist.name.toLowerCase().includes(lowerQuery)
        const matchGenres = artist.genres?.some(g => g.name.toLowerCase().includes(lowerQuery))
        return matchName || matchGenres
      }),
      playlists: playlistsStore.playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(lowerQuery)
      )
    }
  }

  /** Busca por id de género canónico (preciso) o nombre (case-insensitive). */
  function searchByGenre(genreIdOrName: number | string): SearchResults {
    const matchSong = (song: Song) => {
      if (typeof genreIdOrName === 'number') {
        return song.genres?.some(g => g.id === genreIdOrName)
      }
      const lower = genreIdOrName.toLowerCase()
      return song.genres?.some(g => g.name.toLowerCase() === lower)
    }

    const matchingSongs = songsStore.songs.filter(matchSong)
    const matchingAlbumIds = new Set(
      matchingSongs.map(s => s.albumId).filter((x): x is string => !!x)
    )
    const matchingArtistIds = new Set(matchingSongs.map(s => s.artistId))

    return {
      songs: matchingSongs,
      albums: albumsStore.albums.filter(a => matchingAlbumIds.has(a.id)),
      artists: artistsStore.artists.filter(a => matchingArtistIds.has(a.id)),
      playlists: []
    }
  }

  function applyAdvancedFilters(results: SearchResults, filters: AdvancedFilters): SearchResults {
    let filteredResults = { ...results }

    if (filters.genreIds && filters.genreIds.length > 0) {
      const idSet = new Set(filters.genreIds)

      filteredResults.songs = results.songs.filter(song =>
        song.genres?.some(g => idSet.has(g.id))
      )

      // Para álbumes y artistas filtramos por canciones que cumplan el género.
      const matchingAlbumIds = new Set(
        filteredResults.songs.map(s => s.albumId).filter((x): x is string => !!x)
      )
      const matchingArtistIds = new Set(filteredResults.songs.map(s => s.artistId))

      filteredResults.albums = results.albums.filter(a => matchingAlbumIds.has(a.id))
      filteredResults.artists = results.artists.filter(a => matchingArtistIds.has(a.id))
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
    genresStore.$reset()
  }

  return {
    isLoading,
    isLoaded,
    songs,
    albums,
    artists,
    playlists,
    genres,
    loadAllData,
    searchAll,
    searchByGenre,
    applyAdvancedFilters,
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
