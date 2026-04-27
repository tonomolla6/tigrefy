<template>
  <div class="min-h-full bg-dark-base pb-20 md:pb-0">
    <MobileHeader :title="genre?.name || 'Género'" />

    <!-- Header de género (banda de color) -->
    <div
      v-if="genre"
      class="px-4 md:px-8 pt-6 pb-8"
      :style="{ backgroundColor: genreColor(genre.name) }"
    >
      <p class="text-xs uppercase tracking-wider text-white/80 mb-2">Género</p>
      <h1 class="text-3xl md:text-5xl font-bold text-white drop-shadow">{{ genre.name }}</h1>
      <p class="text-sm text-white/80 mt-2">
        {{ totalCount }} resultado{{ totalCount === 1 ? '' : 's' }}
      </p>
    </div>

    <div class="px-4 md:px-8 py-6 space-y-10">
      <!-- Skeleton mientras carga -->
      <div v-if="pending" class="space-y-10">
        <section>
          <div class="h-7 w-32 bg-white/10 rounded animate-pulse mb-4"></div>
          <CardGridSkeleton :count="12" shape="square" />
        </section>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-secondary text-sm py-12 text-center">
        No se pudo cargar el género.
      </div>

      <template v-else-if="data">
        <!-- Canciones -->
        <section v-if="data.songs.length > 0">
          <h2 class="text-xl md:text-2xl font-bold mb-4">Canciones</h2>
          <SongList
            :songs="data.songs"
            preset="songs"
            :context-type="'genre'"
            :context-id="String(data.genre.id)"
          />
        </section>

        <!-- Álbumes -->
        <section v-if="data.albums.length > 0">
          <h2 class="text-xl md:text-2xl font-bold mb-4">Álbumes</h2>
          <div class="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 items-start">
            <NuxtLink
              v-for="album in data.albums"
              :key="album.id"
              :to="`/album/${album.id}`"
              class="group/card p-3 rounded-md hover:bg-[#1a1a1a] transition-all duration-300 cursor-pointer block"
            >
              <SecureImage
                :src="album.cover"
                :alt="album.title"
                class="w-full aspect-square rounded-md shadow-md mb-3"
              />
              <h3 class="font-bold text-base text-white mb-1 line-clamp-2">{{ album.title }}</h3>
              <p class="text-sm text-secondary truncate">{{ album.artistName }}</p>
            </NuxtLink>
          </div>
        </section>

        <!-- Artistas -->
        <section v-if="data.artists.length > 0">
          <h2 class="text-xl md:text-2xl font-bold mb-4">Artistas</h2>
          <div class="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 items-start">
            <NuxtLink
              v-for="artist in data.artists"
              :key="artist.id"
              :to="`/artist/${artist.id}`"
              class="group/card p-3 rounded-md hover:bg-[#1a1a1a] transition-all duration-300 cursor-pointer block text-center"
            >
              <SecureImage
                :src="artist.image"
                :alt="artist.name"
                class="w-full aspect-square rounded-full shadow-md mb-3"
              />
              <h3 class="font-bold text-base text-white truncate">{{ artist.name }}</h3>
              <p class="text-sm text-secondary">Artista</p>
            </NuxtLink>
          </div>
        </section>

        <!-- Vacío -->
        <div
          v-if="data.songs.length === 0 && data.albums.length === 0 && data.artists.length === 0"
          class="text-secondary text-sm py-12 text-center"
        >
          Este género no tiene contenido visible.
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GenreDetail {
  genre: { id: number; name: string }
  songs: any[]
  albums: any[]
  artists: any[]
}

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const id = computed(() => String(route.params.id))

const { data, pending, error } = await useFetch<GenreDetail>(
  () => `/api/genres/${id.value}`,
  { credentials: 'include', watch: [id] }
)

const genre = computed(() => data.value?.genre || null)
const totalCount = computed(() => {
  if (!data.value) return 0
  return data.value.songs.length + data.value.albums.length + data.value.artists.length
})

function genreColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xfffffff
  }
  const palette = [
    '#7e57c2', '#26a69a', '#ef5350', '#ec407a',
    '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc',
    '#5c6bc0', '#26c6da', '#9ccc65', '#ff7043',
  ]
  return palette[Math.abs(hash) % palette.length]
}
</script>
