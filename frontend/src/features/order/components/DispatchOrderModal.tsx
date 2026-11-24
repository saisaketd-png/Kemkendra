"use client";

import React, { useState } from "react";
import { Truck, X, AlertCircle, Info, Calendar, Hash, FileText } from "lucide-react";
import { Button } from "@/shared/components/ui/KemkendraUI";
import { DispatchOrderRequest } from "../api/fulfillment";

interface DispatchOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: DispatchOrderRequest) => Promise<void>;
  poNumber: string;
  productName: string;
}

export function DispatchOrderModal({
  isOpen,
  onClose,
  onConfirm,
  poNumber,
  productName,
}: DispatchOrderModalProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [dispatchDate, setDispatchDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError("Please provide a consignment tracking number or consignment reference ID.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm({
        trackingNumber: trackingNumber.trim(),
        carrier: carrier.trim() ? carrier.trim() : undefined,
        dispatchDate: dispatchDate ? new Date(dispatchDate).toISOString() : undefined,
        estimatedDeliveryDate: estimatedDeliveryDate ? estimatedDeliveryDate : undefined,
        deliveryNotes: deliveryNotes.trim() ? deliveryNotes.trim() : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record order dispatch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 sm:px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0052CC] border border-blue-100 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Dispatch Consignment</h3>
              <p className="text-xs text-slate-500">Order <span className="font-mono font-semibold text-slate-800">#{poNumber}</span> &bull; {productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-start gap-2.5 bg-emerald-50/70 border border-emerald-200/70 p-3.5 rounded-xl text-xs text-emerald-800">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <strong>Self-Managed Logistics:</strong> KemKendra tracks status updates. Enter the consignment details from your freight partner or internal delivery fleet.
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tracking / LR / Waybill Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. VRL-BLR-89210 or TRK98765432"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Carrier / Transporter Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Truck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. VRL Logistics, TCI Express, In-house Fleet"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dispatch Date & Time
              </label>
              <input
                type="datetime-local"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimated Delivery Date
              </label>
              <input
                type="date"
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Dispatch / Handover Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. 10 drums sealed with nitrogen blankets. Handling instructions attached to outer packaging."
              rows={3}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? "Dispatching..." : "Confirm Consignment Dispatch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
