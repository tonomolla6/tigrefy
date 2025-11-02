<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-75"
        @click="handleClose"
      >
        <transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="bg-dark-highlight rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform"
            @click.stop
          >
            <!-- Header -->
            <div class="p-4 md:p-6 border-b border-gray-700">
              <h2 class="text-xl md:text-2xl font-bold">Crear Playlist</h2>
              <p class="text-secondary mt-1 text-sm md:text-base">Personaliza tu nueva playlist</p>
            </div>

            <!-- Form -->
            <div class="p-4 md:p-6 space-y-4 md:space-y-5">
              <!-- Cover Picker Preview -->
              <div class="flex justify-center">
                <div class="relative group cursor-pointer" @click="showingCoverPicker = true">
                  <img
                    :src="selectedCover"
                    alt="Portada"
                    class="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
                  />
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                    <span class="text-xs md:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center">
                      Cambiar portada
                    </span>
                  </div>
                </div>
              </div>

              <!-- Cover Picker (inline) -->
              <div v-if="showingCoverPicker" class="space-y-3">
                <h3 class="text-xs md:text-sm font-semibold text-secondary">Selecciona una portada:</h3>
                <div class="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                  <button
                    v-for="cover in availableCovers"
                    :key="cover"
                    @click="selectedCover = cover; showingCoverPicker = false"
                    class="relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105"
                    :class="selectedCover === cover ? 'border-tiger-500' : 'border-transparent'"
                  >
                    <img :src="cover" alt="Cover option" class="w-full h-full object-cover" />
                  </button>
                </div>
              </div>

              <!-- Name Input -->
              <div>
                <label class="block text-sm font-semibold mb-2">Nombre de la playlist</label>
                <input
                  v-model="playlistName"
                  type="text"
                  placeholder="Mi playlist favorita"
                  maxlength="50"
                  class="w-full bg-dark-base border border-gray-700 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-tiger-500 transition-colors"
                  @keyup.enter="handleCreate"
                  ref="nameInput"
                />
                <p class="text-xs text-secondary mt-1">{{ playlistName.length }}/50 caracteres</p>
              </div>

              <!-- Description Input -->
              <div>
                <label class="block text-sm font-semibold mb-2">Descripción (opcional)</label>
                <textarea
                  v-model="playlistDescription"
                  placeholder="Añade una descripción..."
                  maxlength="200"
                  rows="3"
                  class="w-full bg-dark-base border border-gray-700 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-tiger-500 transition-colors resize-none"
                ></textarea>
                <p class="text-xs text-secondary mt-1">{{ playlistDescription.length }}/200 caracteres</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-4 md:p-6 border-t border-gray-700 flex gap-2 md:gap-3 justify-end">
              <button
                @click="handleClose"
                class="px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-secondary hover:text-primary hover:bg-dark-hover transition-all text-sm md:text-base"
              >
                Cancelar
              </button>
              <button
                @click="handleCreate"
                :disabled="!playlistName.trim()"
                class="btn-tiger px-6 md:px-8 py-2 md:py-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                Crear
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  create: [name: string, description: string, cover: string]
}>()

const playlistName = ref('')
const playlistDescription = ref('')
const selectedCover = ref('/covers/airbeat-cecot.png')
const showingCoverPicker = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

// Available cover options
const availableCovers = ref([
  '/covers/airbeat-cecot.png',
  '/covers/omar-en-altura.jpg',
  '/covers/omar-soltero.png',
  '/favicon.png'
])

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    playlistName.value = ''
    playlistDescription.value = ''
    selectedCover.value = '/covers/airbeat-cecot.png'
    showingCoverPicker.value = false
    nextTick(() => {
      nameInput.value?.focus()
    })
  }
})

const handleClose = () => {
  emit('close')
}

const handleCreate = () => {
  if (playlistName.value.trim()) {
    emit('create', playlistName.value.trim(), playlistDescription.value.trim(), selectedCover.value)
    handleClose()
  }
}
</script>
