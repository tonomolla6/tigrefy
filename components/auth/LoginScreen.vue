<template>
  <div class="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center z-50">
    <div class="w-full max-w-[450px] px-8">
      <!-- Logo -->
      <div class="text-center mb-16">
        <svg class="w-16 h-16 mx-auto mb-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
        <h1 class="text-5xl font-black text-white mb-6 tracking-tight">Inicia sesión en Tigrefy</h1>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Password Input -->
        <div>
          <label class="block text-sm font-bold text-white mb-2">
            Contraseña
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="Contraseña"
            class="w-full px-4 py-3 bg-[#121212] border border-gray-700 hover:border-white rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition-all"
            autocomplete="off"
            :disabled="isLoading"
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-500/10 border border-red-500 text-red-500 text-sm px-4 py-3 rounded">
          <span class="font-bold">Error:</span> {{ error }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading || !password"
          class="w-full py-4 mt-6 bg-tiger-500 hover:bg-tiger-400 hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:hover:scale-100 text-black font-bold text-base rounded-full transition-all duration-200"
        >
          {{ isLoading ? 'Verificando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <!-- Divider -->
      <div class="relative my-8">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-700"></div>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-gray-500 text-sm">
        Solo usuarios autorizados
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const { login } = useAuth()

const handleLogin = async () => {
  if (!password.value) return

  isLoading.value = true
  error.value = ''

  const success = await login(password.value)

  if (!success) {
    error.value = 'Contraseña incorrecta'
    password.value = ''
    isLoading.value = false
  }
  // Si es exitoso, isAuthenticated cambiará y app.vue mostrará la app
}
</script>
