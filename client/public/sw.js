/* THE MR Studio — minimal offline service worker.
 *
 * Strategy:
 *   /api/*               → network-first (always try fresh data; fall back to cache if offline)
 *   /admin*              → bypass SW entirely (auth flows must always hit network)
 *   everything else      → stale-while-revalidate (instant cached response, refresh in background)
 *   navigation request   → fall back to cached "/" if network fails (offline shell)
 *
 * Bump the version string when you ship a breaking SW or asset change so
 * old caches are evicted on the next visit.
 */

const VERSION = "v1";
const RUNTIME_CACHE = `mr-runtime-${VERSION}`;
const SHELL_CACHE = `mr-shell-${VERSION}`;
const SHELL_URLS = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== RUNTIME_CACHE && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/admin")) return;

  // API → network first, fall back to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Navigation requests → try network, fall back to cached "/"
  if (req.mode === "navigate") {
    event.respondWith(navigationFallback(req));
    return;
  }

  // Static assets → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (_) {
    const cached = await caches.match(req);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function navigationFallback(req) {
  try {
    const fresh = await fetch(req);
    return fresh;
  } catch (_) {
    const cache = await caches.open(SHELL_CACHE);
    const cached = await cache.match("/");
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}
