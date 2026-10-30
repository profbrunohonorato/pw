'use strict';
const CACHE = 'pw08-tendencias-v1';
const ASSETS = ['./', './index.html', './app.js', './manifest.webmanifest', './icon.svg', '../assets/style.css'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});
// Não usa skipWaiting nem clients.claim: a ativação e a atualização seguem o ciclo normal.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const allowed = ASSETS.some((asset) => new URL(asset, self.location.href).href === url.href);
  if (!allowed) return;
  event.respondWith(caches.open(CACHE).then(async (cache) => {
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch (error) {
      const saved = await cache.match(event.request);
      if (saved) return saved;
      throw error;
    }
  }));
});
