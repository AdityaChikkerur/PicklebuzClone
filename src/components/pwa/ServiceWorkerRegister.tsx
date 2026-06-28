"use client";

import { useEffect } from "react";

const SW_VERSION = "picklebuzz-v2";

async function removeLegacyServiceWorkers(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map((registration) => registration.unregister())
  );

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("picklebuzz-"))
        .map((key) => caches.delete(key))
    );
  }
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    void (async () => {
      const storedVersion = localStorage.getItem("picklebuzz-sw-version");

      if (storedVersion !== SW_VERSION) {
        await removeLegacyServiceWorkers();
        localStorage.setItem("picklebuzz-sw-version", SW_VERSION);
      }

      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch {
        // Service worker registration is best-effort
      }
    })();
  }, []);

  return null;
}
