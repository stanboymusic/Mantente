import { useEffect, useState } from 'react'

/**
 * Hook para detectar y manejar la instalación de PWA
 * Detecta cuando la app se puede instalar y el usuario instala
 */
export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detectar si es iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIOSDevice)

    // Escuchar evento de beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      console.log('📲 PWA Install Prompt disponible')
    }

    // Escuchar evento de instalación
    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setIsInstalled(true)
      console.log('✅ PWA instalada correctamente')
      
      // Guardar en localStorage que la app fue instalada
      localStorage.setItem('pwa-installed', JSON.stringify({
        timestamp: new Date().toISOString(),
        platform: navigator.platform,
        userAgent: navigator.userAgent
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Verificar si ya fue instalada
    const wasInstalled = localStorage.getItem('pwa-installed')
    if (wasInstalled) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!installPrompt) {
      console.warn('⚠️ Install prompt no disponible')
      return false
    }

    try {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar la app')
        setInstallPrompt(null)
        return true
      } else {
        console.log('❌ Usuario rechazó instalar la app')
        return false
      }
    } catch (error) {
      console.error('Error durante la instalación:', error)
      return false
    }
  }

  return {
    installPrompt,
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    isIOS,
    installApp
  }
}