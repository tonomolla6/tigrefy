/**
 * Convierte MP3 → HLS en el navegador usando ffmpeg.wasm.
 *
 * Por qué en el navegador: Cloudflare Workers no puede ejecutar ffmpeg
 * (es un binario nativo, no JS/WASM). Hacerlo client-side permite que
 * el admin funcione desde cualquier sitio sin Codespaces.
 *
 * El primer uso descarga ~25 MB de ffmpeg.wasm (luego cache del navegador).
 */
import type { LogEvent, ProgressEvent } from '@ffmpeg/ffmpeg'

export interface HlsFile {
  name: string
  data: Uint8Array
}

export type ConvertStep = 'loading-ffmpeg' | 'converting' | 'reading-output'

export interface ConvertProgress {
  step: ConvertStep
  /** 0-100, o null cuando es indeterminado */
  percent: number | null
  message: string
}

// Singleton: una sola instancia de ffmpeg cargada en toda la app
let ffmpegInstance: any = null
let loadingPromise: Promise<any> | null = null

async function getFFmpeg(onProgress?: (p: ConvertProgress) => void): Promise<any> {
  if (ffmpegInstance) return ffmpegInstance
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg')
    const { toBlobURL } = await import('@ffmpeg/util')

    const ffmpeg = new FFmpeg()

    // Los archivos del core (~30 MB total) los servimos desde R2 porque no
    // caben en los assets de Cloudflare Workers (límite 25 MiB por archivo).
    // Hace falta que la app tenga `runtimeConfig.public.r2MediaDomain`.
    const config = useRuntimeConfig()
    const domain = config.public.r2MediaDomain
    if (!domain) {
      throw new Error('R2_MEDIA_DOMAIN no configurado, no se puede cargar ffmpeg')
    }
    const baseURL = `https://${domain}/ffmpeg`

    onProgress?.({ step: 'loading-ffmpeg', percent: null, message: 'Descargando ffmpeg…' })

    // Logs por si algo se cuelga
    ffmpeg.on('log', (e: LogEvent) => {
      if (e.type === 'fferr') console.warn('[ffmpeg]', e.message)
    })

    try {
      console.log('[ffmpeg] descargando core desde', baseURL)
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
      console.log('[ffmpeg] core descargado, cargando…')
      await ffmpeg.load({ coreURL, wasmURL })
      console.log('[ffmpeg] cargado OK')
    } catch (err) {
      ffmpegInstance = null
      console.error('[ffmpeg] error cargando:', err)
      throw new Error(`No se pudo cargar ffmpeg: ${(err as Error).message || err}`)
    }

    ffmpegInstance = ffmpeg
    return ffmpeg
  })()

  try {
    return await loadingPromise
  } finally {
    loadingPromise = null
  }
}

export const useAudioConverter = () => {
  /**
   * Convierte un File MP3 (u otro formato compatible) a HLS.
   * Devuelve la lista de archivos generados (index.m3u8 + segmentos .ts).
   *
   * @param file Archivo de audio del input
   * @param onProgress Callback de progreso (carga, conversión, lectura)
   */
  async function convertToHls(
    file: File,
    onProgress?: (p: ConvertProgress) => void
  ): Promise<HlsFile[]> {
    const { fetchFile } = await import('@ffmpeg/util')
    const ffmpeg = await getFFmpeg(onProgress)

    // Listener de progreso de ffmpeg para la fase "converting"
    const progressHandler = ({ progress }: ProgressEvent) => {
      const percent = Math.min(99, Math.round(progress * 100))
      onProgress?.({
        step: 'converting',
        percent,
        message: `Convirtiendo a HLS… ${percent}%`
      })
    }
    ffmpeg.on('progress', progressHandler)

    try {
      onProgress?.({ step: 'converting', percent: 0, message: 'Convirtiendo a HLS…' })

      // 1. Escribir el MP3 al FS virtual de ffmpeg
      await ffmpeg.writeFile('input', await fetchFile(file))

      // 2. Ejecutar la conversión (segmentos AAC de 3s, 128 kbps)
      await ffmpeg.exec([
        '-i', 'input',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-vn',
        '-hls_time', '3',
        '-hls_list_size', '0',
        '-hls_segment_filename', 'segment%03d.ts',
        'index.m3u8',
      ])

      // 3. Leer los archivos generados
      onProgress?.({ step: 'reading-output', percent: 100, message: 'Empaquetando…' })

      const dirEntries = await ffmpeg.listDir('/')
      const outputNames = dirEntries
        .filter((e: any) => !e.isDir && (e.name === 'index.m3u8' || e.name.endsWith('.ts')))
        .map((e: any) => e.name)
        .sort()

      const files: HlsFile[] = []
      for (const name of outputNames) {
        const data = await ffmpeg.readFile(name) as Uint8Array
        files.push({ name, data })
      }

      // 4. Cleanup del FS virtual
      try { await ffmpeg.deleteFile('input') } catch {}
      for (const name of outputNames) {
        try { await ffmpeg.deleteFile(name) } catch {}
      }

      return files
    } finally {
      ffmpeg.off('progress', progressHandler)
    }
  }

  /**
   * Sube un bundle HLS al servidor con barra de progreso de upload.
   * Devuelve la respuesta del servidor (incluye trackId y duration).
   */
  async function uploadHlsBundle(
    files: HlsFile[],
    options: {
      trackId?: string
      onProgress?: (percent: number) => void
    } = {}
  ): Promise<{ success: boolean; trackId: string; duration: number; segments: number }> {
    const formData = new FormData()
    if (options.trackId) formData.append('trackId', options.trackId)

    for (const f of files) {
      // Crear un Blob explícito desde Uint8Array (algunos browsers no aceptan Uint8Array directo en FormData.append)
      formData.append('files', new Blob([f.data]), f.name)
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/admin/upload-audio')
      xhr.withCredentials = true

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && options.onProgress) {
          options.onProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)) }
          catch (err) { reject(new Error('Respuesta inválida del servidor')) }
        } else {
          let msg = `Error ${xhr.status}`
          try { msg = JSON.parse(xhr.responseText).statusMessage || msg } catch {}
          reject(new Error(msg))
        }
      })
      xhr.addEventListener('error', () => reject(new Error('Error de red')))
      xhr.addEventListener('abort', () => reject(new Error('Subida cancelada')))

      xhr.send(formData)
    })
  }

  return { convertToHls, uploadHlsBundle }
}
