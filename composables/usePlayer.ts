import { formatTime } from '~/utils/formatting'

// Variable global para el elemento de audio (singleton)
let globalAudioElement: HTMLAudioElement | null = null
const DEFAULT_TITLE = 'Tigrefy'

/**
 * Carga el track HLS de la canción en el elemento de audio.
 * El playlist se sirve desde /api/hls/<songId>/index.m3u8 con segmentos firmados.
 */
async function loadHlsTrack(audio: HTMLAudioElement, songId: string): Promise<void> {
  const { destroy: destroyHls, loadTrack } = useHlsPlayer()
  destroyHls()
  await loadTrack(audio, `/api/hls/${songId}/index.m3u8`)
}

// Variables para tracking de tiempo real de reproducción
let accumulatedPlayTime = 0
let lastTimeUpdate = 0

// Variable para detectar doble pulsación en previousSong
let lastPreviousPressTime = 0

// Flag para saber si ya se inicializaron las preferencias
let preferencesInitialized = false

// Función para actualizar el título de la pestaña
const updateDocumentTitle = (song: any | null, playing: boolean) => {
  if (typeof document === 'undefined') return

  if (song && playing) {
    document.title = `${song.title} - ${song.artistName} | ${DEFAULT_TITLE}`
  } else if (song) {
    document.title = `${song.title} - ${song.artistName} | ${DEFAULT_TITLE}`
  } else {
    document.title = DEFAULT_TITLE
  }
}

// Tipo para el contexto de reproducción
export type PlaybackContextType = 'album' | 'playlist' | 'liked-songs' | 'artist' | 'search' | 'unknown'
export interface PlaybackContext {
  type: PlaybackContextType
  id?: string // ID del álbum, playlist, artista, etc.
}

