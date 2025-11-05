import Dexie from 'dexie'

// Crear la base de datos IndexedDB
const db = new Dexie('ManteneConnectDB')

db.version(1).stores({
  products: 'id, name, sku, synced, createdAt',
  customers: 'id, name, email, synced, createdAt',
  orders: 'id, customerId, status, synced, createdAt',
  orderItems: 'id, orderId, productId',
  syncQueue: 'id, entityType, operation, timestamp',
  sessions: 'id, userId, expiresAt',
})

export const dbService = {
  // Productos
  async addProduct(product) {
    return db.products.add({
      ...product,
      synced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  },

  async getProduct(id) {
    return db.products.get(id)
  },

  async getAllProducts() {
    return db.products.toArray()
  },

  async updateProduct(id, updates) {
    return db.products.update(id, {
      ...updates,
      synced: false,
      updatedAt: new Date().toISOString(),
    })
  },

  async deleteProduct(id) {
    return db.products.delete(id)
  },

  async getUnsyncedProducts() {
    return db.products.where('synced').equals(false).toArray()
  },

  // Clientes
  async addCustomer(customer) {
    return db.customers.add({
      ...customer,
      synced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  },

  async getCustomer(id) {
    return db.customers.get(id)
  },

  async getAllCustomers() {
    return db.customers.toArray()
  },

  async updateCustomer(id, updates) {
    return db.customers.update(id, {
      ...updates,
      synced: false,
      updatedAt: new Date().toISOString(),
    })
  },

  async deleteCustomer(id) {
    return db.customers.delete(id)
  },

  async getUnsyncedCustomers() {
    return db.customers.where('synced').equals(false).toArray()
  },

  // Órdenes
  async addOrder(order) {
    return db.orders.add({
      ...order,
      synced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  },

  async getOrder(id) {
    return db.orders.get(id)
  },

  async getAllOrders() {
    return db.orders.toArray()
  },

  async updateOrder(id, updates) {
    return db.orders.update(id, {
      ...updates,
      synced: false,
      updatedAt: new Date().toISOString(),
    })
  },

  async deleteOrder(id) {
    return db.orders.delete(id)
  },

  async getOrdersByCustomer(customerId) {
    return db.orders.where('customerId').equals(customerId).toArray()
  },

  async getUnsyncedOrders() {
    return db.orders.where('synced').equals(false).toArray()
  },

  // Cola de sincronización
  async addToSyncQueue(entityType, operation, entityId, data) {
    return db.syncQueue.add({
      entityType,
      operation,
      entityId,
      data,
      timestamp: new Date().toISOString(),
    })
  },

  async getSyncQueue() {
    return db.syncQueue.toArray()
  },

  async clearSyncQueue() {
    return db.syncQueue.clear()
  },

  // Sesiones
  async saveSession(session) {
    return db.sessions.add({
      ...session,
      createdAt: new Date().toISOString(),
    })
  },

  async getSession(userId) {
    return db.sessions.where('userId').equals(userId).first()
  },

  async clearExpiredSessions() {
    const now = new Date().toISOString()
    return db.sessions.where('expiresAt').below(now).delete()
  },
}