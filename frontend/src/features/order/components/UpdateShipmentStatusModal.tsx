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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4E4E7] rounded-[8px] shadow-tactile-modal max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Update Shipment Transit Status</h3>
              <p className="text-[11px] text-[#64748B]">Order #{poNumber}</p>
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
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-[6px] text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              New Shipment Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShipmentStatus("IN_TRANSIT")}
                className={`p-3 rounded-[6px] border text-left flex items-start gap-2.5 transition-all ${
                  shipmentStatus === "IN_TRANSIT"
                    ? "border-[#0284C7] bg-[#0284C7]/5 text-[#0284C7]"
                    : "border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569]"
                }`}
              >
                <Truck className="w-4 h-4 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">In Transit</div>
                  <div className="text-[10px] text-[#64748B]">Consignment on route with carrier</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShipmentStatus("DELIVERED")}
                className={`p-3 rounded-[6px] border text-left flex items-start gap-2.5 transition-all ${
                  shipmentStatus === "DELIVERED"
                    ? "border-[#059669] bg-[#059669]/5 text-[#059669]"
                    : "border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5" />
                <div>
                  <div className="text-xs font-bold">Delivered</div>
                  <div className="text-[10px] text-[#64748B]">Delivered to destination facility</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Carrier
              </label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="Transporter"
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking reference"
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Revised Estimated Delivery Date
            </label>
            <input
              type="date"
              value={estimatedDeliveryDate}
              onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Transit Update Notes
            </label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Arrived at Ahmedabad hub; out for local delivery to buyer warehouse."
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
              {loading ? "Updating..." : "Update Shipment Status"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
