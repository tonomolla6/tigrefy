<template>
  <div class="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center z-50">
    <div class="w-full max-w-[450px] px-8">
      <!-- Logo -->
      <div class="text-center mb-12">
        <img src="/favicon.png" alt="Tigrefy" class="w-16 h-16 mx-auto mb-6" />
        <h1 class="text-4xl font-black text-white mb-2 tracking-tight">
          Inicia sesión
        </h1>
        <p class="text-gray-400">
          Bienvenido a Tigrefy
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Username Input -->
        <div>
          <label class="block text-sm font-bold text-white mb-2">
            Usuario
          </label>
          <input
            v-model="username"
            type="text"
            placeholder="Tu nombre de usuario"
            class="w-full px-4 py-3 bg-[#121212] border border-gray-700 hover:border-white rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition-all"
            autocomplete="username"
            :disabled="isLoading"
          />
        </div>

        <!-- Password Input -->
        <div>
          <label class="block text-sm font-bold text-white mb-2">
            Contraseña
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="Tu contraseña"
            class="w-full px-4 py-3 bg-[#121212] border border-gray-700 hover:border-white rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition-all"
            autocomplete="current-password"
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
          :disabled="isLoading || !username || !password"
          class="w-full py-4 mt-6 bg-tiger-500 hover:bg-tiger-400 hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:hover:scale-100 text-black font-bold text-base rounded-full transition-all duration-200"
        >
          <span v-if="isLoading">Iniciando sesión...</span>
          <span v-else>Iniciar sesión</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const { login, authError } = useAuth()

const handleSubmit = async () => {
  if (!username.value || !password.value) return

  isLoading.value = true
  error.value = ''

  const success = await login(username.value, password.value)

  if (!success) {
    error.value = authError.value || 'Credenciales incorrectas'
    password.value = ''
  }

  isLoading.value = false
}
</script>
