import React, { useState, useEffect } from 'react'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'
import CustomerFormModal from '../components/CustomerFormModal'
import { useOnline } from '../hooks/useOnline'

export default function CustomersPage() {
  const user = useAuthStore((state) => state.user)
  const isOnline = useOnline()
  const {
    customers,
    loadUserData,
    setSearchTerm,
    getFilteredCustomers,
    deleteCustomer,
    searchTerm,
    pendingSync,
    isLoadingData,
  } = useDataStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [localSearch, setLocalSearch] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadUserData(user.id)
    }
  }, [user?.id, loadUserData])

  const handleSearch = (value) => {
    setLocalSearch(value)
    setSearchTerm(value)
  }

  const filteredCustomers = getFilteredCustomers()

  const stats = {
    totalCustomers: customers.length,
    withEmail: customers.filter(c => c.email).length,
    companies: customers.filter(c => c.ruc || c.company || c.razon_social).length,
  }

  const handleEdit = (customer) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este cliente?')) {
      await deleteCustomer(id, user.id)
    }
  }

  const handleAddNew = () => {
    setSelectedCustomer(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">👥 Clientes</h1>
          <p className="text-gray mt-1">Administra tu base de clientes</p>
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
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-light-gray">
          <p className="text-sm text-gray mb-1">Total Clientes</p>
          <p className="text-3xl font-bold text-dark">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-light-gray">
          <p className="text-sm text-gray mb-1">Con Email</p>
          <p className="text-3xl font-bold text-blue-600">{stats.withEmail}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-light-gray">
          <p className="text-sm text-gray mb-1">Empresas</p>
          <p className="text-3xl font-bold text-green-600">{stats.companies}</p>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white p-4 rounded-lg border border-light-gray">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
          />
          <button
            onClick={handleAddNew}
            className="px-6 py-2 bg-gold hover:bg-light-gold text-dark font-bold rounded-lg transition-colors"
          >
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Tabla de Clientes */}
      {isLoadingData ? (
        <div className="text-center py-8">
          <p className="text-gray">Cargando clientes...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-light-gray">
          <p className="text-gray text-lg">👥 No hay clientes</p>
          <p className="text-sm text-gray mt-2">Comienza agregando tu primer cliente</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-light-gray overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-light-gray border-b border-light-gray">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-dark">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark">Teléfono</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark">Ciudad</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark">Empresa / RUC</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const company = customer.company || customer.razon_social || '-'
                  const ruc = customer.ruc || '-'
                  return (
                    <tr key={customer.id} className="border-b border-light-gray hover:bg-light-gold/20 transition-colors">
                      <td className="px-4 py-3 text-dark font-medium">{customer.name}</td>
                      <td className="px-4 py-3 text-gray text-xs">{customer.email || '-'}</td>
                      <td className="px-4 py-3 text-gray">{customer.phone || '-'}</td>
                      <td className="px-4 py-3 text-gray">{customer.city || '-'}</td>
                      <td className="px-4 py-3 text-gray text-xs">
                        <div>{company}</div>
                        <div className="text-xs text-gray mt-1">{ruc}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs font-medium"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCustomer(null)
        }}
        customer={selectedCustomer}
        onSuccess={() => loadUserData(user.id)}
      />
    </div>
  )
}