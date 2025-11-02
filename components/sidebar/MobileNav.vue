<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-900 z-40 pb-safe">
    <div class="flex items-center justify-around px-2 py-2">
      <NuxtLink
        to="/"
        class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors"
        :class="isActive('/') ? 'text-tiger-500' : 'text-secondary'"
      >
        <IconHome :size="24" />
        <span class="text-xs font-medium">Inicio</span>
      </NuxtLink>

      <NuxtLink
        to="/albums"
        class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors"
        :class="isActive('/albums') ? 'text-tiger-500' : 'text-secondary'"
      >
        <IconLibrary :size="24" />
        <span class="text-xs font-medium">Álbumes</span>
      </NuxtLink>

      <NuxtLink
        to="/library"
        class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
        :class="isActive('/library') ? 'text-tiger-500' : 'text-secondary'"
      >
        <IconLibrary :size="24" />
        <span class="text-xs font-medium">Biblioteca</span>
      </NuxtLink>

      <NuxtLink
        to="/search"
        class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
        :class="isActive('/search') ? 'text-tiger-500' : 'text-secondary'"
      >
        <IconSearch :size="24" />
        <span class="text-xs font-medium">Buscar</span>
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
