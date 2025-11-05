import React from 'react'
import { useAuthStore } from '../store/authStore'

export default function UserInfoCard() {
  const { user } = useAuthStore()

  if (!user) return null

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'
  const userEmail = user.email || 'No disponible'
  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'

  return (
    <div className="bg-gradient-to-r from-gold to-light-gold rounded-lg shadow-lg p-6 text-dark mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">¡Bienvenido, {userName}! 👋</h2>
          <p className="text-sm opacity-80 mb-1">📧 {userEmail}</p>
          <p className="text-xs opacity-70">Miembro desde {joinDate}</p>
        </div>
        <div className="text-5xl">📊</div>
      </div>
    </div>
  )
}