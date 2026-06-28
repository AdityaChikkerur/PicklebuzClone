"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";

export function CapacitorSplash() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;
    setVisible(true);

    async function dismissSplash() {
      const minDisplayMs = 900;
      const startedAt = Date.now();

      const waitForReady = () =>
        new Promise<void>((resolve) => {
          if (document.readyState === "complete") {
            resolve();
            return;
          }
          window.addEventListener("load", () => resolve(), { once: true });
        });

      await waitForReady();
      const elapsed = Date.now() - startedAt;
      if (elapsed < minDisplayMs) {
        await new Promise((resolve) => setTimeout(resolve, minDisplayMs - elapsed));
      }
      if (cancelled) return;

      setFading(true);
      await new Promise((resolve) => setTimeout(resolve, 380));
      if (cancelled) return;

      try {
        await SplashScreen.hide();
      } catch {
        // Splash may already be hidden on some devices.
      }

      setVisible(false);
    }

    void dismissSplash();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-400",
        fading ? "opacity-0" : "opacity-100"
      )}
      aria-hidden={fading}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-[38%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      <div className="relative flex flex-col items-center gap-6 px-8 text-center">
        <div className="animate-float">
          <AppIcon size={88} />
        </div>
        <div>
          <p className="font-display text-4xl font-black italic leading-none tracking-tight">
            <span className="text-foreground">Pickle</span>
            <span className="text-primary">Buzz</span>
          </p>
          <p className="tagline mt-3 text-[10px] tracking-[0.35em]">PLAY • CONNECT • COMPETE</p>
        </div>
        <div className="h-[3px] w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/5 animate-pulse rounded-full bg-primary/80" />
        </div>
      </div>
    </div>
  );
}
