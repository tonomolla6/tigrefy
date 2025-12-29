<template>
  <div
    class="song-list-header hidden md:grid gap-3 px-4 py-2 border-b border-gray-800 text-secondary text-sm mb-2"
    :style="{ gridTemplateColumns }"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <template v-for="column in visibleColumns" :key="column.id">
      <!-- Index (#) -->
      <div v-if="column.id === 'index'" class="flex items-center justify-center">
        #
      </div>

      <!-- Título -->
      <div v-else-if="column.id === 'title'" class="flex items-center">
        Título
      </div>

      <!-- Reproducciones -->
      <div v-else-if="column.id === 'plays'" class="flex items-center justify-center">
        Reproducciones
      </div>

      <!-- Álbum -->
      <div v-else-if="column.id === 'album'" class="flex items-center">
        Álbum
      </div>

      <!-- Fecha añadido -->
      <div v-else-if="column.id === 'dateAdded'" class="flex items-center">
        Fecha en la que se añadió
      </div>

      <!-- Favorite (vacío en header) -->
      <div v-else-if="column.id === 'favorite'" />

      <!-- Duración (reloj) -->
      <div v-else-if="column.id === 'duration'" class="flex items-center justify-center">
        <IconClock :size="16" />
      </div>

      <!-- Menú (flecha, solo en hover) -->
      <div v-else-if="column.id === 'menu'" class="flex items-center justify-center relative">
        <button
          @click="toggleMenu"
          class="p-1 hover:bg-dark-hover rounded transition-all text-secondary hover:text-white"
          :class="isHovering ? 'opacity-100' : 'opacity-0'"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>
    </template>

    <!-- Menú desplegable -->
    <Teleport to="body">
      <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
      <div
        v-if="menuOpen"
        class="fixed z-50 bg-dark-card rounded-lg shadow-xl py-2 min-w-[180px] border border-gray-700"
        :style="menuPosition"
      >
        <div class="px-3 py-2 text-xs font-semibold text-secondary uppercase tracking-wider">
          Columnas
        </div>
        <button
          v-if="hasColumn('plays')"
          class="w-full px-3 py-2 text-left text-sm hover:bg-dark-hover flex items-center justify-between"
          @click="$emit('toggle-column', 'plays')"
        >
          <span>Reproducciones</span>
          <svg v-if="!hiddenColumns.includes('plays')" class="w-4 h-4 text-tiger-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <button
          v-if="hasColumn('album')"
          class="w-full px-3 py-2 text-left text-sm hover:bg-dark-hover flex items-center justify-between"
          @click="$emit('toggle-column', 'album')"
        >
          <span>Álbum</span>
          <svg v-if="!hiddenColumns.includes('album')" class="w-4 h-4 text-tiger-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <button
          v-if="hasColumn('dateAdded')"
          class="w-full px-3 py-2 text-left text-sm hover:bg-dark-hover flex items-center justify-between"
          @click="$emit('toggle-column', 'dateAdded')"
        >
          <span>Fecha en la que se añadió</span>
          <svg v-if="!hiddenColumns.includes('dateAdded')" class="w-4 h-4 text-tiger-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <button
          v-if="hasColumn('duration')"
          class="w-full px-3 py-2 text-left text-sm hover:bg-dark-hover flex items-center justify-between"
          @click="$emit('toggle-column', 'duration')"
        >
          <span>Duración</span>
          <svg v-if="!hiddenColumns.includes('duration')" class="w-4 h-4 text-tiger-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { SongListColumn } from '~/composables/useSongListColumns'

const props = defineProps<{
  columns: SongListColumn[]
  gridTemplateColumns: string
  hiddenColumns: string[]
}>()

defineEmits<{
  'toggle-column': [columnId: string]
}>()

const isHovering = ref(false)
const menuOpen = ref(false)
const menuPosition = ref({ top: '0px', right: '0px' })

// Columnas visibles
const visibleColumns = computed(() =>
  props.columns.filter(col => !props.hiddenColumns.includes(col.id))
)

// Verificar si una columna existe
const hasColumn = (id: string) => props.columns.some(c => c.id === id)

const toggleMenu = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  menuPosition.value = {
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`
  }
  menuOpen.value = !menuOpen.value
}
</script>
