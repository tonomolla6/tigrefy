# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tigrefy is a Spotify-inspired music player web application built with Nuxt 3 and Vue 3. It's a static site (SSR disabled) configured for deployment on Cloudflare Pages. The app features a complete music player with favorites, lyrics, search, shuffle, and repeat modes.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## Architecture

### Data Flow

**Single Source of Truth**: All music data (songs, albums, artists, playlists) is stored in `public/db.json`. This file is fetched and cached in global state via the `useData` composable.

**Global Audio Singleton**: The player uses a single `HTMLAudioElement` instance (`globalAudioElement` in `composables/usePlayer.ts:2`) shared across the entire app to prevent multiple audio instances from playing simultaneously.

**State Management**: Uses Nuxt's `useState` for global reactive state. Key composables:
- `useData.ts` - Loads and queries `db.json` data
- `usePlayer.ts` - Manages audio playback, queue, and player controls
- `useFavorites.ts` - Manages favorites persisted to localStorage with `tigrefy_favorite_*` keys
- `useModal.ts` - Controls modal visibility
- `useUserPlaylists.ts` - Manages user-created playlists

### Component Structure

- `components/player/` - Music player UI and controls
- `components/sidebar/` - Navigation sidebar
- `components/cards/` - Album/song card components
- `components/ui/` - Reusable UI elements (icons, modals)

### Pages

- `pages/index.vue` - Home page with featured content
- `pages/albums.vue` - Album grid view
- `pages/songs.vue` - Song list with search
- `pages/liked-songs.vue` - Favorite songs
- `pages/album/[id].vue` - Individual album view with track list

### Styling

Uses Tailwind CSS with custom theme:
- Custom `tiger` color palette (orange tones: 50-950)
- Dark theme colors (`dark`, `dark-lighter`, `dark-card`, `dark-hover`)
- Theme defined in `tailwind.config.js`

## Adding New Music Content

### Process for Adding Songs

1. Add MP3 file to `public/audio/`
2. Add cover image to `public/covers/`
3. Update `public/db.json` with new song/album entries

### db.json Structure

The database has four main collections:
- `artists` - Artist profiles with id, name, image, followers, genres, bio
- `albums` - Albums with id, title, artistId, artistName, cover, releaseDate, totalTracks, duration, genres
- `songs` - Songs with id, title, artistId, artistName, albumId, albumName, duration, cover, audioUrl, lyrics, plays, releaseDate
- `playlists` - Playlists with id, name, description, cover, songIds, createdAt

All IDs are strings. Relationships use `*Id` fields (e.g., `artistId`, `albumId`).

## Important Technical Details

### Player Implementation

The player (`usePlayer.ts`) implements:
- Queue management with shuffle support
- Three repeat modes: 'off', 'all', 'one'
- Automatic playback on song end
- Previous song restarts current track if > 3 seconds elapsed
- Volume and mute controls

When calling `playSong()`, always pause and reset any existing audio before loading new source to prevent overlapping playback.

### Favorites System

Favorites are stored in localStorage with these keys:
- `tigrefy_favorite_songs`
- `tigrefy_favorite_albums`
- `tigrefy_favorite_artists`
- `tigrefy_favorite_playlists`

Load favorites on app mount using `useFavorites().loadFavorites()`.

### Deployment Configuration

Configured for Cloudflare Pages:
- SSR disabled (`ssr: false` in `nuxt.config.ts`)
- Nitro preset: `cloudflare-pages`
- All assets must be in `public/` directory to be accessible in production

### Component Auto-imports

Components are auto-imported from `~/components` with `pathPrefix: false`, meaning you can use `<PlayerBar />` instead of `<player-PlayerBar />`.
