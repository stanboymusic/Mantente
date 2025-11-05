import { createClient } from '@supabase/supabase-js'

// Inicializar cliente de Supabase con las credenciales del .env.local
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Falta configurar VITE_SUPABASE_URL o VITE_SUPABASE_KEY en .env.local')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Servicio de autenticación con Supabase
export const supabaseAuthService = {
  // Login con email y contraseña
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    return {
      user: data.user,
      session: data.session,
    }
  },

  // Registrarse
  async signup(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    
    if (error) throw error
    
    return {
      user: data.user,
      session: data.session,
    }
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Obtener sesión actual
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    
    if (error) throw error
    return session
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    
    if (error) throw error
    return user
  },

  // Escuchar cambios de autenticación
  onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
    
    return subscription
  },

  // Enviar email para resetear contraseña
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  },

  // Actualizar perfil de usuario
  async updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser(updates)
    if (error) throw error
    return data.user
  },
}

// ========== FUNCIONES DE TRANSFORMACIÓN DE DATOS ==========
// Mapeo de campos de Mantente Connect al formato de Mantente
const mapProductToMantente = (product) => {
  console.log(`🔄 Mapeando producto a formato Mantente:`, {
    original: product,
    user_id: product.user_id,
  })
  
  const mapped = {
    nombre: product.name || '',
    cantidad: parseInt(product.quantity) || 0,
    precio: parseFloat(product.price) || 0,
    descripcion: product.description || '',
    categoria: product.category || '',
    stock_minimo: parseInt(product.quantity) || 0,
    owner: product.user_id, // ✅ CRÍTICO: Incluir owner
    fecha_agregado: new Date().toISOString().split('T')[0],
    created_at: product.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  // Validar UUID del producto
  if (product.id && isValidUUID(product.id)) {
    mapped.id = product.id
  } else if (product.id) {
    console.warn(`⚠️ ID de producto inválido: ${product.id}. Generando nuevo UUID.`)
    mapped.id = crypto.randomUUID()
  }
  
  console.log(`✅ Producto mapeado:`, mapped)
  return mapped
}

const mapProductFromMantente = (product) => {
  console.log(`🔄 Mapeando producto desde Mantente:`, product)
  return {
    id: product.id,
    user_id: product.owner,
    code: product.id,
    name: product.nombre,
    quantity: product.cantidad || 0,
    price: product.precio || 0,
    description: product.descripcion || '',
    category: product.categoria || '',
    created_at: product.created_at,
    updated_at: product.updated_at,
  }
}

const mapCustomerToMantente = (customer) => {
  console.log(`🔄 Mapeando cliente a formato Mantente:`, {
    original: customer,
    user_id: customer.user_id,
  })
  
  const mapped = {
    nombre: customer.name || '',
    email: customer.email || '',
    telefono: customer.phone || '',
    direccion: customer.address || '',
    ciudad: customer.city || '',
    departamento: customer.state || '',
    ruc: customer.tax_id || '',
    razon_social: customer.contact_person || '',
    notas: customer.notes || '',
    estado: customer.is_active !== false ? 'activo' : 'inactivo',
    owner: customer.user_id, // ✅ CRÍTICO: Incluir owner SIEMPRE
    fecha_creacion: customer.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  // Validar UUID del cliente
  if (customer.id && isValidUUID(customer.id)) {
    mapped.id = customer.id
  } else if (customer.id) {
    console.warn(`⚠️ ID de cliente inválido: ${customer.id}. Generando nuevo UUID.`)
    mapped.id = crypto.randomUUID()
  }
  
  console.log(`✅ Cliente mapeado:`, mapped)
  return mapped
}

const mapCustomerFromMantente = (customer) => {
  return {
    id: customer.id,
    user_id: customer.owner,
    code: customer.id,
    name: customer.nombre,
    email: customer.email || '',
    phone: customer.telefono || '',
    address: customer.direccion || '',
    city: customer.ciudad || '',
    state: customer.departamento || '',
    tax_id: customer.ruc || '',
    contact_person: customer.razon_social || '',
    notes: customer.notas || '',
    is_active: customer.estado === 'activo',
    created_at: customer.fecha_creacion,
    updated_at: customer.updated_at,
  }
}

// Función para validar si es un UUID válido
const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// ==========================================
// 🛒 MAPEO DE ÓRDENES
// ==========================================
const mapOrderToMantente = (order) => {
  console.log(`🔄 Mapeando orden a formato Mantente/Supabase:`, {
    original: order,
    user_id: order.user_id,
    customer_id: order.customer_id || order.customerId,
  })
  
  // Validar y generar UUID si es necesario
  let orderId = order.id
  if (!orderId || !isValidUUID(orderId)) {
    orderId = crypto.randomUUID()
    console.warn(`⚠️ ID inválido detectado. Generando nuevo UUID: ${orderId}`)
  }
  
  // ✅ CRÍTICO: customer_id NO PUEDE SER NULL - Validar siempre
  let customerId = order.customer_id || order.customerId
  if (!customerId || customerId === '' || customerId === null) {
    console.error(`❌ ERROR: customer_id es requerido pero es nulo. Orden:`, order)
    throw new Error('customer_id es requerido para crear una orden en Supabase')
  }
  
  const mapped = {
    id: orderId, // ✅ UUID válido garantizado
    user_id: order.user_id, // ✅ CRÍTICO: Incluir user_id siempre
    customer_id: customerId, // ✅ VALIDADO: No puede ser null
    code: order.code || '',
    status: order.status || 'pending',
    order_date: order.order_date || order.orderDate || new Date().toISOString(),
    delivery_date: order.delivery_date || order.deliveryDate || null,
    subtotal: parseFloat(order.subtotal) || 0,
    tax: parseFloat(order.tax) || 0,
    discount: parseFloat(order.discount) || 0,
    total: parseFloat(order.total) || 0,
    payment_method: order.payment_method || order.paymentMethod || '',
    payment_status: order.payment_status || order.paymentStatus || 'pending',
    notes: order.notes || '',
    created_at: order.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  console.log(`✅ Orden mapeada:`, mapped)
  return mapped
}

const mapOrderFromMantente = (order) => {
  console.log(`🔄 Mapeando orden desde Supabase:`, order)
  return {
    id: order.id,
    user_id: order.user_id,
    customerId: order.customer_id,
    code: order.code,
    status: order.status,
    orderDate: order.order_date,
    deliveryDate: order.delivery_date,
    subtotal: order.subtotal,
    tax: order.tax,
    discount: order.discount,
    total: order.total,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    notes: order.notes,
    created_at: order.created_at,
    updated_at: order.updated_at,
  }
}

// Servicio para sincronizar datos con Supabase
export const supabaseSyncService = {
  // Sincronizar productos - AHORA USA TABLA 'inventario'
  async syncProducts(products) {
    const mappedProducts = products.map(mapProductToMantente)
    const { data, error } = await supabase
      .from('inventario')
      .upsert(mappedProducts, { onConflict: 'id' })
    
    if (error) throw error
    return data
  },

  // Sincronizar clientes - AHORA USA TABLA 'clientes'
  async syncCustomers(customers) {
    const mappedCustomers = customers.map(mapCustomerToMantente)
    const { data, error } = await supabase
      .from('clientes')
      .upsert(mappedCustomers, { onConflict: 'id' })
    
    if (error) throw error
    return data
  },

  // Sincronizar órdenes
  async syncOrders(orders) {
    const { data, error } = await supabase
      .from('orders')
      .upsert(orders, { onConflict: 'id' })
    
    if (error) throw error
    return data
  },

  // Obtener productos de Supabase - AHORA USA TABLA 'inventario'
  async getProducts(userId) {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .eq('owner', userId)
    
    if (error) throw error
    return data ? data.map(mapProductFromMantente) : []
  },

  // Obtener clientes de Supabase - TABLA 'customers' con UUIDs
  async getCustomers(userId) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    // Ya están en formato customers (UUID), no necesitan mapeo
    return data || []
  },

  // Obtener órdenes de Supabase
  async getOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  },

  // ========== CRUD Individual para Productos - TABLA 'inventario' ==========
  async createProduct(product) {
    console.log(`📊 INICIO: Creando producto en Supabase...`, {
      product,
      user_id: product.user_id,
    })
    
    if (!product.user_id) {
      throw new Error('❌ CRÍTICO: El producto NO tiene user_id. No se puede sincronizar.')
    }
    
    const mapped = mapProductToMantente(product)
    
    console.log(`📤 Insertando en tabla 'inventario':`, mapped)
    
    try {
      const { data, error } = await supabase
        .from('inventario')
        .insert([mapped])
        .select()
      
      if (error) {
        console.error(`❌ ERROR de Supabase al crear producto:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw new Error(`Error Supabase: ${error.message}`)
      }
      
      if (!data || data.length === 0) {
        console.error(`❌ ERROR: Supabase retornó datos vacíos`)
        throw new Error('No data returned from Supabase')
      }
      
      console.log(`✅ ÉXITO: Producto creado en Supabase:`, data[0])
      return data[0] ? mapProductFromMantente(data[0]) : data[0]
    } catch (error) {
      console.error(`❌ EXCEPTION: Error creando producto:`, error)
      throw error
    }
  },

  async updateProduct(id, updates) {
    const mapped = mapProductToMantente(updates)
    console.log(`📊 Actualización de producto mapeada:`, mapped)
    
    const { data, error } = await supabase
      .from('inventario')
      .update(mapped)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data?.[0] ? mapProductFromMantente(data[0]) : data?.[0]
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('inventario')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // ========== CRUD Individual para Clientes - TABLA 'clientes' ==========
  async createCustomer(customer) {
    console.log(`👥 INICIO: Creando cliente en Supabase...`, {
      customer,
      user_id: customer.user_id,
    })
    
    if (!customer.user_id) {
      throw new Error('❌ CRÍTICO: El cliente NO tiene user_id. No se puede sincronizar.')
    }
    
    const mapped = mapCustomerToMantente(customer)
    
    console.log(`📤 Insertando en tabla 'clientes':`, mapped)
    
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([mapped])
        .select()
      
      if (error) {
        console.error(`❌ ERROR de Supabase al crear cliente:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw new Error(`Error Supabase: ${error.message}`)
      }
      
      if (!data || data.length === 0) {
        console.error(`❌ ERROR: Supabase retornó datos vacíos`)
        throw new Error('No data returned from Supabase')
      }
      
      console.log(`✅ ÉXITO: Cliente creado en Supabase:`, data[0])
      return data[0] ? mapCustomerFromMantente(data[0]) : data[0]
    } catch (error) {
      console.error(`❌ EXCEPTION: Error creando cliente:`, error)
      throw error
    }
  },

  async updateCustomer(id, updates) {
    const mapped = mapCustomerToMantente(updates)
    console.log(`👥 Actualización de cliente mapeada:`, mapped)
    
    const { data, error } = await supabase
      .from('clientes')
      .update(mapped)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data?.[0] ? mapCustomerFromMantente(data[0]) : data?.[0]
  },

  async deleteCustomer(id) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // ========== CRUD Individual para Órdenes - TABLA 'orders' ==========
  async createOrder(order) {
    console.log(`🛒 INICIO: Creando orden en Supabase...`, {
      order,
      user_id: order.user_id,
    })
    
    if (!order.user_id) {
      throw new Error('❌ CRÍTICO: La orden NO tiene user_id. No se puede sincronizar.')
    }
    
    const mapped = mapOrderToMantente(order)
    
    console.log(`📤 Insertando en tabla 'orders':`, mapped)
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([mapped])
        .select()
      
      if (error) {
        console.error(`❌ ERROR de Supabase al crear orden:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw new Error(`Error Supabase: ${error.message}`)
      }
      
      if (!data || data.length === 0) {
        console.error(`❌ ERROR: Supabase retornó datos vacíos`)
        throw new Error('No data returned from Supabase')
      }
      
      console.log(`✅ ÉXITO: Orden creada en Supabase:`, data[0])
      return data[0] ? mapOrderFromMantente(data[0]) : data[0]
    } catch (error) {
      console.error(`❌ EXCEPTION: Error creando orden:`, error)
      throw error
    }
  },

  async updateOrder(id, updates) {
    console.log(`🛒 INICIO: Actualizando orden en Supabase...`, {
      id,
      updates,
      user_id: updates.user_id,
    })
    
    if (!updates.user_id) {
      throw new Error('❌ CRÍTICO: Los datos de actualización NO tienen user_id.')
    }
    
    const mapped = mapOrderToMantente(updates)
    
    console.log(`📤 Actualizando en tabla 'orders':`, mapped)
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(mapped)
        .eq('id', id)
        .select()
      
      if (error) {
        console.error(`❌ ERROR de Supabase al actualizar orden:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw new Error(`Error Supabase: ${error.message}`)
      }
      
      if (!data || data.length === 0) {
        console.error(`❌ ERROR: No se actualizó la orden (ID no existe?)`)
        throw new Error('No data returned from update')
      }
      
      console.log(`✅ ÉXITO: Orden actualizada en Supabase:`, data[0])
      return data[0] ? mapOrderFromMantente(data[0]) : data[0]
    } catch (error) {
      console.error(`❌ EXCEPTION: Error actualizando orden:`, error)
      throw error
    }
  },

  async deleteOrder(id) {
    console.log(`🛒 INICIO: Eliminando orden en Supabase...`, { id })
    
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error(`❌ ERROR de Supabase al eliminar orden:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw new Error(`Error Supabase: ${error.message}`)
      }
      
      console.log(`✅ ÉXITO: Orden eliminada en Supabase`)
    } catch (error) {
      console.error(`❌ EXCEPTION: Error eliminando orden:`, error)
      throw error
    }
  },
}

export default supabase