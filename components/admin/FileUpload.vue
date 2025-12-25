<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm text-gray-400">{{ label }}</label>

    <!-- Zona de drop -->
    <div
      class="relative border-2 border-dashed rounded-lg p-4 transition-colors"
      :class="[
        isDragging ? 'border-tiger-500 bg-tiger-500/10' : 'border-gray-600 hover:border-gray-500'
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <!-- Preview -->
      <div v-if="previewUrl || modelValue" class="flex items-center gap-4">
        <div v-if="type !== 'audio'" class="flex-shrink-0">
          <img
            :src="previewUrl || modelValue"
            class="w-16 h-16 rounded object-cover"
            :class="{ 'rounded-full': type === 'artist' }"
          />
        </div>
        <div v-else class="flex-shrink-0 w-16 h-16 bg-dark-hover rounded flex items-center justify-center">
          <svg class="w-8 h-8 text-tiger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white text-sm truncate">{{ fileName || 'Archivo seleccionado' }}</p>
          <p v-if="fileSize" class="text-gray-400 text-xs">{{ formatSize(fileSize) }}</p>
          <p v-if="pendingFile" class="text-tiger-400 text-xs">Se subirá al guardar</p>
          <button
            type="button"
            @click="clearFile"
            class="text-red-400 text-xs hover:text-red-300 mt-1"
          >
            Eliminar
          </button>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-4">
        <input
          ref="fileInput"
          type="file"
          :accept="acceptTypes"
          class="hidden"
          @change="handleFileSelect"
        />
        <svg v-if="type === 'audio'" class="w-10 h-10 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <svg v-else class="w-10 h-10 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-400 text-sm mb-2">
          Arrastra {{ type === 'audio' ? 'un archivo de audio' : 'una imagen' }} aquí
        </p>
        <button
          type="button"
          @click="fileInput?.click()"
          class="px-4 py-1.5 bg-dark-hover text-white text-sm rounded-full hover:bg-gray-700 transition-colors"
        >
          Seleccionar archivo
        </button>
      </div>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-red-400 text-xs">{{ error }}</p>

    <!-- Opción de URL manual -->
    <div v-if="allowManualUrl && !pendingFile" class="flex items-center gap-2 mt-2">
      <span class="text-gray-500 text-xs">o</span>
      <input
        v-model="manualUrl"
        type="text"
        :placeholder="placeholder"
        class="flex-1 bg-dark-hover text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-tiger-500"
        @input="handleManualUrl"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  type?: 'cover' | 'artist' | 'audio'
  label?: string
  placeholder?: string
  allowManualUrl?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'file-selected': [file: File]
  'duration-detected': [seconds: number]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const error = ref('')
const previewUrl = ref('')
const fileName = ref('')
const fileSize = ref(0)
const manualUrl = ref(props.modelValue || '')
const pendingFile = ref<File | null>(null)

const type = computed(() => props.type || 'cover')

const acceptTypes = computed(() => {
  if (type.value === 'audio') {
    return 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/m4a,.mp3,.wav,.ogg,.m4a'
  }
  return 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif'
})

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    selectFile(files[0])
  }
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectFile(input.files[0])
  }
}

const selectFile = (file: File) => {
  error.value = ''

  // Validar tamaño (máx 50MB para audio, 5MB para imágenes)
  const maxSize = type.value === 'audio' ? 50 * 1024 * 1024 : 5 * 1024 * 1024
  if (file.size > maxSize) {
    error.value = `El archivo es demasiado grande. Máximo: ${type.value === 'audio' ? '50MB' : '5MB'}`
    return
  }

  // Guardar archivo pendiente (no subir todavía)
  pendingFile.value = file
  fileName.value = file.name
  fileSize.value = file.size

  // Crear preview para imágenes o detectar duración para audio
  if (type.value !== 'audio') {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    // Detectar duración del audio
    const audioUrl = URL.createObjectURL(file)
    const audio = new Audio()
    audio.src = audioUrl
    audio.addEventListener('loadedmetadata', () => {
      const duration = Math.round(audio.duration)
      emit('duration-detected', duration)
      URL.revokeObjectURL(audioUrl)
    })
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(audioUrl)
    })
  }

  // Emitir evento con el archivo para que el padre lo suba cuando guarde
  emit('file-selected', file)
  // Limpiar URL manual y modelo (se actualizará después de subir)
  manualUrl.value = ''
  emit('update:modelValue', '')
}

// Función pública para subir el archivo pendiente
const uploadPendingFile = async (): Promise<string | null> => {
  if (!pendingFile.value) {
    return props.modelValue || null
  }

  const formData = new FormData()
  formData.append('file', pendingFile.value)
  formData.append('type', type.value)

  try {
    const response = await $fetch<{ success: boolean; url: string; fileName: string; size: number }>('/api/admin/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })

    if (response.success) {
      pendingFile.value = null
      emit('update:modelValue', response.url)
      return response.url
    }
    return null
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Error al subir el archivo'
    return null
  }
}

// Exponer función para que el padre pueda llamarla
defineExpose({
  uploadPendingFile,
  hasPendingFile: () => !!pendingFile.value
})

const clearFile = () => {
  emit('update:modelValue', '')
  previewUrl.value = ''
  fileName.value = ''
  fileSize.value = 0
  manualUrl.value = ''
  pendingFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleManualUrl = () => {
  emit('update:modelValue', manualUrl.value)
  if (type.value !== 'audio' && manualUrl.value) {
    previewUrl.value = manualUrl.value
  }
  pendingFile.value = null
}

// Sincronizar con valor externo
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal !== manualUrl.value && !pendingFile.value) {
    manualUrl.value = newVal
    if (type.value !== 'audio') {
      previewUrl.value = newVal
    }
  }
})
</script>
