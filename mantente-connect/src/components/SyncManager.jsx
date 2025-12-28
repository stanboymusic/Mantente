import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { useOnline } from '../hooks/useOnline';
import { syncPendingData } from '../services/syncService';
import { pb } from '../services/pocketbaseService';

let pbAuthListener = null;

const SyncManager = () => {
  const { user } = useAuthStore();
  const { isSyncing, pendingSync } = useDataStore();
  const isOnline = useOnline();
  const [lastSyncMessage, setLastSyncMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  // Efecto para escuchar cambios en pb.authStore
  useEffect(() => {
    const listener = () => {
      console.log('🔄 pb.authStore changed in SyncManager:', {
        isValid: pb.authStore.isValid,
        hasRecord: !!pb.authStore.record,
        recordId: pb.authStore.record?.id
      });
      if (isOnline && user && pb.authStore.record && !isSyncing) {
        handleAutoSync();
      }
    };
    const unsubscribe = pb.authStore.onChange(listener);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Efecto para sincronización automática cuando se conecta
  useEffect(() => {
    if (isOnline && user && pb.authStore.record && !isSyncing) {
      handleAutoSync();
    }
  }, [isOnline, user, isSyncing]);

  const handleAutoSync = async () => {
    if (!user || !pb.authStore.record || isSyncing) return;

    console.log('🚀 Starting auto sync - Auth state:', {
      userId: user.id,
      userEmail: user.email,
      pbAuthValid: pb.authStore.isValid,
      pbAuthRecordId: pb.authStore.record?.id
    })

    try {
      setLastSyncMessage('🔄 Sincronizando cambios...');
      setShowNotification(true);

      const result = await syncPendingData(user.id);

      if (result.success) {
        setLastSyncMessage(`✅ ${result.message}`);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        setLastSyncMessage(`⚠️ ${result.message}`);
        setTimeout(() => setShowNotification(false), 5000);
      }
    } catch (error) {
      console.error('Error en sincronización automática:', error);
      setLastSyncMessage('❌ Error en sincronización');
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

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
    if (pendingSync > 0) return `ONLINE - ${pendingSync} cambios pendientes`;
    return 'ONLINE - Todo sincronizado';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600';
    if (isSyncing) return 'text-blue-600';
    if (pendingSync > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Notificación de sincronización */}
      {showNotification && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 mb-2 max-w-sm">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{isSyncing ? '🔄' : '✅'}</span>
            <span className="text-sm font-medium">{lastSyncMessage}</span>
          </div>
        </div>
      )}

      {/* Indicador de estado */}
      <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-3 ${getStatusColor()}`}>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>

        {/* Barra de progreso durante sincronización */}
        {isSyncing && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncManager;