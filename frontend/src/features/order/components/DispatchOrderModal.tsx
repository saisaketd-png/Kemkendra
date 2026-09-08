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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4E4E7] rounded-[8px] shadow-tactile-modal max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Dispatch Consignment</h3>
              <p className="text-[11px] text-[#64748B]">Order #{poNumber} &bull; {productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-[4px] hover:bg-[#E4E4E7] text-[#64748B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex items-start gap-2 bg-[#F0FDF4] border border-[#DCFCE7] p-3 rounded-[6px] text-xs text-[#15803D]">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Self-Managed Logistics:</strong> KemKendra tracks status updates. Enter the consignment details from your freight partner or internal delivery fleet.
            </div>
          </div>

          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-[6px] text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Tracking / LR / Waybill Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. VRL-BLR-89210 or TRK98765432"
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-[6px] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Carrier / Transporter Name <span className="text-[#94A3B8] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Truck className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. VRL Logistics, TCI Express, In-house Fleet"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-[6px] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Dispatch Date & Time
              </label>
              <input
                type="datetime-local"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Estimated Delivery Date
              </label>
              <input
                type="date"
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Dispatch / Handover Notes <span className="text-[#94A3B8] font-normal">(Optional)</span>
            </label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. 10 drums sealed with nitrogen blankets. Handling instructions attached to outer packaging."
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="text-xs bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold"
            >
              {loading ? "Dispatching..." : "Confirm Consignment Dispatch"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
