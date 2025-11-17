
// public/sw.js — service worker minimal (cache simple)
const CACHE = "af-cache-v1";
const PRECACHE_URLS = ["/", "/assets/qr-placeholder.png", "/assets/AstroFood-premiumgold.png"];

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  // stratégie : cache first for precached, else network
  ev.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // optionnel : mettre en cache les réponses GET
        if (req.method === "GET" && res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached || new Response("", { status: 404 }));
    })
  );
});
