<template>
  <div class="relative" ref="menuRef">
    <button
      @click.stop="toggleMenu"
      class="p-2 rounded-full hover:bg-dark-hover transition-colors"
      :class="{ 'bg-dark-hover': isOpen }"
      title="Más opciones"
    >
      <IconMoreVertical :size="20" class="text-secondary hover:text-primary" />
    </button>

    <transition
      enter-active-class="transition-all duration-100"
      leave-active-class="transition-all duration-100"
      enter-from-class="opacity-0 scale-95"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-56 bg-dark-card rounded-lg shadow-2xl border border-gray-700 z-50 overflow-hidden"
        :class="dropdownPosition"
      >
        <ul class="py-2">
          <li>
            <button
              @click.stop="handleAddToPlaylist"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-hover transition-colors text-left"
            >
              <IconPlus :size="18" />
              <span>Añadir a playlist</span>
            </button>
          </li>
          <li>
            <button
              @click.stop="handleToggleFavorite"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-hover transition-colors text-left"
            >
              <IconHeart :size="18" :filled="isFavorite" />
              <span>{{ isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos' }}</span>
            </button>
          </li>
          <li v-if="showRemove">
            <button
              @click.stop="handleRemove"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-hover transition-colors text-left text-red-400"
            >
              <IconClose :size="18" />
              <span>Quitar de esta playlist</span>
            </button>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  songId: string
  isFavorite?: boolean
  showRemove?: boolean
  dropdownPosition?: string
}>()

const emit = defineEmits<{
  addToPlaylist: []
  toggleFavorite: []
  remove: []
}>()

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleAddToPlaylist = () => {
  emit('addToPlaylist')
  isOpen.value = false
}

const handleToggleFavorite = () => {
  emit('toggleFavorite')
  isOpen.value = false
}

const handleRemove = () => {
  emit('remove')
  isOpen.value = false
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
