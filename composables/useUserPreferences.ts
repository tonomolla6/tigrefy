// Composable para gestionar preferencias del usuario persistidas en localStorage

export interface PlayerPreferences {
  volume: number
  isMuted: boolean
  repeatMode: 'off' | 'all' | 'one'
  isShuffled: boolean
}

export interface LayoutPreferences {
  leftSidebarWidth: number
  leftSidebarCollapsed: boolean
  rightSidebarWidth: number
}

export interface UIPreferences {
  showQueue: boolean
  showNowPlaying: boolean
  showLyrics: boolean
}

export interface LastPlayedState {
  songId: string | null
  queueIds: string[]
  queueIndex: number
  contextType: string
  contextId: string | null
  currentTime: number
}

export interface UserPreferences {
  player: PlayerPreferences
  layout: LayoutPreferences
  ui: UIPreferences
  lastPlayed: LastPlayedState
}

const STORAGE_KEY = 'tigrefy_user_preferences'

const DEFAULT_LAST_PLAYED: LastPlayedState = {
  songId: null,
  queueIds: [],
  queueIndex: 0,
  contextType: 'unknown',
  contextId: null,
  currentTime: 0
}

const DEFAULT_PREFERENCES: UserPreferences = {
  player: {
    volume: 0.7,
    isMuted: false,
    repeatMode: 'off',
    isShuffled: false
  },
  layout: {
    leftSidebarWidth: 340,
    leftSidebarCollapsed: false,
    rightSidebarWidth: 380
  },
  ui: {
    showQueue: true,
    showNowPlaying: false,
    showLyrics: false
  },
  lastPlayed: DEFAULT_LAST_PLAYED
}

// Estado global para las preferencias
const preferences = ref<UserPreferences | null>(null)
const isLoaded = ref(false)

export const useUserPreferences = () => {
  // Cargar preferencias desde localStorage
  const loadPreferences = (): UserPreferences => {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_PREFERENCES }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge con defaults para asegurar que todas las propiedades existan
        return {
          player: { ...DEFAULT_PREFERENCES.player, ...parsed.player },
          layout: { ...DEFAULT_PREFERENCES.layout, ...parsed.layout },
          ui: { ...DEFAULT_PREFERENCES.ui, ...parsed.ui },
          lastPlayed: { ...DEFAULT_LAST_PLAYED, ...parsed.lastPlayed }
        }
      }
    } catch (e) {
      console.warn('Error loading user preferences:', e)
    }

    return { ...DEFAULT_PREFERENCES }
  }

  // Guardar preferencias en localStorage
  const savePreferences = () => {
    if (typeof window === 'undefined' || !preferences.value) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences.value))
    } catch (e) {
      console.warn('Error saving user preferences:', e)
    }
  }

  // Inicializar preferencias y sincronizar con estados de Nuxt
  const initPreferences = () => {
    if (isLoaded.value) return preferences.value!

    preferences.value = loadPreferences()
    isLoaded.value = true

    // Sincronizar con estados de Nuxt existentes (si ya fueron creados)
    syncWithNuxtState()

    return preferences.value
  }

  // Sincronizar preferencias cargadas con los estados de Nuxt
  const syncWithNuxtState = () => {
    if (!preferences.value || typeof window === 'undefined') return

    const prefs = preferences.value

    // Sincronizar estados del player
    const volume = useState<number>('volume')
    const isMuted = useState<boolean>('isMuted')
    const isShuffled = useState<boolean>('isShuffled')
    const repeatMode = useState<'off' | 'all' | 'one'>('repeatMode')
    const showLyrics = useState<boolean>('showLyrics')
    const showNowPlaying = useState<boolean>('showNowPlaying')
    const showQueue = useState<boolean>('showQueue')

    if (volume.value !== undefined) volume.value = prefs.player.volume
    if (isMuted.value !== undefined) isMuted.value = prefs.player.isMuted
    if (isShuffled.value !== undefined) isShuffled.value = prefs.player.isShuffled
    if (repeatMode.value !== undefined) repeatMode.value = prefs.player.repeatMode
    if (showLyrics.value !== undefined) showLyrics.value = prefs.ui.showLyrics
    if (showNowPlaying.value !== undefined) showNowPlaying.value = prefs.ui.showNowPlaying
    if (showQueue.value !== undefined) showQueue.value = prefs.ui.showQueue

    // Sincronizar estados del layout
    const leftSidebarWidth = useState<number>('leftSidebarWidth')
    const leftSidebarCollapsed = useState<boolean>('leftSidebarCollapsed')
    const rightSidebarWidth = useState<number>('rightSidebarWidth')

    if (leftSidebarWidth.value !== undefined) leftSidebarWidth.value = prefs.layout.leftSidebarWidth
    if (leftSidebarCollapsed.value !== undefined) leftSidebarCollapsed.value = prefs.layout.leftSidebarCollapsed
    if (rightSidebarWidth.value !== undefined) rightSidebarWidth.value = prefs.layout.rightSidebarWidth
  }

  // Actualizar preferencias del reproductor
  const updatePlayerPreferences = (updates: Partial<PlayerPreferences>) => {
    if (!preferences.value) initPreferences()
    preferences.value!.player = { ...preferences.value!.player, ...updates }
    savePreferences()
  }

  // Actualizar preferencias de layout
  const updateLayoutPreferences = (updates: Partial<LayoutPreferences>) => {
    if (!preferences.value) initPreferences()
    preferences.value!.layout = { ...preferences.value!.layout, ...updates }
    savePreferences()
  }

  // Actualizar preferencias de UI
  const updateUIPreferences = (updates: Partial<UIPreferences>) => {
    if (!preferences.value) initPreferences()
    preferences.value!.ui = { ...preferences.value!.ui, ...updates }
    savePreferences()
  }

  // Actualizar estado de última reproducción
  const updateLastPlayed = (updates: Partial<LastPlayedState>) => {
    if (!preferences.value) initPreferences()
    preferences.value!.lastPlayed = { ...preferences.value!.lastPlayed, ...updates }
    savePreferences()
  }

  // Getters computados
  const playerPreferences = computed(() => preferences.value?.player ?? DEFAULT_PREFERENCES.player)
  const layoutPreferences = computed(() => preferences.value?.layout ?? DEFAULT_PREFERENCES.layout)
  const uiPreferences = computed(() => preferences.value?.ui ?? DEFAULT_PREFERENCES.ui)
  const lastPlayedPreferences = computed(() => preferences.value?.lastPlayed ?? DEFAULT_LAST_PLAYED)

  // Resetear preferencias a valores por defecto
  const resetPreferences = () => {
    preferences.value = { ...DEFAULT_PREFERENCES }
    savePreferences()
  }

  return {
    preferences: readonly(preferences),
    isLoaded: readonly(isLoaded),
    playerPreferences,
    layoutPreferences,
    uiPreferences,
    lastPlayedPreferences,
    initPreferences,
    updatePlayerPreferences,
    updateLayoutPreferences,
    updateUIPreferences,
    updateLastPlayed,
    resetPreferences,
    DEFAULT_PREFERENCES
  }
}
