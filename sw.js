// Service Worker: приложение открывается и без интернета.
// Страницы и картинки берутся из сети, а при отсутствии связи — из кэша. Видео с BotHelp не кэшируются.
const CACHE_NAME = 'osanka-press-pwa-v1';
const PRECACHE = [
  "./",
  "./access-control.js",
  "./app.css",
  "./app.js",
  "./data.js",
  "./expired.html",
  "./icon-192.png",
  "./icon-512.png",
  "./index.html",
  "./main.html",
  "./manifest.json",
  "./menu-1300.html",
  "./menu-belly-data.js",
  "./menu-belly.html",
  "./menu.html",
  "./posture.html",
  "./press.html",
  "./profile.html",
  "./workout.html",
  "./workouts.js",
  "./images/cover-1300.jpg",
  "./images/cover-belly.jpg",
  "./images/main.jpg",
  "./images/menu.jpg",
  "./images/natali.jpg",
  "./images/posture1.jpg",
  "./images/posture2.jpg",
  "./images/posture3.jpg",
  "./images/posture4.jpg",
  "./images/posture5.jpg",
  "./images/posture6.jpg",
  "./images/posture7.jpg",
  "./images/press1.jpg",
  "./images/press2.jpg",
  "./images/press3.jpg",
  "./images/press4.jpg",
  "./images/press5.jpg",
  "./images/press6.jpg",
  "./images/press7.jpg",
  "./images/press8.jpg",
  "./images/belly/p01.jpg",
  "./images/belly/p02.jpg",
  "./images/belly/p03.jpg",
  "./images/belly/p04.jpg",
  "./images/belly/p05.jpg",
  "./images/belly/p06.jpg",
  "./images/belly/p07.jpg",
  "./images/belly/p08.jpg",
  "./images/belly/p09.jpg",
  "./images/belly/p10.jpg",
  "./images/belly/p11.jpg",
  "./images/belly/p12.jpg",
  "./images/belly/p13.jpg",
  "./images/belly/p14.jpg",
  "./images/belly/p15.jpg",
  "./images/belly/p16.jpg",
  "./images/belly/p17.jpg",
  "./images/belly/p18.jpg"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(PRECACHE.map(url => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) return;
  if (url.hostname.includes('bothelp')) return;        // видео — только онлайн
  if (/\.pdf$/i.test(url.pathname)) return;             // большие PDF не храним
  if (req.headers.get('range')) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(req);
      if (response.status === 200 || response.type === 'opaque') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(req, { ignoreSearch: req.mode === 'navigate' });
      if (cached) return cached;
      throw error;
    }
  })());
});
