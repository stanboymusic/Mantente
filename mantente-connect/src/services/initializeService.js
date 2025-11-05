import { useAuthStore } from '../store/authStore'
import { useInventoryStore } from '../store/inventoryStore'
import { useCustomersStore } from '../store/customersStore'
import { useOrdersStore } from '../store/ordersStore'
import { dbService } from './databaseService'
import { setupOnlineListener } from './syncService'

export async function initializeApp() {
  try {
    const { restoreSession } = useAuthStore.getState()
    
    // Restaurar sesión
    await restoreSession()

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