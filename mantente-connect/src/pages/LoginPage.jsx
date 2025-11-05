import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()
  const { login, signup, error, isLoading, user, restoreSession } = useAuthStore()

  // Restaurar sesión al montar componente
  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      return
    }

    try {
      if (isSignUp) {
        await signup(email, password, { name: email.split('@')[0] })
      } else {
        await login(email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      // El error ya está en el store
      console.error('Auth error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold via-light-gold to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🛰️</div>
          <h1 className="text-3xl font-bold text-dark mb-2">Mantente Connect</h1>
          <p className="text-gray">Gestión offline de inventario y ventas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-light-gold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-gold hover:bg-light-gold text-dark font-bold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (isSignUp ? 'Registrando...' : 'Iniciando sesión...') : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-light-gray">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm text-gray hover:text-dark transition-colors"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-light-gray">
          <p className="text-xs text-center text-gray">
            🔒 Usa tus credenciales de Mantente para acceder
          </p>
        </div>
      </div>
    </div>
  )
}