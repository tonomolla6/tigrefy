<template>
  <BottomSheet :isOpen="isOpen" @close="$emit('close')">
    <!-- Header con info de la canción -->
    <template #header>
      <div class="flex items-center gap-3">
        <SecureImage
          :src="song?.cover"
          :alt="song?.title"
          class="w-12 h-12 rounded"
        />
        <div class="min-w-0 flex-1">
          <p class="text-white font-semibold truncate">{{ song?.title }}</p>
          <p class="text-white/60 text-sm truncate">{{ song?.artistName }}</p>
        </div>
      </div>
    </template>

    <!-- Acciones -->
    <div class="py-2">
      <!-- Añadir a favoritos -->
      <button
        @click="handleToggleFavorite"
        class="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <IconHeart :size="24" :filled="isFavorite" :class="isFavorite ? 'text-tiger-500' : 'text-white'" />
        <span class="text-white">{{ isFavorite ? 'Quitar de Me gusta' : 'Añadir a Me gusta' }}</span>
      </button>

      <!-- Añadir a playlist -->
      <button
        @click="handleAddToPlaylist"
        class="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <IconPlus :size="24" class="text-white" />
        <span class="text-white">Añadir a playlist</span>
      </button>

      <!-- Añadir a la cola -->
      <button
        @click="handleAddToQueue"
        class="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span class="text-white">Añadir a la cola</span>
      </button>

      <!-- Separador -->
      <div class="h-px bg-white/10 my-2" />

      <!-- Ir al álbum -->
      <NuxtLink
        v-if="song?.albumId"
        :to="`/album/${song.albumId}`"
        @click="$emit('close')"
        class="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <span class="text-white">Ir al álbum</span>
      </NuxtLink>

      <!-- Ir al artista -->
      <NuxtLink
        v-if="song?.artistId"
        :to="`/artist/${song.artistId}`"
        @click="$emit('close')"
        class="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-white">Ir al artista</span>
      </NuxtLink>

      <!-- Separador -->
      <div class="h-px bg-white/10 my-2" />

      <!-- Compartir (placeholder) -->
      <button
        @click="handleShare"
        class="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span class="text-white">Compartir</span>
      </button>
    </div>

    <!-- Add to Playlist Modal -->
    <AddToPlaylistModal
      v-if="song"
      :isOpen="showAddToPlaylistModal"
      :songId="song.id"
      :songTitle="song.title"
      @close="showAddToPlaylistModal = false; $emit('close')"
    />
  </BottomSheet>
</template>

<script setup lang="ts">
interface Song {
  id: string
  title: string
  artistName: string
  artistId?: string
  albumId?: string
  cover?: string
}

const props = defineProps<{
  isOpen: boolean
  song: Song | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { toggleFavoriteSong, isFavoriteSong } = useFavorites()
const { addToQueue } = usePlayer()
const { showToast } = useToast()

const showAddToPlaylistModal = ref(false)

const isFavorite = computed(() => {
  if (!props.song) return false
  return isFavoriteSong(props.song.id)
})

const handleToggleFavorite = () => {
  if (!props.song) return
  toggleFavoriteSong(props.song.id)
  emit('close')
}

const handleAddToPlaylist = () => {
  showAddToPlaylistModal.value = true
}

const handleAddToQueue = () => {
  if (!props.song) return
  addToQueue(props.song as any)
  showToast('Añadido a la cola', 'success')
  emit('close')
}

const handleShare = async () => {
  if (!props.song) return

  if (navigator.share) {
    try {
      await navigator.share({
        title: props.song.title,
        text: `Escucha "${props.song.title}" de ${props.song.artistName} en Tigrefy`,
        url: window.location.origin + (props.song.albumId ? `/album/${props.song.albumId}` : '/')
      })
    } catch (e) {
      // User cancelled or error
    }
  } else {
    // Fallback: copy to clipboard
    const url = window.location.origin + (props.song.albumId ? `/album/${props.song.albumId}` : '/')
    await navigator.clipboard.writeText(url)
    showToast('Enlace copiado', 'success')
  }
  emit('close')
}
</script>
