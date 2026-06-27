const CACHE = 'px-alert-v1';
const ASSETS = [
  '/forex-price-alert/',
  '/forex-price-alert/index.html',
  '/forex-price-alert/forex-price-alert.html',
  'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow:wght@300;400;600;700&family=Barlow+Condensed:wght@600;700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // For API calls — always go network, never cache
  if (e.request.url.includes('twelvedata') || e.request.url.includes('telegram')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
