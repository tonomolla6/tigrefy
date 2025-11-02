export const useSearchHistory = () => {
  const STORAGE_KEY = 'tigrefy_search_history'
  const MAX_HISTORY = 10

  const history = useState<string[]>('searchHistory', () => [])

  const loadHistory = () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          history.value = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Error loading search history:', error)
      }
    }
  }

  const saveHistory = () => {
    if (process.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
      } catch (error) {
        console.error('Error saving search history:', error)
      }
    }
  }

  const addSearch = (query: string) => {
    if (!query.trim()) return

    // Eliminar duplicados (case insensitive)
    const filtered = history.value.filter(
      item => item.toLowerCase() !== query.toLowerCase()
    )

    // Agregar al inicio
    history.value = [query, ...filtered].slice(0, MAX_HISTORY)

    saveHistory()
  }

  const getHistory = () => {
    return history.value
  }

  const clearHistory = () => {
    history.value = []
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const removeItem = (query: string) => {
    history.value = history.value.filter(item => item !== query)
    saveHistory()
  }

  return {
    loadHistory,
    addSearch,
    getHistory,
    clearHistory,
    removeItem
  }
}
