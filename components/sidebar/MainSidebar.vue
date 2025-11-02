<template>
  <aside class="w-64 bg-black flex flex-col h-full hidden md:flex">
    <!-- Logo -->
    <div class="p-6">
      <NuxtLink to="/" class="flex items-center gap-2">
        <div class="w-10 h-10 flex items-center justify-center">
          <img src="/favicon.png" alt="Tigrefy" class="w-10 h-10" />
        </div>
        <span class="text-2xl font-bold">Tigrefy</span>
      </NuxtLink>
    </div>

    <!-- Navegación principal -->
    <nav class="flex-1 overflow-y-auto">
      <ul class="space-y-2 px-3">
        <li>
          <NuxtLink
            to="/"
            class="sidebar-link"
            :class="{ 'active': isActive('/') }"
          >
            <IconHome :size="24" />
            <span class="font-semibold">Inicio</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/albums"
            class="sidebar-link"
            :class="{ 'active': isActive('/albums') }"
          >
            <IconLibrary :size="24" />
            <span class="font-semibold">Álbumes</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/artists"
            class="sidebar-link"
            :class="{ 'active': isActive('/artists') }"
          >
            <IconSearch :size="24" />
            <span class="font-semibold">Artistas</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/search"
            class="sidebar-link"
            :class="{ 'active': isActive('/search') }"
          >
            <IconSearch :size="24" />
            <span class="font-semibold">Buscar</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/library"
            class="sidebar-link"
            :class="{ 'active': isActive('/library') }"
          >
            <IconLibrary :size="24" />
            <span class="font-semibold">Tu Biblioteca</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
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
