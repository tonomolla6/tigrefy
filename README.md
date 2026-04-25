# 🐯 Tigrefy

Reproductor musical estilo Spotify para Los Tigres. Hecho con Nuxt 3, Vue 3, Pinia, Tailwind, Turso y Cloudflare R2 + Workers.

## Inicio rápido

```bash
npm install
npm run dev          # http://localhost:3000
```

Necesitas un `.env` válido — copia [.env.example](.env.example) y rellena los valores. La base de datos de dev y el bucket R2 de dev (`tigrefy-dev`) ya están separados de los de producción (`tigrefy`).

## Características

- Reproductor con cola, shuffle y tres modos de repeat
- Letras de canciones
- Favoritos (canciones, playlists, álbumes, artistas) sincronizados con la BD
- Playlists del sistema y playlists de usuario
- Búsqueda por canciones, álbumes, artistas y playlists
- Historial de reproducción y de búsqueda
- Diseño responsive (móvil + desktop)
- Panel de administración (`/admin`) para gestionar contenido

## Stack

| Capa | Tech |
|---|---|
| Frontend | Nuxt 3, Vue 3, Pinia, Tailwind CSS |
| Backend | Nitro server (Cloudflare Workers) |
| Base de datos | Turso (libSQL) + Drizzle ORM |
| Media (covers, artistas) | Cloudflare R2 (público) |
| Audio | `public/audio/` por ahora — migración a HLS en R2 en curso |
| Auth | JWT (jose) + PBKDF2 |
| Hosting | Cloudflare Workers (auto-deploy desde `main`) |

## Estructura

```
tigrefy/
├── components/
│   ├── admin/      Subida de archivos
│   ├── cards/      Tarjetas (album/artist/song/playlist)
│   ├── home/       Secciones de la home
│   ├── player/     Reproductor + colas
│   ├── sidebar/    Navegación
│   ├── song/       Listas de canciones
│   └── ui/         Modales, sheets, iconos, SecureImage
├── composables/    Lógica reutilizable (player, media URLs, auth, ...)
├── stores/         Pinia stores (auth, songs, albums, artists, playlists, ...)
├── pages/          Páginas (index, search, library, admin, album/[id], ...)
├── server/
│   ├── api/        Endpoints (auth, admin, songs, albums, ..., media)
│   ├── db/         Schema Drizzle + cliente Turso
│   ├── middleware/ Auth + tigre guards
│   └── utils/      Auth, R2 client
├── drizzle/        Migraciones SQL
├── scripts/        Utilidades (migración R2, clone prod→dev, ...)
└── public/         favicon, robots.txt y MP3s (audio/) hasta migrar a HLS
```

## Añadir música

Todo se hace desde **el panel de admin** (`/admin`, requiere usuario con rol `tigre`):

1. **Artista** → tab Artistas → crear (con imagen)
2. **Álbum** → tab Álbumes → crear (con cover)
3. **Canción** → tab Canciones → crear (con MP3 + cover)

Las imágenes se suben automáticamente a R2 (bucket `tigrefy-dev` en local, `tigrefy` en prod). Los MP3s todavía se guardan en `public/audio/`.

> **Nota**: editar `public/db.json` ya no funciona — ese sistema fue reemplazado por Turso. El archivo ya no existe.

## Scripts npm

```bash
npm run dev               # Dev server
npm run build             # Build para Cloudflare
npm run deploy:worker     # Build + deploy manual con wrangler
npm run db:push           # Aplicar schema a Turso dev
npm run db:migrate        # Aplicar migraciones a Turso dev
npm run db:migrate:prod   # Aplicar migraciones a Turso PROD
npm run db:studio         # Drizzle Studio UI
```

## Scripts utilidad (carpeta `scripts/`)

Lánzalos con `node --env-file=.env scripts/<nombre>.mjs`:

- `upload-images-to-r2.mjs` — sube `public/covers` + `public/artists` a R2
- `test-r2-setup.mjs` — verifica que R2 funciona y la firma HMAC es correcta
- `set-r2-cors.mjs` — configura CORS del bucket
- `clone-prod-to-dev.mjs` — copia datos de prod Turso → dev Turso
- `wipe-dev-db.mjs` — borra todas las tablas de dev (con guard anti-prod)

## Entornos

| | Dev | Prod |
|---|---|---|
| Turso DB | `tigrefy-dev-publicher0...` | `tigrefy-publicher0...` |
| R2 bucket | `tigrefy-dev` | `tigrefy` |
| Dominio R2 | `media-dev.tigrefy.tonomolla.com` | `media.tigrefy.tonomolla.com` |
| Configurado en | `.env` | Cloudflare Workers → Settings → Variables and Secrets |

Variables de Cloudflare deben llevar prefijo `NUXT_` para sobreescribir el `runtimeConfig` (ej. `NUXT_TURSO_URL`, `NUXT_PUBLIC_R2_MEDIA_DOMAIN`).

## Despliegue

**Automático**: cualquier push a `main` dispara un build en Cloudflare Workers. El estado se ve en el dashboard → Workers → tigrefy → Deployments.

**Manual** (requiere wrangler logueado):
```bash
npm run deploy:worker
```

## Roles

- **tigre** — administrador, ve y gestiona todo
- **user** — usuario autenticado, ve todo el contenido (público y privado), crea playlists
- **guest** — sin login, solo ve contenido marcado como público

El registro de nuevos usuarios requiere una `masterKey` (configurada como secreto en el servidor).
