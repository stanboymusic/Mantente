import { useAuthStore } from '../store/authStore'
import { setupOnlineListener } from './syncService'
import { pb } from './pocketbaseService'

let isInitializing = false
let initializationPromise = null

export async function initializeApp() {
  if (isInitializing) {
    console.log('⏳ Initialization already in progress, waiting...')
    return initializationPromise
  }

  isInitializing = true
  initializationPromise = (async () => {
    try {
    const { restoreSession } = useAuthStore.getState()
    
    // Restaurar sesión
    await restoreSession()

    // Refrescar autenticación para cargar el record del usuario
    if (pb.authStore.isValid) {
      try {
        await pb.collection('users').authRefresh()
        console.log('✅ Sesión de PocketBase refrescada')
        console.log('🔐 pb.authStore after refresh:', {
          isValid: pb.authStore.isValid,
          hasRecord: !!pb.authStore.record,
          recordId: pb.authStore.record?.id,
          recordEmail: pb.authStore.record?.email
        })
      } catch (error) {
        console.error('⚠️ Error refrescando sesión de PocketBase:', error)
      }
    }

    // Configurar listener de conectividad
    setupOnlineListener()

    console.log('✅ App initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing app:', error)
    throw error
  }
})()
}