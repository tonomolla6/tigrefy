import { useUserStore } from '~/stores/user'

export const useUserPlaylists = () => {
  const store = useUserStore()
  const { isAuthenticated } = useAuth()

  const loadUserPlaylists = () => store.loadPlaylists()

  const savePlaylist = async (playlistId: string) => {
    if (!isAuthenticated.value) return false
    return store.savePlaylist(playlistId)
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
    getPlaylistById,
  }
}
