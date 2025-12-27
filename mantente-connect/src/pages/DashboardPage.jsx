import React, { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import UserInfoCard from '../components/UserInfoCard'

export default function DashboardPage() {
  const { user, isOnline } = useAuthStore()
  const { products, customers, salesLocal, pendingSync, loadUserData, initDatabase } = useDataStore()
  const [lastSync, setLastSync] = useState(null)
  const initRef = useRef(false)

  // Inicializar datos al montar el componente
  useEffect(() => {
    const init = async () => {
      if (initRef.current) return // Prevenir múltiples inicializaciones
      initRef.current = true
      
      try {
        // Inicializar IndexedDB
        await initDatabase()
        
        if (user?.id) {
          await loadUserData(user.id)
          setLastSync(new Date())
        }
      } catch (error) {
        console.error('Error inicializando dashboard:', error)
      }
    }

    init()
  }, [])

  // Calcular tiempo desde última sincronización
  const getTimeSinceSync = () => {
    if (!lastSync) return 'Nunca'
    
    const now = new Date()
    const diffMinutes = Math.floor((now - lastSync) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Hace unos segundos'
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Hace ${diffHours}h`
    
    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays}d`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tarjeta de bienvenida del usuario */}
      <UserInfoCard />

      <h1 className="text-3xl font-bold text-dark mb-8">Dashboard</h1>

      {/* Indicador de estado de conexión */}
      <div className="mb-6 flex items-center gap-3 p-4 bg-white rounded-lg shadow">
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-taupe animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-sm font-medium text-gray">
          {isOnline ? '🟢 Online - Sincronización activa' : '🔴 Offline - Datos locales'}
        </span>
        {pendingSync > 0 && (
          <span className="ml-auto text-xs font-bold bg-gold text-dark px-2 py-1 rounded">
            ⏳ {pendingSync} cambios pendientes
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gold hover:shadow-lg transition-shadow">
          <div className="text-gray text-sm font-medium mb-1">📦 Productos</div>
          <div className="text-3xl font-bold text-dark">{products.length}</div>
          <p className="text-xs text-gray mt-2">En inventario</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-violet hover:shadow-lg transition-shadow">
          <div className="text-gray text-sm font-medium mb-1">👥 Clientes</div>
          <div className="text-3xl font-bold text-dark">{customers.length}</div>
          <p className="text-xs text-gray mt-2">Registrados</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-taupe hover:shadow-lg transition-shadow">
          <div className="text-gray text-sm font-medium mb-1">📋 Órdenes</div>
          <div className="text-3xl font-bold text-dark">{salesLocal.length}</div>
          <p className="text-xs text-gray mt-2">Registradas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-brown hover:shadow-lg transition-shadow">
          <div className="text-gray text-sm font-medium mb-1">⏳ Pendiente Sync</div>
          <div className="text-3xl font-bold text-dark">{pendingSync}</div>
          <p className="text-xs text-gray mt-2">Cambios locales</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-dark mb-4">⚡ Acciones Rápidas</h2>
          <div className="space-y-3">
            <a href="/inventory" className="block w-full bg-gold hover:bg-light-gold text-dark font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-center">
              ➕ Nuevo Producto
            </a>
            <a href="/customers" className="block w-full bg-violet hover:bg-light-violet text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-center">
              ➕ Nuevo Cliente
            </a>
            <a href="/orders" className="block w-full bg-taupe hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 text-center">
              💰 Nueva Venta
            </a>
          </div>
        </div>

        {/* App Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-dark mb-4">📊 Estado de la App</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray font-medium">🔗 Conexión:</span>
              <span className={`font-bold ${isOnline ? 'text-taupe' : 'text-red-500'}`}>
                {isOnline ? 'Online ✓' : 'Offline ✗'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray font-medium">💾 Base datos local:</span>
              <span className="text-taupe font-bold">Lista ✓</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray font-medium">🔄 Última sincronización:</span>
              <span className="text-gray text-sm font-medium">{getTimeSinceSync()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gold bg-opacity-10 rounded border border-gold">
              <span className="text-gray font-medium">📦 Almacenamiento:</span>
              <span className="text-dark font-bold">{products.length + customers.length + salesLocal.length} items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de últimas actividades (Placeholder para futuro) */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-dark mb-4">📈 Resumen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gold bg-opacity-10 rounded-lg">
            <div className="text-2xl font-bold text-dark mb-1">{products.length}</div>
            <div className="text-sm text-gray">Productos en stock</div>
            <div className="text-xs text-gray mt-2">Gestión de inventario activa</div>
          </div>
          <div className="text-center p-4 bg-violet bg-opacity-10 rounded-lg">
            <div className="text-2xl font-bold text-dark mb-1">{customers.length}</div>
            <div className="text-sm text-gray">Clientes totales</div>
            <div className="text-xs text-gray mt-2">Base de datos completa</div>
          </div>
          <div className="text-center p-4 bg-taupe bg-opacity-10 rounded-lg">
            <div className="text-2xl font-bold text-dark mb-1">{salesLocal.length}</div>
            <div className="text-sm text-gray">Órdenes procesadas</div>
            <div className="text-xs text-gray mt-2">Historial disponible</div>
          </div>
        </div>
      </div>
    </div>
  )
}