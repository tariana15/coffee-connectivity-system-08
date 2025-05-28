const CACHE_NAME = 'coffee-shop-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Добавьте сюда все статические ресурсы, которые нужно кэшировать
  // Например: '/css/style.css', '/js/app.js', '/images/logo.png'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Если ресурс найден в кэше, возвращаем его
        if (response) {
          return response;
        }

        // Если ресурс не найден в кэше, делаем сетевой запрос
        return fetch(event.request)
          .then((response) => {
            // Проверяем, что ответ валидный
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Клонируем ответ, так как он может быть использован только один раз
            const responseToCache = response.clone();

            // Открываем кэш и сохраняем ответ
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
}); 