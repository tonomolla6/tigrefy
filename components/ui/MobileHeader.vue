<template>
  <header class="md:hidden sticky top-0 z-20 bg-dark-base/95 backdrop-blur-sm px-4 py-3">
    <div class="flex items-center justify-between">
      <!-- Título o contenido izquierdo -->
      <div class="flex-1 min-w-0">
        <slot name="left">
          <h1 v-if="title" class="text-xl font-bold truncate">{{ title }}</h1>
        </slot>
      </div>

      <!-- Avatar de usuario con menú -->
      <button
        @click="showMenu = !showMenu"
        class="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <div class="w-8 h-8 rounded-full bg-tiger-600 flex items-center justify-center text-white font-bold text-sm">
          {{ userInitial }}
        </div>
      </button>
    </div>

    <!-- Menú desplegable -->
    <Teleport to="body">
      <div
        v-if="showMenu"
        class="fixed inset-0 z-50"
        @click="showMenu = false"
      >
        <div class="absolute inset-0 bg-black/60" />
        <div
          class="absolute top-14 right-4 bg-dark-card rounded-lg shadow-2xl py-2 min-w-[200px] border border-gray-800"
          @click.stop
        >
          <!-- Info del usuario -->
          <div class="px-4 py-3 border-b border-gray-800">
            <p class="font-semibold text-white">{{ userName }}</p>
            <p class="text-sm text-secondary">{{ userRole }}</p>
          </div>

          <!-- Opciones del menú -->
          <div class="py-1">
            <NuxtLink
              v-if="isAdmin"
              to="/admin"
              @click="showMenu = false"
              class="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Panel de administración</span>
            </NuxtLink>

            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()

const { user, logout, isAdmin } = useAuth()
const router = useRouter()

const showMenu = ref(false)

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

const handleLogout = async () => {
  showMenu.value = false
  await logout()
  router.push('/login')
}
</script>
