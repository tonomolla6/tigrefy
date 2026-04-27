<template>
  <div class="rounded-xl bg-white/5 p-4 md:p-6">
    <div class="flex items-center gap-4 md:gap-6">
      <div class="w-24 h-24 md:w-48 md:h-48 bg-white/10 rounded-lg animate-pulse flex-shrink-0"></div>
      <div class="flex-1 min-w-0 space-y-3">
        <div class="h-5 w-20 bg-white/10 rounded-full animate-pulse"></div>
        <div class="h-7 md:h-9 w-3/4 bg-white/10 rounded animate-pulse"></div>
        <div class="h-4 w-2/5 bg-white/10 rounded animate-pulse"></div>
        <div class="hidden md:flex items-center gap-3 pt-2">
          <div class="h-12 w-40 bg-white/10 rounded-full animate-pulse"></div>
          <div class="h-12 w-12 bg-white/10 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div class="md:hidden flex-shrink-0">
        <div class="h-12 w-12 bg-white/10 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
</template>
