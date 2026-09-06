"use client";

import React, { useState } from "react";
import { AlertTriangle, X, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/KemkendraUI";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  poNumber: string;
}

export function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  poNumber,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError("Please provide a reason for cancellation (minimum 5 characters).");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(reason.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4E4E7] rounded-[8px] shadow-tactile-modal max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Cancel Purchase Order</h3>
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
          <p className="text-xs text-[#64748B] leading-relaxed">
            Cancellation is only permitted prior to consignment dispatch. Both parties will be formally notified of this cancellation.
          </p>

          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-[6px] text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Project timeline deferred, supplier unable to fulfill required grade, mutual cancellation agreement."
              rows={3}
              required
              className="w-full px-3 py-2 text-xs rounded-[6px] border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="text-xs bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold"
            >
              {loading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
