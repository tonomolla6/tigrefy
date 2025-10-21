// Variable global para el elemento de audio (singleton)
let globalAudioElement: HTMLAudioElement | null = null

export const usePlayer = () => {
  const currentSong = useState<any>('currentSong', () => null)
  const isPlaying = useState('isPlaying', () => false)
  const currentTime = useState('currentTime', () => 0)
  const duration = useState('duration', () => 0)
  const volume = useState('volume', () => 0.7)
  const isMuted = useState('isMuted', () => false)
  const isShuffled = useState('isShuffled', () => false)
  const repeatMode = useState<'off' | 'all' | 'one'>('repeatMode', () => 'off')
  const queue = useState<any[]>('queue', () => [])
  const queueIndex = useState('queueIndex', () => 0)
  const showLyrics = useState('showLyrics', () => false)

  const initAudio = () => {
    if (typeof window === 'undefined') return
    
    // Si ya existe un audio global, usarlo
    if (!globalAudioElement) {
      globalAudioElement = new Audio()
      globalAudioElement.volume = volume.value

      globalAudioElement.addEventListener('timeupdate', () => {
        currentTime.value = globalAudioElement?.currentTime || 0
      })

      globalAudioElement.addEventListener('loadedmetadata', () => {
        duration.value = globalAudioElement?.duration || 0
      })

      globalAudioElement.addEventListener('ended', () => {
        handleSongEnd()
      })
    }
  }

  const playSong = async (song: any, playlistQueue?: any[]) => {
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

    currentSong.value = song

    if (playlistQueue && playlistQueue.length > 0) {
      queue.value = playlistQueue
      queueIndex.value = playlistQueue.findIndex(s => s.id === song.id)
    } else {
      queue.value = [song]
      queueIndex.value = 0
    }

    globalAudioElement.src = song.audioUrl
    globalAudioElement.load()

    try {
      await globalAudioElement.play()
      isPlaying.value = true
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
    } else {
      globalAudioElement.play()
      isPlaying.value = true
    }
  }

  const pause = () => {
    if (!globalAudioElement) return
    globalAudioElement.pause()
    isPlaying.value = false
  }

  const play = async () => {
    if (!globalAudioElement || !currentSong.value) return
    try {
      await globalAudioElement.play()
      isPlaying.value = true
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
    playSong(queue.value[nextIndex], queue.value)
  }

  const previousSong = () => {
    if (queue.value.length === 0) return

    // Si han pasado más de 3 segundos, reinicia la canción
    if (currentTime.value > 3) {
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
    playSong(queue.value[prevIndex], queue.value)
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
    if (value > 0) {
      isMuted.value = false
    }
  }

  const toggleMute = () => {
    if (!globalAudioElement) return
    isMuted.value = !isMuted.value
    globalAudioElement.muted = isMuted.value
  }

  const toggleShuffle = () => {
    isShuffled.value = !isShuffled.value

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
  }

  const handleSongEnd = () => {
    nextSong()
  }

  const toggleLyrics = () => {
    showLyrics.value = !showLyrics.value
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
    queueIndex,
    showLyrics,
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
    formatTime
  }
}
