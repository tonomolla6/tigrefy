<template>
  <!-- Mientras carga auth o si está autenticado, mostrar el home (su skeleton se encarga del loading) -->
  <HomeContent v-if="isAuthenticated || isLoading" />

  <!-- Si auth resolvió y NO está autenticado, mostrar landing page -->
  <div v-else class="min-h-screen bg-black text-white overflow-x-hidden">
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3 group relative cursor-default" @click="logoClicks++">
          <img src="/favicon.png" alt="Tigrefy" class="w-10 h-10 group-hover:rotate-12 transition-transform duration-300" />
          <span class="text-2xl font-black tracking-tight">Tigrefy</span>
          <!-- Easter Egg: Tooltip secreto (aparece tras 3 segundos de hover) -->
          <span class="absolute -bottom-7 left-0 text-[10px] text-tiger-500/0 group-hover:text-tiger-500/70 transition-all duration-[2500ms] whitespace-nowrap font-mono">
            {{ logoClicks >= 5 ? '🐯 T.O.A. 🐯' : 'T.O.A.' }}
          </span>
        </div>
        <NuxtLink
          to="/login"
          class="bg-white text-black font-bold px-6 py-2.5 rounded-full hover:scale-105 hover:bg-tiger-500 hover:text-white transition-all duration-300"
        >
          Iniciar sesión
        </NuxtLink>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center pt-20">
      <!-- Background con gradientes animados -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-tiger-500/30 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px] animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-tiger-900/20 rounded-full blur-[150px]"></div>
      </div>

      <!-- Grid pattern overlay -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

      <!-- Easter Egg: Tres huellas de tigre flotantes (Tono, Omar, Ando) -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <!-- Huella 1 - Tono -->
        <div class="tiger-paw absolute top-[12%] left-[5%] md:left-[10%] opacity-[0.04] hover:opacity-[0.12] transition-opacity duration-1000" style="animation: pawFloat1 18s ease-in-out infinite;">
          <svg viewBox="0 0 64 64" class="w-16 h-16 md:w-24 md:h-24 text-tiger-500 rotate-[-20deg]" fill="currentColor">
            <ellipse cx="32" cy="42" rx="14" ry="18"/>
            <ellipse cx="18" cy="22" rx="6" ry="8" transform="rotate(-20 18 22)"/>
            <ellipse cx="32" cy="16" rx="5" ry="7"/>
            <ellipse cx="46" cy="22" rx="6" ry="8" transform="rotate(20 46 22)"/>
            <ellipse cx="52" cy="36" rx="5" ry="6" transform="rotate(35 52 36)"/>
          </svg>
        </div>
        <!-- Huella 2 - Omar -->
        <div class="tiger-paw absolute top-[35%] right-[3%] md:right-[8%] opacity-[0.035] hover:opacity-[0.1] transition-opacity duration-1000" style="animation: pawFloat2 22s ease-in-out infinite; animation-delay: -7s;">
          <svg viewBox="0 0 64 64" class="w-14 h-14 md:w-20 md:h-20 text-orange-500 rotate-[30deg]" fill="currentColor">
            <ellipse cx="32" cy="42" rx="14" ry="18"/>
            <ellipse cx="18" cy="22" rx="6" ry="8" transform="rotate(-20 18 22)"/>
            <ellipse cx="32" cy="16" rx="5" ry="7"/>
            <ellipse cx="46" cy="22" rx="6" ry="8" transform="rotate(20 46 22)"/>
            <ellipse cx="52" cy="36" rx="5" ry="6" transform="rotate(35 52 36)"/>
          </svg>
        </div>
        <!-- Huella 3 - Ando -->
        <div class="tiger-paw absolute bottom-[25%] left-[8%] md:left-[15%] opacity-[0.03] hover:opacity-[0.08] transition-opacity duration-1000" style="animation: pawFloat3 20s ease-in-out infinite; animation-delay: -12s;">
          <svg viewBox="0 0 64 64" class="w-12 h-12 md:w-16 md:h-16 text-amber-500 rotate-[15deg]" fill="currentColor">
            <ellipse cx="32" cy="42" rx="14" ry="18"/>
            <ellipse cx="18" cy="22" rx="6" ry="8" transform="rotate(-20 18 22)"/>
            <ellipse cx="32" cy="16" rx="5" ry="7"/>
            <ellipse cx="46" cy="22" rx="6" ry="8" transform="rotate(20 46 22)"/>
            <ellipse cx="52" cy="36" rx="5" ry="6" transform="rotate(35 52 36)"/>
          </svg>
        </div>
      </div>

      <div class="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 bg-tiger-500/10 border border-tiger-500/30 rounded-full px-4 py-2 mb-8">
          <span class="w-2 h-2 bg-tiger-500 rounded-full animate-pulse"></span>
          <span class="text-tiger-400 text-sm font-medium">La música del Tigre</span>
        </div>

        <!-- Título principal -->
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
          <span class="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            Tu música.
          </span>
          <br />
          <span class="bg-gradient-to-r from-tiger-400 via-tiger-500 to-orange-500 bg-clip-text text-transparent">
            Tu estilo.
          </span>
        </h1>

        <!-- Subtítulo -->
        <p class="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Descubre el sonido exclusivo de los Tigres.
          Música que te hace vibrar, disponible solo para los elegidos.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <NuxtLink
            to="/login"
            class="group relative bg-tiger-500 text-black font-bold px-10 py-4 rounded-full text-lg hover:bg-tiger-400 transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)] overflow-hidden"
          >
            <!-- Easter Egg: Rayas de tigre que aparecen en hover -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(0,0,0,0.3)_8px,rgba(0,0,0,0.3)_16px)]"></div>
            <span class="relative z-10 flex items-center gap-2">
              Empezar ahora
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </NuxtLink>
        </div>

        <!-- Mensaje exclusivo -->
        <div class="mt-16 pt-16 border-t border-white/10">
          <p class="text-gray-500 text-sm flex items-center justify-center gap-2">
            <svg class="w-4 h-4 text-tiger-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            Acceso exclusivo
          </p>
        </div>
      </div>

      <!-- Scroll indicator con easter egg -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce group cursor-pointer" @click="scrollToFeatures">
        <svg class="w-6 h-6 text-gray-500 group-hover:text-tiger-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <!-- Easter Egg: Pequeño texto que aparece en hover -->
        <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-tiger-500/0 group-hover:text-tiger-500/50 transition-all duration-500 whitespace-nowrap">
          ↓ descubre más ↓
        </span>
      </div>
    </section>

    <!-- Features Section -->
    <section class="relative py-32 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-black mb-4">
            <span class="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Todo lo que necesitas
            </span>
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto">
            Una experiencia musical completa diseñada para los verdaderos fans
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Feature 1 -->
          <div class="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-tiger-500/50 transition-all duration-500">
            <div class="w-14 h-14 bg-tiger-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-tiger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Música Exclusiva</h3>
            <p class="text-gray-500">Accede a canciones que no encontrarás en ningún otro lugar. Contenido original de los Tigres.</p>
          </div>

          <!-- Feature 2 -->
          <div class="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-tiger-500/50 transition-all duration-500">
            <div class="w-14 h-14 bg-tiger-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-tiger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Tus Favoritos</h3>
            <p class="text-gray-500">Guarda tus canciones favoritas y crea tu biblioteca personal perfecta.</p>
          </div>

          <!-- Feature 3 -->
          <div class="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-tiger-500/50 transition-all duration-500">
            <div class="w-14 h-14 bg-tiger-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-tiger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Playlists</h3>
            <p class="text-gray-500">Crea y organiza tus propias listas de reproducción para cada momento.</p>
          </div>

          <!-- Feature 4 -->
          <div class="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-tiger-500/50 transition-all duration-500">
            <div class="w-14 h-14 bg-tiger-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-tiger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2m0 2a2 2 0 00-2 2v1h4V6a2 2 0 00-2-2zM17 4V2m0 2a2 2 0 00-2 2v1h4V6a2 2 0 00-2-2zM5 8h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9a2 2 0 012-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Letras</h3>
            <p class="text-gray-500">Sigue las letras de tus canciones favoritas mientras las escuchas.</p>
          </div>

          <!-- Feature 5 -->
          <div class="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-tiger-500/50 transition-all duration-500">
            <div class="w-14 h-14 bg-tiger-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-tiger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Responsive</h3>
            <p class="text-gray-500">Disfruta en cualquier dispositivo. Diseño optimizado para móvil y escritorio.</p>
          </div>

          <!-- Feature 6 -->
          <div class="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-tiger-500/50 transition-all duration-500">
            <div class="w-14 h-14 bg-tiger-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-tiger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Rápido</h3>
            <p class="text-gray-500">Reproducción instantánea sin interrupciones. Tu música siempre lista.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative py-32 px-6">
      <div class="absolute inset-0 bg-gradient-to-b from-tiger-500/10 via-tiger-500/5 to-transparent"></div>

      <div class="relative max-w-4xl mx-auto text-center">
        <h2 class="text-4xl md:text-6xl font-black mb-6">
          <span class="bg-gradient-to-r from-tiger-400 via-tiger-500 to-orange-500 bg-clip-text text-transparent">
            ¿Listo para rugir?
          </span>
        </h2>
        <p class="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Únete a la manada y descubre un mundo de música exclusiva
        </p>
        <NuxtLink
          to="/login"
          class="group relative inline-flex items-center gap-2 bg-tiger-500 text-black font-bold px-12 py-5 rounded-full text-xl hover:bg-tiger-400 transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)] overflow-hidden"
        >
          <!-- Easter Egg: Rayas de tigre que aparecen en hover -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.3)_10px,rgba(0,0,0,0.3)_20px)]"></div>
          <span class="relative z-10">Entrar ahora</span>
          <svg class="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/10 py-8 px-6">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3 group">
          <img src="/favicon.png" alt="Tigrefy" class="w-8 h-8 group-hover:animate-bounce" />
          <span class="font-bold text-gray-400 group-hover:text-tiger-500 transition-colors">Tigrefy</span>
        </div>
        <!-- Easter Egg: Mensaje secreto al hacer hover -->
        <p class="text-gray-600 text-sm group cursor-default">
          <span class="group-hover:hidden">© {{ new Date().getFullYear() }} Tigrefy. Hecho con 🧡 por los Tigres.</span>
          <span class="hidden group-hover:inline text-tiger-500/60">Tono · Omar · Ando — 🐯</span>
        </p>
      </div>
    </footer>

    <!-- Easter Egg: Rayas de tigre sutiles en los bordes (muy sutil) -->
    <div class="fixed bottom-0 left-0 w-1 h-screen pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_20px,theme(colors.tiger.500)_20px,theme(colors.tiger.500)_40px)]"></div>
    <div class="fixed bottom-0 right-0 w-1 h-screen pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_20px,theme(colors.orange.500)_20px,theme(colors.orange.500)_40px)]"></div>
  </div>
