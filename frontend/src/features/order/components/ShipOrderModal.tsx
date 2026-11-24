"use client";

import { useState } from "react";
import { ShipOrderRequest } from "@/features/order/api/fulfillment";

interface ShipOrderModalProps {
  orderId: string;
  poNumber: string;
  onClose: () => void;
  onSubmit: (data: ShipOrderRequest) => Promise<void>;
}

export function ShipOrderModal({
  orderId,
  poNumber,
  onClose,
  onSubmit,
}: ShipOrderModalProps) {
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!carrier.trim() || !trackingNumber.trim()) {
      setError("Carrier and tracking number are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        carrier: carrier.trim(),
        trackingNumber: trackingNumber.trim(),
        estimatedDeliveryDate: estimatedDeliveryDate ? estimatedDeliveryDate : undefined,
      });
      // Component unmounts on success via parent, or closes
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ship order");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between">
          <div>
            <span className="block text-xs font-semibold text-[#0052CC] mb-1">
              Fulfillment Operation
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Dispatch Consignment Shipment
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              PO Reference: <span className="font-mono font-semibold text-slate-900">{poNumber}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}

          <form id="shipOrderForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="carrier" className="block text-xs font-semibold text-slate-700">
                Logistics Carrier <span className="text-rose-500">*</span>
              </label>
              <input
                id="carrier"
                type="text"
                required
                disabled={submitting}
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. Blue Dart, DHL Express, V-Trans, FedEx"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="trackingNumber" className="block text-xs font-semibold text-slate-700">
                AWB / Waybill Tracking Number <span className="text-rose-500">*</span>
              </label>
              <input
                id="trackingNumber"
                type="text"
                required
                disabled={submitting}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Consignment Tracking Code"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="estimatedDeliveryDate" className="block text-xs font-semibold text-slate-700">
                Estimated Delivery Date (Optional)
              </label>
              <input
                id="estimatedDeliveryDate"
                type="date"
                disabled={submitting}
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors"
              />
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-100 p-5 bg-slate-50/70 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="shipOrderForm"
            disabled={submitting || !carrier.trim() || !trackingNumber.trim()}
            className="h-10 px-5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            {submitting ? "Transmitting..." : "Confirm & Ship Consignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
