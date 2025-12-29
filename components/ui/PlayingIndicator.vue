<template>
  <div class="playing-indicator" :class="sizeClass">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md'
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'playing-indicator--sm'
    case 'lg': return 'playing-indicator--lg'
    default: return 'playing-indicator--md'
  }
})
</script>

<style scoped>
.playing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 2px;
}

.playing-indicator--sm {
  height: 12px;
}

.playing-indicator--sm span {
  width: 2px;
}

.playing-indicator--md {
  height: 16px;
}

.playing-indicator--md span {
  width: 3px;
}

.playing-indicator--lg {
  height: 20px;
}

.playing-indicator--lg span {
  width: 4px;
}

.playing-indicator span {
  background-color: #f97316;
  border-radius: 1px;
  animation: playing-bar 0.8s ease-in-out infinite;
}

.playing-indicator span:nth-child(1) {
  height: 30%;
  animation-delay: 0s;
}

.playing-indicator span:nth-child(2) {
  height: 60%;
  animation-delay: 0.2s;
}

.playing-indicator span:nth-child(3) {
  height: 40%;
  animation-delay: 0.4s;
}

.playing-indicator span:nth-child(4) {
  height: 80%;
  animation-delay: 0.1s;
}

@keyframes playing-bar {
  0%, 100% {
    height: 30%;
  }
  50% {
    height: 100%;
  }
}
</style>
