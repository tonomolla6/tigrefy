// Plugin para inicializar preferencias del usuario al arrancar la app
export default defineNuxtPlugin(async () => {
  const { initPreferences } = useUserPreferences()
  const { restoreLastPlayed } = usePlayer()
  const { data, loadData, isLoaded } = useData()

  // Inicializar preferencias desde localStorage
  initPreferences()

  // Cargar datos si no están cargados
  if (!isLoaded.value) {
    await loadData()
  }

  // Restaurar última canción reproducida
  if (data.value.songs && data.value.songs.length > 0) {
    await restoreLastPlayed(data.value.songs)
  }
})
