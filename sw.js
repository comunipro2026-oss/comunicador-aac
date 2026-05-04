// ============================================================
// COMUNIPRO — Service Worker v1.0
// Adriana Soba, Fonoaudióloga
// ============================================================

const CACHE_NAME = 'comunipro-v1';
const BASE = 'https://comunipro2026-oss.github.io/comunicador-aac';

const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap',
];

// ── Instalación: cachear recursos esenciales ──────────────────
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activación: limpiar cachés viejas ─────────────────────────
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// ── Fetch: cache-first, fallback a red ───────────────────────
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).then(function(response) {
        // Cachear solo respuestas válidas
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    }).catch(function() {
      // Sin red y sin caché → devolver index.html como fallback
      return caches.match(BASE + '/index.html');
    })
  );
});
