import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'

export default function OrderFormModal({ isOpen, onClose, order = null, onSuccess }) {
  const user = useAuthStore((state) => state.user)
  const { addOrder, updateOrder, customers, products } = useDataStore()
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState([])
  const [formData, setFormData] = useState({
    code: '',
    customer: '', // Nombre del cliente (para UI)
    customerId: '', // ID del cliente (para DB)
    status: 'pending',
    deliveryDate: '',
    notes: '',
  })

  useEffect(() => {
    if (order) {
      setFormData({
        code: order.code || '',
        customer: order.customer || '',
        customerId: order.customerId || order.customer_id || '',
        status: order.status || 'pending',
        deliveryDate: order.deliveryDate || '',
        notes: order.notes || '',
      })
      setItems(order.items || [])
    } else {
      setFormData({
        code: `ORD-${Date.now()}`,
        customer: '',
        customerId: '',
        status: 'pending',
        deliveryDate: '',
        notes: '',
      })
      setItems([])
    }
  }, [order, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addItem = () => {
    setItems([...items, { product: '', quantity: 1, price: 0 }])
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const updated = [...items]
    updated[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value
    setItems(updated)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // ✅ VALIDACIÓN CRÍTICA: Cliente es obligatorio
    if (!formData.customerId || formData.customerId === '') {
      alert('❌ Debes seleccionar un cliente antes de guardar la orden')
      return
    }
    
    setIsLoading(true)

    try {
      const total = calculateTotal()
      if (order) {
        await updateOrder(order.id, {
          ...formData,
          customer_id: formData.customerId, // ✅ Incluir ID para Supabase
          items,
          total: parseFloat(total),
        })
      } else {
        await addOrder({
          ...formData,
          customer_id: formData.customerId, // ✅ Incluir ID para Supabase
          items,
          total: parseFloat(total),
          user_id: user.id,
        })
      }
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={order ? 'Editar Orden' : 'Nueva Orden'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Código de Orden
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Cliente *
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={(e) => {
                const selectedCustomer = customers.find(c => c.id === e.target.value)
                setFormData(prev => ({
                  ...prev,
                  customerId: e.target.value,
                  customer: selectedCustomer?.name || ''
                }))
              }}
              required
              className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
            >
              <option value="">Seleccionar cliente</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
            >
              <option value="pending">Pendiente</option>
              <option value="processing">En Proceso</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Fecha de Entrega
            </label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-dark">
              Artículos de la Orden
            </label>
            <button
              type="button"
              onClick={addItem}
              className="text-sm px-3 py-1 bg-light-gold text-dark rounded hover:bg-gold transition-colors"
            >
              + Agregar Artículo
            </button>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-gray text-center py-3">No hay artículos. Agrega uno para empezar.</p>
            ) : (
              items.map((item, index) => (
                <div key={index} className="flex gap-2 p-3 bg-light-gray rounded-lg">
                  <select
                    value={item.product}
                    onChange={(e) => updateItem(index, 'product', e.target.value)}
                    className="flex-1 px-2 py-1 border border-light-gray rounded text-sm"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map(p => (
                      <option key={p.id} value={p.name || p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    placeholder="Cant"
                    className="w-16 px-2 py-1 border border-light-gray rounded text-sm"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                    placeholder="Precio"
                    className="w-24 px-2 py-1 border border-light-gray rounded text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Total */}
        <div className="p-3 bg-light-gold rounded-lg">
          <p className="text-sm text-gray">Total de la Orden:</p>
          <p className="text-2xl font-bold text-dark">${calculateTotal()}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            Notas
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="2"
            placeholder="Observaciones adicionales..."
            className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-light-gray text-dark rounded-lg hover:bg-light-gray transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.customerId || items.length === 0}
            className="flex-1 px-4 py-2 bg-gold hover:bg-light-gold text-dark font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}