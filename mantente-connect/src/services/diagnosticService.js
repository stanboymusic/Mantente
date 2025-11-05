import { supabase } from './supabaseService'

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
      const { data: invData } = await supabase
        .from('inventario')
        .select('*')
        .limit(1)
      
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .limit(1)

      if (invData && invData.length > 0) {
        console.log('\n  TABLA ANTIGUA (inventario):')
        const invKeys = Object.keys(invData[0])
        console.log(`  Campos: ${invKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        invKeys.forEach(key => {
          const val = invData[0][key]
          const type = typeof val
          const display = type === 'object' ? JSON.stringify(val).substring(0, 50) : String(val).substring(0, 50)
          console.log(`    • ${key} (${type}): ${display}`)
        })
      }

      if (prodData && prodData.length > 0) {
        console.log('\n  TABLA NUEVA (products):')
        const prodKeys = Object.keys(prodData[0])
        console.log(`  Campos: ${prodKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        prodKeys.forEach(key => {
          const val = prodData[0][key]
          const type = typeof val
          const display = type === 'object' ? JSON.stringify(val).substring(0, 50) : String(val).substring(0, 50)
          console.log(`    • ${key} (${type}): ${display}`)
        })
      }

      // 2️⃣ CLIENTES vs CUSTOMERS
      console.log('\n\n👥 CLIENTES → CUSTOMERS')
      const { data: cliData } = await supabase
        .from('clientes')
        .select('*')
        .limit(1)
      
      const { data: custData } = await supabase
        .from('customers')
        .select('*')
        .limit(1)

      if (cliData && cliData.length > 0) {
        console.log('\n  TABLA ANTIGUA (clientes):')
        const cliKeys = Object.keys(cliData[0])
        console.log(`  Campos: ${cliKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        cliKeys.forEach(key => {
          const val = cliData[0][key]
          const type = typeof val
          const display = type === 'object' ? JSON.stringify(val).substring(0, 50) : String(val).substring(0, 50)
          console.log(`    • ${key} (${type}): ${display}`)
        })
      }

      if (custData && custData.length > 0) {
        console.log('\n  TABLA NUEVA (customers):')
        const custKeys = Object.keys(custData[0])
        console.log(`  Campos: ${custKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        custKeys.forEach(key => {
          const val = custData[0][key]
          const type = typeof val
          const display = type === 'object' ? JSON.stringify(val).substring(0, 50) : String(val).substring(0, 50)
          console.log(`    • ${key} (${type}): ${display}`)
        })
      }

      // 3️⃣ VENTAS vs ORDERS
      console.log('\n\n🛒 VENTAS → ORDERS')
      const { data: ventData } = await supabase
        .from('ventas')
        .select('*')
        .limit(1)
      
      const { data: ordData } = await supabase
        .from('orders')
        .select('*')
        .limit(1)

      if (ventData && ventData.length > 0) {
        console.log('\n  TABLA ANTIGUA (ventas):')
        const ventKeys = Object.keys(ventData[0])
        console.log(`  Campos: ${ventKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        ventKeys.forEach(key => {
          const val = ventData[0][key]
          const type = typeof val
          const display = type === 'object' ? JSON.stringify(val).substring(0, 50) : String(val).substring(0, 50)
          console.log(`    • ${key} (${type}): ${display}`)
        })
      }

      if (ordData && ordData.length > 0) {
        console.log('\n  TABLA NUEVA (orders):')
        const ordKeys = Object.keys(ordData[0])
        console.log(`  Campos: ${ordKeys.join(', ')}`)
        console.log('\n  Primeros valores:')
        ordKeys.forEach(key => {
          const val = ordData[0][key]
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
      const { data: invData, error: invError, count: invCount } = await supabase
        .from('inventario')
        .select('*', { count: 'exact' })
        .limit(5)

      if (invError) {
        console.error(`  ❌ Error: ${invError.message}`)
        results.inventario.error = invError.message
      } else {
        results.inventario.count = invCount || 0
        results.inventario.samples = invData || []
        console.log(`  ✅ Total registros: ${invCount}`)
        if (invData && invData.length > 0) {
          console.log(`  📋 Campos del primer registro:`)
          Object.keys(invData[0]).forEach(key => {
            const value = invData[0][key]
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : value
            console.log(`     - ${key}: ${displayValue}`)
          })
        }
      }
      console.log()

      // ==========================================
      // 2️⃣ ESCANEAR CLIENTES
      // ==========================================
      console.log('👥 Escaneando CLIENTES...')
      const { data: cliData, error: cliError, count: cliCount } = await supabase
        .from('clientes')
        .select('*', { count: 'exact' })
        .limit(5)

      if (cliError) {
        console.error(`  ❌ Error: ${cliError.message}`)
        results.clientes.error = cliError.message
      } else {
        results.clientes.count = cliCount || 0
        results.clientes.samples = cliData || []
        console.log(`  ✅ Total registros: ${cliCount}`)
        if (cliData && cliData.length > 0) {
          console.log(`  📋 Campos del primer registro:`)
          Object.keys(cliData[0]).forEach(key => {
            const value = cliData[0][key]
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : value
            console.log(`     - ${key}: ${displayValue}`)
          })
        }
      }
      console.log()

      // ==========================================
      // 3️⃣ ESCANEAR VENTAS
      // ==========================================
      console.log('🛒 Escaneando VENTAS...')
      const { data: ventData, error: ventError, count: ventCount } = await supabase
        .from('ventas')
        .select('*', { count: 'exact' })
        .limit(5)

      if (ventError) {
        console.error(`  ❌ Error: ${ventError.message}`)
        results.ventas.error = ventError.message
      } else {
        results.ventas.count = ventCount || 0
        results.ventas.samples = ventData || []
        console.log(`  ✅ Total registros: ${ventCount}`)
        if (ventData && ventData.length > 0) {
          console.log(`  📋 Campos del primer registro:`)
          Object.keys(ventData[0]).forEach(key => {
            const value = ventData[0][key]
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : value
            console.log(`     - ${key}: ${displayValue}`)
          })
        }
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
      if (invData && invData.length > 0) {
        const record = invData[0]
        if (record.owner) {
          console.log(`  ✅ Campo OWNER encontrado: "${record.owner}"`)
          console.log(`     Para filtrar por usuario: .eq('owner', '${record.owner}')`)
        } else if (record.user_id) {
          console.log(`  ✅ Campo USER_ID encontrado: "${record.user_id}"`)
          console.log(`     Para filtrar por usuario: .eq('user_id', '${record.user_id}')`)
        } else if (record.email) {
          console.log(`  ✅ Campo EMAIL encontrado: "${record.email}"`)
          console.log(`     Para filtrar por usuario: .eq('email', '${userEmail}')`)
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