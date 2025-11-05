import React, { useState, useEffect } from 'react'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'
import ProductFormModal from '../components/ProductFormModal'
import { useOnline } from '../hooks/useOnline'

export default function InventoryPage() {
  const user = useAuthStore((state) => state.user)
  const isOnline = useOnline()
  const {
    products,
    loadUserData,
    setSearchTerm,
    setFilterCategory,
    getFilteredProducts,
    deleteProduct,
    searchTerm,
    filterCategory,
    pendingSync,
    isLoadingData,
  } = useDataStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
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

  const handleFilterCategory = (category) => {
    setFilterCategory(category)
  }

  const filteredProducts = getFilteredProducts()

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.quantity * p.price), 0),
    lowStock: products.filter(p => p.quantity < 5).length,
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este producto?')) {
      await deleteProduct(id, user.id)
    }
  }

  const handleAddNew = () => {
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">📦 Inventario</h1>
          <p className="text-gray mt-1">Gestiona tus productos y stock</p>
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
          <p className="text-sm text-gray mb-1">Total Productos</p>
          <p className="text-3xl font-bold text-dark">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-light-gray">
          <p className="text-sm text-gray mb-1">Valor Total</p>
          <p className="text-3xl font-bold text-gold">${stats.totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-light-gray">
          <p className="text-sm text-gray mb-1">Stock Bajo</p>
          <p className="text-3xl font-bold text-red-600">{stats.lowStock}</p>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white p-4 rounded-lg border border-light-gray space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
          />
          <button
            onClick={handleAddNew}
            className="px-6 py-2 bg-gold hover:bg-light-gold text-dark font-bold rounded-lg transition-colors"
          >
            + Nuevo Producto
          </button>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleFilterCategory('')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                !filterCategory
                  ? 'bg-gold text-dark'
                  : 'bg-light-gray text-dark hover:bg-gold/20'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleFilterCategory(cat)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filterCategory === cat
                    ? 'bg-gold text-dark'
                    : 'bg-light-gray text-dark hover:bg-gold/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabla de Productos */}
      {isLoadingData ? (
        <div className="text-center py-8">
          <p className="text-gray">Cargando inventario...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-light-gray">
          <p className="text-gray text-lg">📭 No hay productos</p>
          <p className="text-sm text-gray mt-2">Comienza agregando tu primer producto</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-light-gray overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-light-gray border-b border-light-gray">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-dark">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark">Categoría</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark">Cantidad</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark">Precio</th>
                  <th className="px-4 py-3 text-right font-semibold text-dark">Subtotal</th>
                  <th className="px-4 py-3 text-center font-semibold text-dark">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const subtotal = product.quantity * product.price
                  const isLowStock = product.quantity < 5
                  return (
                    <tr key={product.id} className="border-b border-light-gray hover:bg-light-gold/20 transition-colors">
                      <td className="px-4 py-3 text-dark font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-gray">{product.category || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            isLowStock
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-dark">${product.price?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-dark">${subtotal.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
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
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onSuccess={() => loadUserData(user.id)}
      />
    </div>
  )
}