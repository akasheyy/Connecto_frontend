// src/utils/push.js

export async function subscribeToPush() {
  try {
    if (!("serviceWorker" in navigator)) {
      console.log("Service Worker not supported");
      return;
    }

    if (!("PushManager" in window)) {
      console.log("Push not supported");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    const reg = await navigator.serviceWorker.ready;

    // ✅ PREVENT DUPLICATE SUBSCRIPTIONS 🔥
    const existingSub = await reg.pushManager.getSubscription();

    if (existingSub) {
      console.log("Already subscribed ✅");
      return;
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.REACT_APP_VAPID_PUBLIC_KEY
      ),
    });

    await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/push/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(sub),
    });

    console.log("Push Enabled 🔥");
  } catch (err) {
    console.error("Push Subscription Error:", err);
  }
}

/* ✅ REQUIRED HELPER */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
