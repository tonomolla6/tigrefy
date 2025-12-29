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

/**
 * Formatea una fecha de forma relativa (estilo Spotify)
 * - Hace X minutos/horas/días/semanas
 * - O fecha completa si es más antiguo (ej: "16 nov 2022")
 */
export const formatRelativeDate = (dateString: string): string => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  // Menos de 1 hora
  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? 'hace 1 minuto' : `hace ${diffMinutes} minutos`
  }

  // Menos de 24 horas
  if (diffHours < 24) {
    return diffHours === 1 ? 'hace 1 hora' : `hace ${diffHours} horas`
  }

  // Menos de 7 días
  if (diffDays < 7) {
    return diffDays === 1 ? 'hace 1 día' : `hace ${diffDays} días`
  }

  // Menos de 4 semanas
  if (diffWeeks < 4) {
    return diffWeeks === 1 ? 'hace 1 semana' : `hace ${diffWeeks} semanas`
  }

  // Más de 4 semanas: mostrar fecha completa
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}
