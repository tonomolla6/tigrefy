<template>
  <div class="flex items-center justify-center gap-1">
    <span class="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce-dot" style="animation-delay: 0ms;"></span>
    <span class="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce-dot" style="animation-delay: 150ms;"></span>
    <span class="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce-dot" style="animation-delay: 300ms;"></span>
  </div>
</template>

<style scoped>
@keyframes bounce-dot {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.animate-bounce-dot {
  animation: bounce-dot 1s ease-in-out infinite;
}
</style>
