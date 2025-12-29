/**
 * Composable para manejar la lógica de reproducción en contexto
 * Elimina duplicación en páginas de album, playlist y artist
 */
export const useContextPlayback = (contextType: Ref<string> | string, contextId: Ref<string> | string) => {
  const { currentSong, isPlaying, playbackContext, togglePlay, playSong } = usePlayer()

  // Normalizar refs
  const type = computed(() => typeof contextType === 'string' ? contextType : contextType.value)
  const id = computed(() => typeof contextId === 'string' ? contextId : contextId.value)

  /**
   * Verifica si este contexto es el contexto de reproducción actual
   */
  const isThisContext = computed(() =>
    playbackContext.value.type === type.value && playbackContext.value.id === id.value
  )

  /**
   * Verifica si una canción es la actual Y está en este contexto (para resaltar en naranja)
   */
  const isCurrentSongInContext = (song: any): boolean =>
    currentSong.value?.id === song.id && isThisContext.value

  /**
   * Verifica si una canción está reproduciéndose activamente en este contexto (para animación)
   */
  const isCurrentAndPlaying = (song: any): boolean =>
    isCurrentSongInContext(song) && isPlaying.value

  /**
   * Verifica si alguna canción de la lista está reproduciéndose en este contexto
   */
  const isContextPlaying = (songs: any[]): boolean => {
    if (!currentSong.value || !isPlaying.value || !isThisContext.value) return false
    return songs.some(song => song.id === currentSong.value?.id)
  }

  /**
   * Maneja la reproducción de una canción en este contexto
   */
  const handlePlaySong = (song: any, queue: any[]) => {
    if (currentSong.value?.id === song.id) {
      togglePlay()
    } else {
      playSong(song, queue, { type: type.value, id: id.value })
    }
  }

  /**
   * Maneja el botón de play/pause del contexto completo
   */
  const handlePlayContext = (songs: any[]) => {
    if (isContextPlaying(songs)) {
      // Si está reproduciendo una canción del contexto, pausar
      togglePlay()
    } else if (currentSong.value && songs.some(s => s.id === currentSong.value?.id)) {
      // Si hay una canción del contexto pausada, reanudar
      togglePlay()
    } else if (songs.length > 0) {
      // Si no, empezar desde la primera canción
      playSong(songs[0], songs, { type: type.value, id: id.value })
    }
  }

  return {
    isThisContext,
    isCurrentSongInContext,
    isCurrentAndPlaying,
    isContextPlaying,
    handlePlaySong,
    handlePlayContext
  }
}
