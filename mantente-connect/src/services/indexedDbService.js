import { openDB } from 'idb'

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

// Cargar datos del usuario actual desde IndexedDB
const loadUserDataDB = async (userId) => {
  if (!userId) {
    console.log('⚠️ loadUserDataDB: No userId provided')
    return { products: [], customers: [], salesLocal: [], pendingSync: 0 }
  }

  console.log(`📂 Cargando datos locales para usuario: ${userId}`)
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

    return { products, customers, salesLocal, pendingSync }
  } catch (error) {
    console.error('❌ Error cargando datos locales:', error)
    throw error
  }
}

// Agregar producto
const addProductDB = async (product) => {
  try {
    const db = await initDB()
    const newProduct = { ...product, id: crypto.randomUUID(), synced: false, createdAt: new Date().toISOString() }
    await db.add(STORES.PRODUCTS, newProduct)
    console.log('✅ Producto agregado a IndexedDB')
    return newProduct
  } catch (error) {
    console.error('❌ Error agregando producto a IndexedDB:', error)
    throw error
  }
}

// Actualizar producto
const updateProductDB = async (id, updates) => {
  try {
    const db = await initDB()
    const product = await db.get(STORES.PRODUCTS, id)
    if (product) {
      const updated = { ...product, ...updates, synced: false, updatedAt: new Date().toISOString() }
      await db.put(STORES.PRODUCTS, updated)
      console.log('✅ Producto actualizado en IndexedDB')
      return updated
    }
    return null
  } catch (error) {
    console.error('❌ Error actualizando producto en IndexedDB:', error)
    throw error
  }
}

// Eliminar producto
const deleteProductDB = async (id) => {
  try {
    const db = await initDB()
    await db.delete(STORES.PRODUCTS, id)
    console.log('✅ Producto eliminado de IndexedDB')
  } catch (error) {
    console.error('❌ Error eliminando producto de IndexedDB:', error)
    throw error
  }
}

// Agregar cliente
const addCustomerDB = async (customer) => {
  try {
    const db = await initDB()
    const newCustomer = { ...customer, id: crypto.randomUUID(), synced: false, createdAt: new Date().toISOString() }
    await db.add(STORES.CUSTOMERS, newCustomer)
    console.log('✅ Cliente agregado a IndexedDB')
    return newCustomer
  } catch (error) {
    console.error('❌ Error agregando cliente a IndexedDB:', error)
    throw error
  }
}

// Actualizar cliente
const updateCustomerDB = async (id, updates) => {
  try {
    const db = await initDB()
    const customer = await db.get(STORES.CUSTOMERS, id)
    if (customer) {
      const updated = { ...customer, ...updates, synced: false, updatedAt: new Date().toISOString() }
      await db.put(STORES.CUSTOMERS, updated)
      console.log('✅ Cliente actualizado en IndexedDB')
      return updated
    }
    return null
  } catch (error) {
    console.error('❌ Error actualizando cliente en IndexedDB:', error)
    throw error
  }
}

// Eliminar cliente
const deleteCustomerDB = async (id) => {
  try {
    const db = await initDB()
    await db.delete(STORES.CUSTOMERS, id)
    console.log('✅ Cliente eliminado de IndexedDB')
  } catch (error) {
    console.error('❌ Error eliminando cliente de IndexedDB:', error)
    throw error
  }
}

// Agregar venta local (orden)
const addSaleLocalDB = async (sale) => {
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
    return newSale
  } catch (error) {
    console.error('❌ Error agregando venta local a IndexedDB:', error)
    throw error
  }
}

// Actualizar venta local
const updateSaleLocalDB = async (id, updates) => {
  try {
    const db = await initDB()
    const sale = await db.get(STORES.SALES_LOCAL, id)
    if (sale) {
      const updated = { ...sale, ...updates, synced: false, updatedAt: new Date().toISOString() }
      await db.put(STORES.SALES_LOCAL, updated)
      console.log('✅ Venta local actualizada en IndexedDB')
      return updated
    }
    return null
  } catch (error) {
    console.error('❌ Error actualizando venta local en IndexedDB:', error)
    throw error
  }
}

// Eliminar venta local
const deleteSaleLocalDB = async (id) => {
  try {
    const db = await initDB()
    await db.delete(STORES.SALES_LOCAL, id)
    console.log('✅ Venta local eliminada de IndexedDB')
  } catch (error) {
    console.error('❌ Error eliminando venta local de IndexedDB:', error)
    throw error
  }
}

// ✅ LIMPIAR ÓRDENES INVÁLIDAS DE LA COLA DE SINCRONIZACIÓN
const cleanInvalidOrdersFromQueueDB = async (userId) => {
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
      return 0
    }

    console.log(`🧹 Limpiando ${invalidOrders.length} órdenes inválidas de la cola de sincronización...`)

    // Eliminar órdenes inválidas
    for (const item of invalidOrders) {
      await db.delete(STORES.SYNC_QUEUE, item.id)
      console.log(`🗑️ Orden eliminada de cola: ${item.data.data.id}`)
    }

    // Contar restantes
    const remainingQueue = await db.getAll(STORES.SYNC_QUEUE)
    const userRemainingQueue = remainingQueue.filter(item => !item.userId || item.userId === userId)
    console.log(`✅ Limpieza completada. Pendientes: ${userRemainingQueue.length}`)
    return userRemainingQueue.length
  } catch (error) {
    console.error('❌ Error limpiando órdenes inválidas:', error)
    throw error
  }
}

