<template>
  <header class="md:hidden sticky top-0 z-20 bg-dark-base px-3 py-2 shadow-md shadow-black/40">
    <div class="flex items-center gap-2">
      <!-- Avatar de usuario con menú (izquierda) -->
      <button
        @click="openMenu"
        class="flex items-center p-0.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
      >
        <div class="w-7 h-7 rounded-full bg-tiger-600 flex items-center justify-center text-white font-bold text-xs">
          {{ userInitial }}
        </div>
      </button>

      <!-- Título o contenido -->
      <div class="flex-1 min-w-0">
        <slot name="left">
          <h1 v-if="title" class="text-lg font-bold truncate">{{ title }}</h1>
        </slot>
      </div>
    </div>

    <!-- Contenido debajo del título (pills, filtros, etc) -->
    <div v-if="$slots.below" class="mt-2">
      <slot name="below" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()

const { user } = useAuth()

// Estado global del menú lateral
const mobileMenuOpen = useState('mobileMenuOpen', () => false)

const userName = computed(() => {
  return user.value?.displayName || user.value?.username || 'Usuario'
})

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

const openMenu = () => {
  mobileMenuOpen.value = true
}
</script>
