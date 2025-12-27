import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, Settings, Wifi, WifiOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { user, logout } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const isActive = (path) => location.pathname === path

  const navItems = [
    { label: '📊 Dashboard', path: '/dashboard' },
    { label: '📦 Inventario', path: '/inventory' },
    { label: '👥 Clientes', path: '/customers' },
    { label: '💰 Ventas Locales', path: '/orders' },
  ]

  return (
    <nav className="bg-white border-b border-light-gray shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🛰️</span>
            <span className="text-xl font-bold text-gold hidden sm:inline">Mantente Connect</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-light-gold text-dark'
                    : 'text-gray hover:bg-light-gray'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Online Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-xs font-medium text-taupe">
                  <Wifi size={16} />
                  <span className="hidden sm:inline">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-medium text-dark-gray bg-light-gray px-2 py-1 rounded">
                  <WifiOff size={16} />
                  <span className="hidden sm:inline">Offline</span>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link
              to="/settings"
              className="p-2 text-gray hover:bg-light-gray rounded-md transition-colors"
            >
              <Settings size={20} />
            </Link>

            {/* Logout */}
            <button
              onClick={() => {
                logout()
              }}
              className="p-2 text-dark-gray hover:bg-light-gray rounded-md transition-colors"
            >
              <LogOut size={20} />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-gray hover:bg-light-gray"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-light-gray">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-light-gold text-dark'
                    : 'text-gray hover:bg-light-gray'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}