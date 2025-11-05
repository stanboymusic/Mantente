import React, { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { usePWAInstall } from '../hooks/usePWAInstall'

/**
 * Componente que muestra un prompt para instalar la PWA
 * Se oculta después de 5 segundos o cuando el usuario la cierra
 */
export default function PWAInstallPrompt() {
  const { canInstall, isIOS, installApp } = usePWAInstall()
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenShown, setHasBeenShown] = useState(false)

  useEffect(() => {
    if (canInstall && !hasBeenShown) {
      // Mostrar prompt después de 3 segundos
      const timer = setTimeout(() => {
        setIsVisible(true)
        setHasBeenShown(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [canInstall, hasBeenShown])

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsVisible(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible && !canInstall) {
    return null
  }

  if (isIOS) {
    // Para iOS, mostrar instrucción manual
    if (!isVisible) return null
    
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slideUp">
        <div className="bg-white rounded-lg shadow-lg border-2 border-gold p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-bold text-dark mb-2 flex items-center gap-2">
                <Download size={18} />
                📱 Instalar Mantente Connect
              </h3>
              <p className="text-sm text-dark-gray mb-3">
                Toca el botón de compartir y selecciona "Agregar a pantalla de inicio"
              </p>
              <button
                onClick={handleClose}
                className="text-xs text-gold font-semibold hover:text-dark transition"
              >
                Entendido
              </button>
            </div>
            <button
              onClick={handleClose}
              className="text-dark-gray hover:text-dark transition flex-shrink-0"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Para Android y otros navegadores con soporte nativo
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slideUp">
      <div className="bg-gradient-to-r from-gold to-light-gold rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-dark mb-1 flex items-center gap-2">
              <Download size={18} />
              📱 Descargar Mantente Connect
            </h3>
            <p className="text-sm text-dark mb-3">
              Instala la app para acceder sin conexión y sincronizar automáticamente
            </p>
            <button
              onClick={handleInstall}
              className="w-full bg-dark text-white font-bold py-2 px-4 rounded hover:bg-dark-gray transition mb-2"
            >
              Instalar Ahora
            </button>
            <button
              onClick={handleClose}
              className="text-xs text-dark font-semibold hover:underline"
            >
              Más tarde
            </button>
          </div>
          <button
            onClick={handleClose}
            className="text-dark hover:text-dark-gray transition flex-shrink-0"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}