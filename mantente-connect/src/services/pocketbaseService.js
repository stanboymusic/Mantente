import PocketBase from 'pocketbase'

// For production, use the Fly.io URL directly
// For development, use localhost
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
const POCKETBASE_URL = isProduction
  ? 'https://mantente-pocketbase.fly.dev'
  : (import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090')

console.log('🔧 PocketBase URL configurada:', POCKETBASE_URL)
console.log('🔧 Environment:', {
  isProduction,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
  VITE_POCKETBASE_URL: import.meta.env.VITE_POCKETBASE_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  MODE: import.meta.env.MODE
})

export const pb = new PocketBase(POCKETBASE_URL)

pb.autoCancelRequests = true

export const supabaseAuthService = {
  async login(email, password) {
    try {
      console.log('🔐 Intentando login con:', { email, url: POCKETBASE_URL })
      const authData = await pb.collection('users').authWithPassword(email, password)
      console.log('✅ Login exitoso:', authData.record)

      return {
        user: authData.record,
        session: authData,
      }
    } catch (error) {
      console.error('❌ Error en login:', error)
      console.error('❌ Detalles del error:', {
        message: error.message,
        status: error.status,
        response: error.response,
        url: POCKETBASE_URL
      })
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
          const existing = await pb.collection('inventario').getFirstListItem(`nombre="${product.name}" && user_id="${userId}"`)
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
          const existing = await pb.collection('clientes').getFirstListItem(`nombre="${customer.name}" && user_id="${userId}"`)
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
      // Map to expected format
      return records.map(p => ({
        id: p.id,
        name: p.nombre,
        quantity: p.cantidad,
        price: p.precio,
        description: p.descripcion,
        category: p.categoria,
        stock_minimo: p.stock_minimo,
        fecha_agregado: p.fecha_agregado,
        user_id: p.user_id,
        created_at: p.created,
        updated_at: p.updated
      }))
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
      // Map to expected format
      return records.map(c => ({
        id: c.id,
        name: c.nombre,
        email: c.email,
        phone: c.telefono,
        address: c.direccion,
        city: c.ciudad,
        state: c.departamento,
        tax_id: c.ruc,
        contact_person: c.razon_social,
        notes: c.notas,
        is_active: c.estado === 'activo',
        user_id: c.user_id,
        created_at: c.created,
        updated_at: c.updated
      }))
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
        nombre: product.name,
        cantidad: product.quantity,
        precio: product.price,
        descripcion: product.description,
        categoria: product.category,
        stock_minimo: product.stock_minimo || product.quantity,
        fecha_agregado: product.fecha_agregado || new Date().toISOString().split('T')[0],
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
      const data = {}
      if (updates.name) data.nombre = updates.name
      if (updates.quantity !== undefined) data.cantidad = updates.quantity
      if (updates.price !== undefined) data.precio = updates.price
      if (updates.description) data.descripcion = updates.description
      if (updates.category) data.categoria = updates.category
      if (updates.stock_minimo !== undefined) data.stock_minimo = updates.stock_minimo

      const updated = await pb.collection('inventario').update(id, data)
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
        nombre: customer.name,
        email: customer.email,
        telefono: customer.phone,
        direccion: customer.address,
        ciudad: customer.city,
        departamento: customer.state,
        ruc: customer.tax_id,
        razon_social: customer.contact_person,
        notas: customer.notes,
        estado: customer.is_active ? 'activo' : 'inactivo',
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
      const data = {}
      if (updates.name) data.nombre = updates.name
      if (updates.email) data.email = updates.email
      if (updates.phone) data.telefono = updates.phone
      if (updates.address) data.direccion = updates.address
      if (updates.city) data.ciudad = updates.city
      if (updates.state) data.departamento = updates.state
      if (updates.tax_id) data.ruc = updates.tax_id
      if (updates.contact_person) data.razon_social = updates.contact_person
      if (updates.notes) data.notas = updates.notes
      if (updates.is_active !== undefined) data.estado = updates.is_active ? 'activo' : 'inactivo'

      const updated = await pb.collection('clientes').update(id, data)
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
