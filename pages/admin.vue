<template>
  <div class="p-6 pb-40 md:pb-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white mb-2">Panel de Administración</h1>
      <p class="text-gray-400 text-sm">Gestiona usuarios, artistas, álbumes, canciones y playlists</p>
    </div>

    <!-- Stats -->
    <div v-if="stats" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div class="bg-dark-hover rounded-lg p-4">
        <p class="text-gray-400 text-xs">Artistas</p>
        <p class="text-2xl font-bold text-white">{{ artistsList.length }}</p>
      </div>
      <div class="bg-dark-hover rounded-lg p-4">
        <p class="text-gray-400 text-xs">Álbumes</p>
        <p class="text-2xl font-bold text-white">{{ stats.totalAlbums }}</p>
        <p class="text-xs text-gray-500">{{ stats.publicAlbums }} públicos · {{ stats.privateAlbums }} privados</p>
      </div>
      <div class="bg-dark-hover rounded-lg p-4">
        <p class="text-gray-400 text-xs">Canciones</p>
        <p class="text-2xl font-bold text-white">{{ stats.totalSongs }}</p>
        <p class="text-xs text-gray-500">{{ stats.publicSongs }} públicas · {{ stats.privateSongs }} privadas</p>
      </div>
      <div class="bg-dark-hover rounded-lg p-4">
        <p class="text-gray-400 text-xs">Playlists</p>
        <p class="text-2xl font-bold text-white">{{ playlistsList.length }}</p>
      </div>
      <div class="bg-dark-hover rounded-lg p-4">
        <p class="text-gray-400 text-xs">Usuarios</p>
        <p class="text-2xl font-bold text-white">{{ usersList.length }}</p>
        <p class="text-xs text-gray-500">{{ usersByRole.tigre }} tigre · {{ usersByRole.user }} user · {{ usersByRole.guest }} guest</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-4 flex-wrap">
      <button
        @click="activeTab = 'artists'"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="activeTab === 'artists' ? 'bg-white text-black' : 'bg-dark-hover text-white hover:bg-gray-700'"
      >
        Artistas
      </button>
      <button
        @click="activeTab = 'albums'"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="activeTab === 'albums' ? 'bg-white text-black' : 'bg-dark-hover text-white hover:bg-gray-700'"
      >
        Álbumes
      </button>
      <button
        @click="activeTab = 'songs'"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="activeTab === 'songs' ? 'bg-white text-black' : 'bg-dark-hover text-white hover:bg-gray-700'"
      >
        Canciones
      </button>
      <button
        @click="activeTab = 'playlists'"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="activeTab === 'playlists' ? 'bg-white text-black' : 'bg-dark-hover text-white hover:bg-gray-700'"
      >
        Playlists
      </button>
      <button
        @click="activeTab = 'users'"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="activeTab === 'users' ? 'bg-white text-black' : 'bg-dark-hover text-white hover:bg-gray-700'"
      >
        Usuarios
      </button>
    </div>

    <!-- Filtros y botón crear -->
    <div class="flex flex-wrap gap-2 mb-4">
      <!-- Filtros de visibilidad (solo para canciones, álbumes y playlists) -->
      <template v-if="activeTab === 'songs' || activeTab === 'albums' || activeTab === 'playlists'">
        <button
          @click="filter = 'all'"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="filter === 'all' ? 'bg-tiger-500 text-black' : 'bg-dark-hover text-white hover:bg-gray-700'"
        >
          Todas
        </button>
        <button
          @click="filter = 'public'"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="filter === 'public' ? 'bg-green-500 text-black' : 'bg-dark-hover text-white hover:bg-gray-700'"
        >
          Públicas
        </button>
        <button
          @click="filter = 'private'"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="filter === 'private' ? 'bg-red-500 text-white' : 'bg-dark-hover text-white hover:bg-gray-700'"
        >
          Privadas
        </button>
        <div class="flex-1"></div>
      </template>

      <!-- Botones crear -->
      <button
        v-if="activeTab === 'artists'"
        @click="showCreateArtistModal = true"
        class="px-4 py-2 rounded-full text-sm font-medium bg-tiger-500 text-black hover:bg-tiger-400 transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crear artista
      </button>
      <button
        v-if="activeTab === 'albums'"
        @click="showCreateAlbumModal = true"
        class="px-4 py-2 rounded-full text-sm font-medium bg-tiger-500 text-black hover:bg-tiger-400 transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crear álbum
      </button>
      <button
        v-if="activeTab === 'songs'"
        @click="showCreateSongModal = true"
        class="px-4 py-2 rounded-full text-sm font-medium bg-tiger-500 text-black hover:bg-tiger-400 transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crear canción
      </button>
      <button
        v-if="activeTab === 'playlists'"
        @click="showCreatePlaylistModal = true"
        class="px-4 py-2 rounded-full text-sm font-medium bg-tiger-500 text-black hover:bg-tiger-400 transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crear playlist
      </button>
      <button
        v-if="activeTab === 'users'"
        @click="showCreateUserModal = true"
        class="px-4 py-2 rounded-full text-sm font-medium bg-tiger-500 text-black hover:bg-tiger-400 transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crear usuario
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-tiger-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Content Tables -->
    <div v-else class="bg-dark-hover rounded-lg overflow-hidden">
      <!-- Artists Table -->
      <table v-if="activeTab === 'artists'" class="w-full">
        <thead class="bg-black/30">
          <tr>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Artista</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">ID</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="artist in artistsList"
            :key="artist.id"
            class="border-t border-gray-800 hover:bg-black/20"
          >
            <td class="p-3">
              <div class="flex items-center gap-3">
                <img
                  :src="artist.image || '/covers/default-artist.png'"
                  :alt="artist.name"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <span class="text-white text-sm font-medium">{{ artist.name }}</span>
              </div>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-500 text-xs font-mono">{{ artist.id }}</span>
            </td>
            <td class="p-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="openEditArtistModal(artist)"
                  class="p-2 rounded-full bg-tiger-500/20 text-tiger-400 hover:bg-tiger-500/30 transition-colors"
                  title="Editar artista"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmDeleteArtist(artist)"
                  :disabled="isUpdating === artist.id"
                  class="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Eliminar artista"
                >
                  <span v-if="isUpdating === artist.id" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Albums Table -->
      <table v-if="activeTab === 'albums'" class="w-full">
        <thead class="bg-black/30">
          <tr>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Álbum</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Artista</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Pistas</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Visible</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="album in filteredAlbums"
            :key="album.id"
            class="border-t border-gray-800 hover:bg-black/20"
          >
            <td class="p-3">
              <div class="flex items-center gap-3">
                <img
                  :src="album.cover || '/covers/default.png'"
                  :alt="album.title"
                  class="w-10 h-10 rounded object-cover"
                />
                <div class="min-w-0">
                  <p class="text-white text-sm font-medium truncate">{{ album.title }}</p>
                  <p class="text-gray-400 text-xs truncate md:hidden">{{ album.artistName }}</p>
                </div>
              </div>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-300 text-sm">{{ album.artistName }}</span>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-400 text-sm">{{ album.totalTracks }}</span>
            </td>
            <td class="p-3 text-center">
              <button
                @click="toggleAlbumVisibility(album)"
                :disabled="isUpdating === album.id"
                class="p-2 rounded-full transition-colors"
                :class="album.isPublic ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'"
              >
                <span v-if="isUpdating === album.id" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                <span v-else>{{ album.isPublic ? '🔓' : '🔒' }}</span>
              </button>
            </td>
            <td class="p-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="openEditAlbumModal(album)"
                  class="p-2 rounded-full bg-tiger-500/20 text-tiger-400 hover:bg-tiger-500/30 transition-colors"
                  title="Editar álbum"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmDeleteAlbum(album)"
                  :disabled="isUpdating === album.id"
                  class="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Eliminar álbum"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Songs Table -->
      <table v-if="activeTab === 'songs'" class="w-full">
        <thead class="bg-black/30">
          <tr>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Canción</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Artista</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Álbum</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Visible</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="song in filteredSongs"
            :key="song.id"
            class="border-t border-gray-800 hover:bg-black/20"
          >
            <td class="p-3">
              <div class="flex items-center gap-3">
                <img
                  :src="song.cover || '/covers/default.png'"
                  :alt="song.title"
                  class="w-10 h-10 rounded object-cover"
                />
                <div class="min-w-0">
                  <p class="text-white text-sm font-medium truncate">{{ song.title }}</p>
                  <p class="text-gray-400 text-xs truncate md:hidden">{{ song.artistName }}</p>
                </div>
              </div>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-300 text-sm">{{ song.artistName }}</span>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-400 text-sm">{{ song.albumName || '-' }}</span>
            </td>
            <td class="p-3 text-center">
              <button
                @click="toggleSongVisibility(song)"
                :disabled="isUpdating === song.id"
                class="p-2 rounded-full transition-colors"
                :class="song.isPublic ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'"
              >
                <span v-if="isUpdating === song.id" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                <span v-else>{{ song.isPublic ? '🔓' : '🔒' }}</span>
              </button>
            </td>
            <td class="p-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="openEditSongModal(song)"
                  class="p-2 rounded-full bg-tiger-500/20 text-tiger-400 hover:bg-tiger-500/30 transition-colors"
                  title="Editar canción"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmDeleteSong(song)"
                  :disabled="isUpdating === song.id"
                  class="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Eliminar canción"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Playlists Table -->
      <table v-if="activeTab === 'playlists'" class="w-full">
        <thead class="bg-black/30">
          <tr>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Playlist</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Propietario</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Canciones</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Visible</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="playlist in filteredPlaylists"
            :key="playlist.id"
            class="border-t border-gray-800 hover:bg-black/20"
          >
            <td class="p-3">
              <div class="flex items-center gap-3">
                <img
                  :src="playlist.cover || '/covers/default-playlist.png'"
                  :alt="playlist.name"
                  class="w-10 h-10 rounded object-cover"
                />
                <div class="min-w-0">
                  <p class="text-white text-sm font-medium truncate">{{ playlist.name }}</p>
                  <p class="text-gray-400 text-xs truncate md:hidden">{{ playlist.ownerName }}</p>
                </div>
              </div>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-300 text-sm">{{ playlist.ownerName }}</span>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-400 text-sm">{{ playlist.songCount }}</span>
            </td>
            <td class="p-3 text-center">
              <button
                @click="togglePlaylistVisibility(playlist)"
                :disabled="isUpdating === playlist.id"
                class="p-2 rounded-full transition-colors"
                :class="playlist.isPublic ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'"
              >
                <span v-if="isUpdating === playlist.id" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                <span v-else>{{ playlist.isPublic ? '🔓' : '🔒' }}</span>
              </button>
            </td>
            <td class="p-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="openEditPlaylistModal(playlist)"
                  class="p-2 rounded-full bg-tiger-500/20 text-tiger-400 hover:bg-tiger-500/30 transition-colors"
                  title="Editar playlist"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmDeletePlaylist(playlist)"
                  :disabled="isUpdating === playlist.id"
                  class="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Eliminar playlist"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Users Table -->
      <table v-if="activeTab === 'users'" class="w-full">
        <thead class="bg-black/30">
          <tr>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Usuario</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3 hidden md:table-cell">Nombre</th>
            <th class="text-left text-xs font-medium text-gray-400 p-3">Rol</th>
            <th class="text-center text-xs font-medium text-gray-400 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in usersList"
            :key="u.id"
            class="border-t border-gray-800 hover:bg-black/20"
          >
            <td class="p-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-tiger-500 flex items-center justify-center text-black font-bold text-sm">
                  {{ (u.displayName || u.username).slice(0, 2).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-white text-sm font-medium truncate">{{ u.username }}</p>
                  <p class="text-gray-400 text-xs truncate md:hidden">{{ u.displayName }}</p>
                </div>
              </div>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="text-gray-300 text-sm">{{ u.displayName }}</span>
            </td>
            <td class="p-3">
              <select
                :value="u.role"
                @change="changeUserRole(u, ($event.target as HTMLSelectElement).value as 'tigre' | 'user' | 'guest')"
                :disabled="isUpdating === u.id || u.id === user?.id"
                class="bg-dark-card text-white text-sm rounded px-2 py-1 border border-gray-700 focus:border-tiger-500 focus:outline-none disabled:opacity-50"
                :class="{
                  'text-tiger-400': u.role === 'tigre',
                  'text-blue-400': u.role === 'user',
                  'text-gray-400': u.role === 'guest'
                }"
              >
                <option value="tigre" class="text-tiger-400">Tigre</option>
                <option value="user" class="text-blue-400">User</option>
                <option value="guest" class="text-gray-400">Guest</option>
              </select>
            </td>
            <td class="p-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="openEditUserModal(u)"
                  :disabled="isUpdating === u.id"
                  class="p-2 rounded-full bg-tiger-500/20 text-tiger-400 hover:bg-tiger-500/30 transition-colors"
                  title="Editar usuario"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  v-if="u.id !== user?.id"
                  @click="confirmDeleteUser(u)"
                  :disabled="isUpdating === u.id"
                  class="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Eliminar usuario"
                >
                  <span v-if="isUpdating === u.id" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <span v-if="u.id === user?.id" class="text-gray-500 text-xs">Tú</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear Artista -->
    <Teleport to="body">
      <div v-if="showCreateArtistModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold text-white mb-4">Crear nuevo artista</h2>

          <form @submit.prevent="createArtist" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Nombre *</label>
              <input
                v-model="newArtist.name"
                type="text"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Nombre del artista"
                required
              />
            </div>

            <div>
              <FileUpload
                ref="artistImageUpload"
                v-model="newArtist.image"
                type="artist"
                label="Imagen del artista"
                placeholder="/artists/nombre.jpg"
                allow-manual-url
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Biografía</label>
              <textarea
                v-model="newArtist.bio"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500 h-24 resize-none"
                placeholder="Descripción del artista..."
              ></textarea>
            </div>

            <div v-if="createError" class="text-red-400 text-sm">
              {{ createError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="showCreateArtistModal = false"
                class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isCreating"
                class="flex-1 px-4 py-2 rounded-full bg-tiger-500 text-black font-medium hover:bg-tiger-400 transition-colors disabled:opacity-50"
              >
                <span v-if="isCreating">Creando...</span>
                <span v-else>Crear artista</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Editar Artista -->
    <Teleport to="body">
      <div v-if="showEditArtistModal && editingArtist" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold text-white mb-4">Editar artista</h2>

          <form @submit.prevent="saveArtistChanges" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Nombre *</label>
              <input
                v-model="editArtistForm.name"
                type="text"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Nombre del artista"
                required
              />
            </div>

            <div>
              <FileUpload
                ref="editArtistImageUpload"
                v-model="editArtistForm.image"
                type="artist"
                label="Imagen del artista"
                placeholder="/artists/nombre.jpg"
                allow-manual-url
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Biografía</label>
              <textarea
                v-model="editArtistForm.bio"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500 h-24 resize-none"
                placeholder="Descripción del artista..."
              ></textarea>
            </div>

            <div v-if="editArtistError" class="text-red-400 text-sm">
              {{ editArtistError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="closeEditArtistModal"
                class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isEditingArtist"
                class="flex-1 px-4 py-2 rounded-full bg-tiger-500 text-black font-medium hover:bg-tiger-400 transition-colors disabled:opacity-50"
              >
                <span v-if="isEditingArtist">Guardando...</span>
                <span v-else>Guardar cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmar Eliminación Artista -->
    <Teleport to="body">
      <div v-if="artistToDelete" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold text-white mb-2">Eliminar artista</h2>
          <p class="text-gray-400 mb-4">
            ¿Estás seguro de que quieres eliminar a <span class="text-white font-medium">{{ artistToDelete.name }}</span>?
          </p>
          <p class="text-yellow-400 text-sm mb-4">
            Solo se puede eliminar si no tiene álbumes ni canciones asociadas.
          </p>

          <div v-if="deleteArtistError" class="text-red-400 text-sm mb-4">
            {{ deleteArtistError }}
          </div>

          <div class="flex gap-3">
            <button
              @click="artistToDelete = null; deleteArtistError = ''"
              class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="deleteArtist"
              :disabled="isUpdating === artistToDelete?.id"
              class="flex-1 px-4 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <span v-if="isUpdating === artistToDelete?.id">Eliminando...</span>
              <span v-else>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Crear Álbum -->
    <Teleport to="body">
      <div v-if="showCreateAlbumModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold text-white mb-4">Crear nuevo álbum</h2>

          <form @submit.prevent="createAlbum" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Título *</label>
              <input
                v-model="newAlbum.title"
                type="text"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Título del álbum"
                required
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Artista *</label>
              <select
                v-model="newAlbum.artistId"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                required
              >
                <option value="" disabled>Selecciona un artista</option>
                <option v-for="artist in artistsList" :key="artist.id" :value="artist.id">
                  {{ artist.name }}
                </option>
              </select>
            </div>

            <div>
              <FileUpload
                ref="albumCoverUpload"
                v-model="newAlbum.cover"
                type="cover"
                label="Portada del álbum"
                placeholder="/covers/nombre-album.jpg"
                allow-manual-url
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Fecha de lanzamiento</label>
              <input
                v-model="newAlbum.releaseDate"
                type="date"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
              />
            </div>

            <div>
              <label class="flex items-center gap-2 text-sm text-gray-400">
                <input
                  v-model="newAlbum.isPublic"
                  type="checkbox"
                  class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
                />
                Visible para todos (público)
              </label>
            </div>

            <div v-if="createError" class="text-red-400 text-sm">
              {{ createError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="showCreateAlbumModal = false"
                class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isCreating"
                class="flex-1 px-4 py-2 rounded-full bg-tiger-500 text-black font-medium hover:bg-tiger-400 transition-colors disabled:opacity-50"
              >
                <span v-if="isCreating">Creando...</span>
                <span v-else>Crear álbum</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Crear Canción -->
    <Teleport to="body">
      <div v-if="showCreateSongModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold text-white mb-4">Crear nueva canción</h2>

          <form @submit.prevent="createSong" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Título *</label>
              <input
                v-model="newSong.title"
                type="text"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Título de la canción"
                required
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Artista *</label>
              <select
                v-model="newSong.artistId"
                @change="onSongArtistChange"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                required
              >
                <option value="" disabled>Selecciona un artista</option>
                <option v-for="artist in artistsList" :key="artist.id" :value="artist.id">
                  {{ artist.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Álbum *</label>
              <select
                v-model="newSong.albumId"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                :disabled="!newSong.artistId"
                required
              >
                <option value="" disabled>{{ newSong.artistId ? 'Selecciona un álbum' : 'Primero selecciona un artista' }}</option>
                <option v-for="album in filteredAlbumsForSong" :key="album.id" :value="album.id">
                  {{ album.title }}
                </option>
              </select>
            </div>

            <div>
              <FileUpload
                ref="songAudioUpload"
                v-model="newSong.audioUrl"
                type="audio"
                label="Archivo de audio *"
                placeholder="/audio/nombre-cancion.mp3"
                allow-manual-url
                @duration-detected="newSong.duration = $event"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-400 mb-1">Número de pista</label>
                <input
                  v-model.number="newSong.trackNumber"
                  type="number"
                  min="1"
                  class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                  placeholder="Auto"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Duración (seg)</label>
                <input
                  v-model.number="newSong.duration"
                  type="number"
                  min="0"
                  class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Letra</label>
              <textarea
                v-model="newSong.lyrics"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500 h-24 resize-none"
                placeholder="Letra de la canción..."
              ></textarea>
            </div>

            <div>
              <label class="flex items-center gap-2 text-sm text-gray-400">
                <input
                  v-model="newSong.isPublic"
                  type="checkbox"
                  class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
                />
                Visible para todos (público)
              </label>
            </div>

            <div v-if="createError" class="text-red-400 text-sm">
              {{ createError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="showCreateSongModal = false"
                class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isCreating"
                class="flex-1 px-4 py-2 rounded-full bg-tiger-500 text-black font-medium hover:bg-tiger-400 transition-colors disabled:opacity-50"
              >
                <span v-if="isCreating">Creando...</span>
                <span v-else>Crear canción</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Editar Álbum -->
    <Teleport to="body">
      <div v-if="showEditAlbumModal && editingAlbum" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold text-white mb-4">Editar álbum</h2>

          <form @submit.prevent="saveAlbumChanges" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Título *</label>
              <input
                v-model="editAlbumForm.title"
                type="text"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Título del álbum"
                required
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Artista *</label>
              <select
                v-model="editAlbumForm.artistId"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                required
              >
                <option v-for="artist in artistsList" :key="artist.id" :value="artist.id">
                  {{ artist.name }}
                </option>
              </select>
            </div>

            <div>
              <FileUpload
                ref="editAlbumCoverUpload"
                v-model="editAlbumForm.cover"
                type="cover"
                label="Portada del álbum"
                placeholder="/covers/nombre-album.jpg"
                allow-manual-url
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Fecha de lanzamiento</label>
              <input
                v-model="editAlbumForm.releaseDate"
                type="date"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
              />
            </div>

            <div>
              <label class="flex items-center gap-2 text-sm text-gray-400">
                <input
                  v-model="editAlbumForm.isPublic"
                  type="checkbox"
                  class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
                />
                Visible para todos (público)
              </label>
            </div>

            <div v-if="editAlbumError" class="text-red-400 text-sm">
              {{ editAlbumError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="closeEditAlbumModal"
                class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isEditingAlbum"
                class="flex-1 px-4 py-2 rounded-full bg-tiger-500 text-black font-medium hover:bg-tiger-400 transition-colors disabled:opacity-50"
              >
                <span v-if="isEditingAlbum">Guardando...</span>
                <span v-else>Guardar cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmar Eliminación Álbum -->
    <Teleport to="body">
      <div v-if="albumToDelete" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold text-white mb-2">Eliminar álbum</h2>
          <p class="text-gray-400 mb-4">
            ¿Estás seguro de que quieres eliminar <span class="text-white font-medium">{{ albumToDelete.title }}</span>?
          </p>
          <p class="text-yellow-400 text-sm mb-4">
            Solo se puede eliminar si no tiene canciones asociadas.
          </p>

          <div v-if="deleteAlbumError" class="text-red-400 text-sm mb-4">
            {{ deleteAlbumError }}
          </div>

          <div class="flex gap-3">
            <button
              @click="albumToDelete = null; deleteAlbumError = ''"
              class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="deleteAlbum"
              :disabled="isUpdating === albumToDelete?.id"
              class="flex-1 px-4 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <span v-if="isUpdating === albumToDelete?.id">Eliminando...</span>
              <span v-else>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Editar Canción -->
    <Teleport to="body">
      <div v-if="showEditSongModal && editingSong" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold text-white mb-4">Editar canción</h2>

          <form @submit.prevent="saveSongChanges" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Título *</label>
              <input
                v-model="editSongForm.title"
                type="text"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Título de la canción"
                required
              />
            </div>

            <div>
              <FileUpload
                ref="editSongAudioUpload"
                v-model="editSongForm.audioUrl"
                type="audio"
                label="Archivo de audio"
                placeholder="/audio/nombre-cancion.mp3"
                allow-manual-url
                @duration-detected="editSongForm.duration = $event"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-400 mb-1">Número de pista</label>
                <input
                  v-model.number="editSongForm.trackNumber"
                  type="number"
                  min="1"
                  class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Duración (seg)</label>
                <input
                  v-model.number="editSongForm.duration"
                  type="number"
                  min="0"
                  class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Letra</label>
              <textarea
                v-model="editSongForm.lyrics"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500 h-24 resize-none"
                placeholder="Letra de la canción..."
              ></textarea>
            </div>

            <div>
              <label class="flex items-center gap-2 text-sm text-gray-400">
                <input
                  v-model="editSongForm.isPublic"
                  type="checkbox"
                  class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
                />
                Visible para todos (público)
              </label>
            </div>

            <div v-if="editSongError" class="text-red-400 text-sm">
              {{ editSongError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="closeEditSongModal"
                class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isEditingSong"
                class="flex-1 px-4 py-2 rounded-full bg-tiger-500 text-black font-medium hover:bg-tiger-400 transition-colors disabled:opacity-50"
              >
                <span v-if="isEditingSong">Guardando...</span>
                <span v-else>Guardar cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmar Eliminación Canción -->
    <Teleport to="body">
      <div v-if="songToDelete" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold text-white mb-2">Eliminar canción</h2>
          <p class="text-gray-400 mb-4">
            ¿Estás seguro de que quieres eliminar <span class="text-white font-medium">{{ songToDelete.title }}</span>?
          </p>
          <p class="text-yellow-400 text-sm mb-4">
            Esta acción también eliminará la canción de todas las playlists donde esté incluida.
          </p>

          <div v-if="deleteSongError" class="text-red-400 text-sm mb-4">
            {{ deleteSongError }}
          </div>

          <div class="flex gap-3">
            <button
              @click="songToDelete = null; deleteSongError = ''"
              class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="deleteSong"
              :disabled="isUpdating === songToDelete?.id"
              class="flex-1 px-4 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <span v-if="isUpdating === songToDelete?.id">Eliminando...</span>
              <span v-else>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Crear Playlist -->
    <Teleport to="body">
      <div v-if="showCreatePlaylistModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold text-white mb-4">Crear nueva playlist</h2>

          <form @submit.prevent="createPlaylist" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Nombre *</label>
              <input
                v-model="newPlaylist.name"
                type="text"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Nombre de la playlist"
                required
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Descripción</label>
              <textarea
                v-model="newPlaylist.description"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500 h-24 resize-none"
                placeholder="Descripción de la playlist..."
              ></textarea>
            </div>

            <div>
              <FileUpload
                ref="playlistCoverUpload"
                v-model="newPlaylist.cover"
                type="cover"
                label="Portada de la playlist"
                placeholder="/covers/nombre-playlist.jpg"
                allow-manual-url
              />
            </div>

            <div>
              <label class="flex items-center gap-2 text-sm text-gray-400">
                <input
                  v-model="newPlaylist.isPublic"
                  type="checkbox"
                  class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
                />
                Visible para todos (público)
              </label>
            </div>

            <!-- Selector de canciones -->
            <div>
              <label class="block text-sm text-gray-400 mb-1">Canciones (opcional)</label>
              <div class="bg-dark-hover rounded-lg max-h-48 overflow-y-auto">
                <div
                  v-for="song in songs"
                  :key="song.id"
                  @click="togglePlaylistSong(song.id)"
                  class="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer transition-colors"
                  :class="{ 'bg-tiger-500/20': newPlaylistSongIds.includes(song.id) }"
                >
                  <input
                    type="checkbox"
                    :checked="newPlaylistSongIds.includes(song.id)"
                    class="w-4 h-4 rounded bg-dark-hover border-gray-600 text-tiger-500 focus:ring-tiger-500"
                    @click.stop
                    @change="togglePlaylistSong(song.id)"
                  />
                  <img
                    :src="song.cover || '/covers/default.png'"
                    :alt="song.title"
                    class="w-8 h-8 rounded object-cover"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="text-white text-sm truncate">{{ song.title }}</p>
                    <p class="text-gray-400 text-xs truncate">{{ song.artistName }}</p>
                  </div>
                </div>
                <p v-if="songs.length === 0" class="text-gray-500 text-sm p-3 text-center">No hay canciones disponibles</p>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ newPlaylistSongIds.length }} canciones seleccionadas</p>
            </div>

            <div v-if="createError" class="text-red-400 text-sm">
              {{ createError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="showCreatePlaylistModal = false"
                class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isCreating"
                class="flex-1 px-4 py-2 rounded-full bg-tiger-500 text-black font-medium hover:bg-tiger-400 transition-colors disabled:opacity-50"
              >
                <span v-if="isCreating">Creando...</span>
                <span v-else>Crear playlist</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Editar Playlist -->
    <Teleport to="body">
      <div v-if="showEditPlaylistModal && editingPlaylist" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold text-white mb-4">Editar playlist: {{ editingPlaylist.name }}</h2>

          <div class="space-y-4">
            <!-- Canciones actuales -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">Canciones en la playlist ({{ editPlaylistSongIds.length }})</label>
              <div class="bg-dark-hover rounded-lg max-h-40 overflow-y-auto">
                <div
                  v-for="songId in editPlaylistSongIds"
                  :key="songId"
                  class="flex items-center gap-3 p-2 hover:bg-gray-700 transition-colors"
                >
                  <img
                    :src="getSongById(songId)?.cover || '/covers/default.png'"
                    :alt="getSongById(songId)?.title"
                    class="w-8 h-8 rounded object-cover"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="text-white text-sm truncate">{{ getSongById(songId)?.title || 'Canción desconocida' }}</p>
                    <p class="text-gray-400 text-xs truncate">{{ getSongById(songId)?.artistName || '' }}</p>
                  </div>
                  <button
                    @click="removeFromEditPlaylist(songId)"
                    class="p-1 text-red-400 hover:text-red-300 transition-colors"
                    title="Quitar de la playlist"
                  >
                    ✕
                  </button>
                </div>
                <p v-if="editPlaylistSongIds.length === 0" class="text-gray-500 text-sm p-3 text-center">Sin canciones</p>
              </div>
            </div>

            <!-- Añadir canciones -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">Añadir canciones</label>
              <div class="bg-dark-hover rounded-lg max-h-48 overflow-y-auto">
                <div
                  v-for="song in availableSongsForEdit"
                  :key="song.id"
                  @click="addToEditPlaylist(song.id)"
                  class="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <img
                    :src="song.cover || '/covers/default.png'"
                    :alt="song.title"
                    class="w-8 h-8 rounded object-cover"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="text-white text-sm truncate">{{ song.title }}</p>
                    <p class="text-gray-400 text-xs truncate">{{ song.artistName }}</p>
                  </div>
                  <span class="text-tiger-400 text-lg">+</span>
                </div>
                <p v-if="availableSongsForEdit.length === 0" class="text-gray-500 text-sm p-3 text-center">Todas las canciones ya están en la playlist</p>
              </div>
            </div>

            <div v-if="editPlaylistError" class="text-red-400 text-sm">
              {{ editPlaylistError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="closeEditPlaylistModal"
                class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmar Eliminación Playlist -->
    <Teleport to="body">
      <div v-if="playlistToDelete" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold text-white mb-2">Eliminar playlist</h2>
          <p class="text-gray-400 mb-4">
            ¿Estás seguro de que quieres eliminar <span class="text-white font-medium">{{ playlistToDelete.name }}</span>?
          </p>

          <div v-if="deletePlaylistError" class="text-red-400 text-sm mb-4">
            {{ deletePlaylistError }}
          </div>

          <div class="flex gap-3">
            <button
              @click="playlistToDelete = null; deletePlaylistError = ''"
              class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="deletePlaylist"
              :disabled="isUpdating === playlistToDelete?.id"
              class="flex-1 px-4 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <span v-if="isUpdating === playlistToDelete?.id">Eliminando...</span>
              <span v-else>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Crear Usuario -->
    <Teleport to="body">
      <div v-if="showCreateUserModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold text-white mb-4">Crear nuevo usuario</h2>

          <form @submit.prevent="createUser" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Username</label>
              <input
                v-model="newUser.username"
                type="text"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Mínimo 3 caracteres"
                required
                minlength="3"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Nombre para mostrar</label>
              <input
                v-model="newUser.displayName"
                type="text"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Contraseña</label>
              <input
                v-model="newUser.password"
                type="password"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Mínimo 6 caracteres"
                required
                minlength="6"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Rol</label>
              <select
                v-model="newUser.role"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
              >
                <option value="guest">Guest - Solo contenido público</option>
                <option value="user">User - Ve todo el contenido</option>
                <option value="tigre">Tigre - Acceso completo + gestión</option>
              </select>
            </div>

            <div v-if="createUserError" class="text-red-400 text-sm">
              {{ createUserError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="showCreateUserModal = false"
                class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isCreatingUser"
                class="flex-1 px-4 py-2 rounded-full bg-tiger-500 text-black font-medium hover:bg-tiger-400 transition-colors disabled:opacity-50"
              >
                <span v-if="isCreatingUser">Creando...</span>
                <span v-else>Crear usuario</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmar Eliminación -->
    <Teleport to="body">
      <div v-if="userToDelete" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold text-white mb-2">Eliminar usuario</h2>
          <p class="text-gray-400 mb-4">
            ¿Estás seguro de que quieres eliminar a <span class="text-white font-medium">{{ userToDelete.username }}</span>? Esta acción no se puede deshacer.
          </p>

          <div class="flex gap-3">
            <button
              @click="userToDelete = null"
              class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="deleteUser"
              :disabled="isUpdating === userToDelete?.id"
              class="flex-1 px-4 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <span v-if="isUpdating === userToDelete?.id">Eliminando...</span>
              <span v-else>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Editar Usuario -->
    <Teleport to="body">
      <div v-if="showEditUserModal && editingUser" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-card rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold text-white mb-4">Editar usuario</h2>

          <form @submit.prevent="saveUserChanges" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Username</label>
              <input
                v-model="editUserForm.username"
                type="text"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Mínimo 3 caracteres"
                required
                minlength="3"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Nombre para mostrar</label>
              <input
                v-model="editUserForm.displayName"
                type="text"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Nombre visible"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Nueva contraseña <span class="text-gray-600">(dejar vacío para mantener)</span></label>
              <input
                v-model="editUserForm.password"
                type="password"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                placeholder="Mínimo 6 caracteres"
                minlength="6"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Rol</label>
              <select
                v-model="editUserForm.role"
                class="w-full bg-dark-hover text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiger-500"
                :disabled="editingUser.id === user?.id"
              >
                <option value="guest">Guest - Solo contenido público</option>
                <option value="user">User - Ve todo el contenido</option>
                <option value="tigre">Tigre - Acceso completo + gestión</option>
              </select>
              <p v-if="editingUser.id === user?.id" class="text-xs text-gray-500 mt-1">No puedes cambiar tu propio rol</p>
            </div>

            <div v-if="editUserError" class="text-red-400 text-sm">
              {{ editUserError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="closeEditUserModal"
                class="flex-1 px-4 py-2 rounded-full bg-dark-hover text-white hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isEditingUser"
                class="flex-1 px-4 py-2 rounded-full bg-tiger-500 text-black font-medium hover:bg-tiger-400 transition-colors disabled:opacity-50"
              >
                <span v-if="isEditingUser">Guardando...</span>
                <span v-else>Guardar cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'tigre'
})

const { user } = useAuth()

interface Artist {
  id: string
  name: string
  image: string | null
}

interface Song {
  id: string
  title: string
  artistId: string
  artistName: string
  albumId: string | null
  albumName: string | null
  cover: string | null
  isPublic: boolean
}

interface Album {
  id: string
  title: string
  artistId: string
  artistName: string
  cover: string | null
  totalTracks: number
  isPublic: boolean
}

interface AdminUser {
  id: string
  username: string
  displayName: string
  role: 'tigre' | 'user' | 'guest'
  createdAt?: string
  lastLoginAt?: string
}

interface Playlist {
  id: string
  name: string
  description: string | null
  cover: string | null
  ownerId: string | null
  ownerName: string
  isPublic: boolean
  songCount: number
}

interface Stats {
  totalSongs: number
  publicSongs: number
  privateSongs: number
  totalAlbums: number
  publicAlbums: number
  privateAlbums: number
}

const activeTab = ref<'artists' | 'albums' | 'songs' | 'playlists' | 'users'>('artists')
const filter = ref<'all' | 'public' | 'private'>('all')
const isLoading = ref(true)
const isUpdating = ref<string | null>(null)
const isCreating = ref(false)
const createError = ref('')

const artistsList = ref<Artist[]>([])
const songs = ref<Song[]>([])
const albums = ref<Album[]>([])
const playlistsList = ref<Playlist[]>([])
const stats = ref<Stats | null>(null)

// Estado para usuarios
const usersList = ref<AdminUser[]>([])
const showCreateUserModal = ref(false)
const isCreatingUser = ref(false)
const createUserError = ref('')
const userToDelete = ref<AdminUser | null>(null)

// Estado para editar usuario
const showEditUserModal = ref(false)
const editingUser = ref<AdminUser | null>(null)
const isEditingUser = ref(false)
const editUserError = ref('')
const editUserForm = ref({
  username: '',
  displayName: '',
  password: '',
  role: 'guest' as 'tigre' | 'user' | 'guest'
})

// Estado para editar artista
const showEditArtistModal = ref(false)
const editingArtist = ref<Artist | null>(null)
const isEditingArtist = ref(false)
const editArtistError = ref('')
const editArtistForm = ref({
  name: '',
  image: '',
  bio: ''
})
const artistToDelete = ref<Artist | null>(null)
const deleteArtistError = ref('')
const editArtistImageUpload = ref<{ uploadPendingFile: () => Promise<string | null>, hasPendingFile: () => boolean } | null>(null)

// Estado para editar álbum
const showEditAlbumModal = ref(false)
const editingAlbum = ref<Album | null>(null)
const isEditingAlbum = ref(false)
const editAlbumError = ref('')
const editAlbumForm = ref({
  title: '',
  artistId: '',
  cover: '',
  releaseDate: '',
  isPublic: false
})
const albumToDelete = ref<Album | null>(null)
const deleteAlbumError = ref('')
const editAlbumCoverUpload = ref<{ uploadPendingFile: () => Promise<string | null>, hasPendingFile: () => boolean } | null>(null)

// Estado para editar canción
const showEditSongModal = ref(false)
const editingSong = ref<Song | null>(null)
const isEditingSong = ref(false)
const editSongError = ref('')
const editSongForm = ref({
  title: '',
  audioUrl: '',
  trackNumber: null as number | null,
  duration: 0,
  lyrics: '',
  isPublic: false
})
const songToDelete = ref<Song | null>(null)
const deleteSongError = ref('')
const editSongAudioUpload = ref<{ uploadPendingFile: () => Promise<string | null>, hasPendingFile: () => boolean } | null>(null)

// Estado para crear contenido
const showCreateArtistModal = ref(false)
const showCreateAlbumModal = ref(false)
const showCreateSongModal = ref(false)
const showCreatePlaylistModal = ref(false)

// Refs para los componentes de upload
const artistImageUpload = ref<{ uploadPendingFile: () => Promise<string | null>, hasPendingFile: () => boolean } | null>(null)
const albumCoverUpload = ref<{ uploadPendingFile: () => Promise<string | null>, hasPendingFile: () => boolean } | null>(null)
const songAudioUpload = ref<{ uploadPendingFile: () => Promise<string | null>, hasPendingFile: () => boolean } | null>(null)
const playlistCoverUpload = ref<{ uploadPendingFile: () => Promise<string | null>, hasPendingFile: () => boolean } | null>(null)

const newArtist = ref({
  name: '',
  image: '',
  bio: ''
})

const newAlbum = ref({
  title: '',
  artistId: '',
  cover: '',
  releaseDate: '',
  isPublic: false
})

const newSong = ref({
  title: '',
  artistId: '',
  albumId: '',
  audioUrl: '',
  trackNumber: null as number | null,
  duration: 0,
  lyrics: '',
  isPublic: false
})

const newPlaylist = ref({
  name: '',
  description: '',
  cover: '',
  isPublic: true
})

const newPlaylistSongIds = ref<string[]>([])

// Estado para editar playlist
const showEditPlaylistModal = ref(false)
const editingPlaylist = ref<Playlist | null>(null)
const editPlaylistSongIds = ref<string[]>([])
const editPlaylistError = ref('')
const playlistToDelete = ref<Playlist | null>(null)
const deletePlaylistError = ref('')

const newUser = ref({
  username: '',
  displayName: '',
  password: '',
  role: 'guest' as 'tigre' | 'user' | 'guest'
})

const usersByRole = computed(() => ({
  tigre: usersList.value.filter(u => u.role === 'tigre').length,
  user: usersList.value.filter(u => u.role === 'user').length,
  guest: usersList.value.filter(u => u.role === 'guest').length
}))

const filteredSongs = computed(() => {
  if (filter.value === 'public') return songs.value.filter(s => s.isPublic)
  if (filter.value === 'private') return songs.value.filter(s => !s.isPublic)
  return songs.value
})

const filteredAlbums = computed(() => {
  if (filter.value === 'public') return albums.value.filter(a => a.isPublic)
  if (filter.value === 'private') return albums.value.filter(a => !a.isPublic)
  return albums.value
})

const filteredPlaylists = computed(() => {
  if (filter.value === 'public') return playlistsList.value.filter(p => p.isPublic)
  if (filter.value === 'private') return playlistsList.value.filter(p => !p.isPublic)
  return playlistsList.value
})

const filteredAlbumsForSong = computed(() => {
  if (!newSong.value.artistId) return []
  return albums.value.filter(a => a.artistId === newSong.value.artistId)
})

const availableSongsForEdit = computed(() => {
  return songs.value.filter(s => !editPlaylistSongIds.value.includes(s.id))
})

const getSongById = (id: string) => songs.value.find(s => s.id === id)

const loadArtists = async () => {
  try {
    const data = await $fetch<Artist[]>('/api/admin/artists', {
      credentials: 'include'
    })
    artistsList.value = data
  } catch (error) {
    console.error('Error loading artists:', error)
  }
}

const loadContent = async () => {
  isLoading.value = true
  try {
    const data = await $fetch<{ songs: Song[], albums: Album[], stats: Stats }>('/api/admin/content', {
      credentials: 'include'
    })
    songs.value = data.songs
    albums.value = data.albums
    stats.value = data.stats
  } catch (error) {
    console.error('Error loading content:', error)
  } finally {
    isLoading.value = false
  }
}

const loadUsers = async () => {
  try {
    const data = await $fetch<AdminUser[]>('/api/admin/users', {
      credentials: 'include'
    })
    usersList.value = data
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

const loadPlaylists = async () => {
  try {
    const data = await $fetch<Playlist[]>('/api/admin/playlists', {
      credentials: 'include'
    })
    playlistsList.value = data
  } catch (error) {
    console.error('Error loading playlists:', error)
  }
}

const toggleSongVisibility = async (song: Song) => {
  isUpdating.value = song.id
  try {
    await $fetch(`/api/admin/songs/${song.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: { isPublic: !song.isPublic }
    })
    song.isPublic = !song.isPublic
    updateStats()
  } catch (error) {
    console.error('Error updating song:', error)
  } finally {
    isUpdating.value = null
  }
}

const toggleAlbumVisibility = async (album: Album) => {
  isUpdating.value = album.id
  try {
    await $fetch(`/api/admin/albums/${album.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: { isPublic: !album.isPublic }
    })
    album.isPublic = !album.isPublic
    updateStats()
  } catch (error) {
    console.error('Error updating album:', error)
  } finally {
    isUpdating.value = null
  }
}

const togglePlaylistVisibility = async (playlist: Playlist) => {
  isUpdating.value = playlist.id
  try {
    await $fetch(`/api/admin/playlists/${playlist.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: { isPublic: !playlist.isPublic }
    })
    playlist.isPublic = !playlist.isPublic
  } catch (error) {
    console.error('Error updating playlist:', error)
  } finally {
    isUpdating.value = null
  }
}

const updateStats = () => {
  if (stats.value) {
    stats.value.publicSongs = songs.value.filter(s => s.isPublic).length
    stats.value.privateSongs = songs.value.filter(s => !s.isPublic).length
    stats.value.publicAlbums = albums.value.filter(a => a.isPublic).length
    stats.value.privateAlbums = albums.value.filter(a => !a.isPublic).length
  }
}

// Funciones para editar artista
const openEditArtistModal = (artist: Artist) => {
  editingArtist.value = artist
  editArtistForm.value = {
    name: artist.name,
    image: artist.image || '',
    bio: (artist as any).bio || ''
  }
  editArtistError.value = ''
  showEditArtistModal.value = true
}

const closeEditArtistModal = () => {
  showEditArtistModal.value = false
  editingArtist.value = null
  editArtistForm.value = { name: '', image: '', bio: '' }
  editArtistError.value = ''
}

const saveArtistChanges = async () => {
  if (!editingArtist.value) return

  editArtistError.value = ''
  isEditingArtist.value = true

  try {
    // Subir imagen si hay archivo pendiente
    let imageUrl = editArtistForm.value.image
    if (editArtistImageUpload.value?.hasPendingFile()) {
      const uploadedUrl = await editArtistImageUpload.value.uploadPendingFile()
      if (uploadedUrl) {
        imageUrl = uploadedUrl
      } else {
        editArtistError.value = 'Error al subir la imagen. Sube el archivo manualmente a /public/artists/ y escribe la ruta.'
        isEditingArtist.value = false
        return
      }
    }

    const data = await $fetch<{ success: boolean, artist: Artist }>(`/api/admin/artists/${editingArtist.value.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: {
        name: editArtistForm.value.name,
        image: imageUrl || null,
        bio: editArtistForm.value.bio || null
      }
    })

    if (data.success && data.artist) {
      // Actualizar en la lista
      const idx = artistsList.value.findIndex(a => a.id === editingArtist.value?.id)
      if (idx !== -1) {
        artistsList.value[idx] = data.artist
      }
      closeEditArtistModal()
    }
  } catch (error: any) {
    editArtistError.value = error?.data?.statusMessage || 'Error al guardar cambios'
  } finally {
    isEditingArtist.value = false
  }
}

const confirmDeleteArtist = (artist: Artist) => {
  artistToDelete.value = artist
  deleteArtistError.value = ''
}

const deleteArtist = async () => {
  if (!artistToDelete.value) return

  isUpdating.value = artistToDelete.value.id
  deleteArtistError.value = ''

  try {
    await $fetch(`/api/admin/artists/${artistToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    artistsList.value = artistsList.value.filter(a => a.id !== artistToDelete.value?.id)
    artistToDelete.value = null
  } catch (error: any) {
    deleteArtistError.value = error?.data?.statusMessage || 'Error al eliminar artista'
  } finally {
    isUpdating.value = null
  }
}

// Funciones para editar álbum
const openEditAlbumModal = (album: Album) => {
  editingAlbum.value = album
  editAlbumForm.value = {
    title: album.title,
    artistId: album.artistId,
    cover: album.cover || '',
    releaseDate: (album as any).releaseDate || '',
    isPublic: album.isPublic
  }
  editAlbumError.value = ''
  showEditAlbumModal.value = true
}

const closeEditAlbumModal = () => {
  showEditAlbumModal.value = false
  editingAlbum.value = null
  editAlbumForm.value = { title: '', artistId: '', cover: '', releaseDate: '', isPublic: false }
  editAlbumError.value = ''
}

const saveAlbumChanges = async () => {
  if (!editingAlbum.value) return

  editAlbumError.value = ''
  isEditingAlbum.value = true

  try {
    // Subir portada si hay archivo pendiente
    let coverUrl = editAlbumForm.value.cover
    if (editAlbumCoverUpload.value?.hasPendingFile()) {
      const uploadedUrl = await editAlbumCoverUpload.value.uploadPendingFile()
      if (uploadedUrl) {
        coverUrl = uploadedUrl
      } else {
        editAlbumError.value = 'Error al subir la portada. Sube el archivo manualmente a /public/covers/ y escribe la ruta.'
        isEditingAlbum.value = false
        return
      }
    }

    const data = await $fetch<{ success: boolean, album: Album }>(`/api/admin/albums/${editingAlbum.value.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: {
        title: editAlbumForm.value.title,
        artistId: editAlbumForm.value.artistId,
        cover: coverUrl || null,
        releaseDate: editAlbumForm.value.releaseDate || null,
        isPublic: editAlbumForm.value.isPublic
      }
    })

    if (data.success && data.album) {
      // Actualizar en la lista
      const idx = albums.value.findIndex(a => a.id === editingAlbum.value?.id)
      if (idx !== -1) {
        albums.value[idx] = data.album
      }
      updateStats()
      closeEditAlbumModal()
    }
  } catch (error: any) {
    editAlbumError.value = error?.data?.statusMessage || 'Error al guardar cambios'
  } finally {
    isEditingAlbum.value = false
  }
}

const confirmDeleteAlbum = (album: Album) => {
  albumToDelete.value = album
  deleteAlbumError.value = ''
}

const deleteAlbum = async () => {
  if (!albumToDelete.value) return

  isUpdating.value = albumToDelete.value.id
  deleteAlbumError.value = ''

  try {
    await $fetch(`/api/admin/albums/${albumToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    albums.value = albums.value.filter(a => a.id !== albumToDelete.value?.id)
    if (stats.value) {
      stats.value.totalAlbums--
      if (albumToDelete.value.isPublic) {
        stats.value.publicAlbums--
      } else {
        stats.value.privateAlbums--
      }
    }
    albumToDelete.value = null
  } catch (error: any) {
    deleteAlbumError.value = error?.data?.statusMessage || 'Error al eliminar álbum'
  } finally {
    isUpdating.value = null
  }
}

// Funciones para editar canción
const openEditSongModal = (song: Song) => {
  editingSong.value = song
  editSongForm.value = {
    title: song.title,
    audioUrl: (song as any).audioUrl || '',
    trackNumber: (song as any).trackNumber || null,
    duration: (song as any).duration || 0,
    lyrics: (song as any).lyrics || '',
    isPublic: song.isPublic
  }
  editSongError.value = ''
  showEditSongModal.value = true
}

const closeEditSongModal = () => {
  showEditSongModal.value = false
  editingSong.value = null
  editSongForm.value = { title: '', audioUrl: '', trackNumber: null, duration: 0, lyrics: '', isPublic: false }
  editSongError.value = ''
}

const saveSongChanges = async () => {
  if (!editingSong.value) return

  editSongError.value = ''
  isEditingSong.value = true

  try {
    // Subir audio si hay archivo pendiente
    let audioUrl = editSongForm.value.audioUrl
    if (editSongAudioUpload.value?.hasPendingFile()) {
      const uploadedUrl = await editSongAudioUpload.value.uploadPendingFile()
      if (uploadedUrl) {
        audioUrl = uploadedUrl
      } else {
        editSongError.value = 'Error al subir el audio. Sube el archivo manualmente a /public/audio/ y escribe la ruta.'
        isEditingSong.value = false
        return
      }
    }

    const data = await $fetch<{ success: boolean, song: Song }>(`/api/admin/songs/${editingSong.value.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: {
        title: editSongForm.value.title,
        audioUrl: audioUrl || null,
        trackNumber: editSongForm.value.trackNumber || null,
        duration: editSongForm.value.duration || 0,
        lyrics: editSongForm.value.lyrics || null,
        isPublic: editSongForm.value.isPublic
      }
    })

    if (data.success && data.song) {
      // Actualizar en la lista
      const idx = songs.value.findIndex(s => s.id === editingSong.value?.id)
      if (idx !== -1) {
        songs.value[idx] = data.song
      }
      updateStats()
      closeEditSongModal()
    }
  } catch (error: any) {
    editSongError.value = error?.data?.statusMessage || 'Error al guardar cambios'
  } finally {
    isEditingSong.value = false
  }
}

const confirmDeleteSong = (song: Song) => {
  songToDelete.value = song
  deleteSongError.value = ''
}

const deleteSong = async () => {
  if (!songToDelete.value) return

  isUpdating.value = songToDelete.value.id
  deleteSongError.value = ''

  try {
    await $fetch(`/api/admin/songs/${songToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    // Actualizar el conteo del álbum
    if (songToDelete.value.albumId) {
      const album = albums.value.find(a => a.id === songToDelete.value?.albumId)
      if (album) {
        album.totalTracks--
      }
    }

    songs.value = songs.value.filter(s => s.id !== songToDelete.value?.id)
    if (stats.value) {
      stats.value.totalSongs--
      if (songToDelete.value.isPublic) {
        stats.value.publicSongs--
      } else {
        stats.value.privateSongs--
      }
    }
    songToDelete.value = null
  } catch (error: any) {
    deleteSongError.value = error?.data?.statusMessage || 'Error al eliminar canción'
  } finally {
    isUpdating.value = null
  }
}

// Crear artista
const createArtist = async () => {
  createError.value = ''
  isCreating.value = true

  try {
    // Subir imagen si hay archivo pendiente
    let imageUrl = newArtist.value.image
    if (artistImageUpload.value?.hasPendingFile()) {
      const uploadedUrl = await artistImageUpload.value.uploadPendingFile()
      if (uploadedUrl) {
        imageUrl = uploadedUrl
      } else {
        createError.value = 'Error al subir la imagen. Sube el archivo manualmente a /public/artists/ y escribe la ruta.'
        isCreating.value = false
        return
      }
    }

    const data = await $fetch<{ success: boolean, artist: Artist }>('/api/admin/artists', {
      method: 'POST',
      credentials: 'include',
      body: {
        name: newArtist.value.name,
        image: imageUrl || null,
        bio: newArtist.value.bio || null
      }
    })

    if (data.success && data.artist) {
      artistsList.value.push(data.artist)
      showCreateArtistModal.value = false
      newArtist.value = { name: '', image: '', bio: '' }
    }
  } catch (error: any) {
    createError.value = error?.data?.statusMessage || 'Error al crear artista'
  } finally {
    isCreating.value = false
  }
}

// Crear álbum
const createAlbum = async () => {
  createError.value = ''
  isCreating.value = true

  try {
    // Subir portada si hay archivo pendiente
    let coverUrl = newAlbum.value.cover
    if (albumCoverUpload.value?.hasPendingFile()) {
      const uploadedUrl = await albumCoverUpload.value.uploadPendingFile()
      if (uploadedUrl) {
        coverUrl = uploadedUrl
      } else {
        createError.value = 'Error al subir la portada. Sube el archivo manualmente a /public/covers/ y escribe la ruta.'
        isCreating.value = false
        return
      }
    }

    const data = await $fetch<{ success: boolean, album: Album }>('/api/admin/albums', {
      method: 'POST',
      credentials: 'include',
      body: {
        title: newAlbum.value.title,
        artistId: newAlbum.value.artistId,
        cover: coverUrl || null,
        releaseDate: newAlbum.value.releaseDate || null,
        isPublic: newAlbum.value.isPublic
      }
    })

    if (data.success && data.album) {
      albums.value.unshift(data.album)
      if (stats.value) {
        stats.value.totalAlbums++
        if (data.album.isPublic) {
          stats.value.publicAlbums++
        } else {
          stats.value.privateAlbums++
        }
      }
      showCreateAlbumModal.value = false
      newAlbum.value = { title: '', artistId: '', cover: '', releaseDate: '', isPublic: false }
    }
  } catch (error: any) {
    createError.value = error?.data?.statusMessage || 'Error al crear álbum'
  } finally {
    isCreating.value = false
  }
}

// Crear canción
const createSong = async () => {
  createError.value = ''
  isCreating.value = true

  try {
    // Subir audio si hay archivo pendiente
    let audioUrl = newSong.value.audioUrl
    if (songAudioUpload.value?.hasPendingFile()) {
      const uploadedUrl = await songAudioUpload.value.uploadPendingFile()
      if (uploadedUrl) {
        audioUrl = uploadedUrl
      } else {
        // Si falla la subida, mostrar error específico
        createError.value = 'Error al subir el archivo de audio. Puedes subir el archivo manualmente a /public/audio/ y escribir la ruta (ej: /audio/cancion.mp3)'
        isCreating.value = false
        return
      }
    }

    if (!audioUrl) {
      createError.value = 'Debes seleccionar un archivo de audio'
      isCreating.value = false
      return
    }

    const data = await $fetch<{ success: boolean, song: Song }>('/api/admin/songs', {
      method: 'POST',
      credentials: 'include',
      body: {
        title: newSong.value.title,
        artistId: newSong.value.artistId,
        albumId: newSong.value.albumId,
        audioUrl: audioUrl,
        trackNumber: newSong.value.trackNumber || null,
        duration: newSong.value.duration || 0,
        lyrics: newSong.value.lyrics || null,
        isPublic: newSong.value.isPublic
      }
    })

    if (data.success && data.song) {
      songs.value.unshift(data.song)
      if (stats.value) {
        stats.value.totalSongs++
        if (data.song.isPublic) {
          stats.value.publicSongs++
        } else {
          stats.value.privateSongs++
        }
      }
      // Actualizar totalTracks del álbum
      const album = albums.value.find(a => a.id === newSong.value.albumId)
      if (album) {
        album.totalTracks++
      }
      showCreateSongModal.value = false
      newSong.value = { title: '', artistId: '', albumId: '', audioUrl: '', trackNumber: null, duration: 0, lyrics: '', isPublic: false }
    }
  } catch (error: any) {
    createError.value = error?.data?.statusMessage || 'Error al crear canción'
  } finally {
    isCreating.value = false
  }
}

const onSongArtistChange = () => {
  newSong.value.albumId = ''
}

// Funciones para seleccionar canciones en crear playlist
const togglePlaylistSong = (songId: string) => {
  const idx = newPlaylistSongIds.value.indexOf(songId)
  if (idx === -1) {
    newPlaylistSongIds.value.push(songId)
  } else {
    newPlaylistSongIds.value.splice(idx, 1)
  }
}

// Crear playlist
const createPlaylist = async () => {
  createError.value = ''
  isCreating.value = true

  try {
    // Subir portada si hay archivo pendiente
    let coverUrl = newPlaylist.value.cover
    if (playlistCoverUpload.value?.hasPendingFile()) {
      const uploadedUrl = await playlistCoverUpload.value.uploadPendingFile()
      if (uploadedUrl) {
        coverUrl = uploadedUrl
      } else {
        createError.value = 'Error al subir la portada. Sube el archivo manualmente a /public/covers/ y escribe la ruta.'
        isCreating.value = false
        return
      }
    }

    const data = await $fetch<{ success: boolean, playlist: Playlist }>('/api/admin/playlists', {
      method: 'POST',
      credentials: 'include',
      body: {
        name: newPlaylist.value.name,
        description: newPlaylist.value.description || null,
        cover: coverUrl || null,
        isPublic: newPlaylist.value.isPublic
      }
    })

    if (data.success && data.playlist) {
      // Añadir canciones seleccionadas
      for (const songId of newPlaylistSongIds.value) {
        await $fetch(`/api/admin/playlists/${data.playlist.id}/songs`, {
          method: 'POST',
          credentials: 'include',
          body: { songId, action: 'add' }
        })
      }

      // Actualizar el conteo de canciones
      data.playlist.songCount = newPlaylistSongIds.value.length
      playlistsList.value.unshift(data.playlist)
      showCreatePlaylistModal.value = false
      newPlaylist.value = { name: '', description: '', cover: '', isPublic: true }
      newPlaylistSongIds.value = []
    }
  } catch (error: any) {
    createError.value = error?.data?.statusMessage || 'Error al crear playlist'
  } finally {
    isCreating.value = false
  }
}

// Funciones para editar playlist
const openEditPlaylistModal = async (playlist: Playlist) => {
  editingPlaylist.value = playlist
  editPlaylistSongIds.value = []
  editPlaylistError.value = ''
  showEditPlaylistModal.value = true

  // Cargar las canciones actuales de la playlist
  try {
    const data = await $fetch<{ songIds: string[] }>(`/api/admin/playlists/${playlist.id}/songs`, {
      credentials: 'include'
    })
    editPlaylistSongIds.value = data.songIds || []
  } catch (error) {
    console.error('Error loading playlist songs:', error)
  }
}

const closeEditPlaylistModal = () => {
  showEditPlaylistModal.value = false
  editingPlaylist.value = null
  editPlaylistSongIds.value = []
}

const addToEditPlaylist = async (songId: string) => {
  if (!editingPlaylist.value) return

  try {
    const data = await $fetch<{ success: boolean, songCount: number }>(`/api/admin/playlists/${editingPlaylist.value.id}/songs`, {
      method: 'POST',
      credentials: 'include',
      body: { songId, action: 'add' }
    })

    if (data.success) {
      editPlaylistSongIds.value.push(songId)
      editingPlaylist.value.songCount = data.songCount

      // Actualizar en la lista principal
      const playlist = playlistsList.value.find(p => p.id === editingPlaylist.value?.id)
      if (playlist) {
        playlist.songCount = data.songCount
      }
    }
  } catch (error: any) {
    editPlaylistError.value = error?.data?.statusMessage || 'Error al añadir canción'
  }
}

const removeFromEditPlaylist = async (songId: string) => {
  if (!editingPlaylist.value) return

  try {
    const data = await $fetch<{ success: boolean, songCount: number }>(`/api/admin/playlists/${editingPlaylist.value.id}/songs`, {
      method: 'POST',
      credentials: 'include',
      body: { songId, action: 'remove' }
    })

    if (data.success) {
      editPlaylistSongIds.value = editPlaylistSongIds.value.filter(id => id !== songId)
      editingPlaylist.value.songCount = data.songCount

      // Actualizar en la lista principal
      const playlist = playlistsList.value.find(p => p.id === editingPlaylist.value?.id)
      if (playlist) {
        playlist.songCount = data.songCount
      }
    }
  } catch (error: any) {
    editPlaylistError.value = error?.data?.statusMessage || 'Error al quitar canción'
  }
}

const confirmDeletePlaylist = (playlist: Playlist) => {
  playlistToDelete.value = playlist
  deletePlaylistError.value = ''
}

const deletePlaylist = async () => {
  if (!playlistToDelete.value) return

  isUpdating.value = playlistToDelete.value.id
  deletePlaylistError.value = ''

  try {
    await $fetch(`/api/admin/playlists/${playlistToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    playlistsList.value = playlistsList.value.filter(p => p.id !== playlistToDelete.value?.id)
    playlistToDelete.value = null
  } catch (error: any) {
    deletePlaylistError.value = error?.data?.statusMessage || 'Error al eliminar playlist'
  } finally {
    isUpdating.value = null
  }
}

// Funciones de usuarios
const createUser = async () => {
  createUserError.value = ''
  isCreatingUser.value = true

  try {
    const data = await $fetch<{ success: boolean, user: AdminUser }>('/api/admin/users', {
      method: 'POST',
      credentials: 'include',
      body: {
        username: newUser.value.username,
        password: newUser.value.password,
        displayName: newUser.value.displayName || newUser.value.username,
        role: newUser.value.role
      }
    })

    if (data.success && data.user) {
      usersList.value.push(data.user)
      showCreateUserModal.value = false
      newUser.value = { username: '', displayName: '', password: '', role: 'guest' }
    }
  } catch (error: any) {
    createUserError.value = error?.data?.statusMessage || 'Error al crear usuario'
  } finally {
    isCreatingUser.value = false
  }
}

const changeUserRole = async (u: AdminUser, newRole: 'tigre' | 'user' | 'guest') => {
  if (u.role === newRole) return

  isUpdating.value = u.id
  try {
    await $fetch(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body: { role: newRole }
    })
    u.role = newRole
  } catch (error) {
    console.error('Error updating user role:', error)
  } finally {
    isUpdating.value = null
  }
}

const confirmDeleteUser = (u: AdminUser) => {
  userToDelete.value = u
}

// Funciones para editar usuario
const openEditUserModal = (u: AdminUser) => {
  editingUser.value = u
  editUserForm.value = {
    username: u.username,
    displayName: u.displayName,
    password: '',
    role: u.role
  }
  editUserError.value = ''
  showEditUserModal.value = true
}

const closeEditUserModal = () => {
  showEditUserModal.value = false
  editingUser.value = null
  editUserForm.value = {
    username: '',
    displayName: '',
    password: '',
    role: 'guest'
  }
  editUserError.value = ''
}

const saveUserChanges = async () => {
  if (!editingUser.value) return

  editUserError.value = ''
  isEditingUser.value = true

  try {
    // Preparar solo los campos que cambiaron
    const body: Record<string, any> = {}

    if (editUserForm.value.username !== editingUser.value.username) {
      body.username = editUserForm.value.username
    }
    if (editUserForm.value.displayName !== editingUser.value.displayName) {
      body.displayName = editUserForm.value.displayName
    }
    if (editUserForm.value.password) {
      body.password = editUserForm.value.password
    }
    // Solo enviar rol si no es el usuario actual y cambió
    if (editingUser.value.id !== user.value?.id && editUserForm.value.role !== editingUser.value.role) {
      body.role = editUserForm.value.role
    }

    if (Object.keys(body).length === 0) {
      closeEditUserModal()
      return
    }

    const data = await $fetch<{ success: boolean, user: AdminUser }>(`/api/admin/users/${editingUser.value.id}`, {
      method: 'PATCH',
      credentials: 'include',
      body
    })

    if (data.success && data.user) {
      // Actualizar el usuario en la lista
      const idx = usersList.value.findIndex(u => u.id === editingUser.value?.id)
      if (idx !== -1) {
        usersList.value[idx] = {
          ...usersList.value[idx],
          ...data.user
        }
      }
      closeEditUserModal()
    }
  } catch (error: any) {
    editUserError.value = error?.data?.statusMessage || 'Error al guardar cambios'
  } finally {
    isEditingUser.value = false
  }
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  isUpdating.value = userToDelete.value.id
  try {
    await $fetch(`/api/admin/users/${userToDelete.value.id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    usersList.value = usersList.value.filter(u => u.id !== userToDelete.value?.id)
    userToDelete.value = null
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    isUpdating.value = null
  }
}

onMounted(async () => {
  await loadArtists()
  await loadContent()
  await loadPlaylists()
  await loadUsers()
})
</script>