export const usePlayer = () => {
  const { playerPreferences, uiPreferences, lastPlayedPreferences, updatePlayerPreferences, updateUIPreferences, updateLastPlayed, initPreferences } = useUserPreferences()

  // Inicializar preferencias una sola vez
  if (!preferencesInitialized && typeof window !== 'undefined') {
    initPreferences()
    preferencesInitialized = true
  }

  const currentSong = useState<any>('currentSong', () => null)
  const isPlaying = useState('isPlaying', () => false)
  const currentTime = useState('currentTime', () => 0)
  const duration = useState('duration', () => 0)
  const volume = useState('volume', () => playerPreferences.value.volume)
  const volumeBeforeMute = useState('volumeBeforeMute', () => playerPreferences.value.volume)
  const isMuted = useState('isMuted', () => playerPreferences.value.isMuted)
  const isShuffled = useState('isShuffled', () => playerPreferences.value.isShuffled)
  const repeatMode = useState<'off' | 'all' | 'one'>('repeatMode', () => playerPreferences.value.repeatMode)
  const queue = useState<any[]>('queue', () => [])
  const queueIndex = useState('queueIndex', () => 0)
  const showLyrics = useState('showLyrics', () => uiPreferences.value.showLyrics)
  const showNowPlaying = useState('showNowPlaying', () => uiPreferences.value.showNowPlaying)
  const showQueue = useState('showQueue', () => uiPreferences.value.showQueue)
  const playbackContext = useState<PlaybackContext>('playbackContext', () => ({ type: 'unknown' }))

  // Flag para saber si ya se contó la reproducción de la canción actual
  const playCountedForCurrentSong = useState('playCountedForCurrentSong', () => false)

  // Guardar estado de última reproducción
  const saveLastPlayedState = () => {
    if (!currentSong.value) return

    updateLastPlayed({
      songId: currentSong.value.id,
      queueIds: queue.value.map((s: any) => s.id),
      queueIndex: queueIndex.value,
      contextType: playbackContext.value.type,
      contextId: playbackContext.value.id || null,
      currentTime: currentTime.value
    })
  }

  // Función para registrar una reproducción después de 30 segundos reales
  const registerPlay = (songId: string) => {
    if (playCountedForCurrentSong.value) return
    playCountedForCurrentSong.value = true

    $fetch(`/api/songs/${songId}/play`, { method: 'POST' })
      .then((res: any) => {
        // Actualizar contador local si la respuesta incluye plays
        if (res?.plays !== undefined && currentSong.value?.id === songId) {
          currentSong.value.plays = res.plays
        }
      })
      .catch(() => {
        // Ignorar errores de tracking
      })
  }

  const initAudio = () => {
    if (typeof window === 'undefined') return

    // Si ya existe un audio global, usarlo
    if (!globalAudioElement) {
      globalAudioElement = new Audio()
      globalAudioElement.volume = volume.value

      globalAudioElement.addEventListener('timeupdate', () => {
        const current = globalAudioElement?.currentTime || 0
        currentTime.value = current

        // Calcular tiempo real transcurrido desde el último update
        // Solo sumar si estamos reproduciendo y el salto es pequeño (< 2 segundos = reproducción normal)
        if (isPlaying.value && lastTimeUpdate > 0) {
          const delta = current - lastTimeUpdate
          if (delta > 0 && delta < 2) {
            accumulatedPlayTime += delta
          }
        }
        lastTimeUpdate = current

        // Contar reproducción si llegamos a 30 segundos reales
        if (!playCountedForCurrentSong.value && currentSong.value && accumulatedPlayTime >= 30) {
          registerPlay(currentSong.value.id)
        }
      })

      globalAudioElement.addEventListener('loadedmetadata', () => {
        duration.value = globalAudioElement?.duration || 0
      })

      globalAudioElement.addEventListener('ended', () => {
        handleSongEnd()
      })

      // Sincronizar estado cuando se usan teclas multimedia del teclado
      globalAudioElement.addEventListener('play', () => {
        if (!isPlaying.value) {
          isPlaying.value = true
          updateDocumentTitle(currentSong.value, true)
        }
      })

      globalAudioElement.addEventListener('pause', () => {
        if (isPlaying.value) {
          isPlaying.value = false
          updateDocumentTitle(currentSong.value, false)
        }
      })

      // Configurar MediaSession para teclas multimedia del teclado
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
          play()
        })
        navigator.mediaSession.setActionHandler('pause', () => {
          pause()
        })
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          previousSong()
        })
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          nextSong()
        })
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            seek(details.seekTime)
          }
        })
      }
    }
  }

  const playSong = async (song: any, playlistQueue?: any[], context?: PlaybackContext) => {
    initAudio()

    if (!globalAudioElement) {
      console.error('❌ No se pudo inicializar audioElement')
      return
    }

    // CRÍTICO: Pausar completamente cualquier audio que esté sonando
    try {
      globalAudioElement.pause()
      globalAudioElement.currentTime = 0
      isPlaying.value = false
    } catch (e) {
      // No había audio previo
    }

    // Resetear contadores de tiempo de reproducción real
    playCountedForCurrentSong.value = false
    accumulatedPlayTime = 0
    lastTimeUpdate = 0

    currentSong.value = song

    // Guardar el contexto de reproducción
    if (context) {
      playbackContext.value = context
    } else {
      playbackContext.value = { type: 'unknown' }
    }

    if (playlistQueue && playlistQueue.length > 0) {
      queue.value = playlistQueue
      queueIndex.value = playlistQueue.findIndex(s => s.id === song.id)
    } else {
      queue.value = [song]
      queueIndex.value = 0
    }

    try {
      await loadHlsTrack(globalAudioElement, song.id)
    } catch (err) {
      console.error('Error cargando audio:', err)
      isPlaying.value = false
      return
    }

    try {
      await globalAudioElement.play()
      isPlaying.value = true
      updateDocumentTitle(song, true)

      // Actualizar MediaSession metadata
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: song.title,
          artist: song.artistName,
          album: song.albumName || '',
          artwork: song.cover ? [{ src: song.cover, sizes: '512x512', type: 'image/jpeg' }] : []
        })
      }
      // La reproducción se registra después de 30 segundos reales de escucha
      // Guardar estado de última reproducción
      saveLastPlayedState()
    } catch (error) {
      console.error('Error al reproducir:', error)
      isPlaying.value = false
    }
  }

  const togglePlay = () => {
    if (!globalAudioElement || !currentSong.value) return

    if (isPlaying.value) {
      globalAudioElement.pause()
      isPlaying.value = false
      updateDocumentTitle(currentSong.value, false)
    } else {
      globalAudioElement.play()
      isPlaying.value = true
      updateDocumentTitle(currentSong.value, true)
    }
  }

  const pause = () => {
    if (!globalAudioElement) return
    globalAudioElement.pause()
    isPlaying.value = false
    updateDocumentTitle(currentSong.value, false)
    // Guardar posición actual al pausar
    saveLastPlayedState()
  }

  const play = async () => {
    if (!globalAudioElement || !currentSong.value) return
    try {
      await globalAudioElement.play()
      isPlaying.value = true
      updateDocumentTitle(currentSong.value, true)
    } catch (error) {
      console.error('Error al reproducir:', error)
      isPlaying.value = false
    }
  }

  const nextSong = () => {
    if (queue.value.length === 0) return

    let nextIndex = queueIndex.value + 1

    if (repeatMode.value === 'one') {
      // Repetir la misma canción
      seek(0)
      play()
      return
    }

    if (nextIndex >= queue.value.length) {
      if (repeatMode.value === 'all') {
        nextIndex = 0
      } else {
        pause()
        return
      }
    }

    queueIndex.value = nextIndex
    playSong(queue.value[nextIndex], queue.value, playbackContext.value)
  }

  const previousSong = () => {
    if (queue.value.length === 0) return

    const now = Date.now()
    const timeSinceLastPress = now - lastPreviousPressTime
    lastPreviousPressTime = now

    // Si ha pasado más de 1 segundo en la canción Y no es doble pulsación (< 500ms), reinicia
    if (currentTime.value > 1 && timeSinceLastPress > 500) {
      seek(0)
      return
    }

    let prevIndex = queueIndex.value - 1

    if (prevIndex < 0) {
      if (repeatMode.value === 'all') {
        prevIndex = queue.value.length - 1
      } else {
        seek(0)
        return
      }
    }

    queueIndex.value = prevIndex
    playSong(queue.value[prevIndex], queue.value, playbackContext.value)
  }

  const seek = (time: number) => {
    if (!globalAudioElement) return
    globalAudioElement.currentTime = time
    currentTime.value = time
  }

  const setVolume = (value: number) => {
    if (!globalAudioElement) return
    volume.value = value
    globalAudioElement.volume = value

    // Si el usuario mueve la barra manualmente, desmutear
    if (value > 0) {
      isMuted.value = false
      globalAudioElement.muted = false
      volumeBeforeMute.value = value
      // Persistir preferencias
      updatePlayerPreferences({ volume: value, isMuted: false })
    } else {
      isMuted.value = true
      globalAudioElement.muted = true
      // Persistir preferencias
      updatePlayerPreferences({ isMuted: true })
    }
  }

  const toggleMute = () => {
    if (!globalAudioElement) return

    if (isMuted.value) {
      // Desmutear: restaurar el volumen anterior
      isMuted.value = false
      globalAudioElement.muted = false
      volume.value = volumeBeforeMute.value
      globalAudioElement.volume = volumeBeforeMute.value
      // Persistir preferencias
      updatePlayerPreferences({ isMuted: false, volume: volumeBeforeMute.value })
    } else {
      // Mutear: guardar el volumen actual y poner a 0
      volumeBeforeMute.value = volume.value
      isMuted.value = true
      globalAudioElement.muted = true
      volume.value = 0
      // Persistir preferencias
      updatePlayerPreferences({ isMuted: true })
    }
  }

  const toggleShuffle = () => {
    isShuffled.value = !isShuffled.value
    // Persistir preferencia
    updatePlayerPreferences({ isShuffled: isShuffled.value })

    if (isShuffled.value && queue.value.length > 1) {
      // Guardar la canción actual
      const current = queue.value[queueIndex.value]

      // Crear nueva cola mezclada (sin incluir la canción actual)
      const otherSongs = queue.value.filter((_, i) => i !== queueIndex.value)
      const shuffled = [...otherSongs].sort(() => Math.random() - 0.5)

      // Colocar la canción actual al principio
      queue.value = [current, ...shuffled]
      queueIndex.value = 0
    }
  }

  const toggleRepeat = () => {
    if (repeatMode.value === 'off') {
      repeatMode.value = 'all'
    } else if (repeatMode.value === 'all') {
      repeatMode.value = 'one'
    } else {
      repeatMode.value = 'off'
    }
    // Persistir preferencia
    updatePlayerPreferences({ repeatMode: repeatMode.value })
  }

  const handleSongEnd = () => {
    // Contar reproducción si la canción terminó y no se había contado
    // (para canciones menores de 30 segundos)
    if (!playCountedForCurrentSong.value && currentSong.value) {
      registerPlay(currentSong.value.id)
    }
    nextSong()
  }

  const toggleLyrics = () => {
    showLyrics.value = !showLyrics.value
    // Persistir preferencia
    updateUIPreferences({ showLyrics: showLyrics.value })
  }

  const toggleNowPlaying = () => {
    showNowPlaying.value = !showNowPlaying.value
    // Cerrar cola si se abre Now Playing
    if (showNowPlaying.value) {
      showQueue.value = false
    }
    // Persistir preferencias
    updateUIPreferences({ showNowPlaying: showNowPlaying.value, showQueue: showQueue.value })
  }

  const toggleQueue = () => {
    showQueue.value = !showQueue.value
    // Cerrar Now Playing si se abre cola
    if (showQueue.value) {
      showNowPlaying.value = false
    }
    // Persistir preferencias
    updateUIPreferences({ showQueue: showQueue.value, showNowPlaying: showNowPlaying.value })
  }

  // Detener y resetear todo el estado del reproductor
  const stopAndReset = () => {
    if (globalAudioElement) {
      globalAudioElement.pause()
      globalAudioElement.currentTime = 0
      globalAudioElement.src = ''
    }

    // Limpiar instancia HLS si la había
    useHlsPlayer().destroy()

    currentSong.value = null
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
    queue.value = []
    queueIndex.value = 0
    showLyrics.value = false
    showNowPlaying.value = false
    playbackContext.value = { type: 'unknown' }

    // Restaurar título de la pestaña
    updateDocumentTitle(null, false)
  }

  // Añadir canción a la cola (después de la canción actual)
  const addToQueue = (song: any) => {
    if (!song) return

    // Si no hay cola, crear una con solo esta canción
    if (queue.value.length === 0) {
      queue.value = [song]
      queueIndex.value = 0
      return
    }

    // Insertar después de la canción actual
    const insertIndex = queueIndex.value + 1
    queue.value.splice(insertIndex, 0, song)
  }

  // Restaurar última canción reproducida (sin auto-play)
  const restoreLastPlayed = async (songs: any[]) => {
    const lastPlayed = lastPlayedPreferences.value
    if (!lastPlayed.songId || songs.length === 0) return false

    // Buscar la canción en la lista proporcionada
    const song = songs.find(s => s.id === lastPlayed.songId)
    if (!song) return false

    initAudio()
    if (!globalAudioElement) return false

    // Reconstruir la cola si hay IDs guardados
    if (lastPlayed.queueIds.length > 0) {
      const restoredQueue = lastPlayed.queueIds
        .map(id => songs.find(s => s.id === id))
        .filter(Boolean)

      if (restoredQueue.length > 0) {
        queue.value = restoredQueue
        queueIndex.value = lastPlayed.queueIndex
      } else {
        queue.value = [song]
        queueIndex.value = 0
      }
    } else {
      queue.value = [song]
      queueIndex.value = 0
    }

    // Restaurar contexto
    playbackContext.value = {
      type: lastPlayed.contextType as PlaybackContextType,
      id: lastPlayed.contextId || undefined
    }

    // Cargar la canción sin reproducir
    currentSong.value = song

    return new Promise<boolean>(async (resolve) => {
      const onLoadedMetadata = () => {
        duration.value = globalAudioElement?.duration || 0
        if (lastPlayed.currentTime > 0 && lastPlayed.currentTime < duration.value) {
          globalAudioElement!.currentTime = lastPlayed.currentTime
          currentTime.value = lastPlayed.currentTime
        }
        globalAudioElement?.removeEventListener('loadedmetadata', onLoadedMetadata)
        updateDocumentTitle(song, false)
        resolve(true)
      }
      globalAudioElement?.addEventListener('loadedmetadata', onLoadedMetadata)

      try {
        await loadHlsTrack(globalAudioElement!, song.id)
      } catch (err) {
        console.error('Error cargando audio (restoreLastPlayed):', err)
        globalAudioElement?.removeEventListener('loadedmetadata', onLoadedMetadata)
        resolve(false)
      }
    })
  }

  return {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    queue,
    currentIndex: queueIndex,
    showLyrics,
    showNowPlaying,
    showQueue,
    playbackContext,
    playSong,
    togglePlay,
    pause,
    play,
    nextSong,
    previousSong,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLyrics,
    toggleNowPlaying,
    toggleQueue,
    stopAndReset,
    addToQueue,
    restoreLastPlayed,
    formatTime
  }
}
