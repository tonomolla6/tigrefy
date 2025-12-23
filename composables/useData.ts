import { useDataStore, type SearchResults, type AdvancedFilters } from '~/stores/data'
import { useSongsStore } from '~/stores/songs'
import { useAlbumsStore } from '~/stores/albums'
import { useArtistsStore } from '~/stores/artists'
import { usePlaylistsStore } from '~/stores/playlists'

export const useData = () => {
  const dataStore = useDataStore()
  const songsStore = useSongsStore()
  const albumsStore = useAlbumsStore()
  const artistsStore = useArtistsStore()
  const playlistsStore = usePlaylistsStore()

  // Backward compatibility: data object
  const data = computed(() => ({
    songs: songsStore.songs,
    albums: albumsStore.albums,
    artists: artistsStore.artists,
    playlists: playlistsStore.playlists
  }))

  const isLoaded = computed(() => dataStore.isLoaded)

  const loadData = async (forceReload = false) => {
    await dataStore.loadAllData(forceReload)
  }

  return {
    // Backward compat
    data,
    isLoaded,
    loadData,

    // Getter functions
    getSongById: (id: string) => songsStore.getSongById(id),
    getAlbumById: (id: string) => albumsStore.getAlbumById(id),
    getArtistById: (id: string) => artistsStore.getArtistById(id),
    getPlaylistById: (id: string) => playlistsStore.getPlaylistById(id),
    getSongsByAlbumId: (albumId: string) => songsStore.getSongsByAlbumId(albumId),
    getAlbumsByArtistId: (artistId: string) => albumsStore.getAlbumsByArtistId(artistId),
    getSongsByArtistId: (artistId: string) => songsStore.getSongsByArtistId(artistId),
    getSongsByIds: (ids: string[]) => songsStore.getSongsByIds(ids),

    // Search functions
    searchAll: (query: string) => dataStore.searchAll(query),
    searchByGenre: (genre: string) => dataStore.searchByGenre(genre),
    applyAdvancedFilters: (results: SearchResults, filters: AdvancedFilters) =>
      dataStore.applyAdvancedFilters(results, filters),

    updateSongPlays: (songId: string, newPlays: number) => songsStore.updateSongPlays(songId, newPlays)
  }
}
