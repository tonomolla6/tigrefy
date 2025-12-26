<template>
  <div class="h-full flex flex-col relative overflow-hidden">
    <!-- Si no hay canción -->
    <div v-if="!currentSong" class="flex-1 flex items-center justify-center">
      <p class="text-white/50">No hay ninguna canción reproduciéndose</p>
    </div>

    <!-- Si no tiene letra -->
    <div v-else-if="!currentSong.lyrics" class="flex-1 flex items-center justify-center">
      <p class="text-white/50">Esta canción no tiene letra disponible</p>
    </div>

    <!-- Vista de letras -->
    <template v-else>
      <!-- Fondo con gradiente basado en la portada -->
      <div class="absolute inset-0 overflow-hidden">
        <img
          v-if="currentSong.cover"
          :src="currentSong.cover"
          class="absolute inset-0 w-full h-full object-cover blur-3xl scale-150 opacity-40"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />
      </div>

      <!-- Letras con scroll -->
      <CustomScrollbar
        class="relative flex-1 min-h-0"
      >
        <div class="max-w-3xl mx-auto px-6 md:px-12 lg:px-20 py-8">
          <div
            v-for="(line, index) in lyricsLines"
            :key="index"
            class="lyrics-line py-2 transition-all duration-300"
            :class="[
              line.trim() === '' ? 'h-6' : 'cursor-pointer hover:text-white',
              'text-white/50'
            ]"
          >
            <p
              v-if="line.trim() !== ''"
              class="text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed"
            >
              {{ line }}
            </p>
          </div>
        </div>
      </CustomScrollbar>
    </template>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { currentSong, showLyrics } = usePlayer()

// Marcar showLyrics como true al entrar a la página
onMounted(() => {
  showLyrics.value = true
})

// Marcar showLyrics como false al salir de la página
onUnmounted(() => {
  showLyrics.value = false
})

// Dividir las letras en líneas
const lyricsLines = computed(() => {
  if (!currentSong.value?.lyrics) return []
  return currentSong.value.lyrics.split('\n')
})

// Si no hay canción, volver atrás
watch(currentSong, (song) => {
  if (!song) {
    router.back()
  }
}, { immediate: true })
</script>

