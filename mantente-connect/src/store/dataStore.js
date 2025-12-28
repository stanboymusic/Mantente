import { create } from 'zustand'
import { openDB } from 'idb'
import { supabaseSyncService, pb } from '../services/pocketbaseService'

const DB_NAME = 'mantente-db'
const DB_VERSION = 1

const STORES = {
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  SALES_LOCAL: 'sales_local', // Ventas locales con estado='orden'
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
      if (!db.objectStoreNames.contains(STORES.SALES_LOCAL)) {
        const salesStore = db.createObjectStore(STORES.SALES_LOCAL, { keyPath: 'id' })
        salesStore.createIndex('user_id', 'user_id')
        salesStore.createIndex('estado', 'estado')
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
  salesLocal: [], // Ventas locales con estado='orden'
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
    if (!userId) {
      console.log('⚠️ loadUserData: No userId provided')
      return
    }

    console.log(`📂 Cargando datos locales para usuario: ${userId}`)
    set({ isLoadingData: true, error: null })
    try {
      const db = await initDB()

      // Cargar productos
      const productsIndex = db.transaction(STORES.PRODUCTS).store.index('user_id')
      const products = await productsIndex.getAll(userId)
      console.log(`📦 Productos encontrados: ${products.length}`)

      // Cargar clientes
      const customersIndex = db.transaction(STORES.CUSTOMERS).store.index('user_id')
      const customers = await customersIndex.getAll(userId)
      console.log(`👥 Clientes encontrados: ${customers.length}`)

      // Cargar ventas locales (estado='orden')
      const salesIndex = db.transaction(STORES.SALES_LOCAL).store.index('user_id')
      const salesLocal = await salesIndex.getAll(userId)
      console.log(`💰 Ventas locales encontradas: ${salesLocal.length}`)

      // Contar cambios pendientes de sincronizar - SOLO del usuario actual
      const syncQueue = await db.getAll(STORES.SYNC_QUEUE)
      const userSyncQueue = syncQueue.filter(item => !item.userId || item.userId === userId)
      const pendingSync = userSyncQueue.length
      console.log(`⏳ Cambios pendientes: ${pendingSync}`)

      set({
        products,
        customers,
        salesLocal,
        pendingSync,
        isLoadingData: false,
      })

      console.log(`✅ Datos locales cargados exitosamente`)
    } catch (error) {
      set({ error: error.message, isLoadingData: false })
      console.error('❌ Error cargando datos locales:', error)
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

  // Agregar venta local (orden)
  addSaleLocal: async (sale) => {
    try {
      const db = await initDB()
      const newSale = {
        ...sale,
        id: crypto.randomUUID(),
        estado: 'orden', // Estado inicial
        origen: 'mantente_connect', // Origen
        synced: false,
        createdAt: new Date().toISOString()
      }
      await db.add(STORES.SALES_LOCAL, newSale)

      console.log(`💰 Nueva venta local guardada en IndexedDB:`, newSale)
      await get().addToSyncQueue('CREATE', { type: 'sale', data: newSale }, sale.user_id)
      await get().loadUserData(sale.user_id)
      console.log('✅ Venta local agregada')
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error agregando venta local:', error)
      throw error
    }
  },

  // Actualizar venta local
  updateSaleLocal: async (id, updates, userId = null) => {
    try {
      const db = await initDB()
      const sale = await db.get(STORES.SALES_LOCAL, id)
      if (sale) {
        const updated = { ...sale, ...updates, synced: false, updatedAt: new Date().toISOString() }
        await db.put(STORES.SALES_LOCAL, updated)
        await get().addToSyncQueue('UPDATE', { type: 'sale', data: updated }, userId || sale.user_id)

        const state = get()
        set({ salesLocal: state.salesLocal.map(s => s.id === id ? updated : s) })
        console.log('✅ Venta local actualizada')
      }
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error actualizando venta local:', error)
      throw error
    }
  },

  // Eliminar venta local
  deleteSaleLocal: async (id, userId) => {
    try {
      const db = await initDB()
      await db.delete(STORES.SALES_LOCAL, id)
      await get().addToSyncQueue('DELETE', { type: 'sale', id }, userId)
      await get().loadUserData(userId)
      console.log('✅ Venta local eliminada')
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error eliminando venta local:', error)
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

  getFilteredSalesLocal: () => {
    const state = get()
    return state.salesLocal.filter(s =>
      s.codigo_venta?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      s.cliente?.toLowerCase().includes(state.searchTerm.toLowerCase())
    )
  },

  // Limpiar todo (para logout)
  clearData: () => {
    set({
      products: [],
      customers: [],
      salesLocal: [],
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
      totalSalesLocal: state.salesLocal.length,
      pendingSync: state.pendingSync,
    }
  },

  // Cargar datos iniciales desde PocketBase
  loadDataFromPocketBase: async (userId) => {
    if (!userId) {
      console.log('⚠️ loadDataFromPocketBase: No userId provided')
      return
    }

    console.log(`📡 Cargando datos iniciales desde PocketBase para usuario: ${userId}`)
    set({ isLoadingData: true, error: null })
    try {
      // Obtener datos de PocketBase en paralelo
      console.log('🔄 Solicitando datos a PocketBase...')
      const [products, customers, sales] = await Promise.all([
        supabaseSyncService.getProducts(userId),
        supabaseSyncService.getCustomers(userId),
        supabaseSyncService.getSales(userId), // Ventas procesadas
      ])

      console.log(`✅ Datos obtenidos de PocketBase: ${products.length} productos, ${customers.length} clientes, ${sales.length} ventas`)

      // Guardar en IndexedDB
      const db = await initDB()
      console.log('💾 Guardando datos en IndexedDB...')

      // Limpiar IndexedDB primero (solo productos y clientes, no ventas locales)
      const tx = db.transaction([STORES.PRODUCTS, STORES.CUSTOMERS], 'readwrite')
      await tx.objectStore(STORES.PRODUCTS).clear()
      await tx.objectStore(STORES.CUSTOMERS).clear()
      await tx.done

      // Agregar nuevos datos
      for (const product of products) {
        await db.add(STORES.PRODUCTS, { ...product, synced: true })
      }
      for (const customer of customers) {
        await db.add(STORES.CUSTOMERS, { ...customer, synced: true })
      }

      console.log('✅ Datos guardados en IndexedDB')

      // Actualizar estado (ventas procesadas se muestran pero no se guardan localmente como "locales")
      set({
        products: products.map(p => ({ ...p, synced: true })),
        customers: customers.map(c => ({ ...c, synced: true })),
        // salesLocal permanece con las ventas offline no sincronizadas
        isLoadingData: false,
      })

      console.log('✅ Dashboard actualizado con datos de PocketBase')
    } catch (error) {
      set({ error: error.message, isLoadingData: false })
      console.error('❌ Error cargando datos de PocketBase:', error)
      console.error('❌ Detalles del error:', {
        message: error.message,
        status: error.status,
        response: error.response
      })
    }
  },

  // Sincronizar datos pendientes con PocketBase
  syncPendingData: async (userId) => {
    if (!userId) return

    console.log('🔍 Checking auth state before sync:', {
      userId,
      pbAuthValid: pb.authStore.isValid,
      pbAuthRecord: !!pb.authStore.record,
      pbAuthRecordId: pb.authStore.record?.id,
      pbAuthModelId: pb.authStore.model?.id,
      pbAuthToken: !!pb.authStore.token,
      pbAuthTokenExpiry: pb.authStore.token?.expires_at ? new Date(pb.authStore.token.expires_at * 1000) : 'no expiry',
      fullAuthStore: pb.authStore
    })

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
            } else if (item.data.type === 'sale') {
              console.log(`💰 Creando venta (orden):`, item.data.data)
              console.log('🔐 pb.authStore state before createSale:', {
                isValid: pb.authStore.isValid,
                hasRecord: !!pb.authStore.record,
                recordId: pb.authStore.record?.id,
                token: !!pb.authStore.token
              })
              result = await supabaseSyncService.createSale(item.data.data) // Nueva función
              console.log(`✅ Venta creada:`, result)
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
            } else if (item.data.type === 'sale') {
              console.log(`💰 Actualizando venta ${item.data.data.id}:`, item.data.data)
              result = await supabaseSyncService.updateSale(item.data.data.id, item.data.data) // Nueva función
              console.log(`✅ Venta actualizada:`, result)
            }
          } else if (item.action === 'DELETE') {
            if (item.data.type === 'product') {
              console.log(`🗑️ Eliminando producto ${item.data.id}`)
              result = await supabaseSyncService.deleteProduct(item.data.id)
            } else if (item.data.type === 'customer') {
              console.log(`🗑️ Eliminando cliente ${item.data.id}`)
              result = await supabaseSyncService.deleteCustomer(item.data.id)
            } else if (item.data.type === 'sale') {
              console.log(`💰 Eliminando venta ${item.data.id}`)
              result = await supabaseSyncService.deleteSale(item.data.id) // Nueva función
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
        await get().loadDataFromPocketBase(userId)
      } else {
        console.warn(`⚠️ Sincronización con ${failedCount} errores. NO recargando datos de PocketBase para evitar loops.`)
      }
    } catch (error) {
      set({ error: error.message, isSyncing: false })
      console.error('❌ Error sincronizando datos:', error)
    }
  },
}))

// Exportar dataStore para servicios (no React hooks)
export const dataStore = {
  saveInventory: async (inventory) => {
    try {
      const db = await initDB()
      for (const item of inventory) {
        await db.put(STORES.PRODUCTS, item)
      }
      console.log(`✅ Inventory saved: ${inventory.length} items`)
    } catch (error) {
      console.error('❌ Error saving inventory:', error)
    }
  },

  saveClients: async (clients) => {
    try {
      const db = await initDB()
      for (const item of clients) {
        await db.put(STORES.CUSTOMERS, item)
      }
      console.log(`✅ Clients saved: ${clients.length} items`)
    } catch (error) {
      console.error('❌ Error saving clients:', error)
    }
  },

  saveSales: async (sales) => {
    try {
      const db = await initDB()
      for (const item of sales) {
        await db.put(STORES.SALES_LOCAL, item)
      }
      console.log(`✅ Sales saved: ${sales.length} items`)
    } catch (error) {
      console.error('❌ Error saving sales:', error)
    }
  },

  savePendingOperation: async (operation) => {
    try {
      const db = await initDB()
      await db.add(STORES.SYNC_QUEUE, operation)
      console.log(`✅ Pending operation saved: ${operation.id}`)
    } catch (error) {
      console.error('❌ Error saving pending operation:', error)
    }
  },

  updateOperationStatus: async (id, status) => {
    try {
      const db = await initDB()
      const operation = await db.get(STORES.SYNC_QUEUE, id)
      if (operation) {
        operation.status = status
        await db.put(STORES.SYNC_QUEUE, operation)
        console.log(`✅ Operation status updated: ${id} -> ${status}`)
      }
    } catch (error) {
      console.error('❌ Error updating operation status:', error)
    }
  },

  updateInventory: async (newInventory) => {
    try {
      const db = await initDB()
      for (const item of newInventory) {
        await db.put(STORES.PRODUCTS, item)
      }
      console.log(`✅ Inventory updated: ${newInventory.length} items`)
    } catch (error) {
      console.error('❌ Error updating inventory:', error)
    }
  },

  updateClients: async (newClients) => {
    try {
      const db = await initDB()
      for (const item of newClients) {
        await db.put(STORES.CUSTOMERS, item)
      }
      console.log(`✅ Clients updated: ${newClients.length} items`)
    } catch (error) {
      console.error('❌ Error updating clients:', error)
    }
  },

  syncPendingData: async (userId) => {
    return useDataStore.getState().syncPendingData(userId)
  },
}