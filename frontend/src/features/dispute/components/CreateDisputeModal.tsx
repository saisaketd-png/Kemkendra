"use client";

import React, { useState, useRef } from "react";
import { createDispute } from "../api/dispute";
import { Dispute, DisputeReason } from "../types/dispute";

interface CreateDisputeModalProps {
  invoiceId?: string;
  invoiceNumber?: string;
  purchaseOrderId?: string;
  poNumber?: string;
  defaultAmount?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (dispute: Dispute) => void;
}

const REASON_OPTIONS: { value: DisputeReason; label: string; description: string }[] = [
  {
    value: "PAYMENT_NOT_RECEIVED",
    label: "Payment Not Received",
    description: "Buyer claimed payment was made, but funds have not credited after clearance window",
  },
  {
    value: "INCORRECT_PAYMENT_AMOUNT",
    label: "Incorrect Payment Amount",
    description: "Transferred amount does not match invoice or agreed installment figure",
  },
  {
    value: "INVALID_PAYMENT_PROOF",
    label: "Invalid Payment Proof",
    description: "Uploaded bank receipt or UTR appears illegible, mismatched, or counterfeit",
  },
  {
    value: "DUPLICATE_PAYMENT",
    label: "Duplicate Payment Entry",
    description: "Same UTR or transfer was submitted multiple times against this transaction",
  },
  {
    value: "INVOICE_MISMATCH",
    label: "Invoice or GST Mismatch",
    description: "Calculated tax, GSTIN, place of supply, or items on invoice differ from purchase order",
  },
  {
    value: "ORDER_DELIVERY_ISSUE",
    label: "Order Delivery or Spec Issue",
    description: "Chemical specification, COA discrepancy, or delivery failure affecting payment terms",
  },
  {
    value: "OTHER",
    label: "Other Commercial Dispute",
    description: "Other contractual or bank clearance issue requiring platform adjudication",
  },
];

export function CreateDisputeModal({
  invoiceId,
  invoiceNumber,
  purchaseOrderId,
  poNumber,
  defaultAmount,
  isOpen,
  onClose,
  onSuccess,
}: CreateDisputeModalProps) {
  const [reason, setReason] = useState<DisputeReason>("PAYMENT_NOT_RECEIVED");
  const [customReason, setCustomReason] = useState("");
  const [description, setDescription] = useState("");
  const [disputedAmount, setDisputedAmount] = useState<string>(defaultAmount ? String(defaultAmount) : "");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("Evidence document exceeds maximum allowed 10MB limit.");
        return;
      }
      setAttachment(file);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe the dispute details and reason for resolution request.");
      return;
    }
    if (reason === "OTHER" && !customReason.trim()) {
      setError("Please specify your reason for raising this dispute.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dispute = await createDispute(
        {
          invoiceId: invoiceId || undefined,
          purchaseOrderId: purchaseOrderId || undefined,
          reason,
          customReason: reason === "OTHER" ? customReason.trim() : undefined,
          description: description.trim(),
          disputedAmount: disputedAmount ? parseFloat(disputedAmount) : undefined,
          currency: "INR",
        },
        attachment || undefined
      );

      onSuccess(dispute);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to raise dispute");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Raise Commercial Dispute</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {invoiceNumber ? `Invoice: ${invoiceNumber}` : poNumber ? `Order: ${poNumber}` : "Direct Transaction"}
            </p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Dispute Category *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DisputeReason)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              {REASON_OPTIONS.find((o) => o.value === reason)?.description}
            </p>
          </div>

          {reason === "OTHER" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Custom Dispute Subject *
              </label>
              <input
                type="text"
                required
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Brief summary of dispute"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Disputed Amount (INR, Optional)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={disputedAmount}
              onChange={(e) => setDisputedAmount(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Detailed Description & Evidence *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the specific issue, dates of communication, bank statement remarks, or what resolution is requested..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Supporting Evidence Document (Bank Statement, COA, Email PDF)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />
              {attachment ? (
                <div className="flex items-center justify-between text-left p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{attachment.name}</p>
                      <p className="text-[11px] text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttachment(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-rose-500 hover:text-rose-700 p-1 text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <svg className="w-6 h-6 mx-auto text-slate-400 group-hover:text-primary transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Click to attach statement, proof or email export
                  </p>
                  <p className="text-[11px] text-slate-400">PDF, PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
            Submitting this dispute will notify the counterparty and escalate to KemKendra transaction operations. Both parties can exchange messages and evidence until resolved.
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting Dispute..." : "Submit Dispute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
