const CACHE_NAME = "connecto-cache-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.png",
];

/* =========================================
   INSTALL
========================================= */

self.addEventListener("install", (event) => {
  console.log("✅ Service Worker Installed");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );

  self.skipWaiting();
});

/* =========================================
   ACTIVATE
========================================= */

self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker Activated");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

/* =========================================
   FETCH (🔥 FIXED SAFE VERSION)
========================================= */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // ✅ Ignore non-GET requests
  if (request.method !== "GET") return;

  // ✅ Ignore socket / dev / dynamic stuff
  if (
    request.url.includes("socket.io") ||
    request.url.includes("hot-update") ||
    request.url.includes("sockjs") ||
    request.url.includes("/api/")
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // ✅ Only cache valid responses
          if (!response || response.status !== 200) {
            return response;
          }

          const clone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });

          return response;
        })
        .catch(() => {
          // ✅ Optional fallback
          if (request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

/* =========================================
   PUSH NOTIFICATIONS
========================================= */

self.addEventListener("push", (event) => {
  console.log("🔥 Push Received");

  if (!event.data) return;

  let data = {};

  try {
    data = event.data.json();
  } catch (err) {
    console.log("Push JSON Error:", err);
    return;
  }

  const title = data.title || "New Notification";

  const options = {
    body: data.body || "",
    icon: "/favicon.png",
    badge: "/favicon.png",
    data,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/* =========================================
   NOTIFICATION CLICK
========================================= */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data;

  let url = "/";

  if (data?.type === "message") {
    url = `/chat/${data.fromUserId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }

        return clients.openWindow(url);
      })
  );
});
