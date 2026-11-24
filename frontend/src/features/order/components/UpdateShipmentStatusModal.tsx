"use client";

import React, { useState } from "react";
import { Truck, X, AlertCircle, Calendar, Hash, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/KemkendraUI";
import { UpdateShipmentStatusRequest, ShipmentResponse } from "../api/fulfillment";

interface UpdateShipmentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: UpdateShipmentStatusRequest) => Promise<void>;
  poNumber: string;
  currentShipment?: ShipmentResponse | null;
}

export function UpdateShipmentStatusModal({
  isOpen,
  onClose,
  onConfirm,
  poNumber,
  currentShipment,
}: UpdateShipmentStatusModalProps) {
  const [shipmentStatus, setShipmentStatus] = useState<"IN_TRANSIT" | "DELIVERED">("IN_TRANSIT");
  const [trackingNumber, setTrackingNumber] = useState(currentShipment?.trackingNumber || "");
  const [carrier, setCarrier] = useState(currentShipment?.carrier || "");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(currentShipment?.estimatedDeliveryDate || "");
  const [deliveryNotes, setDeliveryNotes] = useState(currentShipment?.deliveryNotes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onConfirm({
        shipmentStatus,
        trackingNumber: trackingNumber.trim() ? trackingNumber.trim() : undefined,
        carrier: carrier.trim() ? carrier.trim() : undefined,
        estimatedDeliveryDate: estimatedDeliveryDate ? estimatedDeliveryDate : undefined,
        deliveryNotes: deliveryNotes.trim() ? deliveryNotes.trim() : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update shipment status");
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
              <h3 className="text-base font-bold text-slate-900">Update Shipment Transit Status</h3>
              <p className="text-xs text-slate-500">Order <span className="font-mono font-semibold text-slate-800">#{poNumber}</span></p>
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
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              New Shipment Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShipmentStatus("IN_TRANSIT")}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition-[border-color,background-color] duration-150 cursor-pointer ${
                  shipmentStatus === "IN_TRANSIT"
                    ? "border-[#0052CC] bg-blue-50/50 text-[#0052CC]"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Truck className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">In Transit</div>
                  <div className="text-[11px] text-slate-500">Consignment on route with carrier</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShipmentStatus("DELIVERED")}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition-[border-color,background-color] duration-150 cursor-pointer ${
                  shipmentStatus === "DELIVERED"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-700"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Delivered</div>
                  <div className="text-[11px] text-slate-500">Delivered to destination facility</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Carrier
              </label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="Transporter"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking reference"
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Revised Estimated Delivery Date
            </label>
            <input
              type="date"
              value={estimatedDeliveryDate}
              onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transit Update Notes
            </label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Arrived at Ahmedabad hub; out for local delivery to buyer warehouse."
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
              {loading ? "Updating..." : "Update Shipment Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
