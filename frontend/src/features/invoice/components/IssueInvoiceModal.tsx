"use client";

import React, { useState } from "react";
import { issueInvoice } from "../api/invoice";
import { Invoice } from "../types/invoice";

interface IssueInvoiceModalProps {
  order: {
    id: string;
    poNumber: string;
    productName?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalAmount: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoice: Invoice) => void;
}

export function IssueInvoiceModal({ order, isOpen, onClose, onSuccess }: IssueInvoiceModalProps) {
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [hsnCode, setHsnCode] = useState("2901");
  const [gstRate, setGstRate] = useState<number>(18.0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time preview calculation
  const baseAmount = Number(order.quantity || 0) * Number(order.unitPrice || 0);
  const taxable = Math.max(0, baseAmount - Number(discountAmount || 0));
  const taxAmount = (taxable * Number(gstRate || 0)) / 100;
  const grandTotal = taxable + taxAmount + Number(additionalCharges || 0);

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const created = await issueInvoice({
        purchaseOrderId: order.id,
        dueDate,
        hsnCode: hsnCode.trim(),
        gstRate: Number(gstRate),
        discountAmount: Number(discountAmount),
        additionalCharges: Number(additionalCharges),
        notes: notes.trim() || undefined,
        termsAndConditions: termsAndConditions.trim() || undefined,
      });
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to issue tax invoice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Issue Official Tax Invoice</h3>
            <p className="text-xs text-slate-500 mt-0.5">Order Ref: {order.poNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleIssue} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Product Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {order.productName || "Chemical Cargo"}
              </p>
              <p className="text-slate-500 mt-0.5">
                Quantity: <span className="font-medium text-slate-700 dark:text-slate-300">{order.quantity} {order.unit}</span> @ ₹{order.unitPrice?.toLocaleString()} / {order.unit}
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Base Value:</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                ₹{baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                HSN Code *
              </label>
              <input
                type="text"
                required
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="e.g. 2901 or 2914"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                GST Rate (%) *
              </label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              >
                <option value={18.0}>18.00% (Standard Chemical GST)</option>
                <option value={12.0}>12.00%</option>
                <option value={5.0}>5.00%</option>
                <option value={28.0}>28.00%</option>
                <option value={0.0}>0.00% (Exempt / Nil Rated)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Additional Charges (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={additionalCharges}
                onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                placeholder="e.g. Freight / Packaging"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          </div>

          {/* Tax Calculation Live Preview */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Taxable Value:</span>
              <span className="font-medium text-slate-900 dark:text-white">₹{taxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Estimated GST ({gstRate}%):</span>
              <span className="font-medium text-slate-900 dark:text-white">₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-blue-200/50 dark:border-blue-900/40 font-bold text-sm text-blue-900 dark:text-blue-200">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Notes & Payment Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Direct bank transfer required. Reference invoice number in narration."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Issuing Tax Invoice..." : "Issue Tax Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
