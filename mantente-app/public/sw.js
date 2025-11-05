const CACHE_NAME = 'mantente-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/material visual/logo.png',
  '/material visual/nombre.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache abierto:', CACHE_NAME);
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('[SW] Algunos recursos no pudieron cachearse:', err);
          // No fallar si no se pueden cachear todos los recursos
        });
      })
      .catch((err) => {
        console.error('[SW] Error durante install:', err);
      })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignorar solicitudes no-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar solicitudes a APIs externas como Firebase o Supabase
  if (request.url.includes('/rest/v1/') || 
      request.url.includes('firebase') ||
      request.url.includes('googleapis')) {
    event.respondWith(fetch(request));
    return;
  }

  // Network First Strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // No cachear respuestas no-200
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clonar la respuesta
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Fallback a cache si no hay conexión
        return caches.match(request)
          .then((response) => {
            if (response) {
              return response;
            }

            // Si es una página HTML, devolver la página principal
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }

            return new Response('No disponible offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background Sync (opcional, para sincronizar datos cuando vuelve conexión)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mantente') {
    event.waitUntil(
      fetch('/api/sync')
        .then((response) => {
          console.log('[SW] Sincronización completada');
          return response;
        })
        .catch((err) => {
          console.warn('[SW] Error en sincronización:', err);
        })
    );
  }
});

// Push Notifications (opcional)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nueva notificación de Mantente',
    icon: '/material visual/logo.png',
    badge: '/material visual/logo.png',
    tag: data.tag || 'mantente-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Mantente', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});