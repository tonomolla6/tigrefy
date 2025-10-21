<template>
  <button
    @click="goBack"
    class="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-4 md:mb-6"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
    <span class="font-semibold">Atrás</span>
  </button>
</template>

<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  router.back()
}
</script>
