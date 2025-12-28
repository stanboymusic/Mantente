import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useDataStore } from './store/dataStore'
import { initializeApp } from './services/initializeService'

import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdLayout from './components/AdLayout'
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
  const { user, isInitializing, isAuthRefreshed, isOnline, setIsOnline, logout } = useAuthStore()
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

  // Limpiar datos cuando hace logout
  useEffect(() => {
    if (!user) {
      clearData()
    }
  }, [user, clearData])



  // Cargar datos locales inmediatamente cuando el usuario inicia sesión
  useEffect(() => {
    const loadDataForUser = async () => {
      if (user?.id) {
        try {
          console.log('👤 Usuario autenticado - Cargando datos locales... (v2)')
          console.log('🔧 Estado de conexión:', { isOnline, userId: user.id })

          await initDatabase()
          await loadUserData(user.id) // Cargar datos locales primero
          console.log('✅ Datos locales cargados')

          // Si está online, sincronizar con PocketBase
          if (isOnline) {
            console.log('🟢 Online - Sincronizando con PocketBase...')
            try {
              await loadDataFromPocketBase(user.id) // Cargar desde PocketBase
              console.log('✅ Datos de PocketBase cargados')
              await cleanInvalidOrdersFromQueue(user.id)
              console.log('✅ Cola de sincronización limpiada')
            } catch (pbError) {
              console.error('❌ Error cargando datos de PocketBase:', pbError)
              // No fallar completamente, continuar con datos locales
            }
          } else {
            console.log('🔴 Offline - Usando solo datos locales')
          }
        } catch (error) {
          console.error('❌ Error general cargando datos:', error)
        }
      } else {
        console.log('⏳ Esperando autenticación de usuario...')
      }
    }

    loadDataForUser()
  }, [user?.id, isOnline, initDatabase, loadUserData, loadDataFromPocketBase, cleanInvalidOrdersFromQueue])

  if (isInitializing || !appReady || !isAuthRefreshed) {
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
    <ErrorBoundary>
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
                  <Route path="/dashboard" element={<AdLayout><DashboardPage /></AdLayout>} />
                  <Route path="/inventory" element={<AdLayout><InventoryPage /></AdLayout>} />
                  <Route path="/customers" element={<AdLayout><CustomersPage /></AdLayout>} />
                  <Route path="/orders" element={<AdLayout><OrdersPage /></AdLayout>} />
                  <Route path="/settings" element={
                    <div className="container mx-auto px-4 py-6">
                      <SettingsPage />
                    </div>
                  } />
                  {/* <Route path="/migrate" element={<MigrationPage />} /> */}
                  <Route path="/diagnostic" element={
                    <div className="container mx-auto px-4 py-6">
                      <DiagnosticPage />
                    </div>
                  } />
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
    </ErrorBoundary>
  )
}

export default App
