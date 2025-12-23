<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-900 z-40 pb-safe">
    <div class="flex items-center justify-around px-1 py-2">
      <NuxtLink
        to="/"
        class="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors"
        :class="isActive('/') ? 'text-white' : 'text-secondary'"
      >
        <IconHome :size="22" :filled="isActive('/')" />
        <span class="text-[10px] font-medium">Inicio</span>
      </NuxtLink>

      <NuxtLink
        to="/search"
        class="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors"
        :class="isActive('/search') ? 'text-white' : 'text-secondary'"
      >
        <IconSearch :size="22" :filled="isActive('/search')" />
        <span class="text-[10px] font-medium">Buscar</span>
      </NuxtLink>

      <NuxtLink
        to="/library"
        class="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors"
        :class="isActive('/library') ? 'text-white' : 'text-secondary'"
      >
        <IconLibrary :size="22" :filled="isActive('/library')" />
        <span class="text-[10px] font-medium">Biblioteca</span>
      </NuxtLink>

      <NuxtLink
        to="/liked-songs"
        class="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors"
        :class="isActive('/liked-songs') ? 'text-white' : 'text-secondary'"
      >
        <IconHeart :size="22" :filled="isActive('/liked-songs')" />
        <span class="text-[10px] font-medium">Me gusta</span>
      </NuxtLink>

      <NuxtLink
        to="/albums"
        class="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors"
        :class="isActive('/albums') ? 'text-white' : 'text-secondary'"
      >
        <svg class="w-[22px] h-[22px]" :fill="isActive('/albums') ? 'currentColor' : 'none'" stroke="currentColor" :stroke-width="isActive('/albums') ? 0 : 2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <span class="text-[10px] font-medium">Álbumes</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>
