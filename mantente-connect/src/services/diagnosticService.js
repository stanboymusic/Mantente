import { pb } from './pocketbaseService'

/**
 * 🔍 SERVICIO DE DIAGNÓSTICO
 * Lee datos de las tablas antiguas SIN FILTROS
 * para identificar qué datos existen y cómo están estructurados
 */

export const diagnosticService = {
  /**
   * 🔬 Analizar estructura de campos - Antiguas vs Nuevas
   */
  async analyzeFieldStructure() {
    console.log('\n🔬 ANALIZANDO ESTRUCTURA DE CAMPOS\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const analysis = {
      inventario_vs_products: {},
      clientes_vs_customers: {},
      ventas_vs_orders: {}
    }

    try {
      // 1️⃣ INVENTARIO vs PRODUCTS
      console.log('\n📦 INVENTARIO → PRODUCTS')
      const invData = await pb.collection('inventario').getList(1, 1)

      const prodData = await pb.collection('products').getList(1, 1)

      if (invData && invData.items && invData.items.length > 0) {
        console.log('\n  TABLA ANTIGUA (inventario):')
        const invKeys = Object.keys(invData.items[0])
        console.log(`  Campos: ${invKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        invKeys.forEach(key => {
          const val = invData.items[0][key]
          const type = typeof val
          const display = type === 'object' ? JSON.stringify(val).substring(0, 50) : String(val).substring(0, 50)
          console.log(`    • ${key} (${type}): ${display}`)
        })
      }

      if (prodData && prodData.items && prodData.items.length > 0) {
        console.log('\n  TABLA NUEVA (products):')
        const prodKeys = Object.keys(prodData.items[0])
        console.log(`  Campos: ${prodKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        prodKeys.forEach(key => {
          const val = prodData.items[0][key]
          const type = typeof val
          const display = type === 'object' ? JSON.stringify(val).substring(0, 50) : String(val).substring(0, 50)
          console.log(`    • ${key} (${type}): ${display}`)
        })
      }

      // 2️⃣ CLIENTES vs CUSTOMERS
      console.log('\n\n👥 CLIENTES → CUSTOMERS')
      const cliData = await pb.collection('clientes').getList(1, 1)

      const custData = await pb.collection('customers').getList(1, 1)

      if (cliData && cliData.items && cliData.items.length > 0) {
        console.log('\n  TABLA ANTIGUA (clientes):')
        const cliKeys = Object.keys(cliData.items[0])
        console.log(`  Campos: ${cliKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        cliKeys.forEach(key => {
          const val = cliData.items[0][key]
          const type = typeof val
          const display = type === 'object' ? JSON.stringify(val).substring(0, 50) : String(val).substring(0, 50)
          console.log(`    • ${key} (${type}): ${display}`)
        })
      }

      if (custData && custData.items && custData.items.length > 0) {
        console.log('\n  TABLA NUEVA (customers):')
        const custKeys = Object.keys(custData.items[0])
        console.log(`  Campos: ${custKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        custKeys.forEach(key => {
          const val = custData.items[0][key]
          const type = typeof val
          const display = type === 'object' ? JSON.stringify(val).substring(0, 50) : String(val).substring(0, 50)
          console.log(`    • ${key} (${type}): ${display}`)
        })
      }

      // 3️⃣ VENTAS vs ORDERS
      console.log('\n\n🛒 VENTAS → ORDERS')
      const ventData = await pb.collection('ventas').getList(1, 1)

      const ordData = await pb.collection('orders').getList(1, 1)

      if (ventData && ventData.items && ventData.items.length > 0) {
        console.log('\n  TABLA ANTIGUA (ventas):')
        const ventKeys = Object.keys(ventData.items[0])
        console.log(`  Campos: ${ventKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        ventKeys.forEach(key => {
          const val = ventData.items[0][key]
          const type = typeof val
          const display = type === 'object' ? JSON.stringify(val).substring(0, 50) : String(val).substring(0, 50)
          console.log(`    • ${key} (${type}): ${display}`)
        })
      }

      if (ordData && ordData.items && ordData.items.length > 0) {
        console.log('\n  TABLA NUEVA (orders):')
        const ordKeys = Object.keys(ordData.items[0])
        console.log(`  Campos: ${ordKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        ordKeys.forEach(key => {
          const val = ordData.items[0][key]
          const type = typeof val
          const display = type === 'object' ? JSON.stringify(val).substring(0, 50) : String(val).substring(0, 50)
          console.log(`    • ${key} (${type}): ${display}`)
        })
      }

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      return { success: true }
    } catch (error) {
      console.error('❌ Error analizando estructura:', error)
      return { success: false, error }
    }
  },

  /**
   * Escanear todas las tablas antiguas
   */
  async scanLegacyTables(userEmail) {
    console.log('🔍 INICIANDO ESCANEO DE TABLAS ANTIGUAS...\n')
    console.log(`📧 Usuario: ${userEmail}\n`)

    const results = {
      inventario: { count: 0, samples: [], error: null },
      clientes: { count: 0, samples: [], error: null },
      ventas: { count: 0, samples: [], error: null },
    }

    try {
      // ==========================================
      // 1️⃣ ESCANEAR INVENTARIO
      // ==========================================
      console.log('📦 Escaneando INVENTARIO...')
      try {
        const invData = await pb.collection('inventario').getList(1, 5)
        results.inventario.count = invData.totalItems || 0
        results.inventario.samples = invData.items || []
        console.log(`  ✅ Total registros: ${invData.totalItems}`)
        if (invData.items && invData.items.length > 0) {
          console.log(`  📋 Campos del primer registro:`)
          Object.keys(invData.items[0]).forEach(key => {
            const value = invData.items[0][key]
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : value
            console.log(`     - ${key}: ${displayValue}`)
          })
        }
      } catch (invError) {
        console.error(`  ❌ Error: ${invError.message}`)
        results.inventario.error = invError.message
      }
      console.log()

      // ==========================================
      // 2️⃣ ESCANEAR CLIENTES
      // ==========================================
      console.log('👥 Escaneando CLIENTES...')
      try {
        const cliData = await pb.collection('clientes').getList(1, 5)
        results.clientes.count = cliData.totalItems || 0
        results.clientes.samples = cliData.items || []
        console.log(`  ✅ Total registros: ${cliData.totalItems}`)
        if (cliData.items && cliData.items.length > 0) {
          console.log(`  📋 Campos del primer registro:`)
          Object.keys(cliData.items[0]).forEach(key => {
            const value = cliData.items[0][key]
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : value
            console.log(`     - ${key}: ${displayValue}`)
          })
        }
      } catch (cliError) {
        console.error(`  ❌ Error: ${cliError.message}`)
        results.clientes.error = cliError.message
      }
      console.log()

      // ==========================================
      // 3️⃣ ESCANEAR VENTAS
      // ==========================================
      console.log('🛒 Escaneando VENTAS...')
      try {
        const ventData = await pb.collection('ventas').getList(1, 5)
        results.ventas.count = ventData.totalItems || 0
        results.ventas.samples = ventData.items || []
        console.log(`  ✅ Total registros: ${ventData.totalItems}`)
        if (ventData.items && ventData.items.length > 0) {
          console.log(`  📋 Campos del primer registro:`)
          Object.keys(ventData.items[0]).forEach(key => {
            const value = ventData.items[0][key]
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : value
            console.log(`     - ${key}: ${displayValue}`)
          })
        }
      } catch (ventError) {
        console.error(`  ❌ Error: ${ventError.message}`)
        results.ventas.error = ventError.message
      }
      console.log()

      // ==========================================
      // 📊 RESUMEN
      // ==========================================
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('✅ ESCANEO COMPLETADO')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`📦 INVENTARIO: ${results.inventario.count} registros`)
      console.log(`👥 CLIENTES: ${results.clientes.count} registros`)
      console.log(`🛒 VENTAS: ${results.ventas.count} registros`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

      // ==========================================
      // 🎯 ANÁLISIS: ¿Cómo filtrar?
      // ==========================================
      console.log('🎯 ANÁLISIS DEL FILTRADO:')
      if (results.inventario.samples && results.inventario.samples.length > 0) {
        const record = results.inventario.samples[0]
        if (record.owner) {
          console.log(`  ✅ Campo OWNER encontrado: "${record.owner}"`)
          console.log(`     Para filtrar por usuario: filter: 'owner="${record.owner}"'`)
        } else if (record.user_id) {
          console.log(`  ✅ Campo USER_ID encontrado: "${record.user_id}"`)
          console.log(`     Para filtrar por usuario: filter: 'user_id="${record.user_id}"'`)
        } else if (record.email) {
          console.log(`  ✅ Campo EMAIL encontrado: "${record.email}"`)
          console.log(`     Para filtrar por usuario: filter: 'email="${userEmail}"'`)
        } else {
          console.log(`  ⚠️ No se encontró campo de identificación de usuario`)
          console.log(`     Campos disponibles: ${Object.keys(record).join(', ')}`)
        }
      }
      console.log()

      return { success: true, results }
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error)
      return { success: false, message: error.message, results }
    }
  },
}

export default diagnosticService