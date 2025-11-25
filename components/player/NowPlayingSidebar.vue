<template>
  <!-- Mobile: Fullscreen overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-300 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showNowPlaying && currentSong && isMobile"
        class="fixed inset-0 z-[60] bg-dark-base flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 class="text-lg font-bold">Reproduciendo</h2>
          <button
            @click="toggleNowPlaying"
            class="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Cover -->
          <div class="flex justify-center mb-6">
            <img
              :src="currentSong.cover"
              :alt="currentSong.title"
              class="w-64 h-64 object-cover rounded-lg shadow-2xl"
            />
          </div>

          <!-- Song Info -->
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold mb-2">{{ currentSong.title }}</h3>
            <NuxtLink
              :to="`/artist/${currentSong.artistId}`"
              class="text-tiger-500 hover:text-tiger-400 transition-colors text-lg"
              @click="toggleNowPlaying"
            >
              {{ currentSong.artistName }}
            </NuxtLink>
          </div>

          <!-- Lyrics -->
          <div class="bg-dark-card rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Letra</h4>
            <div v-if="currentSong.lyrics" class="text-gray-300 whitespace-pre-line leading-relaxed">
              {{ currentSong.lyrics }}
            </div>
            <p v-else class="text-gray-500 italic">Sin letra disponible</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Desktop: Sidebar -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-300 ease-in"
    enter-from-class="w-0 opacity-0"
    leave-to-class="w-0 opacity-0"
    enter-to-class="w-80 opacity-100"
    leave-from-class="w-80 opacity-100"
  >
    <aside
      v-if="showNowPlaying && currentSong && !isMobile"
      class="hidden md:flex w-80 bg-dark-lighter flex-col h-full border-l border-gray-800 overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
        <h2 class="text-sm font-bold uppercase tracking-wider text-gray-400">Reproduciendo</h2>
        <button
          @click="toggleNowPlaying"
          class="p-1 text-gray-400 hover:text-white transition-colors rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <!-- Cover -->
        <div class="p-4">
          <img
            :src="currentSong.cover"
            :alt="currentSong.title"
            class="w-full aspect-square object-cover rounded-lg shadow-xl"
          />
        </div>

        <!-- Song Info -->
        <div class="px-4 pb-4">
          <h3 class="text-lg font-bold truncate">{{ currentSong.title }}</h3>
          <NuxtLink
            :to="`/artist/${currentSong.artistId}`"
            class="text-tiger-500 hover:text-tiger-400 transition-colors text-sm"
          >
            {{ currentSong.artistName }}
          </NuxtLink>
        </div>

        <!-- Lyrics -->
        <div class="px-4 pb-6">
          <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Letra</h4>
          <div
            v-if="currentSong.lyrics"
            class="text-gray-300 whitespace-pre-line text-sm leading-relaxed"
          >
            {{ currentSong.lyrics }}
          </div>
          <p v-else class="text-gray-500 italic text-sm">Sin letra disponible</p>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
const { currentSong, showNowPlaying, toggleNowPlaying } = usePlayer()

// Detectar si es móvil
const isMobile = ref(false)

const checkMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkMobile)
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
