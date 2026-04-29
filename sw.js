const CACHE = 'dune-wiki-v2';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './router.js',
  './store.js',
  './manifest.json',
  './data/schema.js',
  './components/navbar.js',
  './components/infobox.js',
  './components/linksEditor.js',
  './components/timelineEditor.js',
  './pages/home.js',
  './pages/view.js',
  './pages/edit.js',
  './pages/category.js',
  './pages/timeline.js',
  './pages/search.js',
  './pages/settings.js',
  './sync.js',
  './icons/icon.svg',
  'https://cdn.quilljs.com/1.3.7/quill.snow.css',
  'https://cdn.quilljs.com/1.3.7/quill.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => cached);
    })
  );
});
