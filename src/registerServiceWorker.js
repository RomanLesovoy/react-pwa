// In production, we register a service worker to serve assets from local cache.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on the "N+1" visit to a page, since previously
// cached resources are updated in the background.

// To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
// This link also includes instructions on opting out of this behavior.

recipeJustCache();

export default function register () { // Register the service worker
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = 'service-worker.js';
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // At this point, the old content will have been purged and
                  // the fresh content will have been added to the cache.
                  // It's the perfect time to display a "New content is
                  // available; please refresh." message in your web app.
                  console.log('New content is available; please refresh.');
                } else {
                  // At this point, everything has been precached.
                  // It's the perfect time to display a
                  // "Content is cached for offline use." message.
                  console.log('Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch(error => {
          console.error('Error during service worker registration:', error);
        });
    });
  }
}

export function unregister () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}

function recipeJustCache() {
  const CACHE = 'cache-only-v1';

  // При установке воркера мы должны закешировать часть данных (статику).
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE).then((cache) => {
        return cache.addAll([]);
      })
    );
  });

  // При запросе на сервер (событие fetch), используем только данные из кэша.
  self.addEventListener('fetch', (event) => event.respondWith(fromCache(event.request)));

  function fromCache(request) {
    return caches.open(CACHE).then((cache) =>
      cache.match(request)
        .then((matching) => matching || Promise.reject('no-match'))
    );
  }
}

function recipeWithNoConnection() {
  const CACHE = 'offline-fallback-v1';

  // При установке воркера мы должны закешировать часть данных (статику).
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(CACHE)
        .then((cache) => cache.addAll([]))
        // `skipWaiting()` необходим, потому что мы хотим активировать SW
        // и контролировать его сразу, а не после перезагрузки.
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    // `self.clients.claim()` позволяет SW начать перехватывать запросы с самого начала,
    // это работает вместе с `skipWaiting()`, позволяя использовать `fallback` с самых первых запросов.
    event.waitUntil(self.clients.claim());
  });

  self.addEventListener('fetch', function(event) {
    // Можете использовать любую стратегию описанную выше.
    // Если она не отработает корректно, то используейте `Embedded fallback`.
    event.respondWith(networkOrCache(event.request).catch(() => useFallback()));
  });

  function networkOrCache(request) {
    return fetch(request)
      .then((response) => response.ok ? response : fromCache(request))
      .catch(() => fromCache(request));
  }

  // Наш Fallback вместе с нашим собсвенным Динозавриком.
  const FALLBACK =
    '<div>\n' +
    '    <div>App Title</div>\n' +
    '    <div>you are offline</div>\n' +
    '    <img src="/svg/or/base64/of/your/dinosaur" alt="dinosaur"/>\n' +
    '</div>';

  // Он никогда не упадет, т.к мы всегда отдаем заранее подготовленные данные.
  function useFallback() {
    return Promise.resolve(new Response(FALLBACK, { headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }}));
  }

  function fromCache(request) {
    return caches.open(CACHE).then((cache) =>
      cache.match(request).then((matching) =>
        matching || Promise.reject('no-match')
      ));
  }
}