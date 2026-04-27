<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
    <div
      v-for="i in 8"
      :key="i"
      class="flex items-center gap-3 bg-white/10 rounded-md overflow-hidden h-12 md:h-14"
    >
      <div class="h-full aspect-square bg-white/10 animate-pulse"></div>
      <div
        class="h-3 bg-white/15 rounded animate-pulse"
        :style="{ width: `${40 + (i * 7) % 40}%` }"
      ></div>
    </div>
  </div>
</template>