// Agregar a cola de sincronización
const addToSyncQueueDB = async (action, data, userId = null) => {
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

    // Contar items del usuario
    const syncQueue = await db.getAll(STORES.SYNC_QUEUE)
    const userQueue = syncQueue.filter(item => !item.userId || item.userId === userId)

    console.log(`✅ Acción agregada a cola de sincronización: ${action} (pending: ${userQueue.length})`)
    return userQueue.length
  } catch (error) {
    console.error('❌ Error agregando a sync queue:', error)
    throw error
  }
}

// Obtener cola de sincronización para un usuario
const getSyncQueueDB = async (userId) => {
  try {
    const db = await initDB()
    const syncQueue = await db.getAll(STORES.SYNC_QUEUE)
    return syncQueue.filter(item => !item.userId || item.userId === userId)
  } catch (error) {
    console.error('❌ Error obteniendo sync queue:', error)
    throw error
  }
}

// Eliminar de cola de sincronización
const deleteFromSyncQueueDB = async (id) => {
  try {
    const db = await initDB()
    await db.delete(STORES.SYNC_QUEUE, id)
    console.log(`✅ Item eliminado de sync_queue: ${id}`)
  } catch (error) {
    console.error('❌ Error eliminando de sync queue:', error)
    throw error
  }
}

// Guardar inventario (productos)
const saveInventoryDB = async (inventory) => {
  try {
    const db = await initDB()
    for (const item of inventory) {
      await db.put(STORES.PRODUCTS, item)
    }
    console.log(`✅ Inventory saved: ${inventory.length} items`)
  } catch (error) {
    console.error('❌ Error saving inventory:', error)
    throw error
  }
}

// Guardar clientes
const saveClientsDB = async (clients) => {
  try {
    const db = await initDB()
    for (const item of clients) {
      await db.put(STORES.CUSTOMERS, item)
    }
    console.log(`✅ Clients saved: ${clients.length} items`)
  } catch (error) {
    console.error('❌ Error saving clients:', error)
    throw error
  }
}

// Guardar ventas
const saveSalesDB = async (sales) => {
  try {
    const db = await initDB()
    for (const item of sales) {
      await db.put(STORES.SALES_LOCAL, item)
    }
    console.log(`✅ Sales saved: ${sales.length} items`)
  } catch (error) {
    console.error('❌ Error saving sales:', error)
    throw error
  }
}

// Guardar operación pendiente
const savePendingOperationDB = async (operation) => {
  try {
    const db = await initDB()
    await db.add(STORES.SYNC_QUEUE, operation)
    console.log(`✅ Pending operation saved: ${operation.id}`)
  } catch (error) {
    console.error('❌ Error saving pending operation:', error)
    throw error
  }
}

// Actualizar estado de operación
const updateOperationStatusDB = async (id, status) => {
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
    throw error
  }
}

// Actualizar inventario
const updateInventoryDB = async (newInventory) => {
  try {
    const db = await initDB()
    for (const item of newInventory) {
      await db.put(STORES.PRODUCTS, item)
    }
    console.log(`✅ Inventory updated: ${newInventory.length} items`)
  } catch (error) {
    console.error('❌ Error updating inventory:', error)
    throw error
  }
}

// Actualizar clientes
const updateClientsDB = async (newClients) => {
  try {
    const db = await initDB()
    for (const item of newClients) {
      await db.put(STORES.CUSTOMERS, item)
    }
    console.log(`✅ Clients updated: ${newClients.length} items`)
  } catch (error) {
    console.error('❌ Error updating clients:', error)
    throw error
  }
}

// Limpiar productos y clientes (para recarga desde PocketBase)
const clearProductsAndCustomersDB = async () => {
  try {
    const db = await initDB()
    const tx = db.transaction([STORES.PRODUCTS, STORES.CUSTOMERS], 'readwrite')
    await tx.objectStore(STORES.PRODUCTS).clear()
    await tx.objectStore(STORES.CUSTOMERS).clear()
    await tx.done
    console.log('✅ Productos y clientes limpiados de IndexedDB')
  } catch (error) {
    console.error('❌ Error limpiando productos y clientes:', error)
    throw error
  }
}

// Agregar productos desde PocketBase
const addProductsFromPBDB = async (products) => {
  try {
    const db = await initDB()
    for (const product of products) {
      await db.add(STORES.PRODUCTS, { ...product, synced: true })
    }
    console.log(`✅ ${products.length} productos agregados desde PocketBase`)
  } catch (error) {
    console.error('❌ Error agregando productos desde PocketBase:', error)
    throw error
  }
}

// Agregar clientes desde PocketBase
const addCustomersFromPBDB = async (customers) => {
  try {
    const db = await initDB()
    for (const customer of customers) {
      await db.add(STORES.CUSTOMERS, { ...customer, synced: true })
    }
    console.log(`✅ ${customers.length} clientes agregados desde PocketBase`)
  } catch (error) {
    console.error('❌ Error agregando clientes desde PocketBase:', error)
    throw error
  }
}

export {
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
}