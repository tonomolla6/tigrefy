# 🐯 Tigrefy - La App Musical de Los Tigres

¡Bienvenido a **Tigrefy**! Tu plataforma musical personalizada creada con las últimas tecnologías web.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:3000`

### Build para producción

```bash
npm run build
npm run preview
```

## 📱 Características

- **🎵 Reproductor Completo**: Play, pause, siguiente, anterior, shuffle, repeat
- **📜 Letras**: Visualiza las letras de tus canciones favoritas
- **❤️ Favoritos**: Guarda tus canciones y álbumes favoritos
- **🔍 Búsqueda**: Encuentra cualquier canción rápidamente
- **📱 Responsive**: Funciona perfecto en móvil, tablet y desktop
- **💾 Persistencia**: Tus favoritos se guardan automáticamente
- **🎨 Tema Tigre**: Diseño en naranja tigre inspirado en Spotify

## 🎼 Agregar Nuevas Canciones

### 1. Agregar el archivo de audio

Coloca tu archivo MP3 en la carpeta `public/audio/`

Ejemplo: `public/audio/mi-cancion.mp3`

### 2. Agregar la portada

Coloca la imagen del álbum en `public/covers/`

Ejemplo: `public/covers/mi-album.png`

### 3. Actualizar db.json

Edita el archivo `public/db.json`:

#### Para agregar una canción nueva:

```json
{
  "id": "3",
  "title": "Nombre de tu Canción",
  "artistId": "1",
  "artistName": "Tigre Number One",
  "albumId": "1",
  "albumName": "Varios 2025",
  "duration": 180,
  "cover": "/covers/mi-album.png",
  "audioUrl": "/audio/mi-cancion.mp3",
  "lyrics": "Aquí van las letras de tu canción...",
  "plays": 100000,
  "releaseDate": "2025-01-01"
}
```

#### Para agregar un álbum nuevo:

```json
{
  "id": "3",
  "title": "Mi Nuevo Álbum",
  "artistId": "4",
  "artistName": "Los Tigres",
  "cover": "/covers/mi-album.png",
  "releaseDate": "2025-06-01",
  "totalTracks": 5,
  "duration": 900,
  "genres": ["Party", "Electronic"]
}
```

## 🎨 Estructura del Proyecto

```
tigrefy-app/
├── components/           # Componentes Vue
│   ├── player/          # Reproductor de música
│   ├── sidebar/         # Navegación
│   ├── cards/           # Tarjetas de álbumes/canciones
│   └── ui/              # Componentes UI (iconos, modal)
├── composables/         # Lógica reutilizable
│   ├── useData.ts       # Gestión de datos
│   ├── usePlayer.ts     # Reproductor
│   ├── useFavorites.ts  # Favoritos
│   └── useModal.ts      # Modales
├── pages/               # Páginas de la app
│   ├── index.vue        # Inicio (¡Hola, Tigre!)
│   ├── albums.vue       # Lista de álbumes
│   ├── songs.vue        # Lista de canciones con buscador
│   ├── liked-songs.vue  # Canciones favoritas
│   └── album/[id].vue   # Vista de álbum individual
├── public/
│   ├── db.json          # Base de datos local
│   ├── covers/          # Portadas de álbumes
│   └── audio/           # Archivos MP3
└── assets/css/          # Estilos globales
```

## 🎵 Navegación

- **Inicio**: Portada con saludo y álbumes destacados
- **Álbumes**: Todos los álbumes disponibles
- **Canciones**: Todas las canciones con buscador
- **Favoritas**: Tus canciones favoritas

## 📱 Controles del Reproductor

### Desktop:
- **Reproducción**: Click en el botón de play principal
- **Volumen**: Control deslizante en la parte derecha
- **Letras**: Botón "Letras" cuando está disponible
- **Shuffle/Repeat**: Botones a los lados del reproductor

### Móvil:
- **Reproducción**: Botones centrales
- **Menú adicional**: Botón de 3 puntos verticales
  - Shuffle
  - Repeat
  - Favoritos
  - Letras

## 💡 Características Técnicas

- **Nuxt 3**: Framework Vue.js de última generación
- **Vue 3**: Con Composition API
- **Tailwind CSS**: Estilos utility-first
- **TypeScript**: Tipado estático
- **HTML5 Audio API**: Reproducción nativa
- **LocalStorage**: Persistencia de favoritos
- **Responsive Design**: Mobile-first approach

## 🎯 Próximas Mejoras Sugeridas

- [ ] Agregar más canciones y álbumes
- [ ] Implementar visualizador de audio
- [ ] Añadir ecualizador
- [ ] Sistema de playlists personalizadas
- [ ] Estadísticas de reproducción
- [ ] Modo oscuro/claro
- [ ] Compartir canciones
- [ ] PWA (Progressive Web App)

## 🐯 Los Tigres

Esta aplicación es creada por y para **Los Tigres**. Añade tus propias canciones, comparte con tus amigos, y disfruta de tu música personalizada.

---

**¡Que viva la música tigre! 🐯🎵**
