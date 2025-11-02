export const useUserPlaylists = () => {
  const userPlaylists = useState<any[]>('userPlaylists', () => [])

  const loadUserPlaylists = () => {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem('tigrefy_user_playlists')
    if (stored) {
      userPlaylists.value = JSON.parse(stored)
    }
  }

  const saveUserPlaylists = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem('tigrefy_user_playlists', JSON.stringify(userPlaylists.value))
  }

  const createPlaylist = (name: string, description: string = '', cover: string = '/covers/airbeat-cecot.png') => {
    const newPlaylist = {
      id: `user_${Date.now()}`,
      name,
      description,
      cover,
      songIds: [],
      public: false,
      collaborative: false,
      createdAt: new Date().toISOString(),
      isUserCreated: true
    }

    userPlaylists.value.push(newPlaylist)
    saveUserPlaylists()
    return newPlaylist
  }

  const deletePlaylist = (playlistId: string) => {
    const index = userPlaylists.value.findIndex(p => p.id === playlistId)
    if (index > -1) {
      userPlaylists.value.splice(index, 1)
      saveUserPlaylists()
    }
  }

  const addSongToPlaylist = (playlistId: string, songId: string): boolean => {
    const playlist = userPlaylists.value.find(p => p.id === playlistId)
    if (playlist && !playlist.songIds.includes(songId)) {
      playlist.songIds.push(songId)
      saveUserPlaylists()
      return true
    }
    return false
  }

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    const playlist = userPlaylists.value.find(p => p.id === playlistId)
    if (playlist) {
      const index = playlist.songIds.indexOf(songId)
      if (index > -1) {
        playlist.songIds.splice(index, 1)
        saveUserPlaylists()
      }
    }
  }

  const updatePlaylist = (playlistId: string, updates: any) => {
    const playlist = userPlaylists.value.find(p => p.id === playlistId)
    if (playlist) {
      Object.assign(playlist, updates)
      saveUserPlaylists()
    }
  }

  const reorderPlaylistSongs = (playlistId: string, newSongIds: string[]) => {
    const playlist = userPlaylists.value.find(p => p.id === playlistId)
    if (playlist) {
      playlist.songIds = newSongIds
      saveUserPlaylists()
    }
  }

  return {
    userPlaylists,
    loadUserPlaylists,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    updatePlaylist,
    reorderPlaylistSongs
  }
}
