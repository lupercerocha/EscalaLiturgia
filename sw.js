/* T-Jet Sistema — service worker
   O index.html NUNCA sai do cache quando há rede: cache velho servindo
   versão antiga foi a causa de "a função nova não aparece". */
var VERSAO = '2.7.0';
var CACHE  = 'tjet-' + VERSAO;
var LOCAIS = ['./', './index.html', './manifest.json', './favicon.ico', './favicon.svg',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(LOCAIS.map(function (u) { return c.add(u).catch(function () {}); }));
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.map(function (k) { return k === CACHE ? null : caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (cs) { cs.forEach(function (c) { c.postMessage({ tipo: 'atualizado', versao: VERSAO }); }); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data && e.data.tipo === 'pular_espera') self.skipWaiting();
  if (e.data && e.data.tipo === 'limpar') {
    e.waitUntil(caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) { return caches.delete(k); }));
    }));
  }
});

function ehDocumento(req) {
  return req.mode === 'navigate' ||
         req.destination === 'document' ||
         (req.headers.get('accept') || '').indexOf('text/html') > -1;
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var externo = new URL(req.url).origin !== location.origin;

  /* CDN (Sortable, Tesseract): cache primeiro, para funcionar offline */
  if (externo) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) {
          if (res && res.status === 200) {
            var copia = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copia); });
          }
          return res;
        }).catch(function () { return hit; });
      })
    );
    return;
  }

  /* HTML: sempre a rede primeiro, sem negociar. Cache só quando falta sinal. */
  if (ehDocumento(req)) {
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(function (res) {
          var copia = res.clone();
          caches.open(CACHE).then(function (c) { c.put('./index.html', copia); });
          return res;
        })
        .catch(function () {
          return caches.match('./index.html').then(function (hit) {
            return hit || caches.match(req);
          });
        })
    );
    return;
  }

  /* demais arquivos do app: rede primeiro, cache de reserva */
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200 && res.type === 'basic') {
        var copia = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copia); });
      }
      return res;
    }).catch(function () { return caches.match(req); })
  );
});
