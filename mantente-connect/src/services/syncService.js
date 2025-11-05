import { useDataStore } from '../store/dataStore'

let isOnline = navigator.onLine
let isSyncing = false
let syncCheckInterval = null

export function setupOnlineListener() {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  console.log(`📡 Initial network status: ${isOnline ? 'online' : 'offline'}`)
  
  // ✨ NUEVO: Iniciar verificación periódica de cambios pendientes
  // Esto es más confiable que esperar el evento 'online' del navegador
  startPeriodicSyncCheck()
}

function startPeriodicSyncCheck() {
  // Verificar cada 5 segundos si hay cambios pendientes y si estamos online
  syncCheckInterval = setInterval(async () => {
    if (isOnline && !isSyncing) {
      const { pendingSync } = useDataStore.getState()
      if (pendingSync > 0) {
        console.log(`⏰ Verificación periódica: ${pendingSync} cambios pendientes. Iniciando sincronización...`)
        await syncData()
      }
    }
  }, 5000) // Cada 5 segundos
  
  console.log('🔄 Verificación periódica de sincronización iniciada (cada 5s)')
}

async function handleOnline() {
  console.log('🌐 Back online! Starting synchronization...')
  isOnline = true
  await syncData()
}

function handleOffline() {
  console.log('📴 Going offline')
  isOnline = false
}

export async function syncData() {
  if (isSyncing) {
    console.log('⏳ Sync already in progress')
    return
  }

  if (!isOnline) {
    console.log('⚠️ Cannot sync: no internet connection')
    return
  }

  isSyncing = true
  console.log('🔄 Starting data synchronization...')

  try {
    // Obtener datos de dataStore
    const dataStore = useDataStore.getState()
    const { pendingSync } = dataStore

    if (pendingSync === 0) {
      console.log('✅ Nothing to sync')
      isSyncing = false
      return
    }

    console.log(`📤 Found ${pendingSync} items to sync`)

    // 🎯 LLAMAR A DATASTORE PARA SINCRONIZAR DATOS
    // El userId se obtiene automáticamente dentro de syncPendingData
    // Necesitamos obtener el usuario autenticado
    const { supabase } = await import('./supabaseService')
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.warn('⚠️ No authenticated user found. Cannot sync.')
        isSyncing = false
        return
      }

      console.log(`👤 Syncing data for user: ${user.id}`)
      
      // ✨ AQUÍ ES LA MAGIA: Llamar a dataStore.syncPendingData
      // Este método procesa la cola y sincroniza todo con Supabase
      await dataStore.syncPendingData(user.id)
      
      console.log('✅ Synchronization completed successfully')
    } catch (error) {
      console.error('❌ Error getting authenticated user:', error)
      throw error
    }
  } catch (error) {
    console.error('❌ Sync error:', error)
  } finally {
    isSyncing = false
  }
}

export function isAppOnline() {
  return isOnline
}

export function stopPeriodicSyncCheck() {
  if (syncCheckInterval) {
    clearInterval(syncCheckInterval)
    console.log('🛑 Verificación periódica de sincronización detenida')
  }
}