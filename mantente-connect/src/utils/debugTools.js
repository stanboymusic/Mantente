/**
 * 🔧 Herramientas de Debug para Diagnosticar Problemas de Sincronización
 * 
 * USO EN CONSOLA (F12):
 * 1. import('./src/utils/debugTools.js').then(m => window.DEBUG = m)
 * 2. DEBUG.getSyncQueue()
 * 3. DEBUG.clearSyncQueue()
 * 4. DEBUG.getStorageInfo()
 */

import { openDB } from 'idb'

const DB_NAME = 'mantente-db'
const STORES = {
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  SYNC_QUEUE: 'sync_queue',
}

export const debugTools = {
  /**
   * Ver todos los cambios pendientes de sincronizar
   */
  async getSyncQueue() {
    try {
      const db = await openDB(DB_NAME)
      const queue = await db.getAll(STORES.SYNC_QUEUE)
      console.log(`📋 Sync Queue (${queue.length} items):`, queue)
      return queue
    } catch (error) {
      console.error('❌ Error leyendo sync_queue:', error)
    }
  },

  /**
   * Ver productos en IndexedDB
   */
  async getProducts() {
    try {
      const db = await openDB(DB_NAME)
      const products = await db.getAll(STORES.PRODUCTS)
      console.log(`📦 Productos (${products.length}):`, products)
      return products
    } catch (error) {
      console.error('❌ Error leyendo productos:', error)
    }
  },

  /**
   * Ver clientes en IndexedDB
   */
  async getCustomers() {
    try {
      const db = await openDB(DB_NAME)
      const customers = await db.getAll(STORES.CUSTOMERS)
      console.log(`👥 Clientes (${customers.length}):`, customers)
      return customers
    } catch (error) {
      console.error('❌ Error leyendo clientes:', error)
    }
  },

  /**
   * Ver órdenes en IndexedDB
   */
  async getOrders() {
    try {
      const db = await openDB(DB_NAME)
      const orders = await db.getAll(STORES.ORDERS)
      console.log(`📊 Órdenes (${orders.length}):`, orders)
      return orders
    } catch (error) {
      console.error('❌ Error leyendo órdenes:', error)
    }
  },

  /**
   * Limpiar la cola de sincronización
   * ⚠️ ADVERTENCIA: Esto eliminará todos los cambios pendientes
   */
  async clearSyncQueue() {
    try {
      const db = await openDB(DB_NAME)
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite')
      await tx.store.clear()
      console.log('✅ Sync queue limpiada. Los cambios pendientes fueron eliminados.')
      return true
    } catch (error) {
      console.error('❌ Error limpiando sync_queue:', error)
      return false
    }
  },

  /**
   * Limpiar todos los datos de IndexedDB
   * ⚠️ ADVERTENCIA: Esto eliminará TODOS los datos locales
   */
  async clearAllData() {
    try {
      const db = await openDB(DB_NAME)
      const tx = db.transaction(
        [STORES.PRODUCTS, STORES.CUSTOMERS, STORES.ORDERS, STORES.SYNC_QUEUE],
        'readwrite'
      )
      await tx.objectStore(STORES.PRODUCTS).clear()
      await tx.objectStore(STORES.CUSTOMERS).clear()
      await tx.objectStore(STORES.ORDERS).clear()
      await tx.objectStore(STORES.SYNC_QUEUE).clear()
      await tx.done
      console.log('✅ Todos los datos de IndexedDB fueron eliminados.')
      return true
    } catch (error) {
      console.error('❌ Error limpiando IndexedDB:', error)
      return false
    }
  },

  /**
   * Obtener información de almacenamiento
   */
  async getStorageInfo() {
    try {
      const queue = await this.getSyncQueue()
      const products = await this.getProducts()
      const customers = await this.getCustomers()
      const orders = await this.getOrders()

      const info = {
        syncQueue: queue.length,
        products: products.length,
        customers: customers.length,
        orders: orders.length,
        localStorage: Object.entries(localStorage).length,
      }

      console.table(info)
      console.log('📊 Storage Info:', info)
      return info
    } catch (error) {
      console.error('❌ Error obteniendo storage info:', error)
    }
  },

  /**
   * Simular estado offline/online
   */
  async simulateOffline(seconds = 5) {
    console.log(`📴 Simulando offline por ${seconds} segundos...`)
    // Dispara evento offline
    window.dispatchEvent(new Event('offline'))
    
    await new Promise(resolve => setTimeout(resolve, seconds * 1000))
    
    console.log('📡 Volviendo online...')
    // Dispara evento online
    window.dispatchEvent(new Event('online'))
  },

  /**
   * Ver la sesión de autenticación
   */
  getAuthSession() {
    const auth = localStorage.getItem('auth-store')
    if (auth) {
      const parsed = JSON.parse(auth)
      console.log('🔐 Auth Session:', parsed)
      return parsed
    }
    console.warn('⚠️ No hay sesión de autenticación')
    return null
  },

  /**
   * Ver el estado de Zustand DataStore
   */
  getDataStoreState() {
    const dataStore = localStorage.getItem('data-store')
    if (dataStore) {
      const parsed = JSON.parse(dataStore)
      console.log('📦 DataStore State:', parsed)
      return parsed
    }
    console.warn('⚠️ DataStore no encontrado')
    return null
  },

  /**
   * Generar reporte completo de diagnóstico
   */
  async generateReport() {
    console.log('🔍 Generando reporte de diagnóstico...\n')
    
    const report = {
      timestamp: new Date().toISOString(),
      storage: await this.getStorageInfo(),
      auth: this.getAuthSession(),
      dataStore: this.getDataStoreState(),
      syncQueue: await this.getSyncQueue(),
    }

    console.log('📋 REPORTE COMPLETO:')
    console.log(JSON.stringify(report, null, 2))
    
    return report
  },

  /**
   * Instrucciones de uso
   */
  help() {
    console.log(`
🔧 HERRAMIENTAS DE DEBUG - INSTRUCCIONES DE USO

Copia cualquier comando en la consola (F12):

📋 Ver cambios pendientes:
  DEBUG.getSyncQueue()

📦 Ver productos:
  DEBUG.getProducts()

👥 Ver clientes:
  DEBUG.getCustomers()

📊 Ver órdenes:
  DEBUG.getOrders()

📊 Ver información de almacenamiento:
  DEBUG.getStorageInfo()

🔐 Ver sesión de autenticación:
  DEBUG.getAuthSession()

🔍 Generar reporte completo:
  DEBUG.generateReport()

⚠️ OPERACIONES PELIGROSAS:
  DEBUG.clearSyncQueue()      // Limpiar cola de sincronización
  DEBUG.clearAllData()        // Limpiar TODOS los datos

🌐 Simular offline:
  DEBUG.simulateOffline(5)    // Offline por 5 segundos

❓ Ver esta ayuda:
  DEBUG.help()
    `)
  }
}

// Hacer disponible globalmente en desarrollo
if (import.meta.env.DEV) {
  window.DEBUG = debugTools
  console.log('✅ DEBUG tools disponibles: window.DEBUG')
}

export default debugTools