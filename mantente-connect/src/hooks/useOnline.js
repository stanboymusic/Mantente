import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export function useOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const setAuthOnline = useAuthStore((state) => state.setIsOnline)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setAuthOnline(true)
      console.log('🌐 Back online!')
    }

    const handleOffline = () => {
      setIsOnline(false)
      setAuthOnline(false)
      console.log('📴 Going offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setAuthOnline])

  // ✨ NUEVO: Verificación periódica más robusta
  // No confiar solo en navigator.onLine que es poco confiable
  useEffect(() => {
    let checkInterval = null
    
    const checkConnection = async () => {
      try {
        // Hacer un HEAD request a cualquier URL pública para verificar conexión real
        const response = await fetch('https://www.google.com/favicon.ico', { 
          method: 'HEAD',
          mode: 'no-cors',
          timeout: 3000
        })
        
        if (!isOnline) {
          setIsOnline(true)
          setAuthOnline(true)
          console.log('🌐 Conexión detectada (verificación periódica)')
        }
      } catch (error) {
        if (isOnline) {
          setIsOnline(false)
          setAuthOnline(false)
          console.log('📴 Desconexión detectada (verificación periódica)')
        }
      }
    }

    // Verificar cada 10 segundos
    checkInterval = setInterval(checkConnection, 10000)
    
    return () => {
      if (checkInterval) clearInterval(checkInterval)
    }
  }, [isOnline, setAuthOnline])

  return isOnline
}