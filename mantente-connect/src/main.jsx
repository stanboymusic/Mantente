import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Registrar Service Worker para soporte offline y PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado exitosamente:', registration.scope)
      })
      .catch((error) => {
        console.warn('⚠️ Error registrando Service Worker:', error)
      })
  })

  // Escuchar mensajes del Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { type } = event.data
    
    if (type === 'SYNC_REQUESTED' || type === 'PERIODIC_SYNC') {
      console.log('🔄 Sincronización requerida desde Service Worker')
      // La app React manejará esto automáticamente
    }
  })

  // Detectar actualizaciones del Service Worker
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🆕 Nueva versión del Service Worker activada')
    // Mostrar notificación de actualización si lo deseas
    window.dispatchEvent(new CustomEvent('app-updated'))
  })
}
