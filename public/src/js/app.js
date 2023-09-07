const SERVICE_WORKER_PATH = "/sw.js";
const NOTIFICATION_ICON = "/src/images/icons/fiw96x96.png";
const NOTIFICATION_IMAGE = "/src/images/htw-sm.jpg";
const VAPID_PUBLIC_KEY =
  "BKqjdfy1FfKWsxwnki4wJKOtGZy1JeX-Tb04x0HudiKzStK5k8XTrr2FvuZcjGCE1-1E2SbDE5ZfFL3oCafQqzA";

// Initialization & Utilities
document.addEventListener("DOMContentLoaded", init);

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = base64String.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Main Initialization
function init() {
  if (isServiceWorkerSupported()) {
    registerServiceWorker();
  }

  if (areNotificationsSupported()) {
    setupNotificationButtons();
  }
}

function isServiceWorkerSupported() {
  return "serviceWorker" in navigator;
}

function areNotificationsSupported() {
  return "Notification" in window && isServiceWorkerSupported();
}

// Service Worker
function registerServiceWorker() {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => console.log("Service worker registered"))
    .catch((err) => console.log(err));
}

function displayConfirmNotification() {
  if ("serviceWorker" in navigator) {
    let options = {
      body: "You successfully subscribed to our Notification service!",
      icon: "/src/images/icons/fiw96x96.png", //mosquito ersetzen!!!
      image: "/src/images/htw-sm.jpg",
      lang: "de-DE",
      vibrate: [100, 50, 200],
      badge: "/src/images/icons/fiw96x96.png",
      tag: "confirm-notification",
      renotify: true,
      actions: [
        {
          action: "confirm",
          title: "Ok",
          icon: "/src/images/icons/fiw96x96.png",
        },
        {
          action: "cancel",
          title: "Cancel",
          icon: "/src/images/icons/fiw96x96.png",
        },
      ],
    };

    navigator.serviceWorker.ready.then((sw) => {
      sw.showNotification("Successfully subscribed (from SW)!", options);
    });
  }
}

function askForNotificationPermission() {
  Notification.requestPermission((result) => {
    handleNotificationPermission(result);
  });
}

function handleNotificationPermission(result) {
  if (result !== "granted") {
    console.log("No notification permission granted");
  } else {
    configurePushSubscription();
    hideNotificationButtons();
  }
}

function hideNotificationButtons() {
  const buttons = document.querySelectorAll(".enable-notifications");
  buttons.forEach((button) => (button.style.display = "none"));
}

function setupNotificationButtons() {
  const buttons = document.querySelectorAll(".enable-notifications");
  buttons.forEach((button) => {
    button.style.display = "inline-block";
    button.addEventListener("click", askForNotificationPermission);
  });
}

async function configurePushSubscription() {
  try {
    if (!isServiceWorkerSupported()) {
      return;
    }

    const sw = await navigator.serviceWorker.ready;
    const sub = await sw.pushManager.getSubscription();

    if (sub === null) {
      const convertedVapidPublicKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const newSub = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidPublicKey,
      });

      const response = await fetch("http://localhost:8000/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(newSub),
      });

      if (response.ok) {
        displayConfirmNotification();
      } else {
        console.error("Failed to store subscription on the server");
      }
    } else {
      // Possibly having to change that part
      await sub.unsubscribe();
      console.log("Unsubscribed");
    }
  } catch (err) {
    console.error("An error occurred:", err);
  }
}
