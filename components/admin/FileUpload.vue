<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm text-white/70">{{ label }}</label>

    <!-- Zona de drop -->
    <div
      class="relative border-2 border-dashed rounded-lg p-4 transition-colors"
      :class="[
        isDragging ? 'border-tiger-500 bg-tiger-500/10' : 'border-white/10 hover:border-white/20'
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <!-- Preview con archivo -->
      <div v-if="previewUrl || pendingFile || modelValue" class="flex items-center gap-3">
        <div v-if="type !== 'audio'" class="flex-shrink-0">
          <img
            :src="resolvedPreviewSrc"
            class="w-14 h-14 rounded object-cover"
            :class="{ 'rounded-full': type === 'artist' }"
          />
        </div>
        <div v-else class="flex-shrink-0 w-14 h-14 bg-tiger-500/15 rounded flex items-center justify-center">
          <svg class="w-7 h-7 text-tiger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white text-sm truncate">{{ fileName || 'Archivo seleccionado' }}</p>
          <p v-if="fileSize" class="text-white/50 text-xs">{{ formatSize(fileSize) }}</p>
          <p v-if="pendingFile && !progress" class="text-tiger-400 text-xs">Se procesará al guardar</p>
        </div>
        <button
          v-if="!progress"
          type="button"
          @click="clearFile"
          class="flex-shrink-0 w-8 h-8 rounded-full text-white/50 hover:text-red-400 hover:bg-white/5 flex items-center justify-center transition-colors"
          aria-label="Eliminar"
        >
          <IconClose :size="16" />
        </button>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center py-3">
        <input
          ref="fileInput"
          type="file"
          :accept="acceptTypes"
          class="hidden"
          @change="handleFileSelect"
        />
        <svg v-if="type === 'audio'" class="w-9 h-9 text-white/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <svg v-else class="w-9 h-9 text-white/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-white/60 text-sm mb-2">
          Arrastra {{ type === 'audio' ? 'un MP3' : 'una imagen' }} aquí
        </p>
        <button
          type="button"
          @click="fileInput?.click()"
          class="px-4 py-1.5 bg-white/10 text-white text-sm rounded-full hover:bg-white/15 transition-colors"
        >
          Seleccionar archivo
        </button>
      </div>
    </div>

    <!-- Barra de progreso multi-paso (solo audio mientras procesa) -->
    <div v-if="progress" class="space-y-1.5">
      <div class="flex items-center justify-between text-xs">
        <span class="text-white/80 truncate flex items-center gap-2">
          <svg class="w-3 h-3 animate-spin text-tiger-500 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="60" stroke-dashoffset="20" />
          </svg>
          {{ progress.message }}
        </span>
        <span v-if="progress.percent !== null" class="text-white/60 tabular-nums">{{ progress.percent }}%</span>
      </div>
      <div class="w-full bg-dark-hover rounded-full h-1.5 overflow-hidden">
        <div
          v-if="progress.percent !== null"
          class="bg-tiger-500 h-full rounded-full transition-all duration-200"
          :style="`width: ${progress.percent}%`"
        ></div>
        <div
          v-else
          class="bg-tiger-500 h-full w-1/3 rounded-full animate-pulse"
        ></div>
      </div>
      <p v-if="progress.step === 'loading-ffmpeg'" class="text-xs text-white/40">
        Solo la primera vez (~25 MB que el navegador cachea)
      </p>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-red-400 text-xs">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { ConvertProgress } from '~/composables/useAudioConverter'

