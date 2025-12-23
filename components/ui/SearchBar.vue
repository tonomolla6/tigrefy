<template>
  <div class="relative flex-1 max-w-[480px]">
    <input
      ref="searchInput"
      v-model="searchQuery"
      type="text"
      placeholder="¿Qué quieres reproducir?"
      class="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-white placeholder-[#a7a7a7] rounded-full h-12 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
      @input="handleInput"
      @keydown.escape="clearSearch"
    />
    <IconSearch :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" :class="isSearchPage ? 'text-white' : 'text-[#a7a7a7]'" />

    <!-- Botón explorar (navega a /search) -->
    <button
      v-if="!searchQuery"
      @click="goToExplore"
      class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center hover:text-white transition-colors"
      :class="isSearchPage ? 'text-white' : 'text-[#a7a7a7]'"
      title="Explorar"
    >
      <!-- Icono de explorar/browse como Spotify -->
      <svg class="w-5 h-5" viewBox="0 0 24 24" :fill="isSearchPage ? 'currentColor' : 'none'" stroke="currentColor" :stroke-width="isSearchPage ? 0 : 1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    </button>

    <!-- Botón limpiar (cuando hay texto) -->
    <button
      v-else
      @click="clearSearch"
      class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-[#a7a7a7] hover:text-white transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const searchInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const isSearchPage = computed(() => route.path === '/search')

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_DELAY = 300

// Sincronizar con la URL al montar
onMounted(() => {
  if (route.path === '/search' && route.query.q) {
    searchQuery.value = route.query.q as string
  }
})

// Observar cambios en la ruta para sincronizar el input
watch(() => route.query.q, (newQuery) => {
  if (route.path === '/search') {
    searchQuery.value = (newQuery as string) || ''
  }
})

// Limpiar el input cuando salimos de /search
watch(() => route.path, (newPath) => {
  if (newPath !== '/search') {
    searchQuery.value = ''
  }
})

const goToExplore = () => {
  router.push('/search')
}

const handleInput = () => {
  // Clear previous timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Debounce la actualización de la URL
  debounceTimer = setTimeout(() => {
    navigateToSearch()
  }, DEBOUNCE_DELAY)
}

const navigateToSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    })
  } else if (route.path === '/search') {
    // Si está vacío y ya estamos en /search, quitar el query
    router.push('/search')
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  if (route.path === '/search') {
    router.push('/search')
  }
  searchInput.value?.focus()
}

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>
