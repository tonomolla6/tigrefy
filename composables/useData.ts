export const useData = () => {
  const data = useState('appData', () => ({
    artists: [] as any[],
    albums: [] as any[],
    songs: [] as any[],
    playlists: [] as any[]
  }))

  const loadData = async () => {
    try {
      const response = await fetch('/db.json')
      const jsonData = await response.json()
      data.value = jsonData
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const getSongById = (id: string) => {
    return data.value.songs.find(song => song.id === id)
  }

  const getAlbumById = (id: string) => {
    return data.value.albums.find(album => album.id === id)
  }

  const getArtistById = (id: string) => {
    return data.value.artists.find(artist => artist.id === id)
  }

  const getPlaylistById = (id: string) => {
    return data.value.playlists.find(playlist => playlist.id === id)
  }

  const getSongsByAlbumId = (albumId: string) => {
    return data.value.songs.filter(song => song.albumId === albumId)
  }

  const getAlbumsByArtistId = (artistId: string) => {
    return data.value.albums.filter(album => album.artistId === artistId)
  }

  const getSongsByArtistId = (artistId: string) => {
    return data.value.songs.filter(song => song.artistId === artistId)
  }

  const getSongsByIds = (ids: string[]) => {
    return data.value.songs.filter(song => ids.includes(song.id))
  }

  const searchAll = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return {
      songs: data.value.songs.filter(song => {
        const matchTitle = song.title.toLowerCase().includes(lowerQuery)
        const matchArtist = song.artistName.toLowerCase().includes(lowerQuery)
        const matchAlbum = song.albumName?.toLowerCase().includes(lowerQuery)
        const matchLyrics = song.lyrics?.toLowerCase().includes(lowerQuery)
        return matchTitle || matchArtist || matchAlbum || matchLyrics
      }),
      albums: data.value.albums.filter(album => {
        const matchTitle = album.title.toLowerCase().includes(lowerQuery)
        const matchArtist = album.artistName.toLowerCase().includes(lowerQuery)
        const matchGenres = album.genres?.some((genre: string) =>
          genre.toLowerCase().includes(lowerQuery)
        )
        return matchTitle || matchArtist || matchGenres
      }),
      artists: data.value.artists.filter(artist => {
        const matchName = artist.name.toLowerCase().includes(lowerQuery)
        const matchGenres = artist.genres?.some((genre: string) =>
          genre.toLowerCase().includes(lowerQuery)
        )
        return matchName || matchGenres
      }),
      playlists: data.value.playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(lowerQuery)
      )
    }
  }

  const searchByGenre = (genre: string) => {
    const lowerGenre = genre.toLowerCase()

    // Encontrar artistas y álbumes que tienen este género
    const matchingArtists = data.value.artists.filter(artist =>
      artist.genres?.some((g: string) => g.toLowerCase() === lowerGenre)
    )
    const matchingAlbums = data.value.albums.filter(album =>
      album.genres?.some((g: string) => g.toLowerCase() === lowerGenre)
    )

    // Obtener IDs de álbumes que tienen el género
    const albumIds = matchingAlbums.map(a => a.id)

    // Filtrar canciones: priorizar el género del álbum
    // Solo incluir por artista si el álbum no tiene géneros definidos
    const matchingSongs = data.value.songs.filter(song => {
      // Primero buscar el álbum de la canción
      const album = data.value.albums.find(a => a.id === song.albumId)

      // Si el álbum tiene géneros, usar solo esos
      if (album && album.genres && album.genres.length > 0) {
        return album.genres.some((g: string) => g.toLowerCase() === lowerGenre)
      }

      // Si el álbum no tiene géneros, usar los del artista
      const artist = data.value.artists.find(a => a.id === song.artistId)
      return artist?.genres?.some((g: string) => g.toLowerCase() === lowerGenre)
    })

    return {
      songs: matchingSongs,
      albums: matchingAlbums,
      artists: matchingArtists,
      playlists: []
    }
  }

  interface AdvancedFilters {
    genres?: string[]
    yearFrom?: number
    yearTo?: number
    durationRange?: 'short' | 'medium' | 'long' // <3min, 3-5min, >5min
  }

  const applyAdvancedFilters = (results: any, filters: AdvancedFilters) => {
    let filteredResults = { ...results }

    // Filtrar por géneros (si se especifican)
    if (filters.genres && filters.genres.length > 0) {
      const lowerGenres = filters.genres.map(g => g.toLowerCase())

      filteredResults.songs = results.songs.filter((song: any) => {
        const album = data.value.albums.find(a => a.id === song.albumId)
        const artist = data.value.artists.find(a => a.id === song.artistId)
        const songGenres = [
          ...(album?.genres || []),
          ...(artist?.genres || [])
        ].map(g => g.toLowerCase())
        return lowerGenres.some(fg => songGenres.includes(fg))
      })

      filteredResults.albums = results.albums.filter((album: any) =>
        album.genres?.some((g: string) =>
          lowerGenres.includes(g.toLowerCase())
        )
      )

      filteredResults.artists = results.artists.filter((artist: any) =>
        artist.genres?.some((g: string) =>
          lowerGenres.includes(g.toLowerCase())
        )
      )
    }

    // Filtrar por rango de años
    if (filters.yearFrom || filters.yearTo) {
      const filterByYear = (item: any) => {
        if (!item.releaseDate) return false
        const year = new Date(item.releaseDate).getFullYear()
        if (filters.yearFrom && year < filters.yearFrom) return false
        if (filters.yearTo && year > filters.yearTo) return false
        return true
      }

      filteredResults.songs = filteredResults.songs.filter(filterByYear)
      filteredResults.albums = filteredResults.albums.filter(filterByYear)
    }

    // Filtrar por duración (solo para canciones)
    if (filters.durationRange) {
      filteredResults.songs = filteredResults.songs.filter((song: any) => {
        const durationInMinutes = song.duration / 60
        switch (filters.durationRange) {
          case 'short':
            return durationInMinutes < 3
          case 'medium':
            return durationInMinutes >= 3 && durationInMinutes <= 5
          case 'long':
            return durationInMinutes > 5
          default:
            return true
        }
      })
    }

    return filteredResults
  }

  return {
    data,
    loadData,
    getSongById,
    getAlbumById,
    getArtistById,
    getPlaylistById,
    getSongsByAlbumId,
    getAlbumsByArtistId,
    getSongsByArtistId,
    getSongsByIds,
    searchAll,
    searchByGenre,
    applyAdvancedFilters
  }
}
