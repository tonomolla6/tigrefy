<template>
  <section>
    <div class="flex items-center justify-between mb-3">
      <div class="h-6 md:h-7 w-32 md:w-40 bg-white/10 rounded animate-pulse"></div>
      <div class="h-3.5 w-24 bg-white/10 rounded animate-pulse"></div>
    </div>
    <div class="-mx-3 px-3 flex items-start gap-0 overflow-hidden pb-2">
      <div
        v-for="i in 8"
        :key="i"
        class="p-3 w-[200px] flex-shrink-0"
      >
        <div
          class="w-full aspect-square bg-white/10 animate-pulse mb-3 shadow-md"
          :class="shape === 'circle' ? 'rounded-full' : 'rounded-md'"
        ></div>
        <div class="h-4 w-4/5 bg-white/10 rounded animate-pulse mb-2"></div>
        <div class="h-3 w-1/2 bg-white/10 rounded animate-pulse"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  shape: { type: String as () => 'square' | 'circle', default: 'square' }
})
</script>
