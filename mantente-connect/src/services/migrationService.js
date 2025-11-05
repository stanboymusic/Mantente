import { supabase } from './supabaseService'

/**
 * 🔄 SERVICIO DE MIGRACIÓN COMPLETO Y SEGURO
 * Traslada datos de Mantente (antiguo) a Mantente Connect (nuevo)
 * 
 * Tablas antiguas → Nuevas tablas
 * inventario → products
 * clientes → customers
 * ventas → orders + order_items
 * devoluciones → returns (nueva tabla)
 * facturas → invoices
 * 
 * ✅ Sistema seguro de mapeo de IDs
 * ✅ Manejo de datos secundarios
 * ✅ Sin perjudicar la app principal
 */

// 🗂️ MAPEO GLOBAL DE IDs (temporal en memoria y localStorage)
let idMapping = {
  products: {}, // { oldId: newUuid }
  customers: {}, // { oldId: newUuid }
  orders: {}, // { oldId: newUuid }
}

// Cargar mapeo del localStorage
function loadIdMapping() {
  try {
    const stored = localStorage.getItem('migrationIdMapping')
    if (stored) {
      idMapping = JSON.parse(stored)
      console.log('✅ Mapeo de IDs cargado del almacenamiento')
    }
  } catch (e) {
    console.warn('⚠️ No se pudo cargar el mapeo de IDs:', e)
  }
}

// Guardar mapeo en localStorage
function saveIdMapping() {
  try {
    localStorage.setItem('migrationIdMapping', JSON.stringify(idMapping))
    console.log('✅ Mapeo de IDs guardado')
  } catch (e) {
    console.warn('⚠️ No se pudo guardar el mapeo de IDs:', e)
  }
}

// ═════════════════════════════════════════════════════════════
// 🧠 SISTEMA INTELIGENTE "UPSERT" - Prevenir Duplicados
// ═════════════════════════════════════════════════════════════

/**
 * 🔍 Buscar si un producto ya existe por su code
 */
async function findExistingProduct(code, userId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('code', code)
      .eq('user_id', userId)
      .single()
    
    if (!error && data) return data.id
    return null
  } catch (e) {
    return null
  }
}

/**
 * 🔍 Buscar si un cliente ya existe por su code
 */
async function findExistingCustomer(code, userId) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .eq('code', code)
      .eq('user_id', userId)
      .single()
    
    if (!error && data) return data.id
    return null
  } catch (e) {
    return null
  }
}

/**
 * 🔍 Buscar si una orden ya existe por su code
 */
async function findExistingOrder(code, userId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('code', code)
      .eq('user_id', userId)
      .single()
    
    if (!error && data) return data.id
    return null
  } catch (e) {
    return null
  }
}

/**
 * 🔍 Buscar si una factura ya existe por su invoice_number
 */
async function findExistingInvoice(invoiceNumber, userId) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('id')
      .eq('invoice_number', invoiceNumber)
      .eq('user_id', userId)
      .single()
    
    if (!error && data) return data.id
    return null
  } catch (e) {
    return null
  }
}

