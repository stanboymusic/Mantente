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

// Auto-refresh token before expiration
pb.authStore.onChange(() => {
  console.log('🔄 Auth store changed, valid:', pb.authStore.isValid)
  if (pb.authStore.isValid) {
    // Refresh token 5 minutes before expiration
    const expiresAt = new Date(pb.authStore.token.expires_at * 1000)
    const now = new Date()
    const timeUntilExpiry = expiresAt - now

    if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes
      console.log('🔄 Token expiring soon, refreshing...')
      pb.authStore.refresh().catch(err => {
        console.error('❌ Error refreshing token:', err)
      })
    }
  }
})

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
    return pb.authStore.model || pb.authStore.record
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
      const user = pb.authStore.model || pb.authStore.record
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

  async getSales(userId) {
    try {
      console.log(`💰 Obteniendo ventas procesadas para usuario: ${userId}`)
      const records = await pb.collection('ventas').getFullList({
        filter: `user_id = "${userId}"`,
      })
      console.log(`✅ Ventas obtenidas: ${records.length}`)
      // Map to expected format
      return records.map(v => ({
        id: v.id,
        codigo_venta: v.codigo_venta,
        cliente: v.cliente,
        cliente_id: v.cliente_id,
        total: v.total,
        estado: v.estado || 'confirmada',
        origen: v.origen || 'mantente_app',
        productos_json: v.productos_json || [],
        fecha: v.fecha,
        mes_cierre: v.mes_cierre,
        user_id: v.user_id,
        created_at: v.created,
        updated_at: v.updated
      }))
    } catch (error) {
      console.error('❌ Error obteniendo ventas:', error)
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
      const userId = pb.authStore.model?.id
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

  async createSale(sale, userId = null) {
    try {
      console.log('🔐 Auth store state at createSale:', {
        isValid: pb.authStore.isValid,
        hasRecord: !!pb.authStore.record,
        recordId: pb.authStore.record?.id,
        modelId: pb.authStore.model?.id,
        token: pb.authStore.token ? 'present' : 'missing',
        tokenExpiry: pb.authStore.token?.expires_at ? new Date(pb.authStore.token.expires_at * 1000) : 'no expiry',
        providedUserId: userId
      })

      // If we have a token but no record, try to refresh the auth store
      if (pb.authStore.isValid && !pb.authStore.record && pb.authStore.token) {
        console.log('🔄 Token present but no record, refreshing auth store...')
        try {
          await pb.collection('users').authRefresh()
          console.log('✅ Auth store refreshed:', {
            hasRecord: !!pb.authStore.record,
            recordId: pb.authStore.record?.id
          })
        } catch (refreshError) {
          console.error('❌ Failed to refresh auth store:', refreshError.message)
        }
      }

      const finalUserId = userId || pb.authStore.model?.id || pb.authStore.record?.id
      if (!finalUserId) {
        console.error('❌ No authenticated user - no userId provided and pb.authStore.model and record are null/undefined')
        throw new Error('No authenticated user')
      }

      // Crear venta con estado 'orden' para procesamiento automático
      const data = {
        codigo_venta: sale.codigo_venta || `VENTA-${Date.now()}`,
        cliente: sale.cliente,
        cliente_id: sale.customer_id || sale.cliente_id,
        productos_json: sale.productos_json || sale.productos || [],
        cantidad_productos: sale.cantidad_productos || sale.productos_json?.length || sale.productos?.length || 0,
        monto: sale.monto || sale.total,
        descuento: sale.descuento || 0,
        total: sale.total,
        metodo_pago: sale.metodo_pago || 'efectivo',
        fecha: sale.fecha || new Date().toISOString().split('T')[0],
        mes_cierre: sale.mes_cierre || new Date().toISOString().slice(0, 7) + "-01",
        notas: sale.notas || '',
        estado: 'orden', // Estado inicial para procesamiento automático
        origen: 'mantente_connect', // Origen de la venta
        user_id: finalUserId,
      }

      console.log('💰 Creando venta con estado orden:', data)
      const created = await pb.collection('ventas').create(data)
      console.log('✅ Venta creada con estado orden:', created)
      return created
    } catch (error) {
      console.error('❌ Error creando venta:', error)
      throw error
    }
  },

  async updateSale(id, updates) {
    try {
      const updated = await pb.collection('ventas').update(id, updates)
      return updated
    } catch (error) {
      console.error('❌ Error actualizando venta:', error)
      throw error
    }
  },

  async deleteSale(id) {
    try {
      await pb.collection('ventas').delete(id)
    } catch (error) {
      console.error('❌ Error eliminando venta:', error)
      throw error
    }
  },
}
