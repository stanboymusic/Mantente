import { create } from 'zustand'
import { openDB } from 'idb'
import { supabaseSyncService } from '../services/pocketbaseService'

const DB_NAME = 'mantente-db'
const DB_VERSION = 1

const STORES = {
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  SYNC_QUEUE: 'sync_queue',
}

// Inicializar base de datos IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Crear stores si no existen
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        const productsStore = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' })
        productsStore.createIndex('user_id', 'user_id')
      }
      if (!db.objectStoreNames.contains(STORES.CUSTOMERS)) {
        const customersStore = db.createObjectStore(STORES.CUSTOMERS, { keyPath: 'id' })
        customersStore.createIndex('user_id', 'user_id')
      }
      if (!db.objectStoreNames.contains(STORES.ORDERS)) {
        const ordersStore = db.createObjectStore(STORES.ORDERS, { keyPath: 'id' })
        ordersStore.createIndex('user_id', 'user_id')
      }
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export const useDataStore = create((set, get) => ({
  products: [],
  customers: [],
  orders: [],
  pendingSync: 0,
  isLoadingData: false,
  isSyncing: false,
  error: null,
  searchTerm: '',
  filterCategory: '',

  // Inicializar IndexedDB
  initDatabase: async () => {
    try {
      const db = await initDB()
      set({ isLoadingData: false, error: null })
      console.log('✅ IndexedDB inicializada correctamente')
      return db
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error inicializando IndexedDB:', error)
      throw error
    }
  },

  // Cargar datos del usuario actual desde IndexedDB
  loadUserData: async (userId) => {
    if (!userId) return
    
    set({ isLoadingData: true, error: null })
    try {
      const db = await initDB()

      // Cargar productos
      const productsIndex = db.transaction(STORES.PRODUCTS).store.index('user_id')
      const products = await productsIndex.getAll(userId)

      // Cargar clientes
      const customersIndex = db.transaction(STORES.CUSTOMERS).store.index('user_id')
      const customers = await customersIndex.getAll(userId)

      // Cargar órdenes
      const ordersIndex = db.transaction(STORES.ORDERS).store.index('user_id')
      const orders = await ordersIndex.getAll(userId)

      // Contar cambios pendientes de sincronizar - SOLO del usuario actual
      const syncQueue = await db.getAll(STORES.SYNC_QUEUE)
      const userSyncQueue = syncQueue.filter(item => !item.userId || item.userId === userId)
      const pendingSync = userSyncQueue.length

      set({
        products,
        customers,
        orders,
        pendingSync,
        isLoadingData: false,
      })

      console.log(`✅ Datos cargados - ${products.length} productos, ${customers.length} clientes, ${orders.length} órdenes, ${pendingSync} cambios pendientes`)
    } catch (error) {
      set({ error: error.message, isLoadingData: false })
      console.error('❌ Error cargando datos:', error)
    }
  },

  // Agregar producto
  addProduct: async (product) => {
    try {
      const db = await initDB()
      const newProduct = { ...product, id: crypto.randomUUID(), synced: false, createdAt: new Date().toISOString() }
      await db.add(STORES.PRODUCTS, newProduct)
      
      // Agregar a cola de sincronización con userId
      await get().addToSyncQueue('CREATE', { type: 'product', data: newProduct }, product.user_id)
      
      // Recargar productos
      await get().loadUserData(product.user_id)
      console.log('✅ Producto agregado')
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error agregando producto:', error)
      throw error
    }
  },

  // Actualizar producto
  updateProduct: async (id, updates, userId = null) => {
    try {
      const db = await initDB()
      const product = await db.get(STORES.PRODUCTS, id)
      if (product) {
        const updated = { ...product, ...updates, synced: false, updatedAt: new Date().toISOString() }
        await db.put(STORES.PRODUCTS, updated)
        await get().addToSyncQueue('UPDATE', { type: 'product', data: updated }, userId || product.user_id)
        
        // Actualizar estado
        const state = get()
        set({ products: state.products.map(p => p.id === id ? updated : p) })
        console.log('✅ Producto actualizado')
      }
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error actualizando producto:', error)
      throw error
    }
  },

  // Eliminar producto
  deleteProduct: async (id, userId) => {
    try {
      const db = await initDB()
      await db.delete(STORES.PRODUCTS, id)
      await get().addToSyncQueue('DELETE', { type: 'product', id }, userId)
      await get().loadUserData(userId)
      console.log('✅ Producto eliminado')
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error eliminando producto:', error)
      throw error
    }
  },

  // Agregar cliente
  addCustomer: async (customer) => {
    try {
      const db = await initDB()
      const newCustomer = { ...customer, id: crypto.randomUUID(), synced: false, createdAt: new Date().toISOString() }
      await db.add(STORES.CUSTOMERS, newCustomer)
      
      await get().addToSyncQueue('CREATE', { type: 'customer', data: newCustomer }, customer.user_id)
      await get().loadUserData(customer.user_id)
      console.log('✅ Cliente agregado')
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error agregando cliente:', error)
      throw error
    }
  },

  // Actualizar cliente
  updateCustomer: async (id, updates, userId = null) => {
    try {
      const db = await initDB()
      const customer = await db.get(STORES.CUSTOMERS, id)
      if (customer) {
        const updated = { ...customer, ...updates, synced: false, updatedAt: new Date().toISOString() }
        await db.put(STORES.CUSTOMERS, updated)
        await get().addToSyncQueue('UPDATE', { type: 'customer', data: updated }, userId || customer.user_id)
        
        const state = get()
        set({ customers: state.customers.map(c => c.id === id ? updated : c) })
        console.log('✅ Cliente actualizado')
      }
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error actualizando cliente:', error)
      throw error
    }
  },

  // Eliminar cliente
  deleteCustomer: async (id, userId) => {
    try {
      const db = await initDB()
      await db.delete(STORES.CUSTOMERS, id)
      await get().addToSyncQueue('DELETE', { type: 'customer', id }, userId)
      await get().loadUserData(userId)
      console.log('✅ Cliente eliminado')
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error eliminando cliente:', error)
      throw error
    }
  },

  // Agregar orden
  addOrder: async (order) => {
    try {
      const db = await initDB()
      const newOrder = { ...order, id: crypto.randomUUID(), synced: false, createdAt: new Date().toISOString() }
      await db.add(STORES.ORDERS, newOrder)
      
      console.log(`📝 Nueva orden guardada en IndexedDB:`, newOrder)
      await get().addToSyncQueue('CREATE', { type: 'order', data: newOrder }, order.user_id)
      await get().loadUserData(order.user_id)
      console.log('✅ Orden agregada')
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error agregando orden:', error)
      throw error
    }
  },

  // Actualizar orden
  updateOrder: async (id, updates, userId = null) => {
    try {
      const db = await initDB()
      const order = await db.get(STORES.ORDERS, id)
      if (order) {
        const updated = { ...order, ...updates, synced: false, updatedAt: new Date().toISOString() }
        await db.put(STORES.ORDERS, updated)
        await get().addToSyncQueue('UPDATE', { type: 'order', data: updated }, userId || order.user_id)
        
        const state = get()
        set({ orders: state.orders.map(o => o.id === id ? updated : o) })
        console.log('✅ Orden actualizada')
      }
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error actualizando orden:', error)
      throw error
    }
  },

  // Eliminar orden
  deleteOrder: async (id, userId) => {
    try {
      const db = await initDB()
      await db.delete(STORES.ORDERS, id)
      await get().addToSyncQueue('DELETE', { type: 'order', id }, userId)
      await get().loadUserData(userId)
      console.log('✅ Orden eliminada')
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error eliminando orden:', error)
      throw error
    }
  },

  // ✅ LIMPIAR ÓRDENES INVÁLIDAS DE LA COLA DE SINCRONIZACIÓN
  cleanInvalidOrdersFromQueue: async (userId) => {
    try {
      const db = await initDB()
      const syncQueue = await db.getAll(STORES.SYNC_QUEUE)
      
      // Filtrar órdenes sin customer_id válido
      const invalidOrders = syncQueue.filter(item => 
        item.data?.type === 'order' && 
        (!item.data.data?.customer_id || item.data.data?.customer_id === '')
      )
      
      if (invalidOrders.length === 0) {
        console.log('✅ No hay órdenes inválidas para limpiar')
        return
      }
      
      console.log(`🧹 Limpiando ${invalidOrders.length} órdenes inválidas de la cola de sincronización...`)
      
      // Eliminar órdenes inválidas
      for (const item of invalidOrders) {
        await db.delete(STORES.SYNC_QUEUE, item.id)
        console.log(`🗑️ Orden eliminada de cola: ${item.data.data.id}`)
      }
      
      // Actualizar contador
      const remainingQueue = await db.getAll(STORES.SYNC_QUEUE)
      const userRemainingQueue = remainingQueue.filter(item => !item.userId || item.userId === userId)
      set({ pendingSync: userRemainingQueue.length })
      
      console.log(`✅ Limpieza completada. Pendientes: ${userRemainingQueue.length}`)
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error limpiando órdenes inválidas:', error)
    }
  },

  // Agregar a cola de sincronización
  addToSyncQueue: async (action, data, userId = null) => {
    try {
      const db = await initDB()
      const syncItem = {
        action, // 'CREATE', 'UPDATE', 'DELETE'
        data,
        userId, // Añadir user_id para filtrar después
        timestamp: new Date().toISOString(),
        synced: false,
      }
      
      await db.add(STORES.SYNC_QUEUE, syncItem)
      
      // Actualizar contador - contar solo items del usuario actual o sin filtro
      const syncQueue = await db.getAll(STORES.SYNC_QUEUE)
      const userQueue = syncQueue.filter(item => !item.userId || item.userId === userId)
      set({ pendingSync: userQueue.length })
      
      console.log(`✅ Acción agregada a cola de sincronización: ${action} (pending: ${userQueue.length})`)
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error agregando a sync queue:', error)
    }
  },

  // Métodos de búsqueda y filtro
  setSearchTerm: (term) => set({ searchTerm: term }),
  setFilterCategory: (category) => set({ filterCategory: category }),

  getFilteredProducts: () => {
    const state = get()
    return state.products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(state.searchTerm.toLowerCase())
      const matchesCategory = !state.filterCategory || p.category === state.filterCategory
      return matchesSearch && matchesCategory
    })
  },

  getFilteredCustomers: () => {
    const state = get()
    return state.customers.filter(c => 
      c.name?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(state.searchTerm.toLowerCase())
    )
  },

  getFilteredOrders: () => {
    const state = get()
    return state.orders.filter(o => 
      o.code?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      o.customer?.toLowerCase().includes(state.searchTerm.toLowerCase())
    )
  },

  // Limpiar todo (para logout)
  clearData: () => {
    set({
      products: [],
      customers: [],
      orders: [],
      pendingSync: 0,
      error: null,
      searchTerm: '',
      filterCategory: '',
    })
    console.log('✅ Datos locales borrados')
  },

  // Obtener estadísticas
  getStats: () => {
    const state = get()
    return {
      totalProducts: state.products.length,
      totalCustomers: state.customers.length,
      totalOrders: state.orders.length,
      pendingSync: state.pendingSync,
    }
  },

  // Cargar datos iniciales desde PocketBase
  loadDataFromPocketBase: async (userId) => {
    if (!userId) return
    
    set({ isLoadingData: true, error: null })
    try {
      console.log('📡 Cargando datos iniciales desde PocketBase...')
      
      // Obtener datos de PocketBase en paralelo
      const [products, customers, orders] = await Promise.all([
        supabaseSyncService.getProducts(userId),
        supabaseSyncService.getCustomers(userId),
        supabaseSyncService.getOrders(userId),
      ])

      console.log(`✅ Datos obtenidos de PocketBase: ${products.length} productos, ${customers.length} clientes, ${orders.length} órdenes`)

      // Guardar en IndexedDB
      const db = await initDB()

      // Limpiar IndexedDB primero
      const tx = db.transaction([STORES.PRODUCTS, STORES.CUSTOMERS, STORES.ORDERS], 'readwrite')
      await tx.objectStore(STORES.PRODUCTS).clear()
      await tx.objectStore(STORES.CUSTOMERS).clear()
      await tx.objectStore(STORES.ORDERS).clear()
      await tx.done

      // Agregar nuevos datos
      for (const product of products) {
        await db.add(STORES.PRODUCTS, { ...product, synced: true })
      }
      for (const customer of customers) {
        await db.add(STORES.CUSTOMERS, { ...customer, synced: true })
      }
      for (const order of orders) {
        await db.add(STORES.ORDERS, { ...order, synced: true })
      }

      console.log('✅ Datos guardados en IndexedDB')

      // Actualizar estado
      set({
        products: products.map(p => ({ ...p, synced: true })),
        customers: customers.map(c => ({ ...c, synced: true })),
        orders: orders.map(o => ({ ...o, synced: true })),
        isLoadingData: false,
      })

      console.log('✅ Dashboard actualizado con datos de PocketBase')
    } catch (error) {
      set({ error: error.message, isLoadingData: false })
      console.error('❌ Error cargando datos de PocketBase:', error)
    }
  },

  // Sincronizar datos pendientes con PocketBase
  syncPendingData: async (userId) => {
    if (!userId) return
    
    set({ isSyncing: true, error: null })
    try {
      const db = await initDB()
      const syncQueue = await db.getAll(STORES.SYNC_QUEUE)
      
      // ✨ FILTRAR SOLO los items del usuario actual
      const userSyncQueue = syncQueue.filter(item => !item.userId || item.userId === userId)

      if (userSyncQueue.length === 0) {
        console.log('✅ No hay cambios pendientes de sincronizar para este usuario')
        set({ isSyncing: false, pendingSync: 0 })
        return
      }

      console.log(`📤 Sincronizando ${userSyncQueue.length} cambios con PocketBase para usuario ${userId}...`)

      // Procesar cada cambio en la cola
      let syncedCount = 0
      let failedCount = 0

      for (const item of userSyncQueue) {
        try {
          let result = null
          
          if (item.action === 'CREATE') {
            if (item.data.type === 'product') {
              console.log(`📤 Creando producto:`, item.data.data)
              result = await supabaseSyncService.createProduct(item.data.data)
              console.log(`✅ Producto creado:`, result)
            } else if (item.data.type === 'customer') {
              console.log(`📤 Creando cliente:`, item.data.data)
              result = await supabaseSyncService.createCustomer(item.data.data)
              console.log(`✅ Cliente creado:`, result)
            } else if (item.data.type === 'order') {
              console.log(`📤 Creando orden:`, item.data.data)
              result = await supabaseSyncService.createOrder(item.data.data)
              console.log(`✅ Orden creada:`, result)
            }
          } else if (item.action === 'UPDATE') {
            if (item.data.type === 'product') {
              console.log(`📝 Actualizando producto ${item.data.data.id}:`, item.data.data)
              result = await supabaseSyncService.updateProduct(item.data.data.id, item.data.data)
              console.log(`✅ Producto actualizado:`, result)
            } else if (item.data.type === 'customer') {
              console.log(`📝 Actualizando cliente ${item.data.data.id}:`, item.data.data)
              result = await supabaseSyncService.updateCustomer(item.data.data.id, item.data.data)
              console.log(`✅ Cliente actualizado:`, result)
            } else if (item.data.type === 'order') {
              console.log(`📝 Actualizando orden ${item.data.data.id}:`, item.data.data)
              result = await supabaseSyncService.updateOrder(item.data.data.id, item.data.data)
              console.log(`✅ Orden actualizada:`, result)
            }
          } else if (item.action === 'DELETE') {
            if (item.data.type === 'product') {
              console.log(`🗑️ Eliminando producto ${item.data.id}`)
              result = await supabaseSyncService.deleteProduct(item.data.id)
            } else if (item.data.type === 'customer') {
              console.log(`🗑️ Eliminando cliente ${item.data.id}`)
              result = await supabaseSyncService.deleteCustomer(item.data.id)
            } else if (item.data.type === 'order') {
              console.log(`🗑️ Eliminando orden ${item.data.id}`)
              result = await supabaseSyncService.deleteOrder(item.data.id)
            }
          }

          // Verificar que no hay resultado nulo o error oculto
          if (result === undefined && item.action !== 'DELETE') {
            throw new Error(`Resultado vacío. Posible error silencioso en PocketBase`)
          }

          // Eliminar de la cola solo si fue exitoso
          await db.delete(STORES.SYNC_QUEUE, item.id)
          syncedCount++
          console.log(`✅ Item sincronizado exitosamente. Eliminado de sync_queue`)
        } catch (error) {
          failedCount++
          console.error(`⚠️ Error sincronizando item ${item.id}:`, {
            message: error.message || error,
            action: item.action,
            type: item.data?.type,
            data: item.data?.data || item.data
          })
        }
      }

      console.log(`✅ Sincronización completada - ${syncedCount} exitosos, ${failedCount} fallidos`)

      // Actualizar contador - contar solo items del usuario actual
      const remainingQueue = await db.getAll(STORES.SYNC_QUEUE)
      const userRemainingQueue = remainingQueue.filter(item => !item.userId || item.userId === userId)
      set({ pendingSync: userRemainingQueue.length, isSyncing: false })

      // SOLO recargar datos si la sincronización fue exitosa (sin errores)
      if (failedCount === 0) {
        console.log('📡 Recargando datos desde PocketBase...')
        await get().loadDataFromSupabase(userId)
      } else {
        console.warn(`⚠️ Sincronización con ${failedCount} errores. NO recargando datos de PocketBase para evitar loops.`)
      }
    } catch (error) {
      set({ error: error.message, isSyncing: false })
      console.error('❌ Error sincronizando datos:', error)
    }
  },
}))