interface RecentItem {
  type: 'song' | 'album' | 'artist' | 'playlist'
  id: string
  cover: string
  title: string
  artistName?: string
}

export const useRecentlyPlayed = () => {
  const recentItems = useState<RecentItem[]>('recentlyPlayed', () => [])
  const MAX_RECENT = 8

  const loadRecent = () => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('tigrefy_recently_played')
    if (stored) {
      try {
        recentItems.value = JSON.parse(stored)
      } catch {
        recentItems.value = []
      }
    }
  }

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

    if (typeof window !== 'undefined') {
      localStorage.setItem('tigrefy_recently_played', JSON.stringify(recentItems.value))
    }
  }

  const clearRecent = () => {
    recentItems.value = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tigrefy_recently_played')
    }
  }

  return { recentItems, loadRecent, addToRecent, clearRecent }
}
