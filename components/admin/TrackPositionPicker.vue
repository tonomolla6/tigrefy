<script setup lang="ts">
/**
 * Selector visual de posición de track en un álbum.
 * Muestra las canciones existentes con su número y permite elegir entre:
 * - "Al final" (auto)
 * - Cualquier posición intermedia (insertar)
 *
 * Solo visible cuando hay un albumId seleccionado y el álbum tiene canciones.
 */

const props = defineProps<{
  /** Track number actual (null = al final) */
  modelValue: number | null
  /** Lista de canciones existentes del álbum, en orden */
  albumSongs: Array<{ id: string; title: string; trackNumber: number | null }>
  /** Si está editando una canción existente, su id (se excluye de la lista) */
  excludeSongId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const orderedSongs = computed(() => {
  return [...props.albumSongs]
    .filter(s => s.id !== props.excludeSongId)
    .sort((a, b) => (a.trackNumber || 999) - (b.trackNumber || 999))
})

// Renumera: el "auto" o último ocupa nextNumber
const nextNumber = computed(() => orderedSongs.value.length + 1)

const isAuto = computed(() => props.modelValue == null || props.modelValue >= nextNumber.value)

const select = (n: number | null) => {
  emit('update:modelValue', n)
}
</script>

<template>
  <div class="space-y-1.5">
    <label class="block text-sm text-white/70">Orden en el álbum</label>

    <div v-if="orderedSongs.length === 0" class="text-sm text-white/50 bg-dark-hover rounded-lg p-3">
      Será la primera canción del álbum (#1)
    </div>

    <div v-else class="bg-dark-hover rounded-lg p-1.5 space-y-1">
      <!-- Lista de canciones existentes con botón "insertar antes" -->
      <button
        v-for="(song, idx) in orderedSongs"
        :key="song.id"
        type="button"
        @click="select(idx + 1)"
        class="w-full flex items-center gap-3 px-2 py-1.5 rounded transition-colors group"
        :class="modelValue === idx + 1
          ? 'bg-tiger-500/20 ring-1 ring-tiger-500'
          : 'hover:bg-white/5'"
      >
        <span class="text-tiger-400 text-xs font-bold w-6 text-right tabular-nums">
          {{ modelValue === idx + 1 ? '↓ Aquí' : '#' + (idx + 1) }}
        </span>
        <span class="text-sm text-white/80 truncate flex-1 text-left">{{ song.title }}</span>
      </button>

      <!-- Opción "al final" -->
      <button
        type="button"
        @click="select(null)"
        class="w-full flex items-center gap-3 px-2 py-1.5 rounded transition-colors"
        :class="isAuto
          ? 'bg-tiger-500/20 ring-1 ring-tiger-500'
          : 'hover:bg-white/5'"
      >
        <span class="text-tiger-400 text-xs font-bold w-6 text-right tabular-nums">
          #{{ nextNumber }}
        </span>
        <span class="text-sm text-white/80 truncate flex-1 text-left">
          Al final del álbum
        </span>
      </button>
    </div>

    <p v-if="orderedSongs.length > 0" class="text-xs text-white/40 px-1">
      Click en una canción para insertar antes de ella
    </p>
  </div>
</template>
