import type { InjectionKey, Ref, ComputedRef } from 'vue'

export interface DetailStickyState {
  title: string
  playing: boolean
  onPlay: () => void
  bgClass: string
}

interface DetailStickyContext {
  state: Ref<DetailStickyState | null>
  scrollTop: Ref<number>
}

const DETAIL_STICKY_KEY = Symbol('detailStickyHeader') as InjectionKey<DetailStickyContext>

// Usado por el layout: crea el estado y lo provee
export function provideDetailStickyHeader() {
  const state = ref<DetailStickyState | null>(null)
  const scrollTop = ref(0)
  provide(DETAIL_STICKY_KEY, { state, scrollTop })
  return { state, scrollTop }
}

// Usado por las páginas: registra título y acción de play
export function useDetailStickyHeader(options: {
  title: ComputedRef<string | undefined>
  playing: ComputedRef<boolean>
  onPlay: () => void
  bgClass?: string
}) {
  const ctx = inject(DETAIL_STICKY_KEY)
  if (!ctx) return

  watchEffect(() => {
    const title = options.title.value
    ctx.state.value = title
      ? {
          title,
          playing: options.playing.value,
          onPlay: options.onPlay,
          bgClass: options.bgClass || 'bg-dark-highlight'
        }
      : null
  })

  onBeforeUnmount(() => {
    ctx.state.value = null
  })
}
