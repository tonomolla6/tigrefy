const MAX_HISTORY = 10

export const useSearchHistory = () => {
  const history = useLocalStorage<string[]>('tigrefy_search_history', [])

  // Llamar al menos una vez para forzar la hidratación inicial.
  // Los componentes existentes la usaban en onMounted, lo mantenemos por compat.
  const loadHistory = () => history.value

  const addSearch = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return

    // Quitar duplicado case-insensitive y meter al principio
    const filtered = history.value.filter(
      item => item.toLowerCase() !== trimmed.toLowerCase()
    )
    history.value = [trimmed, ...filtered].slice(0, MAX_HISTORY)
  }

  const getHistory = () => history.value

  const clearHistory = () => {
    history.value = []
  }

  const removeItem = (query: string) => {
    history.value = history.value.filter(item => item !== query)
  }

  return {
    loadHistory,
    addSearch,
    getHistory,
    clearHistory,
    removeItem,
  }
}
