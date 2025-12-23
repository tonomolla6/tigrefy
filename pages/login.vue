<template>
  <div class="min-h-screen bg-black text-white overflow-hidden relative">
    <!-- Background con gradientes animados -->
    <div class="absolute inset-0">
      <div class="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-tiger-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[100px] animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-tiger-900/10 rounded-full blur-[150px]"></div>
    </div>

    <!-- Grid pattern overlay -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

    <!-- Easter Egg: Tres huellas de tigre flotantes (Tono, Omar, Ando) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Huella 1 - Tono (arriba izquierda) -->
      <div class="absolute top-[15%] left-[8%] opacity-[0.03] hover:opacity-[0.08] transition-opacity duration-1000 tiger-paw" style="animation: float1 20s ease-in-out infinite;">
        <svg viewBox="0 0 64 64" class="w-20 h-20 md:w-28 md:h-28 text-tiger-500 rotate-[-15deg]" fill="currentColor">
          <ellipse cx="32" cy="42" rx="14" ry="18"/>
          <ellipse cx="18" cy="22" rx="6" ry="8" transform="rotate(-20 18 22)"/>
          <ellipse cx="32" cy="16" rx="5" ry="7"/>
          <ellipse cx="46" cy="22" rx="6" ry="8" transform="rotate(20 46 22)"/>
          <ellipse cx="52" cy="36" rx="5" ry="6" transform="rotate(35 52 36)"/>
        </svg>
      </div>
      <!-- Huella 2 - Omar (derecha centro) -->
      <div class="absolute top-[45%] right-[5%] opacity-[0.025] hover:opacity-[0.07] transition-opacity duration-1000 tiger-paw" style="animation: float2 25s ease-in-out infinite; animation-delay: -8s;">
        <svg viewBox="0 0 64 64" class="w-16 h-16 md:w-24 md:h-24 text-orange-500 rotate-[25deg]" fill="currentColor">
          <ellipse cx="32" cy="42" rx="14" ry="18"/>
          <ellipse cx="18" cy="22" rx="6" ry="8" transform="rotate(-20 18 22)"/>
          <ellipse cx="32" cy="16" rx="5" ry="7"/>
          <ellipse cx="46" cy="22" rx="6" ry="8" transform="rotate(20 46 22)"/>
          <ellipse cx="52" cy="36" rx="5" ry="6" transform="rotate(35 52 36)"/>
        </svg>
      </div>
      <!-- Huella 3 - Ando (abajo izquierda) -->
      <div class="absolute bottom-[20%] left-[12%] opacity-[0.02] hover:opacity-[0.06] transition-opacity duration-1000 tiger-paw" style="animation: float3 22s ease-in-out infinite; animation-delay: -15s;">
        <svg viewBox="0 0 64 64" class="w-14 h-14 md:w-20 md:h-20 text-amber-500 rotate-[10deg]" fill="currentColor">
          <ellipse cx="32" cy="42" rx="14" ry="18"/>
          <ellipse cx="18" cy="22" rx="6" ry="8" transform="rotate(-20 18 22)"/>
          <ellipse cx="32" cy="16" rx="5" ry="7"/>
          <ellipse cx="46" cy="22" rx="6" ry="8" transform="rotate(20 46 22)"/>
          <ellipse cx="52" cy="36" rx="5" ry="6" transform="rotate(35 52 36)"/>
        </svg>
      </div>
    </div>

    <!-- Navbar -->
    <nav class="relative z-10 px-6 py-4">
      <NuxtLink to="/" class="inline-flex items-center gap-3 group relative">
        <img src="/favicon.png" alt="Tigrefy" class="w-10 h-10 group-hover:scale-110 transition-transform" />
        <span class="text-2xl font-black tracking-tight">Tigrefy</span>
        <!-- Easter Egg: Tooltip secreto al hacer hover largo -->
        <span class="absolute -bottom-8 left-0 text-[10px] text-tiger-500/0 group-hover:text-tiger-500/60 transition-all duration-[3000ms] whitespace-nowrap font-mono">
          T.O.A. est. 2024
        </span>
      </NuxtLink>
    </nav>

    <!-- Content -->
    <div class="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
      <div class="w-full max-w-md">
        <!-- Card con glassmorphism -->
        <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
          <!-- Glow effect -->
          <div class="absolute -inset-1 bg-gradient-to-r from-tiger-500/20 via-orange-500/20 to-tiger-500/20 rounded-3xl blur-xl opacity-50"></div>

          <div class="relative">
            <!-- Header -->
            <div class="text-center mb-10">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-tiger-400 to-tiger-600 rounded-2xl mb-6 shadow-lg shadow-tiger-500/30">
                <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 class="text-3xl md:text-4xl font-black mb-2">
                <span class="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Bienvenido
                </span>
              </h1>
              <p class="text-gray-400">
                Inicia sesión para continuar
              </p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <!-- Username -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-300">
                  Usuario
                </label>
                <div class="relative group">
                  <div class="absolute inset-0 bg-gradient-to-r from-tiger-500/50 to-orange-500/50 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  <input
                    v-model="username"
                    type="text"
                    placeholder="Tu nombre de usuario"
                    class="relative w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-tiger-500/50 focus:bg-white/10 transition-all"
                    autocomplete="username"
                    :disabled="isSubmitting"
                  />
                </div>
              </div>

              <!-- Password -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-300">
                  Contraseña
                </label>
                <div class="relative group">
                  <div class="absolute inset-0 bg-gradient-to-r from-tiger-500/50 to-orange-500/50 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  <input
                    v-model="password"
                    type="password"
                    placeholder="Tu contraseña"
                    class="relative w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-tiger-500/50 focus:bg-white/10 transition-all"
                    autocomplete="current-password"
                    :disabled="isSubmitting"
                  />
                </div>
              </div>

              <!-- Error -->
              <Transition
                enter-active-class="transition-all duration-300"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-200"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <div v-if="error" class="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                  <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ error }}</span>
                </div>
              </Transition>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="isSubmitting || !username || !password"
                class="relative w-full py-4 mt-2 bg-gradient-to-r from-tiger-500 to-orange-500 text-black font-bold text-base rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none overflow-hidden group"
              >
                <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                  Entrar
                  <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </form>

            <!-- Divider -->
            <div class="flex items-center gap-4 my-8">
              <div class="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            <!-- Back link -->
            <div class="text-center">
              <NuxtLink
                to="/"
                class="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors group"
              >
                <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Volver al inicio
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Footer text con easter egg -->
        <p class="text-center text-gray-600 text-xs mt-8 group cursor-default">
          <span class="group-hover:hidden transition-opacity">Solo para miembros autorizados</span>
          <span class="hidden group-hover:inline text-tiger-500/40 transition-opacity">La manada protege a los suyos</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const isSubmitting = ref(false)

