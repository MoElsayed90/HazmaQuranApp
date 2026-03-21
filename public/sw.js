/**
 * Service worker: CacheFirst for mushaf page images (jsDelivr CDN) for instant PWA page flipping.
 */
const CACHE_NAME = "hazma-mushaf-v1";
const MUSHAF_IMAGE_PATTERN = /^https:\/\/cdn\.jsdelivr\.net\/gh\/tarekeldeeb\/madina_images@/;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (event.request.method !== "GET") return;
  if (!MUSHAF_IMAGE_PATTERN.test(url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
