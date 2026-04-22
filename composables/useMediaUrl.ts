/**
 * Composable para manejar URLs de media (tracks e imágenes)
 * Obtiene URLs firmadas del backend y las cachea hasta expiración
 */

interface CachedUrl {
  url: string
  expiresAt: number
}

// Cache en memoria para URLs firmadas
const imageUrlCache = new Map<string, CachedUrl>()

export const useMediaUrl = () => {
  /**
   * Obtiene URL del playlist HLS para un track
   * Esta URL apunta al endpoint del backend que reescribe el playlist
   * @param trackId - ID del track en R2 (normalmente song.audioUrl cuando es HLS)
   */
  const getTrackPlaylistUrl = (trackId: string): string => {
    // Si el trackId parece ser una URL local (/audio/...), extraer solo el nombre
    if (trackId.startsWith('/audio/')) {
      trackId = trackId.replace('/audio/', '').replace('.mp3', '')
    }
    return `/api/media/track/${trackId}.m3u8`
  }

  /**
   * Obtiene URL firmada para una imagen desde la API
   * Cachea la URL hasta 5 minutos antes de expirar
   * @param path - Path de la imagen. Ej: /covers/album.png o covers/album.png
   */
  const getImageUrl = async (path: string): Promise<string> => {
    if (!path) return ''

    // Normalizar path (quitar / inicial si existe)
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path
    const cacheKey = `image:${normalizedPath}`

    // Verificar cache (válido si expira en más de 5 minutos)
    const cached = imageUrlCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now() + 300000) {
      return cached.url
    }

    try {
      const response = await $fetch<{ url: string; expiresIn: number }>(
        `/api/media/image/${normalizedPath}`
      )

      // Cachear URL
      imageUrlCache.set(cacheKey, {
        url: response.url,
        expiresAt: Date.now() + (response.expiresIn * 1000)
      })

      return response.url
    } catch (error) {
      console.error('Error obteniendo URL de imagen:', error)
      // Fallback: intentar usar path local (para desarrollo)
      return `/${normalizedPath}`
    }
  }

  /**
   * Pre-carga una imagen obteniendo su URL firmada
   * Útil para precargar covers de canciones en cola
   * @param path - Path de la imagen
   */
  const preloadImage = async (path: string): Promise<void> => {
    if (!path) return

    try {
      const url = await getImageUrl(path)
      // Crear imagen para precargar en el navegador
      if (typeof window !== 'undefined') {
        const img = new Image()
        img.src = url
      }
    } catch {
      // Ignorar errores de precarga
    }
  }

  /**
   * Limpia URLs expiradas del cache
   */
  const clearExpiredCache = (): void => {
    const now = Date.now()
    for (const [key, value] of imageUrlCache.entries()) {
      if (value.expiresAt <= now) {
        imageUrlCache.delete(key)
      }
    }
  }

  // Limpiar cache expirado periódicamente (cada minuto)
  if (typeof window !== 'undefined') {
    setInterval(clearExpiredCache, 60000)
  }

  return {
    getTrackPlaylistUrl,
    getImageUrl,
    preloadImage,
    clearExpiredCache
  }
}
