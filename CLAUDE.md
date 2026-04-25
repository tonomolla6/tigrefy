# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tigrefy is a Spotify-inspired music player built with Nuxt 3, Vue 3, Pinia and Tailwind CSS. Backend uses Turso (libSQL/SQLite) via Drizzle ORM, Cloudflare R2 for media storage and Cloudflare Workers for hosting. Hybrid rendering: pages render client-side (SPA), `/api/**` routes render server-side.

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server at http://localhost:3000 (loads .env)
npm run build            # Build for Cloudflare (NITRO_PRESET=cloudflare-module)
npm run deploy:worker    # Build + wrangler deploy
npm run preview          # Preview built output
npm run db:push          # Push schema to Turso (dev) — uses .env
npm run db:migrate       # Apply migrations to Turso (dev) — uses .env
npm run db:studio        # Drizzle Studio UI
npm run db:migrate:prod  # Apply migrations to prod — uses .env.production
```

Production deploy is automatic via Cloudflare's Git integration on push to `main`.

## Architecture

### Data flow

**Source of truth**: Turso (libSQL/SQLite) accessed via Drizzle ORM. Schema in [server/db/schema.ts](server/db/schema.ts), migrations in [drizzle/](drizzle/).

**Frontend**: Pinia stores ([stores/](stores/)) cache content fetched from `/api/*` endpoints. Composables in [composables/](composables/) wrap stores with reactive helpers.

```
Vue component → composable → Pinia store → $fetch('/api/...') → Drizzle → Turso
```

**Auth**: JWT (HS256, jose) in `tigrefy_token` cookie, 7-day expiry. PBKDF2 password hashing. Roles: `tigre` (admin), `user`, `guest`. Middleware in [server/middleware/](server/middleware/) protects API routes; route-level Vue middleware (`middleware: 'auth'` / `'tigre'`) guards pages.

**Media (covers, artists, audio)**: Cloudflare R2.
- **Images**: served public from `https://media[-dev].tigrefy.tonomolla.com/{covers,artists}/...`
- **Audio**: MP3s still served from `public/audio/` (HLS migration in progress, not yet active)
- Frontend builds image URLs via [composables/useMediaUrl.ts](composables/useMediaUrl.ts) → [components/ui/SecureImage.vue](components/ui/SecureImage.vue)

### Environments

`tigrefy` (prod) and `tigrefy-dev` (dev) — both Turso DB and R2 bucket separated. Local dev always points to dev. See [.env.example](.env.example).

| Source | Used by |
|---|---|
| `.env` | `npm run dev` and local scripts (`node --env-file=.env ...`) |
| `.env.production` | Only `npm run db:migrate:prod` |
| Cloudflare dashboard secrets | Deployed Worker — uses `NUXT_*` prefix to override `runtimeConfig` |

Required env vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET`, `R2_MEDIA_DOMAIN`, `R2_SIGNING_SECRET`, `R2_ACCOUNT_ID`, `R2_MEDIA_ACCESS_KEY_ID`, `R2_MEDIA_SECRET_ACCESS_KEY`, `R2_MEDIA_BUCKET`. In Cloudflare dashboard, prefix all with `NUXT_` (e.g. `NUXT_PUBLIC_R2_MEDIA_DOMAIN`).

### Component & page layout

```
components/
├── admin/        FileUpload (drag-drop)
├── auth/         LoginScreen
├── cards/        Album/Artist/Playlist/SongCard
├── home/         HomeContent, HeroNewRelease, MediaSection, QuickAccessCard...
├── player/       MusicPlayer, FullscreenPlayer, QueueSheet, QueueSidebar, NowPlayingSidebar
├── sidebar/      MainSidebar, MobileNav, MobileSideMenu
├── song/         SongList, ArtistTopSongs
└── ui/           SecureImage, modals, sheets, icons, base controls
```

Components auto-imported with `pathPrefix: false` → use `<PlayerBar />` directly.

```
pages/
├── index.vue          Home (auth-gated landing or content)
├── login.vue          Login form
├── admin.vue          Tigre-only admin dashboard
├── library.vue        Saved playlists/albums
├── liked-songs.vue    Liked songs
├── search.vue         Multi-type search
├── lyrics.vue         Current track lyrics
├── songs.vue, albums.vue, artists.vue
├── album/[id].vue, artist/[id].vue, playlist/[id].vue, track/[id].vue
└── section/{albums,artists,playlists}.vue
```

### API endpoints

```
/api/auth/{login,logout,register,me}
/api/admin/                        [tigre]
  ├─ content.get
  ├─ upload.post                   (cover/artist → R2; audio → public/audio or R2)
  ├─ {artists,albums,songs,playlists,users}/  CRUD
  └─ playlists/[id]/songs.{get,post}
/api/{songs,albums,artists,playlists}/
  ├─ index.get   (filtered by role)
  └─ [id].get    (+ subroutes: play.post, like.{get,post}, save.post)
/api/user/                         [auth]
  ├─ liked-songs.get, saved-{playlists,albums}.get
  ├─ playlists/index.get, [id]/save.post
  ├─ favorites/  (legacy artist favorites)
  └─ history/plays.{get,post}
/api/search.get
/api/media/track/[id].m3u8.get     (HLS playlist with signed segments — not in use yet)
```

### Pinia stores

- `auth` — current user, login/logout/register, role checks
- `data` — orchestrates `loadAllData` across the four content stores
- `songs`, `albums`, `artists`, `playlists` — cache + fetch + getters
- `favorites` — liked songs, saved playlists/albums, followed artists
- `user` — user-created playlists, play history

### Composables

- `useAuth` — auth store wrapper (login/logout, role checks)
- `usePlayer` — singleton `HTMLAudioElement`, queue, shuffle, repeat ('off' | 'all' | 'one')
- `useMediaUrl` — `getImageUrl(path)` → R2 URL, `getTrackPlaylistUrl(id)` → HLS endpoint
- `useFavorites` — toggle/check song/playlist/album/artist favorites
- `useUserPreferences` — localStorage prefs (volume, layout, last played track/queue)
- `useData` — orchestration wrapper for loading
- `useContextPlayback` — reusable play-from-context for album/playlist/artist pages
- `useSearchHistory`, `useRecentlyPlayed` — localStorage history
- `useModal`, `useToast` — UI primitives
- `useSongListColumns` — configure visible columns in song tables
- `useSidebarResize`, `useScrollRestore`, `useDetailStickyHeader` — UI state

LocalStorage keys: `tigrefy_user_preferences`, `tigrefy_search_history`, `tigrefy_recently_played`, `tigrefy_auth`.

## Adding new music

Through the admin page at `/admin` (requires `tigre` role):

1. **Crear artista** → tab Artistas → form (incluye subir imagen vía `<FileUpload type="artist">` → R2 `artists/`)
2. **Crear álbum** → tab Álbumes → form + subir cover (R2 `covers/`)
3. **Crear canción** → tab Canciones → form + subir MP3 (`public/audio/` por defecto, o R2 si `USE_R2_STORAGE=true`)
4. Marcar `isPublic` para que aparezca a usuarios sin rol tigre

The admin endpoints (`POST /api/admin/{artists,albums,songs}`) call Drizzle to insert. Upload endpoint at [server/api/admin/upload.post.ts](server/api/admin/upload.post.ts) routes by `type`: cover/artist/hls always to R2, audio depends on flag.

## Database schema (key tables)

- `artists`, `albums`, `songs`, `genres`, `song_genres`
- `playlists` (unified: system playlists have `ownerId = null`)
- `playlist_songs` (junction with position)
- `saved_playlists`, `saved_albums` — user library
- `song_likes`, `artist_followers` — user favorites
- `users`, `user_sessions`, `user_play_history`, `user_search_history`

IDs are 22-char hex strings generated by SQLite (`hex(randomblob(11))`). FK relationships defined in schema; cascading deletes for user-owned data.

## Scripts (one-off utilities)

- `scripts/upload-images-to-r2.mjs` — migrate `public/covers` + `public/artists` to R2
- `scripts/test-r2-setup.mjs` — verify R2 connectivity + URL signing
- `scripts/set-r2-cors.mjs` — set CORS policy on R2 bucket (currently fails with object-only token; use dashboard)
- `scripts/clone-prod-to-dev.mjs` — copy data from prod Turso to dev Turso
- `scripts/wipe-dev-db.mjs` — drop all tables in dev DB (guard against prod URL)
- `scripts/delete-r2-test-file.mjs` — cleanup diagnostic file

All read env via `node --env-file=.env scripts/<name>.mjs`. The `clone-prod-to-dev.mjs` reads both `.env` (dest) and `.env.production` (source).

## Deployment notes

- `nitro.preset = 'cloudflare-module'`, [wrangler.toml](wrangler.toml) configured.
- Routing: `routeRules: { '/**': { ssr: false }, '/api/**': { ssr: true } }` — pages SPA, API SSR.
- `runtimeConfig.public.r2MediaDomain` is the only public env var (rest are server-only).
- Cloudflare auto-deploys on push to `main` via Workers Builds. Build token must exist in Cloudflare API tokens (don't delete it).
- R2 buckets need CORS policy to allow `crossorigin="anonymous"` images (used by `extractDominantColor` in [utils/image.ts](utils/image.ts) for QuickAccessCard / HeroNewRelease).

## In-progress / not yet active

HLS audio streaming exists as scaffolding but is **not wired**:
- [server/api/media/track/[id].m3u8.get.ts](server/api/media/track/) — playlist endpoint with signed segments (not committed yet)
- [composables/useHlsPlayer.ts](composables/useHlsPlayer.ts) — HLS.js wrapper (not committed yet)
- `scripts/convert-mp3-to-hls.ts`, `scripts/upload-hls-to-r2.ts` — migration tooling (not committed yet)
- Plan: convert MP3s → HLS + R2, add Worker for HMAC validation on `media.tigrefy.tonomolla.com/tracks/*`, flip the flag in `usePlayer.ts`.

Until then, audio is served directly from `public/audio/`.
