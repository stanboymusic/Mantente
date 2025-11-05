import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useDataStore } from './store/dataStore'
import { initializeApp } from './services/initializeService'
import { migrationService } from './services/migrationService'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SyncManager from './components/SyncManager'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import CustomersPage from './pages/CustomersPage'
import OrdersPage from './pages/OrdersPage'
import SettingsPage from './pages/SettingsPage'
import MigrationPage from './pages/MigrationPage'
import DiagnosticPage from './pages/DiagnosticPage'

function App() {
  const { user, isInitializing, isOnline, setIsOnline, logout } = useAuthStore()
  const { clearData, loadDataFromSupabase, initDatabase, cleanInvalidOrdersFromQueue } = useDataStore()
  const [appReady, setAppReady] = useState(false)

  // Inicializar app
  useEffect(() => {
    const setupApp = async () => {
      try {
        await initializeApp()
        setAppReady(true)
      } catch (error) {
        console.error('Error initializing app:', error)
        setAppReady(true) // Allow app to continue anyway
      }
    }

    setupApp()
  }, [])

  // Listeners de online/offline
  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 App online')
      setIsOnline(true)
    }

    const handleOffline = () => {
      console.log('🔴 App offline')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificar estado inicial
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setIsOnline])

  // Limpiar datos cuando hace logout
  useEffect(() => {
    if (!user) {
      clearData()
    }
  }, [user, clearData])

  // 🤖 Auto-migración automática en primer login
  useEffect(() => {
    const performAutoMigration = async () => {
      if (user?.id && isOnline) {
        try {
          // Verificar si ya se hizo migración para este usuario
          const migrationKey = `migration_completed_${user.id}`
          const alreadyMigrated = localStorage.getItem(migrationKey)
          
          if (!alreadyMigrated) {
            console.log('🚀 INICIANDO AUTO-MIGRACIÓN EN BACKGROUND...')
            console.log('⏳ Los datos se están cargando automáticamente desde Mantente antiguo...')
            
            // Ejecutar migración en background sin bloquear la UI
            migrationService.migrateAllData(user.id).then(() => {
              // Marcar migración como completada
              localStorage.setItem(migrationKey, new Date().toISOString())
              console.log('✅ Auto-migración completada')
            }).catch((error) => {
              console.warn('⚠️ Error en auto-migración (continuando...)', error)
            })
          }
        } catch (error) {
          console.warn('⚠️ Error verificando migración:', error)
        }
      }
    }

    performAutoMigration()
  }, [user?.id, isOnline])

  // Cargar datos de Supabase cuando el usuario inicia sesión y está online
  useEffect(() => {
    const loadSupabaseData = async () => {
      if (user?.id && isOnline) {
        try {
          console.log('🟢 Usuario autenticado y online - Cargando datos de Supabase...')
          await initDatabase()
          await loadDataFromSupabase(user.id)
          
          // ✅ Limpiar órdenes inválidas de la cola de sincronización
          await cleanInvalidOrdersFromQueue(user.id)
        } catch (error) {
          console.error('Error cargando datos de Supabase:', error)
        }
      }
    }

    loadSupabaseData()
  }, [user?.id, isOnline, initDatabase, loadDataFromSupabase, cleanInvalidOrdersFromQueue])

  if (isInitializing || !appReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gold to-light-gold">
        <div className="text-center">
          <div className="text-5xl mb-4">🛰️</div>
          <h1 className="text-3xl font-bold text-dark mb-2">Mantente Connect</h1>
          <p className="text-dark-gray">Inicializando aplicación...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white">
        {user && <Navbar />}
        <main className="flex-1">
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/migrate" element={<MigrationPage />} />
                <Route path="/diagnostic" element={<DiagnosticPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </>
            )}
          </Routes>
        </main>
        {user && <Footer />}
        {user && <SyncManager />}
        <PWAInstallPrompt />
      </div>
    </Router>
  )
}

export default App
