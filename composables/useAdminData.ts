/**
 * Estado compartido del panel de administración.
 *
 * Por qué un composable y no Pinia: los stores de Pinia son para datos que
 * se reusan en múltiples páginas (canciones, álbumes para el reproductor).
 * El admin solo se carga en /admin y queremos que cada vez que se vuelve a
 * entrar se refresquen los datos. Con un composable de módulo conseguimos
 * estado singleton durante la vida de la página sin polución global.
 */
import { ref, computed } from 'vue'
import type { AdminSong as Song } from '~/types/song'
import type { Artist, Album, Playlist, AdminUser, Stats } from '~/types/admin'
import type { Genre } from '~/stores/genres'

// Estado a nivel de módulo — singleton entre tabs del admin
const artistsList = ref<Artist[]>([])
const songs = ref<Song[]>([])
const albums = ref<Album[]>([])
const playlistsList = ref<Playlist[]>([])
const usersList = ref<AdminUser[]>([])
const genresList = ref<Genre[]>([])
const stats = ref<Stats | null>(null)
const isLoadingContent = ref(true)

export const useAdminData = () => {
  const loadArtists = async () => {
    try {
      artistsList.value = await $fetch<Artist[]>('/api/admin/artists', { credentials: 'include' })
    } catch (error) {
      console.error('Error loading artists:', error)
    }
  }

  const loadContent = async () => {
    isLoadingContent.value = true
    try {
      const data = await $fetch<{ songs: Song[]; albums: Album[]; stats: Stats }>(
        '/api/admin/content',
        { credentials: 'include' }
      )
      songs.value = data.songs
      albums.value = data.albums
      stats.value = data.stats
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      isLoadingContent.value = false
    }
  }

  const loadPlaylists = async () => {
    try {
      playlistsList.value = await $fetch<Playlist[]>('/api/admin/playlists', { credentials: 'include' })
    } catch (error) {
      console.error('Error loading playlists:', error)
    }
  }

  const loadUsers = async () => {
    try {
      usersList.value = await $fetch<AdminUser[]>('/api/admin/users', { credentials: 'include' })
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadGenres = async () => {
    try {
      genresList.value = await $fetch<Genre[]>('/api/admin/genres', { credentials: 'include' })
    } catch (error) {
      console.error('Error loading genres:', error)
    }
  }

  const loadAll = async () => {
    await loadArtists()
    await loadContent()
    await loadPlaylists()
    await loadUsers()
    await loadGenres()
  }

  /**
   * Recalcula los contadores públicos/privados de stats a partir del estado
   * actual de songs/albums. Usar tras toggles de visibilidad.
   */
  const recomputeVisibilityStats = () => {
    if (!stats.value) return
    stats.value.publicSongs = songs.value.filter(s => s.isPublic).length
    stats.value.privateSongs = songs.value.filter(s => !s.isPublic).length
    stats.value.publicAlbums = albums.value.filter(a => a.isPublic).length
    stats.value.privateAlbums = albums.value.filter(a => !a.isPublic).length
  }

  const usersByRole = computed(() => ({
    tigre: usersList.value.filter(u => u.role === 'tigre').length,
    user: usersList.value.filter(u => u.role === 'user').length,
    guest: usersList.value.filter(u => u.role === 'guest').length,
  }))

  return {
    // estado
    artistsList,
    songs,
    albums,
    playlistsList,
    usersList,
    genresList,
    stats,
    isLoadingContent,
    usersByRole,
    // loaders
    loadAll,
    loadArtists,
    loadContent,
    loadPlaylists,
    loadUsers,
    loadGenres,
    // helpers
    recomputeVisibilityStats,
  }
}
