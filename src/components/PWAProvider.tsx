"use client";

import { useEffect } from "react";

export function PWAProvider() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              if (typeof window !== "undefined" && window.confirm("New version available. Reload?")) {
                window.location.reload();
              }
            }
          });
        });
      } catch (e) {
        console.warn("Service worker registration failed:", e);
      }
    };
    register();
  }, []);
  return null;
}
