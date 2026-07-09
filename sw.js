// ⬇️ BUMP THIS every time you push a code update
const CACHE_VERSION = 3;
const CACHE_NAME = 'px-alert-v' + CACHE_VERSION;

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ── Install ──
self.addEventListener('install', event => {
  console.log('[SW v' + CACHE_VERSION + '] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: wipe ALL old caches ──
self.addEventListener('activate', event => {
  console.log('[SW v' + CACHE_VERSION + '] Activate — cleaning old caches');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Deleting:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Listen for skip waiting message ──
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Fetch: never cache API calls, cache-first for static assets ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip all API / proxy calls — let browser handle directly
  const skipHosts = [
    'twelvedata.com', 'yahoo.com', 'corsproxy.io',
    'codetabs.com', 'allorigins.win', 'telegram.org',
    'fonts.googleapis.com', 'fonts.gstatic.com'
  ];
  if (skipHosts.some(h => url.hostname.includes(h))) return;

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
