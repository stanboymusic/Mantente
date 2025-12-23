// Service Worker para Mantente Connect
// Permite funcionamiento offline y caching inteligente

const CACHE_NAME = 'mantente-connect-v1'
const RUNTIME_CACHE = 'mantente-connect-runtime'
const API_CACHE = 'mantente-connect-api'

// Archivos críticos que deben estar en cache
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalándose...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Cache creado:', CACHE_NAME)
      return cache.addAll(CRITICAL_ASSETS).catch(err => {
        console.warn('⚠️ Algunos archivos no se pudieron cachear:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activado')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== API_CACHE) {
            console.log('🗑️ Limpiando cache antiguo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Interceptación de requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // No cachear requests POST, PUT, DELETE
  if (request.method !== 'GET') {
    event.respondWith(fetch(request))
    return
  }

  // API requests - Network first, then cache (except auth)
  if (url.origin !== location.origin ||
      url.pathname.includes('/api/') ||
      url.hostname.includes('supabase') ||
      url.hostname.includes('pocketbase')) {

    // Don't cache authentication requests
    if (url.pathname.includes('auth-with-password') ||
        url.pathname.includes('auth-refresh') ||
        url.pathname.includes('request-password-reset')) {
      event.respondWith(fetch(request))
      return
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.status === 200) {
            // Clone the response before returning it
            const responseClone = response.clone()
            caches.open(API_CACHE).then(cache => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          return caches.match(request)
            .then(cachedResponse => cachedResponse || cacheResponse404())
        })
    )
    return
  }

  // Static assets - Cache first, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || request.method !== 'GET') {
            return response
          }

          // Clone the response before returning it
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, responseClone))
          return response
        })
        .catch(() => {
          // Fallback para imágenes
          if (request.destination === 'image') {
            return cacheResponse404('image')
          }
          return cacheResponse404()
        })
    })
  )
})

// Fallback responses
function cacheResponse404(type = 'document') {
  if (type === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-size="12" fill="#999">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    )
  }
  
  return new Response('Offline - Contenido no disponible', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  })
}

// Background sync para sincronizar cuando vuelve la conexión
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_REQUESTED',
            timestamp: new Date().toISOString()
          })
        })
      })
    )
  }
})

// Periodic background sync (opcional, para sincronización periódica)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-data') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'PERIODIC_SYNC',
            timestamp: new Date().toISOString()
          })
        })
      })
    )
  }
})