const props = defineProps<{
  modelValue: string
  type?: 'cover' | 'artist' | 'audio'
  label?: string
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
const pendingFile = ref<File | null>(null)
const progress = ref<ConvertProgress | { step: 'uploading'; percent: number; message: string } | null>(null)
const lastResponse = ref<any>(null)

const { getImageUrl } = useMediaUrl()

const type = computed(() => props.type || 'cover')

const resolvedPreviewSrc = computed(() => {
  if (previewUrl.value) return previewUrl.value
  return getImageUrl(props.modelValue)
})

const acceptTypes = computed(() => {
  if (type.value === 'audio') {
    return 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/x-m4a,.mp3,.wav,.ogg,.m4a'
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
  if (files && files.length > 0) selectFile(files[0])
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) selectFile(input.files[0])
}

const selectFile = (file: File) => {
  error.value = ''

  const maxSize = type.value === 'audio' ? 50 * 1024 * 1024 : 5 * 1024 * 1024
  if (file.size > maxSize) {
    error.value = `Demasiado grande (máx ${type.value === 'audio' ? '50 MB' : '5 MB'})`
    return
  }

  pendingFile.value = file
  fileName.value = file.name
  fileSize.value = file.size

  if (type.value !== 'audio') {
    const reader = new FileReader()
    reader.onload = (e) => { previewUrl.value = e.target?.result as string }
    reader.readAsDataURL(file)
  } else {
    // Detectar duración rápida con HTML5 Audio (luego el server la confirma)
    const audioUrl = URL.createObjectURL(file)
    const audio = new Audio()
    audio.src = audioUrl
    audio.addEventListener('loadedmetadata', () => {
      emit('duration-detected', Math.round(audio.duration))
      URL.revokeObjectURL(audioUrl)
    })
    audio.addEventListener('error', () => URL.revokeObjectURL(audioUrl))
  }

  emit('file-selected', file)
  emit('update:modelValue', '')
}

/**
 * Sube el archivo pendiente.
 * - Imágenes: POST simple a /api/admin/upload
 * - Audio: convierte a HLS en navegador (ffmpeg.wasm) y sube bundle a /api/admin/upload-audio
 */
const uploadPendingFile = async (trackId?: string): Promise<string | null> => {
  if (!pendingFile.value) {
    return props.modelValue || null
  }

  error.value = ''

  try {
    if (type.value === 'audio') {
      const { convertToHls, uploadHlsBundle } = useAudioConverter()

      // Paso 1+2: cargar ffmpeg (si hace falta) y convertir
      const hlsFiles = await convertToHls(pendingFile.value, (p) => {
        progress.value = p
      })

      // Paso 3: subir bundle al server
      progress.value = { step: 'uploading', percent: 0, message: 'Subiendo a R2…' }
      const response = await uploadHlsBundle(hlsFiles, {
        trackId,
        onProgress: (percent) => {
          progress.value = { step: 'uploading', percent, message: `Subiendo a R2… ${percent}%` }
        }
      })

      lastResponse.value = response
      pendingFile.value = null
      progress.value = null
      emit('update:modelValue', response.trackId)
      return response.trackId
    }

    // Imágenes (cover/artist): subida directa
    const formData = new FormData()
    formData.append('file', pendingFile.value)
    formData.append('type', type.value)

    const response = await $fetch<any>('/api/admin/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })

    if (response.success) {
      lastResponse.value = response
      pendingFile.value = null
      emit('update:modelValue', response.url)
      return response.url
    }
    return null
  } catch (err: any) {
    progress.value = null
    console.error('[FileUpload] error subiendo archivo:', err)
    const msg = err?.message
      || err?.data?.statusMessage
      || err?.toString()
      || 'Error al subir el archivo'
    error.value = msg
    return null
  }
}

defineExpose({
  uploadPendingFile: uploadPendingFile as (trackId?: string) => Promise<string | null>,
  hasPendingFile: () => !!pendingFile.value,
  lastUploadResponse: () => lastResponse.value
})

const clearFile = () => {
  emit('update:modelValue', '')
  previewUrl.value = ''
  fileName.value = ''
  fileSize.value = 0
  pendingFile.value = null
  progress.value = null
  error.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && !pendingFile.value && type.value !== 'audio') {
    previewUrl.value = ''  // delegamos a getImageUrl en el computed
  }
})
</script>
