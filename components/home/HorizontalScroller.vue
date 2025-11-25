<template>
  <section class="relative group/scroller">
    <!-- Header de sección -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl md:text-2xl font-bold hover:underline cursor-pointer">
        {{ title }}
      </h2>
      <NuxtLink
        v-if="showAllLink"
        :to="showAllLink"
        class="text-sm font-semibold text-secondary hover:text-primary hover:underline transition-colors"
      >
        Mostrar todo
      </NuxtLink>
    </div>

    <!-- Botón navegación izquierda -->
    <button
      v-show="canScrollLeft"
      @click="scrollLeft"
      class="absolute left-0 top-1/2 mt-4 -translate-y-1/2 z-10
             bg-dark-card/90 hover:bg-dark-hover rounded-full p-2
             opacity-0 group-hover/scroller:opacity-100 transition-opacity duration-200
             shadow-lg hidden md:flex items-center justify-center"
      aria-label="Scroll izquierda"
    >
      <IconChevronLeft :size="24" />
    </button>

    <!-- Botón navegación derecha -->
    <button
      v-show="canScrollRight"
      @click="scrollRight"
      class="absolute right-0 top-1/2 mt-4 -translate-y-1/2 z-10
             bg-dark-card/90 hover:bg-dark-hover rounded-full p-2
             opacity-0 group-hover/scroller:opacity-100 transition-opacity duration-200
             shadow-lg hidden md:flex items-center justify-center"
      aria-label="Scroll derecha"
    >
      <IconChevronRight :size="24" />
    </button>

    <!-- Contenedor scroll -->
    <div
      ref="scrollContainer"
      class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2"
      @scroll="updateScrollState"
    >
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  },
  showAllLink: {
    type: String,
    default: ''
  }
})

const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const SCROLL_AMOUNT = 400

const updateScrollState = () => {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 10
}

const scrollLeft = () => {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' })
}

const scrollRight = () => {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
}

onMounted(() => {
  updateScrollState()
})
</script>
