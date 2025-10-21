# 🐯 Tigrefy - Tu Clon de Spotify

Tigrefy es un clon completo de Spotify desarrollado con **Nuxt 3**, **Vue 3** y **Tailwind CSS**, con un tema naranja tigre distintivo. Es una aplicación web totalmente funcional que almacena todos los datos localmente.

## ✨ Características

- 🎵 **Reproductor de audio completo** con controles de reproducción, pausa, siguiente, anterior
- 🔀 **Shuffle y repeat** modes
- 📊 **Visualización de letras** de canciones
- ❤️ **Sistema de favoritos** para canciones, álbumes, artistas y playlists
- 🎨 **Interfaz moderna** inspirada en Spotify con tema naranja tigre
- 📱 **Diseño responsive** que funciona en todos los dispositivos
- 🎭 **Navegación completa** entre artistas, álbumes, playlists y búsqueda
- 💾 **Persistencia local** usando localStorage
- 🎪 **Playlists personalizadas** que puedes crear y editar
- 🔍 **Búsqueda avanzada** con filtros por canciones, álbumes, artistas y playlists

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+ instalado
- npm o yarn

### Pasos de instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

3. Abrir el navegador en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
tigrefy-app/
├── components/          # Componentes Vue reutilizables
│   ├── cards/          # Tarjetas de álbumes, artistas, canciones
│   ├── player/         # Componente del reproductor de música
│   ├── sidebar/        # Sidebar de navegación
│   └── ui/             # Iconos y componentes UI
├── composables/        # Composables de Vue para estado global
│   ├── useData.ts      # Gestión de datos de la app
│   ├── usePlayer.ts    # Lógica del reproductor
│   ├── useFavorites.ts # Gestión de favoritos
│   └── useUserPlaylists.ts # Gestión de playlists del usuario
├── layouts/            # Layouts de Nuxt
│   └── default.vue     # Layout principal con sidebar y reproductor
├── pages/              # Páginas de la aplicación
│   ├── index.vue       # Página de inicio
│   ├── search.vue      # Página de búsqueda
│   ├── library.vue     # Tu biblioteca
│   ├── liked-songs.vue # Canciones favoritas
│   ├── album/[id].vue  # Vista de álbum
│   ├── artist/[id].vue # Vista de artista
│   └── playlist/[id].vue # Vista de playlist
├── public/
│   ├── db.json         # Base de datos local con toda la música
│   └── covers/         # Imágenes de portadas (placeholders SVG)
└── assets/css/         # Estilos globales
```

## 🎨 Personalización del Tema

El tema naranja tigre está configurado en `tailwind.config.js`:

```javascript
colors: {
  tiger: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Color principal
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  }
}
```

## 📝 Base de Datos Local

Los datos están almacenados en `public/db.json` e incluyen:

- **Artistas**: The Weeknd, Bad Bunny, Taylor Swift, Drake, Billie Eilish
- **Álbumes**: 6 álbumes completos
- **Canciones**: 12 canciones con letras completas
- **Playlists**: 4 playlists curadas

### Agregar tu propia música

Para agregar tus propias canciones, edita `public/db.json`:

1. **Agregar un artista**:
```json
{
  "id": "6",
  "name": "Nombre del Artista",
  "image": "/covers/mi-artista.jpg",
  "followers": 1000000,
  "genres": ["Pop", "Rock"],
  "bio": "Biografía del artista"
}
```

2. **Agregar un álbum**:
```json
{
  "id": "7",
  "title": "Nombre del Álbum",
  "artistId": "6",
  "artistName": "Nombre del Artista",
  "cover": "/covers/mi-album.jpg",
  "releaseDate": "2024-01-01",
  "totalTracks": 10,
  "duration": 2400,
  "genres": ["Pop"]
}
```

3. **Agregar una canción**:
```json
{
  "id": "13",
  "title": "Nombre de la Canción",
  "artistId": "6",
  "artistName": "Nombre del Artista",
  "albumId": "7",
  "albumName": "Nombre del Álbum",
  "duration": 200,
  "cover": "/covers/mi-album.jpg",
  "audioUrl": "/audio/mi-cancion.mp3",
  "lyrics": "Letra de la canción aquí...",
  "plays": 1000000,
  "releaseDate": "2024-01-01"
}
```

4. **Colocar archivos de audio**: Coloca tus archivos MP3 en `public/audio/`
5. **Colocar portadas**: Coloca las imágenes en `public/covers/`

## 🎵 Funcionalidades del Reproductor

- ▶️ Play/Pause
- ⏭️ Siguiente canción
- ⏮️ Canción anterior
- 🔀 Modo aleatorio (shuffle)
- 🔁 Modo repetición (off/all/one)
- 🔊 Control de volumen
- 🔇 Silenciar
- 📜 Ver letras
- ⏱️ Barra de progreso con seek
- 📋 Cola de reproducción

## 💾 Persistencia de Datos

La aplicación guarda automáticamente en localStorage:

- ❤️ Canciones, álbumes, artistas y playlists favoritas
- 🎵 Playlists creadas por el usuario
- ⚙️ Configuración del reproductor

## 🛠️ Tecnologías Utilizadas

- **Nuxt 3** - Framework de Vue.js
- **Vue 3** - Framework JavaScript progresivo
- **Tailwind CSS** - Framework de CSS utility-first
- **TypeScript** - Tipado estático
- **HTML5 Audio API** - Para reproducción de audio

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Generar sitio estático
npm run generate
```

## 🎯 Próximas Mejoras

- [ ] Agregar más canciones y artistas
- [ ] Implementar ecualizador
- [ ] Agregar animaciones más complejas
- [ ] Modo oscuro/claro toggle
- [ ] Export/import de playlists
- [ ] Estadísticas de reproducción
- [ ] Recomendaciones basadas en escucha

## 🐛 Solución de Problemas

### No se reproducen las canciones
- Asegúrate de que los archivos MP3 existen en `public/audio/`
- Verifica que las rutas en `db.json` son correctas
- Abre la consola del navegador para ver errores

### Las imágenes no se cargan
- Los placeholders SVG se generan automáticamente
- Para imágenes reales, colócalas en `public/covers/`
- Actualiza las rutas en `db.json`

### Los favoritos no se guardan
- Verifica que localStorage esté habilitado en tu navegador
- Limpia la caché del navegador si hay problemas

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Siéntete libre de:

- Reportar bugs
- Sugerir nuevas características
- Mejorar la documentación
- Enviar pull requests

## 🙏 Créditos

Desarrollado con ❤️ usando Nuxt 3, Vue 3 y Tailwind CSS.

---

**Nota**: Para usar archivos de audio reales, coloca tus archivos MP3 en la carpeta `public/audio/` y actualiza las rutas en `db.json`. Los archivos de audio no están incluidos por razones de derechos de autor.
