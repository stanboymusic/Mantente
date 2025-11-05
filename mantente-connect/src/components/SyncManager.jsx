import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import { useOnline } from '../hooks/useOnline'

export default function SyncManager() {
  const isOnline = useOnline()
  const user = useAuthStore((state) => state.user)
  const { pendingSync, isSyncing, syncPendingData, setLastSyncTime } = useDataStore()
  const { setLastSyncTime: setAuthLastSyncTime, setOfflineMode } = useAuthStore()
  const [showNotification, setShowNotification] = useState(false)
  const lastSyncAttempt = useRef(null)
  const syncRetries = useRef(0)
  const MAX_RETRIES = 3
  const RETRY_DELAY = 5000 // 5 segundos entre reintentos

  useEffect(() => {
    // Evitar sincronización infinita con debounce y límite de reintentos
    if (isOnline && user && pendingSync > 0 && !isSyncing) {
      const now = Date.now()
      const timeSinceLastAttempt = lastSyncAttempt.current ? now - lastSyncAttempt.current : null

      // Si es el primer intento o han pasado 5 segundos desde el último
      if (!lastSyncAttempt.current || timeSinceLastAttempt >= RETRY_DELAY) {
        // Si llegamos al máximo de reintentos, esperar más tiempo
        if (syncRetries.current >= MAX_RETRIES) {
          console.warn(`⚠️ Máximo número de reintentos (${MAX_RETRIES}) alcanzado. Esperando 30 segundos...`)
          setTimeout(() => {
            syncRetries.current = 0
          }, 30000)
          return
        }

        console.log(`🔄 Iniciando sincronización de datos pendientes (intento ${syncRetries.current + 1}/${MAX_RETRIES})...`)
        lastSyncAttempt.current = now
        syncRetries.current += 1

        syncPendingData(user.id).then(() => {
          const nowTime = new Date().toISOString()
          setAuthLastSyncTime(nowTime)
          setOfflineMode(false)
          setShowNotification(true)
          syncRetries.current = 0 // Reset reintentos en caso de éxito
          setTimeout(() => setShowNotification(false), 5000)
        }).catch((error) => {
          console.error('❌ Error en sincronización:', error)
        })
      }
    }
  }, [isOnline, user, pendingSync, isSyncing, syncPendingData, setAuthLastSyncTime, setOfflineMode])

  if (!isOnline && pendingSync > 0) {
    return (
      <div className="fixed bottom-4 right-4 bg-amber-100 border border-amber-400 text-amber-900 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-40">
        <div className="animate-spin">⏳</div>
        <div>
          <p className="font-semibold">Modo Offline</p>
          <p className="text-sm">{pendingSync} cambios pendientes de sincronizar</p>
        </div>
      </div>
    )
  }

  if (isSyncing) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-400 text-blue-900 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-40">
        <div className="animate-spin">🔄</div>
        <div>
          <p className="font-semibold">Sincronizando...</p>
          <p className="text-sm">Guardando cambios en la nube</p>
        </div>
      </div>
    )
  }

  if (showNotification) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-900 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-40 animate-pulse">
        <div>✅</div>
        <div>
          <p className="font-semibold">Sincronización completada</p>
          <p className="text-sm">Todos tus datos están actualizados</p>
        </div>
      </div>
    )
  }

  return null
}