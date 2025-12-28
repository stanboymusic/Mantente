import { pb } from './pocketbaseService.js';
import { useAuthStore } from '../store/authStore';
import { dataStore } from '../store/dataStore';

// Función para configurar el listener de conectividad
export function setupOnlineListener() {
  const { setIsOnline } = useAuthStore.getState();

  const handleOnline = () => {
    console.log('🟢 App online');
    setIsOnline(true);
  };

  const handleOffline = () => {
    console.log('🔴 App offline');
    setIsOnline(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Verificar estado inicial
  setIsOnline(navigator.onLine);
}

// Función pura para inicializar sincronización - descargar datos iniciales
export async function initializeSync(userId) {
  try {
    console.log('🚀 Iniciando sincronización inicial...');

    // Descargar inventario
    const inventory = await pb.collection('inventario').getFullList({
      filter: `user_id = "${userId}"`
    });

    // Descargar clientes
    const clients = await pb.collection('clientes').getFullList({
      filter: `user_id = "${userId}"`
    });

    // Descargar ventas procesadas (solo lectura)
    const sales = await pb.collection('ventas').getFullList({
      filter: `user_id = "${userId}" && estado != "orden"`
    });

    const lastSyncTime = new Date().toISOString();
    console.log('✅ Sincronización inicial completada');

    return { success: true, data: { inventory, clients, sales }, lastSyncTime };
  } catch (error) {
    console.error('❌ Error en sincronización inicial:', error);
    return { success: false, error: error.message };
  }
}

// Función pura para crear operación encolada
export function createQueuedOperation(operation) {
  const queuedOp = {
    id: crypto.randomUUID(),
    type: operation.type, // 'create_order', 'update_inventory', etc.
    data: operation.data,
    timestamp: new Date().toISOString(),
    status: 'pending',
    retryCount: 0
  };

  console.log(`📋 Operación creada: ${operation.type}`, queuedOp.id);

  return queuedOp;
}

// Función pura para procesar la cola de sincronización
export async function processQueue(syncQueue, userId) {
  if (syncQueue.length === 0) {
    return syncQueue;
  }

  console.log('🔄 Procesando cola de sincronización...');

  const updatedQueue = [];

  try {
    for (const operation of syncQueue) {
      if (operation.status === 'pending') {
        const result = await executeOperation(operation, userId);

        if (result.success) {
          operation.status = 'completed';
          console.log(`✅ Operación completada: ${operation.type}`);
        } else {
          operation.retryCount++;
          if (operation.retryCount >= 3) {
            operation.status = 'failed';
            console.error(`❌ Operación fallida definitivamente: ${operation.type}`);
          } else {
            console.warn(`⚠️ Reintento ${operation.retryCount}/3 para operación: ${operation.type}`);
            updatedQueue.push(operation);
          }
        }
      } else {
        updatedQueue.push(operation);
      }
    }

    return updatedQueue;

  } catch (error) {
    console.error('❌ Error procesando cola:', error);
    return syncQueue;
  }
}

// Función pura para ejecutar una operación específica
export async function executeOperation(operation, userId) {
  try {
    switch (operation.type) {
      case 'create_order':
        return await createOrder(operation.data, userId);
      case 'update_inventory':
        return await updateInventory(operation.data, userId);
      case 'update_client':
        return await updateClient(operation.data, userId);
      default:
        throw new Error(`Tipo de operación desconocido: ${operation.type}`);
    }
  } catch (error) {
    console.error(`❌ Error ejecutando operación ${operation.type}:`, error);
    return { success: false, error: error.message };
  }
}

// Función pura para crear orden de venta
export async function createOrder(orderData, userId) {
  try {
    // Crear la orden en PocketBase
    const order = await pb.collection('sales_orders').create({
      ...orderData,
      user_id: userId,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    // Crear la venta automáticamente
    const sale = await pb.collection('sales').create({
      order_id: order.id,
      client_id: order.client_id,
      total_amount: order.total_amount,
      items: order.items,
      user_id: userId,
      status: 'completed',
      created_at: new Date().toISOString()
    });

    // Generar factura automáticamente
    const invoice = await pb.collection('invoices').create({
      sale_id: sale.id,
      client_id: order.client_id,
      total_amount: order.total_amount,
      items: order.items,
      user_id: userId,
      status: 'generated',
      created_at: new Date().toISOString()
    });

    console.log('💰 Orden → Venta → Factura generada automáticamente');
    return { success: true, data: { order, sale, invoice } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Función pura para actualizar inventario
export async function updateInventory(inventoryData, userId) {
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

// Función pura para actualizar cliente
export async function updateClient(clientData, userId) {
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

// Función pura para sincronizar cambios remotos
export async function syncRemoteChanges(lastSyncTime, userId) {
  try {
    const lastSync = lastSyncTime || new Date(0).toISOString();

    // Sincronizar inventario
    const newInventory = await pb.collection('inventory').getFullList({
      filter: `user_id = "${userId}" && updated >= "${lastSync}"`
    });

    // Sincronizar clientes
    const newClients = await pb.collection('clients').getFullList({
      filter: `user_id = "${userId}" && updated >= "${lastSync}"`
    });

    const updatedLastSyncTime = new Date().toISOString();
    console.log('🔄 Cambios remotos sincronizados');

    return { success: true, data: { newInventory, newClients }, lastSyncTime: updatedLastSyncTime };

  } catch (error) {
    console.error('❌ Error sincronizando cambios remotos:', error);
    return { success: false, error: error.message };
  }
}

// Función para sincronizar datos pendientes - delega a dataStore
export async function syncPendingData(userId) {
  return await dataStore.syncPendingData(userId);
}