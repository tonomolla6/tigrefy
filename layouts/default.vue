<template>
  <div class="h-screen flex flex-col overflow-hidden bg-black">
    <!-- Top Bar (Desktop) -->
    <header class="hidden md:flex items-center justify-between h-16 px-4 bg-black flex-shrink-0 z-40">
      <!-- Logo izquierda -->
      <div class="w-[72px] flex items-center justify-center">
        <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/public/favicon.png" alt="Tigrefy" class="w-7 h-7" />
          <span class="text-lg font-bold text-white">Tigrefy</span>
        </NuxtLink>
      </div>

      <!-- Navegación y búsqueda centro -->
      <div class="flex-1 flex items-center justify-center gap-2 max-w-xl mx-auto px-4">
        <Tooltip text="Inicio" position="bottom">
          <NuxtLink
            to="/"
            class="w-12 h-12 flex items-center justify-center rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-colors"
          >
            <IconHome :size="24" :filled="isHomePage" class="text-white" />
          </NuxtLink>
        </Tooltip>
        <SearchBar />
      </div>

      <!-- Perfil derecha -->
      <div class="flex items-center justify-end gap-2">
        <div class="relative" data-user-menu>
          <button
            @click.stop="showUserMenu = !showUserMenu"
            class="flex items-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-full py-1.5 pl-1.5 pr-3 transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-tiger-500 flex items-center justify-center text-black font-bold text-xs">
              {{ userInitials }}
            </div>
            <span class="text-sm font-medium text-white max-w-[120px] truncate">{{ user?.displayName || user?.username }}</span>
            <svg
              class="w-3 h-3 text-gray-400 transition-transform"
              :class="{ 'rotate-180': showUserMenu }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showUserMenu"
              class="absolute right-0 top-full mt-1 bg-[#282828] rounded-md shadow-2xl z-[9999] w-[180px] py-1"
            >
              <div class="px-3 py-2 text-xs text-gray-400 border-b border-white/10">
                {{ user?.role === 'tigre' ? 'Tigre' : user?.role === 'user' ? 'Usuario' : 'Invitado' }}
              </div>
              <NuxtLink
                v-if="canManage"
                to="/admin"
                @click="showUserMenu = false"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Gestionar contenido
              </NuxtLink>
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <div
      class="flex flex-1 overflow-hidden transition-all"
      :class="{ 'md:mb-[90px]': hasCurrentSong }"
    >
      <!-- Sidebar Izquierdo (Desktop) -->
      <MainSidebar />

      <!-- Main content -->
      <main class="relative flex-1 min-w-0 overflow-hidden bg-dark md:rounded-lg md:mx-2 md:my-0">
        <!-- Sticky header visible al hacer scroll (track/album/artist/etc.) -->
        <Transition name="fade">
          <div
            v-if="detailStickyHeader && detailStickyScrollTop > 300"
            :class="[detailStickyHeader.bgClass, 'absolute top-0 left-0 right-0 z-30 px-4 md:px-6 py-2 flex items-center gap-4']"
          >
            <button
              @click="detailStickyHeader.onPlay"
              class="bg-tiger-500 hover:bg-tiger-600 hover:scale-105 text-white rounded-full p-3 transition-all shadow-lg flex-shrink-0"
            >
              <IconPause v-if="detailStickyHeader.playing" :size="24" />
              <IconPlay v-else :size="24" />
            </button>
            <h2 class="text-lg md:text-xl font-bold truncate">{{ detailStickyHeader.title }}</h2>
          </div>
        </Transition>

        <CustomScrollbar
          ref="desktopScrollbar"
          class="hidden md:block h-full"
          @scroll="onDesktopScroll"
        >
          <slot />
        </CustomScrollbar>
        <div
          ref="mobileScroll"
          class="md:hidden h-full overflow-y-auto"
          @scroll="onMobileScroll"
        >
          <slot />
        </div>
      </main>

      <!-- Sidebar Derecho - Now Playing (Desktop) -->
      <NowPlayingSidebar />

      <!-- Sidebar Derecho - Queue (Desktop) -->
      <QueueSidebar />
    </div>

    <!-- Reproductor -->
    <MusicPlayer />

    <!-- Navegación Móvil -->
    <MobileNav />

    <!-- Toast Notifications -->
    <ToastContainer />

    <!-- Menú Lateral Móvil -->
    <MobileSideMenu />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { loadData } = useData()
const { loadFavorites } = useFavorites()
const { loadUserPlaylists } = useUserPlaylists()
const { user, logout, canManage } = useAuth()
const { currentSong } = usePlayer()

const showUserMenu = ref(false)
const hasCurrentSong = computed(() => !!currentSong.value)
const isHomePage = computed(() => route.path === '/')

// Resetear scroll al cambiar de ruta (el scroll vive en contenedores internos, no en window)
const desktopScrollbar = ref<{ scrollToTop: () => void } | null>(null)
const mobileScroll = ref<HTMLElement | null>(null)
watch(() => route.path, () => {
  desktopScrollbar.value?.scrollToTop()
  if (mobileScroll.value) mobileScroll.value.scrollTop = 0
})

// Sticky header para páginas de detalle (track/album/artist)
const { state: detailStickyHeader, scrollTop: detailStickyScrollTop } = provideDetailStickyHeader()
const onDesktopScroll = (scrollTop: number) => {
  detailStickyScrollTop.value = scrollTop
}
const onMobileScroll = (e: Event) => {
  detailStickyScrollTop.value = (e.target as HTMLElement).scrollTop
}

const userInitials = computed(() => {
  const name = user.value?.displayName || user.value?.username || ''
  return name.slice(0, 2).toUpperCase()
})

const handleLogout = async () => {
  showUserMenu.value = false
  await logout()
}

onMounted(async () => {
  await loadData()
  loadFavorites()
  loadUserPlaylists()

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const userMenuContainer = document.querySelector('[data-user-menu]')
    if (userMenuContainer && !userMenuContainer.contains(target)) {
      showUserMenu.value = false
    }
  })
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

