/**
 * Wrapper de HLS.js + HLS nativo (Safari).
 *
 * - Chrome/Firefox/Edge: usan HLS.js
 * - Safari: usa la implementación nativa del navegador
 */
import Hls from 'hls.js'

let hlsInstance: Hls | null = null

export const useHlsPlayer = () => {
  /**
   * ¿El navegador soporta HLS de forma nativa? (solo Safari)
   */
  const supportsNativeHls = (audioElement: HTMLAudioElement): boolean => {
    return audioElement.canPlayType('application/vnd.apple.mpegurl') !== ''
  }

  /**
   * Carga un track HLS en el elemento de audio.
   * @returns Promise que resuelve cuando el manifest está parseado
   */
  const loadTrack = (
    audioElement: HTMLAudioElement,
    playlistUrl: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Destruir instancia previa
      if (hlsInstance) {
        hlsInstance.destroy()
        hlsInstance = null
      }

      // Safari: HLS nativo
      if (supportsNativeHls(audioElement)) {
        audioElement.src = playlistUrl

        const onLoaded = () => {
          audioElement.removeEventListener('loadedmetadata', onLoaded)
          audioElement.removeEventListener('error', onError)
          resolve()
        }
        const onError = () => {
          audioElement.removeEventListener('loadedmetadata', onLoaded)
          audioElement.removeEventListener('error', onError)
          reject(new Error('HLS native: failed to load'))
        }

        audioElement.addEventListener('loadedmetadata', onLoaded)
        audioElement.addEventListener('error', onError)
        audioElement.load()
        return
      }

      // Resto: HLS.js
      if (!Hls.isSupported()) {
        reject(new Error('HLS no soportado en este navegador'))
        return
      }

      hlsInstance = new Hls({
        // Empezar a sonar lo antes posible (1 segmento ~ 3s ya basta).
        maxBufferLength: 10,
        maxMaxBufferLength: 30,
        startLevel: -1,
        startFragPrefetch: true,
        // No esperar mucho tiempo de buffer antes de play
        backBufferLength: 30,
        debug: false,
      })

      hlsInstance.loadSource(playlistUrl)
      hlsInstance.attachMedia(audioElement)

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => resolve())

      hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.warn('HLS network error, recovering...')
            hlsInstance?.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.warn('HLS media error, recovering...')
            hlsInstance?.recoverMediaError()
            break
          default:
            reject(new Error(`HLS fatal: ${data.type} ${data.details}`))
            break
        }
      })
    })
  }

  /**
   * Destruye la instancia de HLS.js. Llamar al cambiar de canción o detener.
   */
  const destroy = (): void => {
    if (hlsInstance) {
      hlsInstance.destroy()
      hlsInstance = null
    }
  }

  return { loadTrack, destroy, supportsNativeHls }
}
