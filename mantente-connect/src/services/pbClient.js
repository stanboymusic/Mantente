import PocketBase from 'pocketbase'

// For production, use the Fly.io URL directly
// For development, use localhost
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
const POCKETBASE_URL = isProduction
  ? 'https://mantente-pocketbase.fly.dev'
  : (import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090')

console.log('🔧 PocketBase URL configurada:', POCKETBASE_URL)
console.log('🔧 Environment:', {
  isProduction,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
  VITE_POCKETBASE_URL: import.meta.env.VITE_POCKETBASE_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  MODE: import.meta.env.MODE
})

export const pb = new PocketBase(POCKETBASE_URL)

pb.autoCancelRequests = true

// Auto-refresh token before expiration
pb.authStore.onChange(() => {
  console.log('🔄 Auth store changed, valid:', pb.authStore.isValid)
  if (pb.authStore.isValid) {
    // Refresh token 5 minutes before expiration
    const expiresAt = new Date(pb.authStore.token.expires_at * 1000)
    const now = new Date()
    const timeUntilExpiry = expiresAt - now

    if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes
      console.log('🔄 Token expiring soon, refreshing...')
      pb.authStore.refresh().catch(err => {
        console.error('❌ Error refreshing token:', err)
      })
    }
  }
})