/**
 * Lightweight privacy-conscious client tracking utility for KemKendra marketing events.
 * Fire-and-forget: does not block UI interactions or collect sensitive personal information.
 */

export type MarketingEventType =
  | "PRODUCT_VIEW"
  | "SEARCH"
  | "CATEGORY_VIEW"
  | "SUPPLIER_VIEW"
  | "REG_START"
  | "REG_COMPLETE"
  | "RFQ_START"
  | "RFQ_SUBMIT"
  | "CONTACT_SUBMIT";

export function trackMarketingEvent(
  eventType: MarketingEventType,
  identifier?: string,
  category?: string
): void {
  if (typeof window === "undefined") return;

  const payload = {
    eventType,
    identifier: identifier ? String(identifier).slice(0, 100) : undefined,
    category: category ? String(category).slice(0, 100) : undefined,
  };

  try {
    const bodyStr = JSON.stringify(payload);
    // Use keepalive fetch or sendBeacon for uninterrupted delivery during page transitions
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([bodyStr], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/v1/public/analytics/track", blob);
      if (sent) return;
    }

    fetch("/api/v1/public/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyStr,
      keepalive: true,
    }).catch(() => {
      // Intentionally silent: marketing tracking must never throw uncaught UI errors
    });
  } catch {
    // Silent fallback
  }
}
