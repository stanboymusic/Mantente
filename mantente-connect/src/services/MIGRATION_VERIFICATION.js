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

import { pb } from './supabaseService'

export const verificationService = {
  /**
   * 📊 Obtener estadísticas completas de PocketBase
   */
  async getStats(userId) {
    console.log('\n📊 OBTENIENDO ESTADÍSTICAS DE POCKETBASE...\n')

    try {
      // Obtener counts de cada tabla
      const [products, customers, orders, orderItems, invoices] = await Promise.all([
        pb.collection('inventario').getList(1, 1, { filter: `user_id="${userId}"` }),
        pb.collection('clientes').getList(1, 1, { filter: `user_id="${userId}"` }),
        pb.collection('orders').getList(1, 1, { filter: `user_id="${userId}"` }),
        pb.collection('order_items').getList(1, 1),
        pb.collection('invoices').getList(1, 1, { filter: `user_id="${userId}"` }),
      ])

      const stats = {
        products: products.totalItems || 0,
        customers: customers.totalItems || 0,
        orders: orders.totalItems || 0,
        orderItems: orderItems.totalItems || 0,
        invoices: invoices.totalItems || 0,
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
      const ordersWithoutCustomer = await pb.collection('orders').getList(1, 100, {
        filter: `user_id="${userId}" && customer_id=null`
      })

      console.log(`⚠️ Órdenes sin cliente: ${ordersWithoutCustomer?.totalItems || 0}`)
      if (ordersWithoutCustomer && ordersWithoutCustomer.items.length > 0) {
        console.log('   Órdenes afectadas:', ordersWithoutCustomer.items.map(o => o.code).join(', '))
      }

      // Order items sin producto asignado
      const itemsWithoutProduct = await pb.collection('order_items').getList(1, 100, {
        filter: 'product_id=null'
      })

      console.log(`⚠️ Order items sin producto: ${itemsWithoutProduct?.totalItems || 0}`)

      // Órdenes sin items
      const ordersData = await pb.collection('orders').getList(1, 100, {
        filter: `user_id="${userId}"`
      })

      if (ordersData && ordersData.items) {
        for (const order of ordersData.items) {
          const items = await pb.collection('order_items').getList(1, 1, {
            filter: `order_id="${order.id}"`
          })

          if (!items || items.totalItems === 0) {
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
      const productSample = await pb.collection('inventario').getList(1, 1, {
        filter: `user_id="${userId}"`
      })

      if (productSample && productSample.items && productSample.items[0]) {
        console.log('📦 Producto:', productSample.items[0])
      }

      // Un cliente
      const customerSample = await pb.collection('clientes').getList(1, 1, {
        filter: `user_id="${userId}"`
      })

      if (customerSample && customerSample.items && customerSample.items[0]) {
        console.log('👥 Cliente:', customerSample.items[0])
      }

      // Una orden con items
      const orderSample = await pb.collection('orders').getList(1, 1, {
        filter: `user_id="${userId}"`
      })

      if (orderSample && orderSample.items && orderSample.items[0]) {
        console.log('🛒 Orden:', orderSample.items[0])
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
      const user = pb.authStore.record

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

      console.log('📊 ESTADÍSTICAS DE POCKETBASE:')
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
      // Get all records and delete them one by one (PocketBase doesn't have batch delete)
      const [orderItems, orders, customers, products, invoices] = await Promise.all([
        pb.collection('order_items').getFullList(),
        pb.collection('orders').getFullList({ filter: `user_id="${userId}"` }),
        pb.collection('clientes').getFullList({ filter: `user_id="${userId}"` }),
        pb.collection('inventario').getFullList({ filter: `user_id="${userId}"` }),
        pb.collection('invoices').getFullList({ filter: `user_id="${userId}"` }),
      ])

      // Delete all records
      await Promise.all([
        ...orderItems.map(item => pb.collection('order_items').delete(item.id)),
        ...orders.map(item => pb.collection('orders').delete(item.id)),
        ...customers.map(item => pb.collection('clientes').delete(item.id)),
        ...products.map(item => pb.collection('inventario').delete(item.id)),
        ...invoices.map(item => pb.collection('invoices').delete(item.id)),
      ])

      console.log('✅ Datos borrados')
    } catch (error) {
      console.error('❌ Error borrando datos:', error)
    }
  },

  /**
   * 📋 Reporte detallado en JSON
   */
  async generateReport(userId) {
    console.log('\n📋 GENERANDO REPORTE...\n')

    try {
      const products = await pb.collection('inventario').getFullList({
        filter: `user_id="${userId}"`
      })

      const customers = await pb.collection('clientes').getFullList({
        filter: `user_id="${userId}"`
      })

      const orders = await pb.collection('orders').getFullList({
        filter: `user_id="${userId}"`
      })

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