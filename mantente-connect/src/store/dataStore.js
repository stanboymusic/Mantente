import { create } from 'zustand'
import { supabaseSyncService, pb } from '../services/pocketbaseService'
import {
  initDB,
  loadUserDataDB,
  addProductDB,
  updateProductDB,
  deleteProductDB,
  addCustomerDB,
  updateCustomerDB,
  deleteCustomerDB,
  addSaleLocalDB,
  updateSaleLocalDB,
  deleteSaleLocalDB,
  cleanInvalidOrdersFromQueueDB,
  addToSyncQueueDB,
  getSyncQueueDB,
  deleteFromSyncQueueDB,
  saveInventoryDB,
  saveClientsDB,
  saveSalesDB,
  savePendingOperationDB,
  updateOperationStatusDB,
  updateInventoryDB,
  updateClientsDB,
  clearProductsAndCustomersDB,
  addProductsFromPBDB,
  addCustomersFromPBDB,
} from '../services/indexedDbService'

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
      const { products, customers, salesLocal, pendingSync } = await loadUserDataDB(userId)

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
      const newProduct = await addProductDB(product)

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
      const updated = await updateProductDB(id, updates)
      if (updated) {
        await get().addToSyncQueue('UPDATE', { type: 'product', data: updated }, userId || updated.user_id)

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
      await deleteProductDB(id)
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
      const newCustomer = await addCustomerDB(customer)

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
      const updated = await updateCustomerDB(id, updates)
      if (updated) {
        await get().addToSyncQueue('UPDATE', { type: 'customer', data: updated }, userId || updated.user_id)

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
      await deleteCustomerDB(id)
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
      const newSale = await addSaleLocalDB(sale)

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
      const updated = await updateSaleLocalDB(id, updates)
      if (updated) {
        await get().addToSyncQueue('UPDATE', { type: 'sale', data: updated }, userId || updated.user_id)

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
      await deleteSaleLocalDB(id)
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
      const remainingCount = await cleanInvalidOrdersFromQueueDB(userId)
      set({ pendingSync: remainingCount })
      console.log(`✅ Limpieza completada. Pendientes: ${remainingCount}`)
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error limpiando órdenes inválidas:', error)
    }
  },

  // Agregar a cola de sincronización
  addToSyncQueue: async (action, data, userId = null) => {
    try {
      const pendingCount = await addToSyncQueueDB(action, data, userId)
      set({ pendingSync: pendingCount })
      console.log(`✅ Acción agregada a cola de sincronización: ${action} (pending: ${pendingCount})`)
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

    if (!pb.authStore.isValid) {
      console.warn('⚠️ loadDataFromPocketBase: pb.authStore.isValid is false. Cannot load data.')
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
      console.log('💾 Guardando datos en IndexedDB...')

      // Limpiar IndexedDB primero (solo productos y clientes, no ventas locales)
      await clearProductsAndCustomersDB()

      // Agregar nuevos datos
      await addProductsFromPBDB(products)
      await addCustomersFromPBDB(customers)

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
      pbAuthRecord: !!(pb.authStore.model || pb.authStore.record),
      pbAuthId: (pb.authStore.model || pb.authStore.record)?.id,
      pbAuthToken: !!pb.authStore.token,
      fullAuthStore: pb.authStore
    })

    let currentUser = pb.authStore.model || pb.authStore.record

    // If we have a token but no record, try to refresh the auth store before syncing
    if (pb.authStore.isValid && !currentUser && pb.authStore.token) {
      console.log('🔄 Token present but no record before sync, refreshing auth store...')
      try {
        const authData = await pb.collection('users').authRefresh()
        console.log('✅ Auth store refreshed before sync:', {
          hasRecord: !!(pb.authStore.model || pb.authStore.record),
          recordId: (pb.authStore.model || pb.authStore.record)?.id
        })
      } catch (refreshError) {
        console.error('❌ Failed to refresh auth store before sync:', refreshError.message)
        // If refresh fails, don't proceed with sync
        console.warn('⚠️ Cannot sync without authenticated record')
        return
      }
    }

    // Ensure we have an authenticated record before proceeding
    currentUser = pb.authStore.model || pb.authStore.record
    
    if (!currentUser) {
      console.warn('⚠️ No authenticated user record available for sync. Checking fallback...')
      
      // Fallback: If we have a token, we might be able to proceed even if the record is missing
      if (pb.authStore.isValid && pb.authStore.token) {
        try {
          const payload = JSON.parse(atob(pb.authStore.token.split('.')[1]));
          const fallbackUserId = payload.id;
          
          if (fallbackUserId === userId) {
            console.log('✅ Token matches userId, proceeding with sync using token fallback')
          } else {
            console.error('❌ Token userId mismatch:', { tokenUserId: fallbackUserId, providedUserId: userId })
            throw new Error('Authentication mismatch')
          }
        } catch (e) {
          console.error('❌ Could not validate token fallback:', e.message)
          return { success: false, message: 'No authenticated user' }
        }
      } else {
        console.error('❌ No authenticated user record and no valid token available for sync')
        return { success: false, message: 'No authenticated user' }
      }
    }

    set({ isSyncing: true, error: null })
    try {
      const userSyncQueue = await getSyncQueueDB(userId)

      if (userSyncQueue.length === 0) {
        console.log('✅ No hay cambios pendientes de sincronizar para este usuario')
        set({ pendingSync: 0 })
        return { success: true, message: 'Nada pendiente' }
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
              const currentPbUser = pb.authStore.model || pb.authStore.record;
              console.log(`💰 Sincronizando venta (orden):`, item.data.data)
              console.log('🔐 pb.authStore state in loop before createSale:', {
                isValid: pb.authStore.isValid,
                hasRecord: !!currentPbUser,
                recordId: currentPbUser?.id,
                token: !!pb.authStore.token
              })
              result = await supabaseSyncService.createSale(item.data.data, userId) // Nueva función
              console.log(`✅ Venta sincronizada exitosamente:`, result)
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
          await deleteFromSyncQueueDB(item.id)
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
      const userRemainingQueue = await getSyncQueueDB(userId)
      set({ pendingSync: userRemainingQueue.length })

      // SOLO recargar datos si la sincronización fue exitosa (sin errores)
      if (failedCount === 0) {
        console.log('📡 Recargando datos desde PocketBase...')
        await get().loadDataFromPocketBase(userId)
        return { success: true, message: 'Sincronización exitosa' }
      } else {
        console.warn(`⚠️ Sincronización con ${failedCount} errores. NO recargando datos de PocketBase para evitar loops.`)
        return { success: false, message: `Sincronización parcial: ${syncedCount} exitosos, ${failedCount} fallidos` }
      }
    } catch (error) {
      set({ error: error.message })
      console.error('❌ Error sincronizando datos:', error)
      return { success: false, message: error.message }
    } finally {
      set({ isSyncing: false })
    }
  },
}))

// Exportar dataStore para servicios (no React hooks)
export const dataStore = {
  saveInventory: saveInventoryDB,
  saveClients: saveClientsDB,
  saveSales: saveSalesDB,
  savePendingOperation: savePendingOperationDB,
  updateOperationStatus: updateOperationStatusDB,
  updateInventory: updateInventoryDB,
  updateClients: updateClientsDB,
  syncPendingData: async (userId) => {
    return useDataStore.getState().syncPendingData(userId)
  },
}