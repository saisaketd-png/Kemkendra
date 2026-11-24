"use client";

import { useState } from "react";
import { X, ShieldCheck, FileCheck2, Clock, Send, RefreshCw, AlertCircle, Building2, MapPin, Phone } from "lucide-react";
import { createOrder, PurchaseOrderResponse } from "../api/createOrder";

interface IssuePoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: PurchaseOrderResponse) => void;
  rfqId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  currency: string;
  leadTimeDays?: number | null;
}

export function IssuePoModal({
  isOpen,
  onClose,
  onSuccess,
  rfqId,
  productName,
  quantity,
  unit,
  unitPrice,
  currency,
  leadTimeDays,
}: IssuePoModalProps) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [billingContact, setBillingContact] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmount = quantity * unitPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim() || !billingContact.trim()) {
      setError("Please provide both shipping address and billing/procurement contact details.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const order = await createOrder({
        rfqId,
        shippingAddress: shippingAddress.trim(),
        billingContact: billingContact.trim(),
        notes: notes.trim() || undefined,
      });

      window.dispatchEvent(new CustomEvent("rfq-updated", { detail: { rfqId } }));
      window.dispatchEvent(new CustomEvent("notifications-updated"));
      onSuccess(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate purchase order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#F8F9FA] border-b border-slate-200 text-[#0F172A] flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
              Issue Formal Purchase Order
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Execute a binding commercial contract with the verified supplier.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Agreed Commercial Terms Summary (Read-Only Snapshot) */}
          <div className="bg-[#F8F9FA] border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-semibold text-[#0F172A]">
                Agreed Quotation Terms
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Locked Commercial Agreement
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-[#64748B] block">Product</span>
                <strong className="font-bold text-[#0F172A] truncate block mt-0.5">{productName}</strong>
              </div>

              <div>
                <span className="text-[11px] text-[#64748B] block">Quantity</span>
                <span className="font-bold text-[#0F172A] block mt-0.5">
                  {quantity.toLocaleString()} {unit.toUpperCase()}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#64748B] block">Unit Price</span>
                <span className="font-bold text-[#0F172A] block mt-0.5">
                  {currency} {unitPrice.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#64748B] block">Total Amount</span>
                <strong className="font-bold text-sm text-emerald-700 block mt-0.5">
                  {currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {leadTimeDays && (
              <div className="text-xs text-[#64748B] border-t border-slate-200 pt-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0052CC]" />
                <span>Committed Delivery SLA:</span>
                <strong className="text-[#0F172A]">{leadTimeDays} business days upon confirmation</strong>
              </div>
            )}
          </div>

          {/* Operational Input Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Delivery / Shipping Address <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="e.g. Warehouse 4B, 100 Industrial Chemical Logistics Hub, Navi Mumbai, MH 400705"
                className="w-full text-xs rounded-lg border border-slate-300 p-3 text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Billing / Procurement Contact <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                required
                value={billingContact}
                onChange={(e) => setBillingContact(e.target.value)}
                placeholder="e.g. procurement@pharmaholdings.com / +91 98765 43210 (Accounts Dept)"
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2.5 text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Special Logistics / Delivery Notes <span className="text-[#64748B] font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Temperature sensitive batch. Receiving dock 8am-4pm. Forklift available on site."
                className="w-full text-xs rounded-lg border border-slate-300 p-3 text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto h-10 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto h-10 px-5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 press-tactile"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PO...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm & Issue Purchase Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
