interface RecentItem {
  type: 'song' | 'album' | 'artist' | 'playlist'
  id: string
  cover: string
  title: string
  artistName?: string
}

const MAX_RECENT = 8

export const useRecentlyPlayed = () => {
  const recentItems = useLocalStorage<RecentItem[]>('tigrefy_recently_played', [])

  // Compatibilidad con el callsite anterior; la hidratación es automática
  const loadRecent = () => recentItems.value

  const addToRecent = (item: RecentItem) => {
    const existing = recentItems.value.findIndex(
      r => r.type === item.type && r.id === item.id
    )
    if (existing > -1) {
      recentItems.value.splice(existing, 1)
    }
    recentItems.value.unshift(item)
    if (recentItems.value.length > MAX_RECENT) {
      recentItems.value = recentItems.value.slice(0, MAX_RECENT)
    }
  }

  const clearRecent = () => {
    recentItems.value = []
  }

  return { recentItems, loadRecent, addToRecent, clearRecent }
}
