/**
 * Helpers para URLs de media.
 *
 * - Imágenes (covers/artists): URL pública directa al dominio R2.
 *   El dominio se lee de runtimeConfig.public.r2MediaDomain (env R2_MEDIA_DOMAIN).
 *
 * - Audio HLS: URL al endpoint del backend que reescribe el playlist
 *   con segmentos firmados (HMAC).
 */

export const useMediaUrl = () => {
  const config = useRuntimeConfig()
  const domain = config.public.r2MediaDomain

  /**
   * Construye URL pública de una imagen (cover, artista, playlist).
   * Acepta tanto "/covers/x.jpg" como "covers/x.jpg".
   * URLs absolutas (http://...) y data:/blob: se devuelven tal cual.
   */
  const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    if (path.startsWith('data:') || path.startsWith('blob:')) return path

    const normalized = path.startsWith('/') ? path : `/${path}`
    if (!domain) {
      console.warn('[useMediaUrl] R2_MEDIA_DOMAIN no configurado — la imagen no se podrá cargar:', normalized)
      return normalized
    }
    return `https://${domain}${normalized}`
  }

  /**
   * URL del playlist HLS para un track.
   * Apunta al endpoint que reescribe el .m3u8 con segmentos firmados.
   */
  const getTrackPlaylistUrl = (trackId: string): string => {
    let id = trackId
    if (id.startsWith('/audio/')) {
      id = id.replace('/audio/', '').replace('.mp3', '')
    }
    return `/api/hls/${id}/index.m3u8`
  }

  return {
    getImageUrl,
    getTrackPlaylistUrl,
  }
}
