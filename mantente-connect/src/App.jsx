import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useDataStore } from './store/dataStore'
import { initializeApp } from './services/initializeService'

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
// import MigrationPage from './pages/MigrationPage'
import DiagnosticPage from './pages/DiagnosticPage'

function App() {
  const { user, isInitializing, isOnline, setIsOnline, logout } = useAuthStore()
  const { clearData, loadDataFromPocketBase, loadUserData, initDatabase, cleanInvalidOrdersFromQueue } = useDataStore()
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



  // Cargar datos locales inmediatamente cuando el usuario inicia sesión
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          console.log('👤 Usuario autenticado - Cargando datos locales...')
          await initDatabase()
          await loadUserData(user.id) // Cargar datos locales primero

          // Si está online, sincronizar con PocketBase
          if (isOnline) {
            console.log('🟢 Online - Sincronizando con PocketBase...')
            await loadDataFromPocketBase(user.id) // Cargar desde PocketBase
            await cleanInvalidOrdersFromQueue(user.id)
          } else {
            console.log('🔴 Offline - Usando solo datos locales')
          }
        } catch (error) {
          console.error('Error cargando datos:', error)
        }
      }
    }

    loadUserData()
  }, [user?.id, isOnline, initDatabase, loadUserData, loadDataFromPocketBase, cleanInvalidOrdersFromQueue])

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
                {/* <Route path="/migrate" element={<MigrationPage />} /> */}
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
