<template>
  <aside
    v-if="showNowPlaying && currentSong"
    class="shrink-0 bg-dark-lighter flex flex-col h-full border-l border-gray-800 overflow-hidden overflow-y-auto"
    style="width: 320px;"
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
</template>

<script setup lang="ts">
const { currentSong, showNowPlaying, toggleNowPlaying } = usePlayer()
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
