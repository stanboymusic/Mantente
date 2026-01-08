import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { useOnline } from '../hooks/useOnline';
import { syncPendingData } from '../services/syncService';
import { pb } from '../services/pocketbaseService';

const SyncManager = () => {
  const { user } = useAuthStore();
  const { isSyncing, pendingSync } = useDataStore();
  const isOnline = useOnline();
  const [lastSyncMessage, setLastSyncMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  // Efecto para escuchar cambios en pb.authStore - Solo para logging ahora
  useEffect(() => {
    const listener = () => {
      const pbUser = pb.authStore.model || pb.authStore.record;
      console.log('🔄 pb.authStore changed in SyncManager (Manual Mode):', {
        isValid: pb.authStore.isValid,
        hasRecord: !!pbUser
      });
    };
    const unsubscribe = pb.authStore.onChange(listener);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleManualSync = useCallback(async () => {
    if (!user || isSyncing || !isOnline) return;

    // Verificar si pb.authStore es válido
    if (!pb.authStore.isValid) {
      setLastSyncMessage('❌ Sesión de PocketBase inválida. Por favor re-inicia sesión.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      return;
    }

    console.log('🚀 Iniciando sincronización manual...');

    try {
      setLastSyncMessage('🔄 Sincronizando cambios locales...');
      setShowNotification(true);

      const result = await syncPendingData(user.id);

      if (result.success) {
        setLastSyncMessage(`✅ ${result.message}`);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        setLastSyncMessage(`⚠️ ${result.message}`);
        // Mantener notificación visible si falló para que el usuario vea el error
      }
    } catch (error) {
      console.error('Error en sincronización manual:', error);
      setLastSyncMessage('❌ Error en sincronización');
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [user, isSyncing, isOnline]);

  const getStatusIcon = () => {
    if (!isOnline) return '📴';
    if (isSyncing) return '🔄';
    if (pendingSync > 0) return '⏳';
    return '🌐';
  };

  const getStatusText = () => {
    if (!isOnline) {
      return pendingSync > 0
        ? `OFFLINE - ${pendingSync} cambios pendientes`
        : 'OFFLINE';
    }

    if (isSyncing) return 'SINCRONIZANDO...';
    if (pendingSync > 0) return `ONLINE - ${pendingSync} pendientes`;
    return 'ONLINE - Sincronizado';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600';
    if (isSyncing) return 'text-blue-600';
    if (pendingSync > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2">
      {/* Notificación de sincronización */}
      {showNotification && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start space-x-3">
            <span className="text-xl mt-0.5">{isSyncing ? '🔄' : (lastSyncMessage.includes('✅') ? '✅' : '⚠️')}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{lastSyncMessage}</p>
              {!isSyncing && !lastSyncMessage.includes('✅') && (
                <button 
                  onClick={() => setShowNotification(false)}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indicador de estado y botón de sincronización */}
      <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-3 ${getStatusColor()} flex flex-col items-center`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className="text-sm font-bold uppercase tracking-tight">{getStatusText()}</span>
        </div>

        {isOnline && pendingSync > 0 && !isSyncing && (
          <button
            onClick={handleManualSync}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors shadow-sm flex items-center justify-center space-x-1"
          >
            <span>Subir cambios</span>
            <span>📤</span>
          </button>
        )}

        {/* Barra de progreso durante sincronización */}
        {isSyncing && (
          <div className="mt-2 w-full">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncManager;