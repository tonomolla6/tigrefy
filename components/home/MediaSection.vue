<template>
  <section class="relative group/scroller">
    <!-- Header de sección -->
    <div class="flex items-center justify-between mb-1">
      <NuxtLink
        v-if="showAllLink"
        :to="showAllLink"
        class="text-xl md:text-2xl font-bold hover:underline cursor-pointer"
      >
        {{ title }}
      </NuxtLink>
      <h2 v-else class="text-xl md:text-2xl font-bold">
        {{ title }}
      </h2>
      <NuxtLink
        v-if="showAllLink"
        :to="showAllLink"
        class="text-sm font-semibold text-secondary hover:text-primary hover:underline transition-colors"
      >
        Mostrar todos
      </NuxtLink>
    </div>

    <!-- Botón navegación izquierda -->
    <button
      v-show="canScrollLeft"
      @click="scrollLeft"
      class="absolute left-0 top-1/2 mt-4 -translate-y-1/2 z-10
             bg-dark-card/90 hover:bg-dark-hover rounded-full p-2
             opacity-0 group-hover/scroller:opacity-100 transition-opacity duration-200
             shadow-lg hidden md:flex items-center justify-center"
      aria-label="Scroll izquierda"
    >
      <IconChevronLeft :size="24" />
    </button>

    <!-- Botón navegación derecha -->
    <button
      v-show="canScrollRight"
      @click="scrollRight"
      class="absolute right-0 top-1/2 mt-4 -translate-y-1/2 z-10
             bg-dark-card/90 hover:bg-dark-hover rounded-full p-2
             opacity-0 group-hover/scroller:opacity-100 transition-opacity duration-200
             shadow-lg hidden md:flex items-center justify-center"
      aria-label="Scroll derecha"
    >
      <IconChevronRight :size="24" />
    </button>

    <!-- Contenedor scroll -->
    <div
      ref="scrollContainer"
      class="-mx-3 px-3 flex items-start gap-0 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2"
      @scroll="updateScrollState"
    >
      <!-- Álbumes -->
      <template v-if="type === 'albums'">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="`/album/${item.id}`"
          class="group/card p-3 rounded-md bg-transparent hover:bg-[#1a1a1a]
                 transition-all duration-300 cursor-pointer w-[200px] flex-shrink-0
                 snap-start block first:-ml-3"
        >
          <div class="relative mb-3">
            <img
              :src="item.cover"
              :alt="item.title"
              class="w-full aspect-square object-cover rounded-md shadow-md"
            />
            <CardPlayButton
              :is-playing="isCurrentlyPlaying(item)"
              :is-visible="isCurrentContext(item)"
              :aria-label="`Reproducir ${item.title}`"
              @click="handlePlay(item)"
            />
          </div>
          <h3 class="font-bold text-base text-white mb-1 line-clamp-2">{{ item.title }}</h3>
          <!-- Desktop: link clickeable -->
          <NuxtLink
            :to="`/artist/${item.artistId}`"
            class="hidden md:block text-sm text-[#a7a7a7] truncate hover:text-white hover:underline transition-colors"
            @click.stop
          >
            {{ item.artistName }}
          </NuxtLink>
          <!-- Mobile: solo texto -->
          <span class="md:hidden text-sm text-[#a7a7a7] truncate block">
            {{ item.artistName }}
          </span>
        </NuxtLink>
      </template>

      <!-- Playlists -->
      <template v-else-if="type === 'playlists'">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="`/playlist/${item.id}`"
          class="group/card p-3 rounded-md bg-transparent hover:bg-[#1a1a1a]
                 transition-all duration-300 cursor-pointer w-[200px] flex-shrink-0
                 snap-start block first:-ml-3"
        >
          <div class="relative mb-3">
            <img
              :src="item.cover || '/covers/default-playlist.png'"
              :alt="item.name"
              class="w-full aspect-square object-cover rounded-md shadow-md"
            />
            <CardPlayButton
              :is-playing="isCurrentlyPlaying(item)"
              :is-visible="isCurrentContext(item)"
              :aria-label="`Reproducir ${item.name}`"
              @click="handlePlay(item)"
            />
          </div>
          <h3 class="font-bold text-base text-white mb-1 line-clamp-2">{{ item.name }}</h3>
          <p class="text-sm text-[#a7a7a7] line-clamp-2">{{ item.description || 'Playlist' }}</p>
        </NuxtLink>
      </template>

      <!-- Artists -->
      <template v-else-if="type === 'artists'">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="`/artist/${item.id}`"
          class="group/card p-3 rounded-md bg-transparent hover:bg-[#1a1a1a]
                 transition-all duration-300 cursor-pointer w-[200px] flex-shrink-0
                 snap-start block first:-ml-3"
        >
          <div class="relative mb-3">
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full aspect-square object-cover rounded-full shadow-md"
            />
          </div>
          <h3 class="font-bold text-base text-white mb-1 text-center truncate">{{ item.name }}</h3>
          <p class="text-sm text-[#a7a7a7] text-center">Artista</p>
        </NuxtLink>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  type: 'albums' | 'playlists' | 'artists'
  items: any[]
  showAllLink?: string
}>()

const { playSong, playbackContext, isPlaying, togglePlay } = usePlayer()
const { data, getSongsByIds } = useData()
const { addToRecent } = useRecentlyPlayed()

const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const SCROLL_AMOUNT = 400

const updateScrollState = () => {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 10
}

const scrollLeft = () => {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' })
}

const scrollRight = () => {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
}

const isCurrentContext = (item: any) => {
  return playbackContext.value.type === props.type.slice(0, -1) && playbackContext.value.id === item.id
}

const isCurrentlyPlaying = (item: any) => {
  return isCurrentContext(item) && isPlaying.value
}

const getSongsByAlbumId = (albumId: string) => {
  return (data.value.songs || []).filter((song: any) => song.albumId === albumId)
}

const handlePlay = (item: any) => {
  if (isCurrentContext(item)) {
    togglePlay()
    return
  }

  if (props.type === 'albums') {
    const songs = getSongsByAlbumId(item.id)
    if (songs.length > 0) {
      playSong(songs[0], songs, { type: 'album', id: item.id })
      addToRecent({
        type: 'album',
        id: item.id,
        cover: item.cover,
        title: item.title,
        artistName: item.artistName
      })
    }
  } else if (props.type === 'playlists') {
    const songs = getSongsByIds(item.songIds || [])
    if (songs.length > 0) {
      playSong(songs[0], songs, { type: 'playlist', id: item.id })
    }
  }
}

onMounted(() => {
  updateScrollState()
})
</script>
