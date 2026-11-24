"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  FileCheck,
  Send,
} from "lucide-react";
import { QuotationResponse } from "../api/submitQuotation";
import { acceptQuotation } from "../api/acceptQuotation";
import { rejectQuotation } from "../api/rejectQuotation";

interface QuotationComparisonProps {
  quotations: QuotationResponse[];
  rfqStatus: string;
  rfqId: string;
  onDecisionSuccess?: () => void;
  onOpenCounterOffer?: () => void;
}

export function QuotationComparison({
  quotations,
  rfqStatus,
  rfqId,
  onDecisionSuccess,
  onOpenCounterOffer,
}: QuotationComparisonProps) {
  const [modalMode, setModalMode] = useState<"accept" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  if (!quotations || quotations.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-tactile-card">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">
          Awaiting Commercial Quotation
        </h3>
        <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 leading-relaxed">
          The verified manufacturer has received your inquiry and is preparing a formal commercial quotation with pricing and lead times.
        </p>
      </div>
    );
  }

  const latestQuotation = quotations[0];
  const previousQuotation = quotations.length > 1 ? quotations[1] : null;
  const canBuyerAct = (rfqStatus === "QUOTED" || rfqStatus === "COUNTERED") && latestQuotation.actorType !== "BUYER";

  async function handleConfirmDecision() {
    if (!modalMode) return;
    try {
      setSubmitting(true);
      setDecisionError(null);

      if (modalMode === "accept") {
        await acceptQuotation(rfqId, latestQuotation.id, notes.trim() || undefined);
      } else {
        await rejectQuotation(rfqId, latestQuotation.id, notes.trim() || undefined);
      }

      setModalMode(null);
      setNotes("");
      if (onDecisionSuccess) {
        onDecisionSuccess();
      }
    } catch (err) {
      setDecisionError(
        err instanceof Error ? err.message : "Failed to submit quotation decision"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const formatActionLabel = (action?: string | null) => {
    switch (action) {
      case "COUNTER_OFFER":
        return "Counter Offer";
      case "REVISED_QUOTATION":
        return "Revised Quotation";
      case "INITIAL_QUOTATION":
      default:
        return "Initial Proposal";
    }
  };

  // Price delta helper
  const getPriceDelta = (current: number, prev: number | null | undefined) => {
    if (prev == null || prev === 0) return null;
    const diff = current - prev;
    const pct = ((diff / prev) * 100).toFixed(1);
    return { diff, pct, isLower: diff < 0, isHigher: diff > 0 };
  };

  // Turn ownership determination
  const turnIndicator = useMemo(() => {
    if (rfqStatus === "ACCEPTED") {
      return {
        label: "Quotation Accepted & Finalized",
        variant: "success",
        subtext: "Commercial terms agreed. Ready to generate Purchase Order.",
      };
    }
    if (rfqStatus === "REJECTED") {
      return {
        label: "Quotation Declined",
        variant: "danger",
        subtext: "Commercial proposal was declined.",
      };
    }
    if (rfqStatus === "CLOSED" || rfqStatus === "CANCELLED") {
      return {
        label: "Inquiry Closed",
        variant: "neutral",
        subtext: "This procurement inquiry is no longer active.",
      };
    }
    if (latestQuotation.actorType === "SUPPLIER") {
      return {
        label: "Your Turn to Respond",
        variant: "warning",
        subtext: "Supplier submitted proposal. You may Accept, Reject, or propose a Counter-Offer.",
      };
    }
    if (latestQuotation.actorType === "BUYER") {
      return {
        label: "Awaiting Supplier Response",
        variant: "brand",
        subtext: "Your counter-offer was dispatched. Awaiting manufacturer response.",
      };
    }
    return {
      label: "Negotiation in Progress",
      variant: "neutral",
      subtext: "Multi-round commercial proposal exchange in progress.",
    };
  }, [rfqStatus, latestQuotation]);

  const delta = previousQuotation ? getPriceDelta(latestQuotation.unitPrice, previousQuotation.unitPrice) : null;

  return (
    <div className="space-y-6">
      {/* Turn Ownership Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          turnIndicator.variant === "warning"
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : turnIndicator.variant === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : turnIndicator.variant === "danger"
            ? "bg-rose-50 border-rose-200 text-rose-800"
            : turnIndicator.variant === "brand"
            ? "bg-blue-50 border-blue-200 text-blue-800"
            : "bg-[#F8F9FA] border-slate-200 text-[#64748B]"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              turnIndicator.variant === "warning"
                ? "bg-amber-100 text-amber-900 font-bold"
                : turnIndicator.variant === "success"
                ? "bg-emerald-100 text-emerald-800"
                : turnIndicator.variant === "danger"
                ? "bg-rose-100 text-rose-800"
                : turnIndicator.variant === "brand"
                ? "bg-blue-100 text-blue-800"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {turnIndicator.label}
          </span>
          <span className="text-xs font-medium">{turnIndicator.subtext}</span>
        </div>
      </div>

      {/* 1. LATEST / CURRENT ACTIVE QUOTATION CARD */}
      <div className="bg-white border-2 border-[#0052CC] rounded-2xl shadow-tactile-card overflow-hidden">
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-[#091E42] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold bg-[#0052CC] text-white px-2.5 py-1 rounded-md">
              Current Quotation — Version {latestQuotation.quotationVersion}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {formatActionLabel(latestQuotation.actionType)} by {latestQuotation.actorType === "BUYER" ? "Buyer (You)" : "Supplier"}
            </span>
          </div>

          <span className="text-xs text-slate-300">
            {new Date(latestQuotation.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Commercial Figures */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-slate-200">
            {/* Unit Price */}
            <div>
              <span className="text-xs font-semibold text-[#64748B] block mb-1">
                Agreed Unit Price
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#0F172A]">
                  {latestQuotation.currency} {latestQuotation.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                {delta && (
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                      delta.isLower
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : delta.isHigher
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {delta.isLower ? "↓" : "↑"} {Math.abs(Number(delta.pct))}%
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#64748B]">per standard unit</span>
            </div>

            {/* Minimum Order Quantity */}
            <div>
              <span className="text-xs font-semibold text-[#64748B] block mb-1">
                Minimum Order Quantity (MOQ)
              </span>
              <span className="text-xl font-bold text-[#0F172A] block">
                {latestQuotation.minimumOrderQuantity != null
                  ? `${latestQuotation.minimumOrderQuantity.toLocaleString()} Units`
                  : "Standard"}
              </span>
              <span className="text-[11px] text-[#64748B]">Production threshold</span>
            </div>

            {/* Fulfillment Lead Time */}
            <div>
              <span className="text-xs font-semibold text-[#64748B] block mb-1">
                Fulfillment Lead Time
              </span>
              <span className="text-xl font-bold text-[#0F172A] block">
                {latestQuotation.leadTimeDays != null ? `${latestQuotation.leadTimeDays} Days` : "Standard"}
              </span>
              <span className="text-[11px] text-[#64748B]">Upon order confirmation</span>
            </div>

            {/* Validity Date */}
            <div>
              <span className="text-xs font-semibold text-[#64748B] block mb-1">
                Quotation Validity
              </span>
              <span className="text-base font-bold text-[#0F172A] block">
                {latestQuotation.validityDate
                  ? new Date(latestQuotation.validityDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "30 Days"}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">Valid Commercial Offer</span>
            </div>
          </div>

          {/* Secondary Details & Commercial Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-xs font-semibold text-[#64748B] block mb-1">
                Packaging & Presentation
              </span>
              <p className="font-medium text-[#0F172A]">
                {latestQuotation.packagingDetails || "Standard industrial protective drums / containers"}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#64748B] block mb-1">
                Commercial Terms & Notes
              </span>
              <p className="font-medium text-[#0F172A] italic bg-[#F8F9FA] p-3 rounded-lg border border-slate-200">
                {latestQuotation.commercialNotes || "Standard B2B commercial terms and quality warranty apply."}
              </p>
            </div>
          </div>

          {/* Commercial Message (if Counter-Offer) */}
          {latestQuotation.commercialMessage && (
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-xs">
              <span className="text-xs font-semibold text-[#0052CC] block mb-1">
                Commercial Counter Rationale
              </span>
              <p className="text-[#0F172A] font-medium leading-relaxed">
                "{latestQuotation.commercialMessage}"
              </p>
            </div>
          )}

          {/* Action Bar for Buyer Decisioning */}
          {canBuyerAct && (
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F8F9FA] -mx-6 -mb-6 p-6">
              <div className="text-xs text-[#64748B]">
                <strong className="text-[#0F172A] block">Action Required</strong>
                Review the supplier's commercial proposal and select your decision.
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalMode("reject")}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 hover:border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors shadow-2xs press-tactile"
                >
                  Decline Proposal
                </button>

                {onOpenCounterOffer && (
                  <button
                    type="button"
                    onClick={onOpenCounterOffer}
                    className="px-5 py-2.5 rounded-lg border border-[#0052CC] text-[#0052CC] hover:bg-blue-50 text-xs font-semibold transition-colors shadow-2xs press-tactile"
                  >
                    Counter Offer
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setModalMode("accept")}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 press-tactile"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Quotation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. QUOTATION REVISION & NEGOTIATION TIMELINE */}
      {quotations.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-tactile-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Commercial Negotiation History
              </h3>
              <p className="text-xs text-[#64748B]">Previous versions and proposal progression</p>
            </div>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {quotations.length} Versions Logged
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {quotations.map((quote, idx) => {
              const isCurrent = idx === 0;
              const isBuyer = quote.actorType === "BUYER";

              return (
                <div key={quote.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          isBuyer ? "bg-blue-50 text-[#0052CC] border border-blue-200" : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        {isBuyer ? "Buyer" : "Supplier"}
                      </span>
                      <strong className="text-xs font-bold text-[#0F172A]">
                        V{quote.quotationVersion} · {formatActionLabel(quote.actionType)}
                      </strong>
                      {isCurrent && (
                        <span className="text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md">
                          Latest
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#64748B] block">
                      {new Date(quote.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-[11px] text-[#64748B] block">Price</span>
                      <span className="font-bold text-[#0F172A]">
                        {quote.currency} {quote.unitPrice.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">MOQ</span>
                      <span className="font-bold text-[#0F172A]">
                        {quote.minimumOrderQuantity != null ? `${quote.minimumOrderQuantity} U` : "—"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#64748B] block">Lead Time</span>
                      <span className="font-bold text-[#0F172A]">
                        {quote.leadTimeDays != null ? `${quote.leadTimeDays}d` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ACCEPT / REJECT CONFIRMATION MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 bg-[#091E42] text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {modalMode === "accept" ? "Accept Commercial Quotation" : "Decline Quotation"}
              </h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {decisionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
                  {decisionError}
                </div>
              )}

              <p className="text-[#0F172A] leading-relaxed">
                {modalMode === "accept"
                  ? `You are accepting Version ${latestQuotation.quotationVersion} at ${latestQuotation.currency} ${latestQuotation.unitPrice.toFixed(2)} / unit. Once accepted, you will be able to issue the binding Purchase Order.`
                  : `Are you sure you want to decline this quotation? You may optionally include a message explaining why.`}
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Optional Remarks / Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Terms accepted. Ready for standard delivery schedule."
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDecision}
                  disabled={submitting}
                  className={`px-5 py-2 rounded-lg text-white text-xs font-semibold transition-colors shadow-2xs press-tactile ${
                    modalMode === "accept"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submitting ? "Processing..." : modalMode === "accept" ? "Confirm Acceptance" : "Decline"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
