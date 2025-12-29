// Sistema de columnas para SongList
// El cover está DENTRO de la columna 'title' (como Spotify)

export interface SongListColumn {
  id: string
  label?: string
  width: number // en píxeles, 0 = flex (1fr)
  align?: 'left' | 'center' | 'right'
}

export interface ColumnPreset {
  columns: SongListColumn[]
  showArtist: boolean
  showCover: boolean
  showHeader: boolean
}

// Presets para diferentes contextos
export const columnPresets = {
  // Para página de artista (sin header, sin nombre de artista, con cover)
  artist: {
    columns: [
      { id: 'index', width: 40, align: 'center' },
      { id: 'title', width: 0 }, // flex
      { id: 'plays', width: 120, align: 'right' },
      { id: 'favorite', width: 40, align: 'center' },
      { id: 'duration', width: 70, align: 'center' },
    ],
    showArtist: false,
    showCover: true,
    showHeader: false,
  },

  // Para playlist
  playlist: {
    columns: [
      { id: 'index', width: 40, align: 'center' },
      { id: 'title', width: 0 }, // flex
      { id: 'plays', width: 120, align: 'center' },
      { id: 'album', width: 200 },
      { id: 'favorite', width: 40, align: 'center' },
      { id: 'duration', width: 50, align: 'center' },
      { id: 'menu', width: 40, align: 'center' },
    ],
    showArtist: true,
    showCover: true,
    showHeader: true,
  },

  // Para álbum (sin cover, sin plays)
  album: {
    columns: [
      { id: 'index', width: 40, align: 'center' },
      { id: 'title', width: 0 }, // flex
      { id: 'duration', width: 50, align: 'center' },
      { id: 'menu', width: 40, align: 'center' },
    ],
    showArtist: true,
    showCover: false,
    showHeader: true,
  },

  // Para búsqueda/canciones
  songs: {
    columns: [
      { id: 'index', width: 40, align: 'center' },
      { id: 'title', width: 0 }, // flex
      { id: 'album', width: 200 },
      { id: 'duration', width: 70, align: 'center' },
    ],
    showArtist: true,
    showCover: true,
    showHeader: true,
  },

  // Liked songs (como Spotify: sin reproducciones, con fecha añadido)
  liked: {
    columns: [
      { id: 'index', width: 40, align: 'center' },
      { id: 'title', width: 0 }, // flex
      { id: 'album', width: 200 },
      { id: 'dateAdded', width: 150 },
      { id: 'favorite', width: 40, align: 'center' },
      { id: 'duration', width: 50, align: 'center' },
      { id: 'menu', width: 40, align: 'center' },
    ],
    showArtist: true,
    showCover: true,
    showHeader: true,
  },
} as const

export type PresetName = keyof typeof columnPresets

// Composable para manejar columnas
export function useSongListColumns(presetName: PresetName) {
  const preset = columnPresets[presetName]
  const columns = preset.columns

  // Columnas ocultas
  const hiddenColumns = ref<string[]>([])

  // Toggle visibilidad de columna
  const toggleColumn = (columnId: string) => {
    const idx = hiddenColumns.value.indexOf(columnId)
    if (idx === -1) {
      hiddenColumns.value = [...hiddenColumns.value, columnId]
    } else {
      hiddenColumns.value = hiddenColumns.value.filter(id => id !== columnId)
    }
  }

  // Columnas visibles
  const visibleColumns = computed(() =>
    columns.filter(col => !hiddenColumns.value.includes(col.id))
  )

  // Generar string de grid-template-columns (solo visibles)
  const gridTemplateColumns = computed(() => {
    return visibleColumns.value
      .map(col => col.width === 0 ? '1fr' : `${col.width}px`)
      .join(' ')
  })

  return {
    columns,
    visibleColumns,
    hiddenColumns,
    showArtist: preset.showArtist,
    showCover: preset.showCover,
    showHeader: preset.showHeader,
    gridTemplateColumns,
    toggleColumn,
  }
}
