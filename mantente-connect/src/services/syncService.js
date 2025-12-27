import { pb } from './pocketbaseService.js';
import { dataStore } from '../store/dataStore.js';
import { useDataStore } from '../store/dataStore.js';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncQueue = [];
    this.lastSyncTime = null;
  }

  // Inicializar sincronización - descargar datos iniciales
  async initializeSync() {
    try {
      console.log('🚀 Iniciando sincronización inicial...');

      // Descargar inventario
      const inventory = await pb.collection('inventario').getFullList({
        filter: `user_id = "${pb.authStore.model.id}"`
      });

      // Descargar clientes
      const clients = await pb.collection('clientes').getFullList({
        filter: `user_id = "${pb.authStore.model.id}"`
      });

      // Descargar ventas procesadas (solo lectura)
      const sales = await pb.collection('ventas').getFullList({
        filter: `user_id = "${pb.authStore.model.id}" && estado != "orden"`
      });

      // Guardar localmente
      await dataStore.saveInventory(inventory);
      await dataStore.saveClients(clients);
      await dataStore.saveSales(sales);

      this.lastSyncTime = new Date().toISOString();
      console.log('✅ Sincronización inicial completada');

      return { success: true };
    } catch (error) {
      console.error('❌ Error en sincronización inicial:', error);
      return { success: false, error: error.message };
    }
  }

  // Agregar operación a la cola de sincronización
  async queueOperation(operation) {
    try {
      const queuedOp = {
        id: crypto.randomUUID(),
        type: operation.type, // 'create_order', 'update_inventory', etc.
        data: operation.data,
        timestamp: new Date().toISOString(),
        status: 'pending',
        retryCount: 0
      };

      // Guardar localmente primero
      await dataStore.savePendingOperation(queuedOp);

      // Agregar a la cola en memoria
      this.syncQueue.push(queuedOp);

      console.log(`📋 Operación encolada: ${operation.type}`, queuedOp.id);

      // Intentar sincronizar inmediatamente si hay conexión
      if (navigator.onLine) {
        this.processQueue();
      }

      return { success: true, operationId: queuedOp.id };
    } catch (error) {
      console.error('❌ Error al encolar operación:', error);
      return { success: false, error: error.message };
    }
  }

  // Procesar la cola de sincronización
  async processQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    console.log('🔄 Procesando cola de sincronización...');

    try {
      for (const operation of this.syncQueue) {
        if (operation.status === 'pending') {
          const result = await this.executeOperation(operation);

          if (result.success) {
            operation.status = 'completed';
            await dataStore.updateOperationStatus(operation.id, 'completed');
            console.log(`✅ Operación completada: ${operation.type}`);
          } else {
            operation.retryCount++;
            if (operation.retryCount >= 3) {
              operation.status = 'failed';
              await dataStore.updateOperationStatus(operation.id, 'failed');
              console.error(`❌ Operación fallida definitivamente: ${operation.type}`);
            } else {
              console.warn(`⚠️ Reintento ${operation.retryCount}/3 para operación: ${operation.type}`);
            }
          }
        }
      }

      // Limpiar operaciones completadas
      this.syncQueue = this.syncQueue.filter(op => op.status !== 'completed');

    } catch (error) {
      console.error('❌ Error procesando cola:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Ejecutar una operación específica
  async executeOperation(operation) {
    try {
      switch (operation.type) {
        case 'create_order':
          return await this.createOrder(operation.data);
        case 'update_inventory':
          return await this.updateInventory(operation.data);
        case 'update_client':
          return await this.updateClient(operation.data);
        default:
          throw new Error(`Tipo de operación desconocido: ${operation.type}`);
      }
    } catch (error) {
      console.error(`❌ Error ejecutando operación ${operation.type}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Crear orden de venta
  async createOrder(orderData) {
    try {
      // Crear la orden en PocketBase
      const order = await pb.collection('sales_orders').create({
        ...orderData,
        user_id: pb.authStore.model.id,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      // Crear la venta automáticamente
      const sale = await pb.collection('sales').create({
        order_id: order.id,
        client_id: order.client_id,
        total_amount: order.total_amount,
        items: order.items,
        user_id: pb.authStore.model.id,
        status: 'completed',
        created_at: new Date().toISOString()
      });

      // Generar factura automáticamente
      const invoice = await pb.collection('invoices').create({
        sale_id: sale.id,
        client_id: order.client_id,
        total_amount: order.total_amount,
        items: order.items,
        user_id: pb.authStore.model.id,
        status: 'generated',
        created_at: new Date().toISOString()
      });

      console.log('💰 Orden → Venta → Factura generada automáticamente');
      return { success: true, data: { order, sale, invoice } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Actualizar inventario
  async updateInventory(inventoryData) {
    try {
      await pb.collection('inventory').update(inventoryData.id, {
        ...inventoryData,
        last_modified: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Actualizar cliente
  async updateClient(clientData) {
    try {
      await pb.collection('clients').update(clientData.id, {
        ...clientData,
        last_modified: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sincronización automática al reconectar
  startAutoSync() {
    // Monitorear cambios en la conexión
    window.addEventListener('online', () => {
      console.log('🔄 Conexión recuperada, iniciando sincronización automática...');
      this.processQueue();
      this.syncRemoteChanges();
    });
  }

  // Sincronizar cambios remotos
  async syncRemoteChanges() {
    try {
      const lastSync = this.lastSyncTime || new Date(0).toISOString();

      // Sincronizar inventario
      const newInventory = await pb.collection('inventory').getFullList({
        filter: `user_id = "${pb.authStore.model.id}" && updated >= "${lastSync}"`
      });

      // Sincronizar clientes
      const newClients = await pb.collection('clients').getFullList({
        filter: `user_id = "${pb.authStore.model.id}" && updated >= "${lastSync}"`
      });

      // Actualizar localmente
      if (newInventory.length > 0) {
        await dataStore.updateInventory(newInventory);
      }

      if (newClients.length > 0) {
        await dataStore.updateClients(newClients);
      }

      this.lastSyncTime = new Date().toISOString();
      console.log('🔄 Cambios remotos sincronizados');

    } catch (error) {
      console.error('❌ Error sincronizando cambios remotos:', error);
    }
  }
}

export const syncService = new SyncService();

// Exportar función para configurar listener de conectividad
export const setupOnlineListener = () => {
  syncService.startAutoSync();
};

// Exportar función para sincronizar datos pendientes
export const syncPendingData = async (userId) => {
  try {
    await dataStore.syncPendingData(userId);
    return { success: true, message: 'Sincronización completada exitosamente' };
  } catch (error) {
    console.error('Error en syncPendingData:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
};