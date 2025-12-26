<template>
  <!-- Contenedor que mueve todo el contenido -->
  <div
    class="md:hidden fixed inset-0 z-[60] transition-transform duration-300 ease-out pointer-events-none"
    :style="{ transform: isOpen ? 'translateX(80%)' : 'translateX(0)' }"
  >
    <!-- Overlay para cerrar cuando está abierto -->
    <div
      v-if="isOpen"
      class="absolute inset-0 bg-black/40 pointer-events-auto"
      @click="closeMenu"
    />
  </div>

  <!-- Menú lateral fijo -->
  <div
    class="md:hidden fixed top-0 left-0 bottom-0 w-[80%] bg-dark-card z-[59] flex flex-col transition-transform duration-300 ease-out"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Header con avatar e info del usuario -->
    <div class="px-4 py-5 border-b border-gray-800">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-tiger-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {{ userInitial }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-white text-lg truncate">{{ userName }}</p>
          <p class="text-sm text-secondary">{{ userRole }}</p>
        </div>
      </div>
    </div>

    <!-- Opciones del menú -->
    <div class="py-2 flex-1">
      <NuxtLink
        v-if="isAdmin"
        to="/admin"
        @click="closeMenu"
        class="flex items-center gap-4 px-4 py-3.5 hover:bg-white/10 transition-colors"
      >
        <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Panel de administración</span>
      </NuxtLink>

      <button
        @click="handleLogout"
        class="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/10 transition-colors text-left"
      >
        <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Cerrar sesión</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { user, logout, isAdmin } = useAuth()

// Estado global del menú lateral
const mobileMenuOpen = useState('mobileMenuOpen', () => false)

const isOpen = computed(() => mobileMenuOpen.value)

const userName = computed(() => {
  return user.value?.displayName || user.value?.username || 'Usuario'
})

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

const userRole = computed(() => {
  if (user.value?.role === 'admin') return 'Administrador'
  if (user.value?.role === 'guest') return 'Invitado'
  return 'Usuario'
})

const closeMenu = () => {
  mobileMenuOpen.value = false
}

const handleLogout = async () => {
  closeMenu()
  await logout()
  router.push('/login')
}

// Cerrar menú al cambiar de ruta
watch(() => router.currentRoute.value.path, () => {
  closeMenu()
})
</script>
