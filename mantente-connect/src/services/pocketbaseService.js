import PocketBase from 'pocketbase'

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090'

if (!POCKETBASE_URL) {
  console.error('❌ Falta configurar VITE_POCKETBASE_URL en .env.local')
}

export const pb = new PocketBase(POCKETBASE_URL)

pb.autoCancelRequests = true

export const supabaseAuthService = {
  async login(email, password) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      
      return {
        user: authData.record,
        session: authData,
      }
    } catch (error) {
      console.error('❌ Error en login:', error)
      throw error
    }
  },

  async signup(email, password, metadata = {}) {
    try {
      const userData = {
        email,
        password,
        passwordConfirm: password,
        ...metadata,
      }
      
      const record = await pb.collection('users').create(userData)
      
      const authData = await pb.collection('users').authWithPassword(email, password)
      
      return {
        user: authData.record,
        session: authData,
      }
    } catch (error) {
      console.error('❌ Error en signup:', error)
      throw error
    }
  },

  async logout() {
    pb.authStore.clear()
  },

  async getSession() {
    return pb.authStore.isValid ? pb.authStore : null
  },

  async getCurrentUser() {
    return pb.authStore.record
  },

  onAuthStateChange(callback) {
    pb.authStore.onChange(() => {
      callback(pb.authStore.isValid ? 'SIGNED_IN' : 'SIGNED_OUT', pb.authStore)
    })
    
    return {
      unsubscribe: () => {},
    }
  },

  async resetPassword(email) {
    try {
      await pb.collection('users').requestPasswordReset(email)
    } catch (error) {
      console.error('❌ Error en reset password:', error)
      throw error
    }
  },

  async updateProfile(updates) {
    try {
      const user = pb.authStore.record
      if (!user) throw new Error('No authenticated user')
      
      const updated = await pb.collection('users').update(user.id, updates)
      return updated
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error)
      throw error
    }
  },
}

export const supabaseSyncService = {
  async syncProducts(products) {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) throw new Error('No authenticated user')
      
      const mappedProducts = products.map(p => ({
        ...p,
        user_id: userId,
      }))
      
      let result = []
      for (const product of mappedProducts) {
        try {
          const existing = await pb.collection('inventario').getFirstListItem(`code="${product.code}" && user_id="${userId}"`)
          const updated = await pb.collection('inventario').update(existing.id, product)
          result.push(updated)
        } catch (e) {
          const created = await pb.collection('inventario').create(product)
          result.push(created)
        }
      }
      
      return result
    } catch (error) {
      console.error('❌ Error sincronizando productos:', error)
      throw error
    }
  },

  async syncCustomers(customers) {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) throw new Error('No authenticated user')
      
      const mappedCustomers = customers.map(c => ({
        ...c,
        user_id: userId,
      }))
      
      let result = []
      for (const customer of mappedCustomers) {
        try {
          const existing = await pb.collection('clientes').getFirstListItem(`code="${customer.code}" && user_id="${userId}"`)
          const updated = await pb.collection('clientes').update(existing.id, customer)
          result.push(updated)
        } catch (e) {
          const created = await pb.collection('clientes').create(customer)
          result.push(created)
        }
      }
      
      return result
    } catch (error) {
      console.error('❌ Error sincronizando clientes:', error)
      throw error
    }
  },

  async syncOrders(orders) {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) throw new Error('No authenticated user')
      
      const mappedOrders = orders.map(o => ({
        ...o,
        user_id: userId,
      }))
      
      let result = []
      for (const order of mappedOrders) {
        try {
          const existing = await pb.collection('orders').getFirstListItem(`id="${order.id}"`)
          const updated = await pb.collection('orders').update(existing.id, order)
          result.push(updated)
        } catch (e) {
          const created = await pb.collection('orders').create(order)
          result.push(created)
        }
      }
      
      return result
    } catch (error) {
      console.error('❌ Error sincronizando órdenes:', error)
      throw error
    }
  },

  async getProducts(userId) {
    try {
      const records = await pb.collection('inventario').getFullList({
        filter: `user_id = "${userId}"`,
      })
      return records
    } catch (error) {
      console.error('❌ Error obteniendo productos:', error)
      return []
    }
  },

  async getCustomers(userId) {
    try {
      const records = await pb.collection('clientes').getFullList({
        filter: `user_id = "${userId}"`,
      })
      return records
    } catch (error) {
      console.error('❌ Error obteniendo clientes:', error)
      return []
    }
  },

  async getOrders(userId) {
    try {
      const records = await pb.collection('orders').getFullList({
        filter: `user_id = "${userId}"`,
      })
      return records
    } catch (error) {
      console.error('❌ Error obteniendo órdenes:', error)
      return []
    }
  },

  async createProduct(product) {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) throw new Error('No authenticated user')
      
      const data = {
        ...product,
        user_id: userId,
      }
      
      const created = await pb.collection('inventario').create(data)
      return created
    } catch (error) {
      console.error('❌ Error creando producto:', error)
      throw error
    }
  },

  async updateProduct(id, updates) {
    try {
      const updated = await pb.collection('inventario').update(id, updates)
      return updated
    } catch (error) {
      console.error('❌ Error actualizando producto:', error)
      throw error
    }
  },

  async deleteProduct(id) {
    try {
      await pb.collection('inventario').delete(id)
    } catch (error) {
      console.error('❌ Error eliminando producto:', error)
      throw error
    }
  },

  async createCustomer(customer) {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) throw new Error('No authenticated user')
      
      const data = {
        ...customer,
        user_id: userId,
      }
      
      const created = await pb.collection('clientes').create(data)
      return created
    } catch (error) {
      console.error('❌ Error creando cliente:', error)
      throw error
    }
  },

  async updateCustomer(id, updates) {
    try {
      const updated = await pb.collection('clientes').update(id, updates)
      return updated
    } catch (error) {
      console.error('❌ Error actualizando cliente:', error)
      throw error
    }
  },

  async deleteCustomer(id) {
    try {
      await pb.collection('clientes').delete(id)
    } catch (error) {
      console.error('❌ Error eliminando cliente:', error)
      throw error
    }
  },

  async createOrder(order) {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) throw new Error('No authenticated user')
      
      const data = {
        ...order,
        user_id: userId,
      }
      
      const created = await pb.collection('orders').create(data)
      return created
    } catch (error) {
      console.error('❌ Error creando orden:', error)
      throw error
    }
  },

  async updateOrder(id, updates) {
    try {
      const updated = await pb.collection('orders').update(id, updates)
      return updated
    } catch (error) {
      console.error('❌ Error actualizando orden:', error)
      throw error
    }
  },

  async deleteOrder(id) {
    try {
      await pb.collection('orders').delete(id)
    } catch (error) {
      console.error('❌ Error eliminando orden:', error)
      throw error
    }
  },
}
