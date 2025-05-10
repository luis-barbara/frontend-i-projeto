const CACHE_NAME = "todo-app-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./favicon.jpg",  
  "./pwa_logo.svg"  
];

// Instala o Service Worker e armazena em cache os recursos essenciais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

// Intercepta requisições e serve do cache quando offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Atualização do cache e limpeza de caches antigos quando o service worker for ativado
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
