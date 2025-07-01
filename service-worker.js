const CACHE_NAME = 'finance-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/auth.js',
  '/firebase-config.js',
  '/manifest.json',
  '/android-icon-192x192.png',
  '/apple-icon-512x512.png',
  'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js'
];

// Instala o SW e faz cache dos arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Ativa o SW e remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
});

// Intercepta requisições e serve do cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});
