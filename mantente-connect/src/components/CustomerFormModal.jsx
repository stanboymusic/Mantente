import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'

export default function CustomerFormModal({ isOpen, onClose, customer = null, onSuccess }) {
  const user = useAuthStore((state) => state.user)
  const { addCustomer, updateCustomer } = useDataStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    company: '',
    ruc: '',
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        city: customer.city || '',
        address: customer.address || '',
        company: customer.company || customer.razon_social || '',
        ruc: customer.ruc || '',
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        address: '',
        company: '',
        ruc: '',
      })
    }
  }, [customer, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (customer) {
        await updateCustomer(customer.id, formData)
      } else {
        await addCustomer({
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
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? 'Editar Cliente' : 'Nuevo Cliente'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Nombre completo"
            className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            Dirección
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Calle y número"
            className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Ciudad
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ciudad"
              className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              RUC (Empresa)
            </label>
            <input
              type="text"
              name="ruc"
              value={formData.ruc}
              onChange={handleChange}
              placeholder="RUC"
              className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            Empresa / Razón Social
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Nombre de la empresa"
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