</template>

<script setup lang="ts">
import HomeContent from '~/components/home/HomeContent.vue'

definePageMeta({
  layout: false,
  middleware: 'landing-or-login'
})

const { isAuthenticated, isLoading } = useAuth()

// Easter egg: contador de clicks en el logo
const logoClicks = ref(0)

// Scroll suave a features
const scrollToFeatures = () => {
  window.scrollTo({
    top: window.innerHeight,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
/* Easter Egg: Animaciones de huellas flotantes */
@keyframes pawFloat1 {
  0%, 100% { transform: translate(0, 0) rotate(-20deg); }
  25% { transform: translate(12px, -18px) rotate(-15deg); }
  50% { transform: translate(4px, 8px) rotate(-25deg); }
  75% { transform: translate(-8px, -4px) rotate(-18deg); }
}

@keyframes pawFloat2 {
  0%, 100% { transform: translate(0, 0) rotate(30deg); }
  33% { transform: translate(-15px, 12px) rotate(35deg); }
  66% { transform: translate(8px, -8px) rotate(25deg); }
}

@keyframes pawFloat3 {
  0%, 100% { transform: translate(0, 0) rotate(15deg); }
  20% { transform: translate(8px, 12px) rotate(20deg); }
  40% { transform: translate(-4px, -8px) rotate(10deg); }
  60% { transform: translate(12px, 4px) rotate(18deg); }
  80% { transform: translate(-8px, 8px) rotate(12deg); }
}

.tiger-paw {
  pointer-events: auto;
}
</style>
