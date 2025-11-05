import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'

export default function ProductFormModal({ isOpen, onClose, product = null, onSuccess }) {
  const user = useAuthStore((state) => state.user)
  const { addProduct, updateProduct } = useDataStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    description: '',
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        quantity: product.quantity || 0,
        price: product.price || 0,
        description: product.description || '',
      })
    } else {
      setFormData({
        name: '',
        category: '',
        quantity: 0,
        price: 0,
        description: '',
      })
    }
  }, [product, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (product) {
        await updateProduct(product.id, formData)
      } else {
        await addProduct({
          ...formData,
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
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Editar Producto' : 'Nuevo Producto'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            Nombre del Producto *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ej: Laptop Dell"
            className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            Categoría
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Ej: Electrónica"
            className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Cantidad
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Precio Unitario
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Describe el producto..."
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
            disabled={isLoading || !formData.name}
            className="flex-1 px-4 py-2 bg-gold hover:bg-light-gold text-dark font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}