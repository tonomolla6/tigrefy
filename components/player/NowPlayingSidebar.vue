<template>
  <aside
    v-if="showNowPlaying && currentSong"
    class="hidden md:flex shrink-0 bg-dark-card flex-col h-full overflow-hidden m-2 ml-2 mb-0 rounded-lg"
    style="width: 340px;"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4">
      <h2 class="text-base font-bold">{{ currentSong.albumName || currentSong.title }}</h2>
      <button
        @click="toggleNowPlaying"
        aria-label="Cerrar"
        class="p-1.5 text-gray-400 hover:text-white hover:bg-dark-hover transition-colors rounded-full"
      >
        <IconClose :size="20" />
      </button>
    </div>

    <!-- Content -->
    <CustomScrollbar class="flex-1 min-h-0 px-4 pb-4">
      <!-- Cover -->
      <div class="mb-4">
        <SecureImage
          :src="currentSong.cover"
          :alt="currentSong.title"
          class="w-full aspect-square object-cover rounded-lg shadow-xl"
        />
      </div>

      <!-- Song Info -->
      <div class="mb-6">
        <h3 class="text-xl font-bold truncate">{{ currentSong.title }}</h3>
        <NuxtLink
          :to="`/artist/${currentSong.artistId}`"
          class="text-gray-400 hover:text-white hover:underline transition-colors text-sm"
        >
          {{ currentSong.artistName }}
        </NuxtLink>
      </div>

      <!-- About the Artist -->
      <div v-if="currentArtist" class="mb-6">
        <h4 class="text-sm font-bold mb-3">Información sobre el artista</h4>
        <NuxtLink
          :to="`/artist/${currentArtist.id}`"
          class="block bg-dark-hover rounded-lg overflow-hidden hover:bg-gray-700/50 transition-colors"
        >
          <div class="relative">
            <SecureImage
              :src="currentArtist.image"
              :alt="currentArtist.name"
              class="w-full h-48 object-cover"
            />
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p class="font-bold text-lg">{{ currentArtist.name }}</p>
              <p class="text-xs text-gray-300">{{ formatFollowers(currentArtist.followers) }} oyentes mensuales</p>
            </div>
          </div>
          <div v-if="currentArtist.bio" class="p-4">
            <p class="text-sm text-gray-400 line-clamp-3">{{ currentArtist.bio }}</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Lyrics -->
      <div v-if="currentSong.lyrics" class="mb-6">
        <h4 class="text-sm font-bold mb-3">Letra</h4>
        <div class="bg-gradient-to-b from-indigo-900/30 to-purple-900/30 rounded-lg p-4">
          <p class="text-gray-300 whitespace-pre-line text-sm leading-relaxed line-clamp-[12]">
            {{ currentSong.lyrics }}
          </p>
          <button
            @click="toggleLyrics"
            class="mt-3 text-xs font-semibold text-white hover:underline"
          >
            Mostrar más
          </button>
        </div>
      </div>
    </CustomScrollbar>
  </aside>
</template>

<script setup lang="ts">
const { currentSong, showNowPlaying, toggleNowPlaying, toggleLyrics } = usePlayer()
const { artists } = useData()

const currentArtist = computed(() => {
  if (!currentSong.value) return null
  return artists.value.find(a => a.id === currentSong.value?.artistId)
})

const formatFollowers = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + ' M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + ' mil'
  }
  return num.toString()
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-\[12\] {
  display: -webkit-box;
  -webkit-line-clamp: 12;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
