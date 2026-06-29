const CACHE = 'px-mobile-v2';

self.addEventListener('install', e => {
  self.skipWaiting(); // force activate immediately
});

self.addEventListener('activate', e => {
  // Delete ALL old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first — always get fresh content
  // Only cache as fallback if network fails
  if (e.request.url.includes('twelvedata') ||
      e.request.url.includes('telegram') ||
      e.request.url.includes('yahoo') ||
      e.request.url.includes('corsproxy')) {
    return; // never cache API calls
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
