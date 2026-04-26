import { useUserStore } from '~/stores/user'

export const useUserPlaylists = () => {
  const store = useUserStore()
  const { isAuthenticated } = useAuth()

  const loadUserPlaylists = () => store.loadPlaylists()

  const savePlaylist = async (playlistId: string) => {
    if (!isAuthenticated.value) return false
    return store.savePlaylist(playlistId)
  }

  /**
   * Añade una canción a una playlist propia.
   * Devuelve true si se añadió, false si ya estaba o falló.
   */
  const addSongToPlaylist = async (playlistId: string, songId: string): Promise<boolean> => {
    if (!isAuthenticated.value) return false
    const playlist = store.getPlaylistById(playlistId)
    // Si ya está, no llamamos al servidor — la modal usará esto para feedback
    if (playlist?.songIds.includes(songId)) return false
    return store.toggleSongInPlaylist(playlistId, songId, 'add')
  }

  const getPlaylistById = (id: string) => store.getPlaylistById(id)

  return {
    // Todas las playlists del usuario (creadas + guardadas)
    userPlaylists: computed(() => store.playlists),
    // Solo playlists creadas por el usuario
    ownedPlaylists: computed(() => store.ownedPlaylists),
    // Solo playlists guardadas (de otros)
    savedPlaylists: computed(() => store.savedPlaylists),
    isLoadingPlaylists: computed(() => store.isLoadingPlaylists),
    playlistsCount: computed(() => store.playlistsCount),

    // Actions
    loadUserPlaylists,
    savePlaylist,
    addSongToPlaylist,
    getPlaylistById,
  }
}