const { login, authError, isAuthenticated } = useAuth()

// Si ya está autenticado, redirigir a home
watchEffect(() => {
  if (isAuthenticated.value) {
    router.push('/')
  }
})

const handleSubmit = async () => {
  if (!username.value || !password.value) return

  isSubmitting.value = true
  error.value = ''

  const success = await login(username.value, password.value)

  if (success) {
    router.push('/')
  } else {
    error.value = authError.value || 'Credenciales incorrectas'
    password.value = ''
  }

  isSubmitting.value = false
}
</script>

<style scoped>
/* Eliminar todos los outlines y bordes de focus del navegador */
input {
  outline: none !important;
  box-shadow: none !important;
}

input:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* Ocultar estilos de autofill del navegador */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.05) inset !important;
  -webkit-text-fill-color: white !important;
  caret-color: white !important;
  transition: background-color 5000s ease-in-out 0s;
  border-color: rgba(255, 255, 255, 0.1) !important;
  outline: none !important;
}

/* Easter Egg: Animaciones de huellas flotantes */
@keyframes float1 {
  0%, 100% { transform: translate(0, 0) rotate(-15deg); }
  25% { transform: translate(15px, -20px) rotate(-10deg); }
  50% { transform: translate(5px, 10px) rotate(-20deg); }
  75% { transform: translate(-10px, -5px) rotate(-12deg); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0) rotate(25deg); }
  33% { transform: translate(-20px, 15px) rotate(30deg); }
  66% { transform: translate(10px, -10px) rotate(20deg); }
}

@keyframes float3 {
  0%, 100% { transform: translate(0, 0) rotate(10deg); }
  20% { transform: translate(10px, 15px) rotate(15deg); }
  40% { transform: translate(-5px, -10px) rotate(5deg); }
  60% { transform: translate(15px, 5px) rotate(12deg); }
  80% { transform: translate(-10px, 10px) rotate(8deg); }
}

.tiger-paw {
  pointer-events: auto;
}
</style>