export const migrationService = {
  /**
   * Migrar UN producto de inventario a products (con detección de duplicados)
   */
  async migrateProduct(inventarioItem, userId) {
    try {
      const productCode = `INV-${inventarioItem.id}`
      
      // 🔍 PASO 1: Verificar si ya existe
      const existingId = await findExistingProduct(productCode, userId)
      if (existingId) {
        console.log(`  ⏭️ Producto ya existe (saltando): ${productCode}`)
        idMapping.products[inventarioItem.id] = existingId
        saveIdMapping()
        return { success: true, data: [{ id: existingId }], skipped: true }
      }
      
      // 📝 PASO 2: Crear el nuevo producto
      const productData = {
        user_id: userId,
        code: productCode,
        name: inventarioItem.nombre || '',
        description: inventarioItem.descripcion || '',
        price: parseFloat(inventarioItem.precio) || 0,
        cost: null,
        quantity: parseInt(inventarioItem.cantidad) || 0,
        category: inventarioItem.categoria || '',
        image_url: null,
        sku: null,
        barcode: null,
        is_active: true,
        created_at: inventarioItem.created_at || new Date().toISOString(),
        updated_at: inventarioItem.updated_at || new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()

      if (error) {
        // 🔍 Si falla por duplicate, buscar el existente
        if (error.code === '23505') {
          const existingId = await findExistingProduct(productCode, userId)
          if (existingId) {
            idMapping.products[inventarioItem.id] = existingId
            saveIdMapping()
            return { success: true, data: [{ id: existingId }], recovered: true }
          }
        }
        throw error
      }
      
      // 🗺️ Guardar mapeo
      if (data && data[0]) {
        idMapping.products[inventarioItem.id] = data[0].id
        saveIdMapping()
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('❌ Error migrando producto:', error)
      return { success: false, error }
    }
  },

  /**
   * Migrar UN cliente de clientes a customers (con detección de duplicados)
   */
  async migrateCustomer(clienteItem, userId) {
    try {
      const customerCode = `CLI-${clienteItem.id}`
      
      // 🔍 PASO 1: Verificar si ya existe
      const existingId = await findExistingCustomer(customerCode, userId)
      if (existingId) {
        console.log(`  ⏭️ Cliente ya existe (saltando): ${customerCode}`)
        idMapping.customers[clienteItem.id] = existingId
        saveIdMapping()
        return { success: true, data: [{ id: existingId }], skipped: true }
      }
      
      // 📝 PASO 2: Crear el nuevo cliente
      const customerData = {
        user_id: userId,
        code: customerCode,
        name: clienteItem.nombre || '',
        email: clienteItem.email || null,
        phone: clienteItem.telefono || null,
        address: clienteItem.direccion || null,
        city: (clienteItem.ciudad && typeof clienteItem.ciudad === 'object') ? null : clienteItem.ciudad,
        state: clienteItem.departamento || null,
        zip_code: null,
        country: null,
        tax_id: clienteItem.ruc || null,
        contact_person: null,
        payment_terms: null,
        credit_limit: 0,
        is_active: clienteItem.estado === 'inactive' ? false : true,
        notes: clienteItem.notas || null,
        created_at: clienteItem.fecha_creacion || clienteItem.created_at || new Date().toISOString(),
        updated_at: clienteItem.updated_at || new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()

      if (error) {
        // 🔍 Si falla por duplicate, buscar el existente
        if (error.code === '23505') {
          const existingId = await findExistingCustomer(customerCode, userId)
          if (existingId) {
            idMapping.customers[clienteItem.id] = existingId
            saveIdMapping()
            return { success: true, data: [{ id: existingId }], recovered: true }
          }
        }
        throw error
      }
      
      // 🗺️ Guardar mapeo
      if (data && data[0]) {
        idMapping.customers[clienteItem.id] = data[0].id
        saveIdMapping()
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('❌ Error migrando cliente:', error)
      return { success: false, error }
    }
  },

  /**
   * Migrar UNA venta de ventas a orders (con detección de duplicados)
   */
  async migrateOrder(ventaItem, userId) {
    try {
      const orderCode = ventaItem.codigo_venta || `VTA-${ventaItem.id}`
      
      // 🔍 PASO 1: Verificar si la orden ya existe
      const existingOrderId = await findExistingOrder(orderCode, userId)
      if (existingOrderId) {
        console.log(`  ⏭️ Orden ya existe (saltando): ${orderCode}`)
        idMapping.orders[ventaItem.id] = existingOrderId
        saveIdMapping()
        return { success: true, data: [{ id: existingOrderId }], skipped: true }
      }
      
      // 🔍 PASO 2: Buscar el UUID del cliente usando el mapeo
      let customerNewId = idMapping.customers[ventaItem.cliente_id]
      
      // ❌ Si no existe el cliente en el mapeo, crear cliente "Sin asignar"
      if (!customerNewId && ventaItem.cliente_id) {
        console.log(`⚠️ Cliente ID ${ventaItem.cliente_id} no encontrado, creando cliente "Sin asignar"...`)
        
        const unassignedCustomer = {
          user_id: userId,
          code: `CLI-UNKNOWN-${ventaItem.cliente_id}`,
          name: `Sin asignar (${ventaItem.cliente_id})`,
          email: null,
          phone: null,
          address: null,
          city: null,
          state: null,
          zip_code: null,
          country: null,
          tax_id: null,
          contact_person: null,
          payment_terms: null,
          credit_limit: 0,
          is_active: true,
          notes: 'Cliente creado automáticamente durante migración',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        // 🔍 Primero verificar si ya existe
        const existingCustomerId = await findExistingCustomer(unassignedCustomer.code, userId)
        if (existingCustomerId) {
          customerNewId = existingCustomerId
        } else {
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert(unassignedCustomer)
            .select()
          
          if (!customerError && newCustomer?.[0]) {
            customerNewId = newCustomer[0].id
            idMapping.customers[ventaItem.cliente_id] = customerNewId
            saveIdMapping()
          }
        }
      }
      
      // 📝 PASO 3: Crear la nueva orden
      const orderData = {
        user_id: userId,
        code: orderCode,
        customer_id: customerNewId || null,
        status: 'completed',
        order_date: ventaItem.fecha ? new Date(ventaItem.fecha).toISOString() : new Date().toISOString(),
        delivery_date: null,
        subtotal: parseFloat(ventaItem.monto) || 0,
        tax: 0,
        discount: parseFloat(ventaItem.descuento) || 0,
        total: parseFloat(ventaItem.total) || 0,
        payment_method: ventaItem.metodo_pago || null,
        payment_status: 'completed',
        notes: (ventaItem.notas && typeof ventaItem.notas === 'object') ? null : ventaItem.notas,
        created_at: ventaItem.created_at || new Date().toISOString(),
        updated_at: ventaItem.updated_at || new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()

      if (error) {
        // 🔍 Si falla por duplicate, buscar el existente
        if (error.code === '23505') {
          const existingId = await findExistingOrder(orderCode, userId)
          if (existingId) {
            idMapping.orders[ventaItem.id] = existingId
            saveIdMapping()
            return { success: true, data: [{ id: existingId }], recovered: true }
          }
        }
        throw error
      }
      
      // 🗺️ Guardar mapeo: oldVentaId → newOrderUuid
      if (data && data[0]) {
        idMapping.orders[ventaItem.id] = data[0].id
        
        // ➕ Crear items de la orden desde productos_json
        if (ventaItem.productos_json && Array.isArray(ventaItem.productos_json)) {
          for (const item of ventaItem.productos_json) {
            const productNewId = idMapping.products[item.id] || null
            
            await supabase
              .from('order_items')
              .insert({
                order_id: data[0].id,
                product_id: productNewId,
                quantity: item.cantidad || 1,
                unit_price: item.precio || 0,
                discount_percentage: 0,
                line_total: (item.cantidad || 1) * (item.precio || 0),
                created_at: new Date().toISOString(),
              })
          }
        }
        
        saveIdMapping()
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('❌ Error migrando venta:', error)
      return { success: false, error }
    }
  },

  /**
   * 🔄 Migrar devoluciones a tabla returns
   */
  async migrateReturns(devolucionItem, userId) {
    try {
      const returnData = {
        user_id: userId,
        order_id: idMapping.orders[devolucionItem.venta_id] || null,
        product_id: idMapping.products[devolucionItem.producto?.id] || null,
        reason: devolucionItem.razon || devolucionItem.tipo_resolucion || '',
        quantity_returned: devolucionItem.cantidad_devuelta || devolucionItem.cantidad || 0,
        refund_amount: parseFloat(devolucionItem.monto) || 0,
        status: devolucionItem.estado || 'pending',
        replacement_product_id: devolucionItem.producto_nuevo ? idMapping.products[devolucionItem.producto_nuevo.id] : null,
        notes: devolucionItem.notas_adicionales || '',
        created_at: devolucionItem.fecha ? new Date(devolucionItem.fecha).toISOString() : new Date().toISOString(),
        updated_at: devolucionItem.updated_at || new Date().toISOString(),
      }

      // Primero verificar si la tabla exists
      const { data, error } = await supabase
        .from('returns')
        .insert(returnData)
        .select()

      if (error) {
        // Si la tabla no existe, solo registrar advertencia
        if (error.code === 'PGRST116') {
          console.warn('⚠️ Tabla "returns" no existe aún, devolución no migrada')
          return { success: false, error: 'Table not found' }
        }
        throw error
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('❌ Error migrando devolución:', error)
      return { success: false, error }
    }
  },

  /**
   * 📄 Migrar facturas a tabla invoices (con detección de duplicados)
   */
  async migrateInvoices(facturaItem, userId) {
    try {
      const invoiceNumber = facturaItem.numero_factura || `FAC-${facturaItem.id}`
      
      // 🔍 PASO 1: Verificar si la factura ya existe
      const existingInvoiceId = await findExistingInvoice(invoiceNumber, userId)
      if (existingInvoiceId) {
        console.log(`  ⏭️ Factura ya existe (saltando): ${invoiceNumber}`)
        return { success: true, data: [{ id: existingInvoiceId }], skipped: true }
      }
      
      // 🔍 PASO 2: Buscar cliente o crear si no existe
      let customerId = idMapping.customers[facturaItem.cliente_id]
      
      if (!customerId && facturaItem.cliente_id) {
        console.log(`⚠️ Cliente ID ${facturaItem.cliente_id} no encontrado en factura, creando cliente "Sin asignar"...`)
        
        const unassignedCustomer = {
          user_id: userId,
          code: `CLI-UNKNOWN-${facturaItem.cliente_id}`,
          name: `Sin asignar (${facturaItem.cliente_id})`,
          email: null,
          phone: null,
          address: null,
          city: null,
          state: null,
          zip_code: null,
          country: null,
          tax_id: null,
          contact_person: null,
          payment_terms: null,
          credit_limit: 0,
          is_active: true,
          notes: 'Cliente creado automáticamente durante migración',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        // 🔍 Primero verificar si ya existe
        const existingCustomerId = await findExistingCustomer(unassignedCustomer.code, userId)
        if (existingCustomerId) {
          customerId = existingCustomerId
        } else {
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert(unassignedCustomer)
            .select()
          
          if (!customerError && newCustomer?.[0]) {
            customerId = newCustomer[0].id
            idMapping.customers[facturaItem.cliente_id] = customerId
            saveIdMapping()
          }
        }
      }
      
      // 📝 PASO 3: Crear la nueva factura
      const invoiceData = {
        user_id: userId,
        order_id: idMapping.orders[facturaItem.venta_id] || null,
        customer_id: customerId || null,
        invoice_number: invoiceNumber,
        invoice_date: facturaItem.fecha ? new Date(facturaItem.fecha).toISOString() : new Date().toISOString(),
        due_date: null,
        status: facturaItem.estado || 'completed',
        subtotal: parseFloat(facturaItem.subtotal) || 0,
        tax: parseFloat(facturaItem.impuesto) || 0,
        discount: parseFloat(facturaItem.descuento) || 0,
        total: parseFloat(facturaItem.total) || 0,
        paid_amount: facturaItem.estado === 'paid' ? (parseFloat(facturaItem.total) || 0) : 0,
        payment_method: facturaItem.metodo_pago || null,
        notes: facturaItem.notas || null,
        created_at: facturaItem.created_at || new Date().toISOString(),
        updated_at: facturaItem.updated_at || new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()

      if (error) {
        // 🔍 Si falla por duplicate, buscar el existente
        if (error.code === '23505') {
          const existingId = await findExistingInvoice(invoiceNumber, userId)
          if (existingId) {
            return { success: true, data: [{ id: existingId }], recovered: true }
          }
        }
        throw error
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('❌ Error migrando factura:', error)
      return { success: false, error }
    }
  },

  /**
   * 🔄 Migración de datos secundarios (Devoluciones, Facturas, etc.)
   */
  async migrateSecondaryData(userId, legacyOwner) {
    console.log('\n📦 Migrando datos secundarios...\n')
    
    const secondaryResults = {
      returns: { total: 0, migrated: 0, failed: 0 },
      invoices: { total: 0, migrated: 0, failed: 0 },
    }

    try {
      // 🔄 MIGRAR DEVOLUCIONES
      console.log('  🔄 Devoluciones...')
      const { data: devoData, error: devoError } = await supabase
        .from('devoluciones')
        .select('*')
        .eq('owner', legacyOwner)

      if (!devoError && devoData && devoData.length > 0) {
        secondaryResults.returns.total = devoData.length
        for (const item of devoData) {
          const result = await this.migrateReturns(item, userId)
          if (result.success) {
            secondaryResults.returns.migrated++
            console.log(`    ✅ Devolución migrada`)
          } else {
            secondaryResults.returns.failed++
          }
        }
        console.log(`  ✅ Devoluciones: ${secondaryResults.returns.migrated}/${secondaryResults.returns.total}\n`)
      }

      // 📄 MIGRAR FACTURAS
      console.log('  📄 Facturas...')
      const { data: factData, error: factError } = await supabase
        .from('facturas')
        .select('*')
        .eq('owner', legacyOwner)

      if (!factError && factData && factData.length > 0) {
        secondaryResults.invoices.total = factData.length
        for (const item of factData) {
          const result = await this.migrateInvoices(item, userId)
          if (result.success) {
            secondaryResults.invoices.migrated++
            console.log(`    ✅ Factura migrada: ${item.numero_factura}`)
          } else {
            secondaryResults.invoices.failed++
          }
        }
        console.log(`  ✅ Facturas: ${secondaryResults.invoices.migrated}/${secondaryResults.invoices.total}\n`)
      }

      return secondaryResults
    } catch (error) {
      console.error('❌ Error en datos secundarios:', error)
      return secondaryResults
    }
  },

  /**
   * 🚀 MIGRACIÓN COMPLETA Y AUTOMÁTICA
   * Lee todos los datos de Mantente y los guarda en Mantente Connect
   * ✅ SEGURA: No modifica la app principal
   * ✅ INTELIGENTE: Mapea IDs automáticamente
   */
  async migrateAllData(userId) {
    console.log('\n')
    console.log('════════════════════════════════════════════════════════')
    console.log('🚀 INICIANDO MIGRACIÓN COMPLETA Y SEGURA')
    console.log('════════════════════════════════════════════════════════\n')
    
    if (!userId) {
      console.error('❌ No hay userId para migración')
      return { success: false, message: 'Usuario no autenticado' }
    }

    // 🗂️ Cargar mapeo existente
    loadIdMapping()

    // Obtener el mapeo del usuario antiguo
    const mappingJson = localStorage.getItem('userMapping')
    let legacyOwner = userId // por defecto usa el userId actual

    if (mappingJson) {
      try {
        const mapping = JSON.parse(mappingJson)
        legacyOwner = mapping.legacyOwner
        console.log('📍 Usando mapeo de usuario guardado:')
        console.log(`   ├─ Usuario Actual (Supabase): ${userId}`)
        console.log(`   └─ Usuario Antiguo (Firebase): ${legacyOwner}\n`)
      } catch (e) {
        console.warn('⚠️ No se pudo leer el mapeo, usando userId actual')
      }
    } else {
      console.log('ℹ️ Sin mapeo guardado, usando userId actual como owner\n')
    }

    const results = {
      products: { total: 0, migrated: 0, failed: 0 },
      customers: { total: 0, migrated: 0, failed: 0 },
      orders: { total: 0, migrated: 0, failed: 0 },
      secondary: {},
    }

    try {
      // ==========================================
      // 1️⃣ MIGRAR PRODUCTOS (PRIMERO)
      // ==========================================
      console.log('📦 PASO 1: Migrando productos...')
      console.log('─────────────────────────────────────────')
      const { data: inventarioData, error: invError } = await supabase
        .from('inventario')
        .select('*')
        .eq('owner', legacyOwner)

      if (invError) {
        console.warn('⚠️ No se encontraron productos:', invError.message)
      }

      if (inventarioData && inventarioData.length > 0) {
        results.products.total = inventarioData.length
        console.log(`📊 Encontrados: ${inventarioData.length} productos\n`)

        for (const item of inventarioData) {
          const result = await this.migrateProduct(item, userId)
          if (result.success) {
            results.products.migrated++
            console.log(`  ✅ ${item.nombre} (${item.cantidad} unidades)`)
          } else {
            results.products.failed++
            console.log(`  ❌ ${item.nombre} (Error: ${result.error?.message})`)
          }
        }
      } else {
        console.log('ℹ️ Sin productos para migrar\n')
      }
      console.log(`\n✅ PRODUCTOS COMPLETADO: ${results.products.migrated}/${results.products.total} exitosos\n`)

      // ==========================================
      // 2️⃣ MIGRAR CLIENTES (SEGUNDO)
      // ==========================================
      console.log('👥 PASO 2: Migrando clientes...')
      console.log('─────────────────────────────────────────')
      const { data: clientesData, error: cliError } = await supabase
        .from('clientes')
        .select('*')
        .eq('owner', legacyOwner)

      if (cliError) {
        console.warn('⚠️ No se encontraron clientes:', cliError.message)
      }

      if (clientesData && clientesData.length > 0) {
        results.customers.total = clientesData.length
        console.log(`📊 Encontrados: ${clientesData.length} clientes\n`)

        for (const item of clientesData) {
          const result = await this.migrateCustomer(item, userId)
          if (result.success) {
            results.customers.migrated++
            console.log(`  ✅ ${item.nombre} (${item.email || 'sin email'})`)
          } else {
            results.customers.failed++
            console.log(`  ❌ ${item.nombre} (Error: ${result.error?.message})`)
          }
        }
      } else {
        console.log('ℹ️ Sin clientes para migrar\n')
      }
      console.log(`\n✅ CLIENTES COMPLETADO: ${results.customers.migrated}/${results.customers.total} exitosos\n`)

      // ==========================================
      // 3️⃣ MIGRAR ÓRDENES/VENTAS (TERCERO)
      // ==========================================
      console.log('🛒 PASO 3: Migrando órdenes y items...')
      console.log('─────────────────────────────────────────')
      const { data: ventasData, error: ventError } = await supabase
        .from('ventas')
        .select('*')
        .eq('owner', legacyOwner)

      if (ventError) {
        console.warn('⚠️ No se encontraron órdenes:', ventError.message)
      }

      if (ventasData && ventasData.length > 0) {
        results.orders.total = ventasData.length
        console.log(`📊 Encontradas: ${ventasData.length} órdenes\n`)

        for (const item of ventasData) {
          const result = await this.migrateOrder(item, userId)
          if (result.success) {
            results.orders.migrated++
            console.log(`  ✅ Orden #${item.codigo_venta} - Total: $${item.total}`)
          } else {
            results.orders.failed++
            console.log(`  ❌ Orden #${item.codigo_venta} (Error: ${result.error?.message})`)
          }
        }
      } else {
        console.log('ℹ️ Sin órdenes para migrar\n')
      }
      console.log(`\n✅ ÓRDENES COMPLETADO: ${results.orders.migrated}/${results.orders.total} exitosos\n`)

      // ==========================================
      // 4️⃣ DATOS SECUNDARIOS (OPCIONAL)
      // ==========================================
      results.secondary = await this.migrateSecondaryData(userId, legacyOwner)

      // ==========================================
      // 📊 RESUMEN FINAL
      // ==========================================
      console.log('════════════════════════════════════════════════════════')
      console.log('✅ MIGRACIÓN COMPLETADA CON ÉXITO')
      console.log('════════════════════════════════════════════════════════')
      console.log(`📦 Productos:   ${results.products.migrated}/${results.products.total} migrados`)
      console.log(`👥 Clientes:    ${results.customers.migrated}/${results.customers.total} migrados`)
      console.log(`🛒 Órdenes:     ${results.orders.migrated}/${results.orders.total} migradas`)
      if (results.secondary.returns.total > 0) {
        console.log(`🔄 Devoluciones: ${results.secondary.returns.migrated}/${results.secondary.returns.total} migradas`)
      }
      if (results.secondary.invoices.total > 0) {
        console.log(`📄 Facturas:    ${results.secondary.invoices.migrated}/${results.secondary.invoices.total} migradas`)
      }
      console.log('════════════════════════════════════════════════════════\n')

      console.log('🎉 ¡Migración realizada! Los datos están en Supabase.\n')
      console.log('📋 Mapeo de IDs guardado en localStorage para futuros usos.\n')

      return { success: true, results }
    } catch (error) {
      console.error('❌ Error crítico en migración:', error)
      console.error('📍 Stack:', error.stack)
      return { success: false, message: error.message, results }
    }
  },

  /**
   * 🔍 Obtener mapeo actual de IDs
   */
  getIdMapping() {
    loadIdMapping()
    return idMapping
  },

  /**
   * 🗑️ Limpiar mapeo de IDs
   */
  clearIdMapping() {
    idMapping = {
      products: {},
      customers: {},
      orders: {},
    }
    try {
      localStorage.removeItem('migrationIdMapping')
      console.log('✅ Mapeo de IDs limpiado')
    } catch (e) {
      console.warn('⚠️ Error limpiando mapeo:', e)
    }
  },
}

export default migrationService