"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    function handleOnline() {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    }

    function handleOffline() {
      setIsOnline(false);
      setShowReconnected(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-0 inset-x-0 z-[9999] py-1.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${
        !isOnline ? "bg-[#DC2626] text-white" : "bg-[#059669] text-white"
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
          <span>You are currently offline. Some features may be unavailable.</span>
        </>
      ) : (
        <>
          <Wifi className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Internet connection restored.</span>
        </>
      )}
    </div>
  );
}
