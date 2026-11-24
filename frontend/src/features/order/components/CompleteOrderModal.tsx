"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, X, ShieldCheck, FileCheck, PackageCheck, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/KemkendraUI";

interface CompleteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  poNumber: string;
  counterpartLabel: string;
  counterpartName?: string | null;
  productName: string;
  quantity: number | string;
  unit: string;
  totalAmount?: number;
  currency?: string;
}

export function CompleteOrderModal({
  isOpen,
  onClose,
  onConfirm,
  poNumber,
  counterpartLabel,
  counterpartName,
  productName,
  quantity,
  unit,
  totalAmount,
  currency = "INR",
}: CompleteOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete purchase order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-[#F8F9FA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Transaction Settlement
              </span>
              <h2 className="text-base font-bold text-[#0F172A] mt-1 tracking-tight">
                Complete Purchase Order
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            You are about to mark this purchase order as <strong className="text-[#0F172A] font-semibold">COMPLETED</strong>. This confirms that all ordered chemical materials have been delivered, verified, and commercial obligations are fulfilled.
          </p>

          {/* Order Summary Card */}
          <div className="bg-[#F8F9FA] border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Order Number:</span>
              <span className="font-bold text-[#0052CC]">{poNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">{counterpartLabel}:</span>
              <span className="font-semibold text-[#0F172A]">{counterpartName || "Verified Enterprise"}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Chemical Compound:</span>
              <span className="font-semibold text-[#0F172A]">{productName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Delivered Volume:</span>
              <span className="font-semibold text-[#0F172A]">{quantity} {unit}</span>
            </div>
            {totalAmount !== undefined && (
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-slate-600 font-semibold">Total Commercial Value:</span>
                <span className="font-bold text-sm text-emerald-700">
                  {currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-[#0052CC]">
            <ShieldCheck className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block text-[#0F172A] font-semibold">Commercial & Archival Settlement</strong>
              <p className="leading-relaxed text-[11px] text-slate-600">
                Completing this order locks the commercial ledger, informs the counterparty via instant notification, and permanently archives the transaction record in the platform audit vault.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 bg-[#F8F9FA] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="h-10 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors press-tactile disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Completing...
              </span>
            ) : (
              "Confirm & Settle Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
