<template>
  <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 items-start">
    <div
      v-for="i in count"
      :key="i"
      class="p-3"
    >
      <div
        class="w-full aspect-square bg-white/10 animate-pulse mb-3 shadow-md"
        :class="shape === 'circle' ? 'rounded-full' : 'rounded-md'"
      ></div>
      <div
        class="h-4 bg-white/10 rounded animate-pulse mb-2"
        :class="shape === 'circle' ? 'mx-auto w-3/5' : 'w-4/5'"
      ></div>
      <div
        class="h-3 bg-white/10 rounded animate-pulse"
        :class="shape === 'circle' ? 'mx-auto w-2/5' : 'w-1/2'"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  count: { type: Number, default: 18 },
  shape: { type: String as () => 'square' | 'circle', default: 'square' }
})
</script>
