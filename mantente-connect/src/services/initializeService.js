import { useAuthStore } from '../store/authStore'
import { useInventoryStore } from '../store/inventoryStore'
import { useCustomersStore } from '../store/customersStore'
import { useOrdersStore } from '../store/ordersStore'
import { dbService } from './databaseService'
import { setupOnlineListener } from './syncService'
import { pb } from './pocketbaseService'

export async function initializeApp() {
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

    // Cargar datos locales
    await loadLocalData()

    // Configurar listener de conectividad
    setupOnlineListener()

    console.log('✅ App initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing app:', error)
    throw error
  }
}

async function loadLocalData() {
  try {
    const [products, customers, orders] = await Promise.all([
      dbService.getAllProducts(),
      dbService.getAllCustomers(),
      dbService.getAllOrders(),
    ])

    useInventoryStore.getState().setProducts(products)
    useCustomersStore.getState().setCustomers(customers)
    useOrdersStore.getState().setOrders(orders)

    console.log('✅ Local data loaded')
  } catch (error) {
    console.error('Error loading local data:', error)
  }
}