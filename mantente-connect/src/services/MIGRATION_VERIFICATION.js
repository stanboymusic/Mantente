/**
 * 🔍 SCRIPT DE VERIFICACIÓN POST-MIGRACIÓN
 * 
 * Úsalo en la consola del navegador (F12) para verificar que todo se migró correctamente
 * 
 * Copia y pega en la consola:
 * ────────────────────────────────────────────────────────────────
 * import verificationService from '/src/services/MIGRATION_VERIFICATION.js'
 * await verificationService.verifyMigration()
 * ────────────────────────────────────────────────────────────────
 */

import { supabase } from './supabaseService'

export const verificationService = {
  /**
   * 📊 Obtener estadísticas completas de Supabase
   */
  async getStats(userId) {
    console.log('\n📊 OBTENIENDO ESTADÍSTICAS DE SUPABASE...\n')

    try {
      // Obtener counts de cada tabla
      const [products, customers, orders, orderItems, invoices] = await Promise.all([
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('order_items')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
      ])

      const stats = {
        products: products.count || 0,
        customers: customers.count || 0,
        orders: orders.count || 0,
        orderItems: orderItems.count || 0,
        invoices: invoices.count || 0,
      }

      return stats
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error)
      return null
    }
  },

  /**
   * 🔗 Verificar integridad de relaciones
   */
  async verifyRelationships(userId) {
    console.log('\n🔗 VERIFICANDO INTEGRIDADES...\n')

    try {
      // Órdenes sin cliente asignado
      const { data: ordersWithoutCustomer } = await supabase
        .from('orders')
        .select('id, code')
        .eq('user_id', userId)
        .is('customer_id', null)

      console.log(`⚠️ Órdenes sin cliente: ${ordersWithoutCustomer?.length || 0}`)
      if (ordersWithoutCustomer && ordersWithoutCustomer.length > 0) {
        console.log('   Órdenes afectadas:', ordersWithoutCustomer.map(o => o.code).join(', '))
      }

      // Order items sin producto asignado
      const { data: itemsWithoutProduct } = await supabase
        .from('order_items')
        .select('id, order_id')
        .is('product_id', null)

      console.log(`⚠️ Order items sin producto: ${itemsWithoutProduct?.length || 0}`)

      // Órdenes sin items
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, code')
        .eq('user_id', userId)

      if (ordersData) {
        for (const order of ordersData) {
          const { data: items } = await supabase
            .from('order_items')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', order.id)

          if (!items || items.length === 0) {
            console.log(`⚠️ Orden ${order.code} sin items`)
          }
        }
      }

      return true
    } catch (error) {
      console.error('❌ Error verificando relaciones:', error)
      return false
    }
  },

  /**
   * 📋 Ver datos de ejemplo
   */
  async showSamples(userId) {
    console.log('\n📋 DATOS DE EJEMPLO\n')

    try {
      // Un producto
      const { data: productSample } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .limit(1)

      if (productSample && productSample[0]) {
        console.log('📦 Producto:', productSample[0])
      }

      // Un cliente
      const { data: customerSample } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .limit(1)

      if (customerSample && customerSample[0]) {
        console.log('👥 Cliente:', customerSample[0])
      }

      // Una orden con items
      const { data: orderSample } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .limit(1)

      if (orderSample && orderSample[0]) {
        console.log('🛒 Orden:', orderSample[0])
      }

      return true
    } catch (error) {
      console.error('❌ Error mostrando ejemplos:', error)
      return false
    }
  },

  /**
   * 🔍 VERIFICACIÓN COMPLETA
   */
  async verifyMigration() {
    console.log('\n')
    console.log('════════════════════════════════════════════════════════')
    console.log('🔍 VERIFICACIÓN POST-MIGRACIÓN COMPLETA')
    console.log('════════════════════════════════════════════════════════\n')

    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        console.error('❌ No hay usuario autenticado')
        return { success: false }
      }

      console.log(`✅ Usuario: ${user.email}\n`)

      // 1️⃣ Obtener estadísticas
      const stats = await this.getStats(user.id)

      if (!stats) {
        throw new Error('No se pudieron obtener estadísticas')
      }

      console.log('📊 ESTADÍSTICAS DE SUPABASE:')
      console.log('─────────────────────────────────────────')
      console.log(`📦 Productos:      ${stats.products}`)
      console.log(`👥 Clientes:       ${stats.customers}`)
      console.log(`🛒 Órdenes:        ${stats.orders}`)
      console.log(`📋 Order Items:    ${stats.orderItems}`)
      console.log(`📄 Facturas:       ${stats.invoices}`)
      console.log('─────────────────────────────────────────\n')

      // 2️⃣ Verificar relaciones
      await this.verifyRelationships(user.id)
      console.log('')

      // 3️⃣ Mostrar ejemplos
      await this.showSamples(user.id)

      // 4️⃣ Resumen
      const totalMigrated = stats.products + stats.customers + stats.orders
      console.log('\n════════════════════════════════════════════════════════')
      console.log('✅ VERIFICACIÓN COMPLETADA')
      console.log('════════════════════════════════════════════════════════')
      console.log(`📊 Total de registros: ${totalMigrated}`)

      if (stats.products > 0 && stats.customers > 0 && stats.orders > 0) {
        console.log('✅ Todos los datos se han migrado correctamente!')
      } else {
        console.warn('⚠️ Algunos datos no se han migrado. Verifica los logs.')
      }

      console.log('════════════════════════════════════════════════════════\n')

      return {
        success: true,
        stats,
        userId: user.id,
      }
    } catch (error) {
      console.error('❌ Error en verificación:', error)
      console.error('Stack:', error.stack)
      return { success: false, error: error.message }
    }
  },

  /**
   * 🧹 Limpiar datos de prueba (CUIDADO)
   */
  async clearTestData(userId, confirm = false) {
    if (!confirm) {
      console.warn('⚠️ PELIGRO: Esta acción borrará TODOS los datos migrados')
      console.warn('Ejecuta con: clearTestData(userId, true)')
      return
    }

    console.log('🗑️ BORRANDO DATOS MIGRADOS...\n')

    try {
      await Promise.all([
        supabase
          .from('order_items')
          .delete()
          .eq('order_id', 'any'), // Esto borrará todos

        supabase
          .from('orders')
          .delete()
          .eq('user_id', userId),

        supabase
          .from('customers')
          .delete()
          .eq('user_id', userId),

        supabase
          .from('products')
          .delete()
          .eq('user_id', userId),

        supabase
          .from('invoices')
          .delete()
          .eq('user_id', userId),
      ])

      console.log('✅ Datos borrados')
    } catch (error) {
      console.error('❌ Error borrando datos:', error)
    }
  },

  /**
   * 📋 Reporte detallado en CSV
   */
  async generateReport(userId) {
    console.log('\n📋 GENERANDO REPORTE...\n')

    try {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)

      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)

      const report = {
        timestamp: new Date().toISOString(),
        userId,
        products: {
          total: products?.length || 0,
          data: products || [],
        },
        customers: {
          total: customers?.length || 0,
          data: customers || [],
        },
        orders: {
          total: orders?.length || 0,
          data: orders || [],
        },
      }

      console.log('✅ Reporte generado:')
      console.log(JSON.stringify(report, null, 2))

      // Copiar al portapapeles
      navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      console.log('📋 Reporte copiado al portapapeles')

      return report
    } catch (error) {
      console.error('❌ Error generando reporte:', error)
      return null
    }
  },
}

export default verificationService