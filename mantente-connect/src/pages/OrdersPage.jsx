import React, { useState, useEffect } from 'react'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'
import OrderFormModal from '../components/OrderFormModal'
import { useOnline } from '../hooks/useOnline'

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user)
  const isOnline = useOnline()
  const {
    salesLocal,
    loadUserData,
    setSearchTerm,
    getFilteredSalesLocal,
    deleteSaleLocal,
    searchTerm,
    pendingSync,
    isLoadingData,
  } = useDataStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [localSearch, setLocalSearch] = useState('')
  const [expandedOrders, setExpandedOrders] = useState(new Set())

  useEffect(() => {
    if (user?.id) {
      loadUserData(user.id)
    }
  }, [user?.id, loadUserData])

  const handleSearch = (value) => {
    setLocalSearch(value)
    setSearchTerm(value)
  }

  const filteredSalesLocal = getFilteredSalesLocal()

  const stats = {
    totalOrders: salesLocal.length,
    totalValue: salesLocal.reduce((sum, s) => sum + (s.total || 0), 0),
    pending: salesLocal.filter(s => s.estado === 'orden').length,
    processed: salesLocal.filter(s => s.estado !== 'orden').length,
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return '✅ Completada'
      case 'pending':
        return '⏳ Pendiente'
      case 'cancelled':
        return '❌ Cancelada'
      default:
        return status
    }
  }

  const toggleExpand = (orderId) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const handleEdit = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta venta local?')) {
      await deleteSaleLocal(id, user.id)
    }
  }

  const handleAddNew = () => {
    setSelectedOrder(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">💰 Ventas Locales</h1>
          <p className="text-gray mt-1">Ventas creadas offline pendientes de sincronización</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingSync > 0 && (
            <div className="px-3 py-2 bg-amber-100 text-amber-900 rounded-lg text-sm font-medium">
              ⏳ {pendingSync} cambios sin sincronizar
            </div>
          )}
          {!isOnline && (
            <div className="px-3 py-2 bg-red-100 text-red-900 rounded-lg text-sm font-medium">
              📴 Offline
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-light-gray">
          <p className="text-sm text-gray mb-1">Total Órdenes</p>
          <p className="text-3xl font-bold text-dark">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-light-gray">
          <p className="text-sm text-gray mb-1">Valor Total</p>
          <p className="text-3xl font-bold text-gold">${stats.totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-light-gray">
          <p className="text-sm text-gray mb-1">Por Procesar</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-light-gray">
          <p className="text-sm text-gray mb-1">Procesadas</p>
          <p className="text-3xl font-bold text-green-600">{stats.processed}</p>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white p-4 rounded-lg border border-light-gray">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por código o cliente..."
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
          />
          <button
            onClick={handleAddNew}
            className="px-6 py-2 bg-gold hover:bg-light-gold text-dark font-bold rounded-lg transition-colors"
          >
            + Nueva Orden
          </button>
        </div>
      </div>

      {/* Lista de Órdenes */}
      {isLoadingData ? (
        <div className="text-center py-8">
          <p className="text-gray">Cargando órdenes...</p>
        </div>
      ) : filteredSalesLocal.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-light-gray">
          <p className="text-gray text-lg">📭 No hay órdenes</p>
          <p className="text-sm text-gray mt-2">Comienza creando tu primera orden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSalesLocal.map((sale) => {
            const isExpanded = expandedOrders.has(sale.id)
            const items = sale.items || []
            return (
              <div key={sale.id} className="bg-white rounded-lg border border-light-gray overflow-hidden">
                {/* Header de la orden (siempre visible) */}
                <button
                  onClick={() => toggleExpand(sale.id)}
                  className="w-full px-4 py-4 hover:bg-light-gold/20 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="flex-1">
                      <p className="font-semibold text-dark">{sale.codigo_venta || sale.id}</p>
                      <p className="text-sm text-gray">{sale.cliente || sale.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray">{new Date(sale.createdAt || sale.date).toLocaleDateString()}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusColor(sale.estado || sale.status)}`}>
                        {getStatusLabel(sale.estado || sale.status)}
                      </span>
                    </div>
                    <div className="text-right min-w-fit">
                      <p className="text-lg font-bold text-gold">${(sale.total || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className={`ml-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </div>
                </button>

                {/* Detalles expandibles */}
                {isExpanded && (
                  <div className="border-t border-light-gray p-4 space-y-4 bg-light-gold/10">
                    {/* Artículos */}
                    <div>
                      <h4 className="font-semibold text-dark mb-2">Artículos:</h4>
                      {sale.productos_json?.length === 0 ? (
                        <p className="text-sm text-gray">Sin artículos registrados</p>
                      ) : (
                        <div className="space-y-1 text-sm">
                          {sale.productos_json?.map((item, idx) => (
                            <div key={idx} className="flex justify-between py-1 border-b border-light-gray/50">
                              <span className="text-gray">{item.nombre} x {item.cantidad}</span>
                              <span className="font-medium text-dark">${(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Información adicional */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {sale.delivery_date && (
                        <div>
                          <p className="text-gray">Entrega:</p>
                          <p className="font-medium text-dark">{new Date(sale.delivery_date).toLocaleDateString()}</p>
                        </div>
                      )}
                      {sale.notas && (
                        <div>
                          <p className="text-gray">Notas:</p>
                          <p className="font-medium text-dark">{sale.notas}</p>
                        </div>
                      )}
                    </div>

                    {/* Resumen financiero */}
                    <div className="pt-3 border-t border-light-gray space-y-1 text-sm">
                      {sale.subtotal && (
                        <div className="flex justify-between">
                          <span className="text-gray">Subtotal:</span>
                          <span className="text-dark">${sale.subtotal.toFixed(2)}</span>
                        </div>
                      )}
                      {sale.discount && (
                        <div className="flex justify-between">
                          <span className="text-gray">Descuento:</span>
                          <span className="text-dark">-${sale.discount.toFixed(2)}</span>
                        </div>
                      )}
                      {sale.tax && (
                        <div className="flex justify-between">
                          <span className="text-gray">Impuesto:</span>
                          <span className="text-dark">${sale.tax.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-2 border-t border-light-gray">
                        <span className="text-dark">Total:</span>
                        <span className="text-gold">${(sale.total || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={() => handleEdit(sale)}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <OrderFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedOrder(null)
        }}
        sale={selectedOrder}
        onSuccess={() => loadUserData(user.id)}
      />
    </div>
  )
}