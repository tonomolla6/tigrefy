/**
 * Utilidades para manejo de imágenes
 * Elimina duplicación de funciones de imagen en múltiples archivos
 */

/**
 * Maneja errores de carga de imagen ocultando el elemento
 */
export const handleImageError = (e: Event): void => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

/**
 * Extrae el color dominante de una imagen
 * Usado para gradientes dinámicos en headers
 */
export const extractDominantColor = (img: HTMLImageElement): string | null => {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = 50
    canvas.height = 50
    ctx.drawImage(img, 0, 0, 50, 50)

    const imageData = ctx.getImageData(0, 0, 50, 50).data
    let r = 0, g = 0, b = 0, count = 0

    // Muestrear cada 16 pixeles para eficiencia
    for (let i = 0; i < imageData.length; i += 16) {
      r += imageData[i]
      g += imageData[i + 1]
      b += imageData[i + 2]
      count++
    }

    r = Math.round(r / count)
    g = Math.round(g / count)
    b = Math.round(b / count)

    // Boost de saturación para colores más vibrantes
    const boost = 1.3
    r = Math.min(255, Math.round(r * boost))
    g = Math.min(255, Math.round(g * boost))
    b = Math.min(255, Math.round(b * boost))

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  } catch {
    // Error CORS u otro error
    return null
  }
}

/**
 * Carga una imagen y extrae su color dominante
 * Retorna una promesa con el color o null si falla
 */
export const loadImageAndExtractColor = (src: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const color = extractDominantColor(img)
      resolve(color)
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}
