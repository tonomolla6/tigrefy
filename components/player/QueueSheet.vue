<template>
  <transition
    enter-active-class="transition-transform duration-300"
    leave-active-class="transition-transform duration-300"
    enter-from-class="translate-y-full"
    leave-to-class="translate-y-full"
  >
    <div
      v-if="isOpen"
      class="absolute inset-0 bg-dark-card flex flex-col z-10"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <h3 class="text-lg font-bold text-white">Cola de reproducción</h3>
        <button
          @click="$emit('close')"
          class="p-2 text-white/70 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenido -->
      <div class="flex-1 overflow-y-auto">
        <!-- Reproduciendo ahora -->
        <div v-if="currentSong" class="px-4 py-3 border-b border-white/10">
          <p class="text-xs text-white/40 uppercase tracking-wider mb-2">Reproduciendo ahora</p>
          <div class="flex items-center gap-3">
            <img
              :src="currentSong.cover || '/covers/default.png'"
              :alt="currentSong.title"
              class="w-12 h-12 rounded object-cover"
            />
            <div class="min-w-0 flex-1">
              <p class="text-white font-medium truncate">{{ currentSong.title }}</p>
              <NuxtLink
                :to="`/artist/${currentSong.artistId}`"
                @click.stop="$emit('close')"
                class="text-white/60 text-sm truncate block hover:text-white hover:underline transition-colors"
              >
                {{ currentSong.artistName }}
              </NuxtLink>
            </div>
            <!-- Playing indicator -->
            <div class="flex items-end gap-0.5 h-4">
              <span class="w-1 bg-tiger-500 rounded-full animate-pulse" style="height: 40%; animation-delay: 0ms;"></span>
              <span class="w-1 bg-tiger-500 rounded-full animate-pulse" style="height: 70%; animation-delay: 150ms;"></span>
              <span class="w-1 bg-tiger-500 rounded-full animate-pulse" style="height: 50%; animation-delay: 300ms;"></span>
            </div>
          </div>
        </div>

        <!-- Siguiente en la cola -->
        <div v-if="upcomingSongs.length > 0" class="px-4 py-3">
          <p class="text-xs text-white/40 uppercase tracking-wider mb-2">Siguiente</p>
          <div class="space-y-1">
            <div
              v-for="(song, index) in upcomingSongs"
              :key="`${song.id}-${index}`"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span class="text-white/40 text-sm w-5 text-center">{{ index + 1 }}</span>
              <img
                :src="song.cover || '/covers/default.png'"
                :alt="song.title"
                class="w-10 h-10 rounded object-cover"
              />
              <div class="min-w-0 flex-1">
                <p class="text-white text-sm font-medium truncate">{{ song.title }}</p>
                <p class="text-white/60 text-xs truncate">{{ song.artistName }}</p>
              </div>
              <span class="text-white/40 text-xs">{{ formatDuration(song.duration) }}</span>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="flex flex-col items-center justify-center py-16 px-8">
          <svg class="w-16 h-16 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p class="text-white/60 text-center">No hay más canciones en la cola</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  close: []
}>()

const { currentSong, queue, currentIndex } = usePlayer()

const upcomingSongs = computed(() => {
  if (!queue.value || currentIndex.value === undefined) return []
  return queue.value.slice(currentIndex.value + 1)
})

const formatDuration = (seconds: number) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}
.animate-pulse {
  animation: pulse 0.8s ease-in-out infinite;
}
</style>
