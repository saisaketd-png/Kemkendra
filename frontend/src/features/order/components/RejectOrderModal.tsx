"use client";

import { useState } from "react";

interface RejectOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  poNumber: string;
}

export function RejectOrderModal({
  isOpen,
  onClose,
  onConfirm,
  poNumber,
}: RejectOrderModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError("Rejection reason must be at least 5 characters.");
      return;
    }
    if (trimmed.length > 1000) {
      setError("Rejection reason cannot exceed 1000 characters.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="border-b border-slate-100 bg-slate-50/70 p-5 sm:p-6">
          <span className="block text-xs font-semibold text-rose-600 mb-1">
            Critical Commercial Action
          </span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Decline Purchase Order
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            PO Reference: <span className="font-mono font-semibold text-slate-900">{poNumber}</span>
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Operational Rejection Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              rows={4}
              placeholder="Provide a clear, detailed commercial or operational justification (e.g. inability to meet requested lot specifications, regulatory restrictions, or material stock outage)..."
              className="w-full text-xs rounded-lg p-3 bg-white border border-slate-300 focus:border-[#0052CC] text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0052CC]/20 shadow-2xs transition-colors resize-y"
              disabled={loading}
              required
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
              <span>Minimum 5 characters</span>
              <span className={reason.length > 1000 ? "text-rose-600 font-bold" : "font-mono"}>
                {reason.length}/1000
              </span>
            </div>
          </div>

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
              disabled={loading || reason.trim().length < 5}
              className="h-10 px-5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Rejection</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
