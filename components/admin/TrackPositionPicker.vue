<script setup lang="ts">
/**
 * Selector visual de posición de track en un álbum.
 *
 * Muestra TODAS las canciones del álbum + la canción que se está editando o
 * creando, destacada en su posición actual. Dos botones ↑/↓ mueven esa
 * canción una posición arriba o abajo dentro del álbum.
 *
 * Modo editar: pasar `excludeSongId` con el id de la canción editada (debe
 *   estar también dentro de `albumSongs`); su `trackNumber` se ignora y se
 *   usa `modelValue` como posición.
 * Modo crear: omitir `excludeSongId`; se renderiza un placeholder con el
 *   título "Esta canción nueva" en la posición que indique `modelValue` (o
 *   al final si es null).
 */

const props = defineProps<{
  /** Posición 1-based actual; null = al final */
  modelValue: number | null
  /** Lista de canciones existentes del álbum */
  albumSongs: Array<{ id: string; title: string; trackNumber: number | null }>
  /** Si está editando una canción existente, su id */
  excludeSongId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

interface Row {
  key: string
  title: string
  isCurrent: boolean
}

const rows = computed<Row[]>(() => {
  const others = [...props.albumSongs]
    .filter(s => s.id !== props.excludeSongId)
    .sort((a, b) => (a.trackNumber ?? 9999) - (b.trackNumber ?? 9999))

  const currentRow: Row = {
    key: props.excludeSongId || '__new__',
    title: props.excludeSongId
      ? (props.albumSongs.find(s => s.id === props.excludeSongId)?.title ?? 'Esta canción')
      : 'Esta canción nueva',
    isCurrent: true,
  }

  // Posición 0-based donde insertar la canción actual.
  const targetIdx = props.modelValue == null
    ? others.length
    : Math.max(0, Math.min(props.modelValue - 1, others.length))

  const result: Row[] = others.map(s => ({ key: s.id, title: s.title, isCurrent: false }))
  result.splice(targetIdx, 0, currentRow)
  return result
})

const currentIdx = computed(() => rows.value.findIndex(r => r.isCurrent))
const isFirst = computed(() => currentIdx.value <= 0)
const isLast = computed(() => currentIdx.value >= rows.value.length - 1)

const moveUp = () => {
  const idx = currentIdx.value
  if (idx <= 0) return
  // Nueva posición 0-based = idx-1; 1-based = idx.
  emit('update:modelValue', idx)
}

const moveDown = () => {
  const idx = currentIdx.value
  if (idx >= rows.value.length - 1) return
  // Nueva posición 0-based = idx+1; 1-based = idx+2.
  emit('update:modelValue', idx + 2)
}
</script>

<template>
  <div class="space-y-1.5">
    <label class="block text-sm text-white/70">Orden en el álbum</label>

    <div v-if="albumSongs.length === 0 || (excludeSongId && albumSongs.length === 1)"
         class="text-sm text-white/50 bg-dark-hover rounded-lg p-3">
      {{ excludeSongId ? 'Esta es la única canción del álbum.' : 'Será la primera canción del álbum (#1).' }}
    </div>

    <div v-else class="bg-dark-hover rounded-lg p-1.5 space-y-1">
      <div
        v-for="(row, idx) in rows"
        :key="row.key"
        class="flex items-center gap-3 px-2 py-1.5 rounded transition-colors"
        :class="row.isCurrent ? 'bg-tiger-500/20 ring-1 ring-tiger-500' : ''"
      >
        <span
          class="text-xs font-bold w-6 text-right tabular-nums"
          :class="row.isCurrent ? 'text-tiger-400' : 'text-white/50'"
        >
          #{{ idx + 1 }}
        </span>
        <span
          class="text-sm truncate flex-1 text-left"
          :class="row.isCurrent ? 'text-white font-medium' : 'text-white/60'"
        >
          {{ row.title }}
        </span>
        <div v-if="row.isCurrent" class="flex items-center gap-1">
          <button
            type="button"
            @click="moveUp"
            :disabled="isFirst"
            class="w-7 h-7 flex items-center justify-center rounded text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Subir una posición"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            @click="moveDown"
            :disabled="isLast"
            class="w-7 h-7 flex items-center justify-center rounded text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Bajar una posición"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
