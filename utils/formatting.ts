/**
 * Utilidades de formateo centralizadas
 * Elimina duplicación de funciones de formato en múltiples archivos
 */

/**
 * Formatea segundos a formato mm:ss
 */
export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Formatea número de reproducciones (1000 -> 1K, 1000000 -> 1M)
 */
export const formatPlays = (plays: number): string => {
  if (!plays || isNaN(plays)) return '0'
  if (plays >= 1000000) {
    return `${(plays / 1000000).toFixed(1)}M`
  }
  if (plays >= 1000) {
    return `${(plays / 1000).toFixed(1)}K`
  }
  return plays.toString()
}

/**
 * Formatea número de seguidores con separador de miles
 */
export const formatFollowers = (followers: number): string => {
  if (!followers || isNaN(followers)) return '0'
  return followers.toLocaleString('es-ES')
}

/**
 * Formatea duración total en formato "X h Y min" o "Y min"
 */
export const formatDuration = (totalSeconds: number): string => {
  if (!totalSeconds || isNaN(totalSeconds)) return '0 min'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours} h ${minutes} min`
  }
  return `${minutes} min`
}

/**
 * Formatea reproducciones con separador de miles (para tablas detalladas)
 */
export const formatPlaysDetailed = (plays: number): string => {
  if (!plays || isNaN(plays)) return '0'
  return plays.toLocaleString('es-ES')
}
