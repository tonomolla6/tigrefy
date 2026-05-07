/**
 * Wrapper de HLS.js + HLS nativo (Safari).
 *
 * - Chrome/Firefox/Edge: usan HLS.js
 * - Safari: usa la implementación nativa del navegador
 *
 * Estrategia de robustez:
 *
 * 1. **Refresh proactivo**: el manifest se re-pide a los 12 min de cargarlo,
 *    antes de que caduquen los tokens (15 min en server). Así el playback
 *    continuo nunca se topa con una URL caducada.
 *
 * 2. **Recovery reactivo**: si por lo que sea (tab throttled, blip de red,
 *    proactivo que llega tarde) un segmento devuelve 401 o falla por red,
 *    re-pedimos el manifest entero y reanudamos. Hasta MAX_RECOVERY intentos.
 *
 * 3. **Auto-skip**: si el recovery se agota o el error no es recuperable,
 *    `onFatalError` permite al player saltar al siguiente track.
 */
import Hls from 'hls.js'

let hlsInstance: Hls | null = null
let currentPlaylistUrl: string | null = null
let currentAudioElement: HTMLAudioElement | null = null
let recoveryAttempts = 0
let refreshTimer: ReturnType<typeof setTimeout> | null = null

const MAX_RECOVERY = 2

// Refresco proactivo del manifest. Debe ser estrictamente menor que el TTL
// del server (`getExpires(900)` en /api/hls/[id]/[filename].get.ts).
// 12 min deja 3 min de margen frente al TTL de 15 min.
const MANIFEST_REFRESH_MS = 12 * 60 * 1000

export type HlsFatalCallback = (reason: string) => void

export const useHlsPlayer = () => {
  const supportsNativeHls = (audioElement: HTMLAudioElement): boolean => {
    return audioElement.canPlayType('application/vnd.apple.mpegurl') !== ''
  }

  /**
   * Re-pide el manifest actual con tokens frescos sin interrumpir el playback.
   * El audio sigue sonando del buffer mientras llega el nuevo manifest.
   */
  const reloadManifest = (opts: { reason: string }) => {
    if (!hlsInstance || !currentPlaylistUrl || !currentAudioElement) return

    const audio = currentAudioElement
    const resumeAt = audio.currentTime
    const wasPlaying = !audio.paused

    console.info(`[hls] refresh manifest (${opts.reason}) @ t=${resumeAt.toFixed(1)}s`)

    const onReload = () => {
      // El currentTime suele preservarse al hacer loadSource sobre la misma
      // instancia, pero defensivamente lo restauramos si se desvía.
      if (Math.abs(audio.currentTime - resumeAt) > 1) {
        audio.currentTime = resumeAt
      }
      // Si el usuario tenía pausado antes, NO arrancamos solos.
      if (wasPlaying && audio.paused) {
        audio.play().catch(() => {
          // Autoplay policy puede bloquear; el usuario volverá a dar play.
        })
      }
    }
    hlsInstance.once(Hls.Events.MANIFEST_PARSED, onReload)
    hlsInstance.loadSource(currentPlaylistUrl)
  }

  const scheduleProactiveRefresh = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }
    refreshTimer = setTimeout(() => {
      reloadManifest({ reason: 'proactive' })
      // El nuevo MANIFEST_PARSED reagendará el siguiente refresh.
    }, MANIFEST_REFRESH_MS)
  }

  const cancelProactiveRefresh = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  /**
   * Carga un track HLS en el elemento de audio.
   * @param onFatalError invocado cuando el recovery se agota o el error no es recuperable
   * @returns Promise que resuelve cuando el manifest está parseado por primera vez
   */
  const loadTrack = (
    audioElement: HTMLAudioElement,
    playlistUrl: string,
    onFatalError?: HlsFatalCallback
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (hlsInstance) {
        hlsInstance.destroy()
        hlsInstance = null
      }
      cancelProactiveRefresh()

      currentPlaylistUrl = playlistUrl
      currentAudioElement = audioElement
      recoveryAttempts = 0

      // Safari: HLS nativo. No tenemos control fino sobre el manifest reload;
      // los errores los captura el listener `error` del <audio> en usePlayer.
      // Como Safari refetchea el manifest internamente cuando lo necesita,
      // un TTL de 15 min en el server es suficiente para sesiones normales.
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

      if (!Hls.isSupported()) {
        reject(new Error('HLS no soportado en este navegador'))
        return
      }

      hlsInstance = new Hls({
        maxBufferLength: 10,
        maxMaxBufferLength: 30,
        startLevel: -1,
        startFragPrefetch: true,
        backBufferLength: 30,
        debug: false,
      })

      hlsInstance.loadSource(playlistUrl)
      hlsInstance.attachMedia(audioElement)

      let manifestParsed = false

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        // Cualquier (re)carga exitosa "resetea" el contador y reagenda el
        // siguiente refresh proactivo. Esto cubre tanto la primera carga
        // como las posteriores recargas (proactivas o reactivas).
        recoveryAttempts = 0
        scheduleProactiveRefresh()
        if (!manifestParsed) {
          manifestParsed = true
          resolve()
        }
      })

      hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return

        // Antes del primer manifest no podemos recuperar nada útil.
        if (!manifestParsed) {
          reject(new Error(`HLS fatal pre-manifest: ${data.type} ${data.details}`))
          return
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          if (recoveryAttempts < MAX_RECOVERY && currentPlaylistUrl) {
            recoveryAttempts++
            console.warn(
              `[hls] network error (${data.details}, status=${data.response?.code}) → reactive reload [${recoveryAttempts}/${MAX_RECOVERY}]`
            )
            reloadManifest({ reason: `reactive #${recoveryAttempts}` })
            return
          }
          onFatalError?.('No se pudo cargar el siguiente fragmento de audio')
          return
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          if (recoveryAttempts < MAX_RECOVERY) {
            recoveryAttempts++
            console.warn(`[hls] media error (${data.details}) → recoverMediaError [${recoveryAttempts}/${MAX_RECOVERY}]`)
            hlsInstance?.recoverMediaError()
            return
          }
          onFatalError?.('Error de decodificación del audio')
          return
        }

        // OTHER_ERROR, MUX_ERROR, KEY_SYSTEM_ERROR — no recuperables.
        onFatalError?.(`Error de reproducción (${data.details})`)
      })
    })
  }

  const destroy = (): void => {
    cancelProactiveRefresh()
    if (hlsInstance) {
      hlsInstance.destroy()
      hlsInstance = null
    }
    currentPlaylistUrl = null
    currentAudioElement = null
    recoveryAttempts = 0
  }

  return { loadTrack, destroy, supportsNativeHls }
}
