/* 999gml 个人网站 Service Worker：优先网络，断网时回退到缓存 */
const CACHE = '999gml-v1';
const CORE = [
  './',
  './index.html',
  './article.html',
  './games.html',
  './game.html',
  './spidey-miner.html',
  './404.html',
  './manifest.json',
  './css/style.css',
  './js/main.js',
  './js/content.js',
  './js/chat.js',
  './js/article.js',
  './js/game.js',
  './js/spidey-miner.js',
  './assets/og-image.png',
  './avatars/avatar.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => {
          if (hit) return hit;
          if (req.mode === 'navigate') return caches.match('./index.html');
          return Response.error();
        })
      )
  );
});
