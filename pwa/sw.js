/* Service worker de l'appli qrbc : réseau d'abord, copie locale en secours.
   L'API et les écritures ne sont jamais mises en cache. */
const VERSION = 'qrbc-v1';
const COQUILLE = ['/app', '/commun.js', '/i18n.js', '/qrcode.js', '/icon-192.png', '/icon-512.png', '/favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(COQUILLE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const HORS_LIGNE = '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>Hors ligne</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#1b1a17;color:#f6f4ef;' +
  'font:16px/1.5 system-ui,sans-serif;text-align:center;padding:24px}button{margin-top:14px;padding:12px 20px;border:0;border-radius:12px;' +
  'background:#d9572b;color:#fff;font:inherit;font-weight:700}</style></head><body><div><h1>Pas de connexion</h1>' +
  '<p>Vérifiez votre réseau, puis réessayez.</p><button onclick="location.reload()">Réessayer</button></div></body></html>';

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return;
  e.respondWith((async () => {
    try {
      const rep = await fetch(req);
      if (rep.ok && COQUILLE.includes(url.pathname)) {
        const copie = rep.clone();
        caches.open(VERSION).then(c => c.put(req, copie));
      }
      return rep;
    } catch (err) {
      const enCache = await caches.match(req, { ignoreSearch: true });
      if (enCache) return enCache;
      if (req.mode === 'navigate') return new Response(HORS_LIGNE, { headers: { 'content-type': 'text/html; charset=utf-8' } });
      throw err;
    }
  })());
});
