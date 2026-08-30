// The Budget Calculator service worker — deliberately minimal.
//
// This app handles live financial data, so we never cache API responses or
// authenticated page shells: every navigation goes to the network first.
// The only thing cached is a tiny, versioned shell (offline fallback page,
// manifest, icons) so the app installs cleanly and shows something useful
// if the network drops mid-session, instead of a browser error page.

const CACHE_NAME = "budget-calculator-shell-v2";
const SHELL_ASSETS = [
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Only ever intercept top-level navigations; let everything else
  // (API calls, RSC payloads, data fetches) go straight to the network.
  if (request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(() => caches.match("/offline.html").then((res) => res ?? Response.error())),
  );
});
