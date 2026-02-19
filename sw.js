// ===============================
// CLEAN ENTERPRISE SERVICE WORKER
// ===============================

// Version name (change if you update app)
const CACHE_NAME = "underwriting-app-v1";

// Files to cache (only static files)
const STATIC_ASSETS = [
  "/",
  "/index.html"
];

// -------------------------------
// INSTALL
// -------------------------------
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// -------------------------------
// ACTIVATE
// -------------------------------
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// -------------------------------
// FETCH
// -------------------------------
self.addEventListener("fetch", (event) => {

  // Do NOT cache API calls
  if (event.request.url.includes("/analyze")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
