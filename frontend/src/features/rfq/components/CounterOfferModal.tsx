"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRight,
  Package,
  Layers,
  Scale,
} from "lucide-react";
import { CreateCounterOfferRequest, submitCounterOffer } from "../api/submitCounterOffer";
import { QuotationResponse } from "../api/submitQuotation";

interface CounterOfferModalProps {
  rfqId: string;
  chemicalName?: string;
  requestedQuantity?: number;
  unit?: string;
  initialUnitPrice?: number;
  initialCurrency?: string;
  initialMoq?: number;
  initialLeadTimeDays?: number;
  initialPackaging?: string;
  onClose: () => void;
  onSuccess: (quotation: QuotationResponse) => void;
}

export function CounterOfferModal({
  rfqId,
  chemicalName = "Chemical Raw Material",
  requestedQuantity = 100,
  unit = "KG",
  initialUnitPrice,
  initialCurrency = "INR",
  initialMoq,
  initialLeadTimeDays,
  initialPackaging,
  onClose,
  onSuccess,
}: CounterOfferModalProps) {
  const [formData, setFormData] = useState<Partial<CreateCounterOfferRequest>>({
    unitPrice: initialUnitPrice,
    currency: initialCurrency || "INR",
    minimumOrderQuantity: initialMoq,
    leadTimeDays: initialLeadTimeDays,
    packagingDetails: initialPackaging || "",
    commercialMessage: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "unitPrice" || name === "minimumOrderQuantity" || name === "leadTimeDays"
          ? value === ""
            ? undefined
            : Number(value)
          : value,
    }));
  };

  const applyPercentReduction = (percent: number) => {
    if (!initialUnitPrice) return;
    const discounted = initialUnitPrice * (1 - percent / 100);
    setFormData((prev) => ({
      ...prev,
      unitPrice: Math.round(discounted * 100) / 100,
    }));
  };

  const currentEstimatedTotal =
    requestedQuantity && formData.unitPrice ? requestedQuantity * formData.unitPrice : 0;
  const previousEstimatedTotal =
    requestedQuantity && initialUnitPrice ? requestedQuantity * initialUnitPrice : 0;

  // Commercial delta calculation
  const unitPriceDelta =
    formData.unitPrice && initialUnitPrice ? formData.unitPrice - initialUnitPrice : 0;
  const percentDelta =
    initialUnitPrice && initialUnitPrice > 0 && unitPriceDelta !== 0
      ? (unitPriceDelta / initialUnitPrice) * 100
      : 0;
  const totalSavings =
    previousEstimatedTotal > 0 && currentEstimatedTotal > 0
      ? previousEstimatedTotal - currentEstimatedTotal
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.unitPrice || formData.unitPrice <= 0) {
      setError("Counter unit price must be greater than zero.");
      return;
    }

    if (!formData.commercialMessage || !formData.commercialMessage.trim()) {
      setError("Please provide a commercial rationale or volume commitment for this counter offer.");
      return;
    }

    try {
      setLoading(true);
      const res = await submitCounterOffer(rfqId, formData as CreateCounterOfferRequest);
      window.dispatchEvent(new CustomEvent("rfq-updated", { detail: { rfqId } }));
      window.dispatchEvent(new CustomEvent("notifications-updated"));
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit commercial counter offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-[#F8F9FA] flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0052CC] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                Commercial Counter Offer
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Direct Negotiation
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight mt-1">
              Propose Counter Terms — {chemicalName}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Submit adjusted commercial pricing and dispatch parameters directly to the manufacturer.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Side-by-Side Commercial Comparison */}
          <div className="bg-[#F8F9FA] border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-[#0F172A]">
                Commercial Term Comparison
              </span>
              <span className="text-xs text-[#64748B]">
                Target Consignment: <strong className="text-[#0F172A]">{requestedQuantity.toLocaleString()} {unit}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Supplier's Current Offer */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-[#64748B] block">
                  Current Supplier Quoted Price
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-lg font-bold text-[#0F172A]">
                    {initialCurrency} {initialUnitPrice ? initialUnitPrice.toFixed(2) : "—"}
                  </span>
                  <span className="text-xs text-[#64748B]">/ {unit}</span>
                </div>
                <span className="text-[11px] text-[#64748B] block">
                  Est. Gross: {initialCurrency} {previousEstimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Your Proposed Counter */}
              <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0052CC]">
                    Your Proposed Counter Price
                  </span>
                  {percentDelta !== 0 && (
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 ${
                        percentDelta < 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {percentDelta < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <TrendingUp className="w-3 h-3" />
                      )}
                      <span>{percentDelta > 0 ? `+${percentDelta.toFixed(1)}%` : `${percentDelta.toFixed(1)}%`}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-lg font-bold text-[#0052CC]">
                    {formData.currency} {formData.unitPrice ? Number(formData.unitPrice).toFixed(2) : "0.00"}
                  </span>
                  <span className="text-xs text-[#0052CC]">/ {unit}</span>
                </div>

                <span className="text-[11px] text-[#0052CC] block">
                  Est. Gross: {formData.currency} {currentEstimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {totalSavings > 0 && (
                    <span className="text-emerald-700 font-semibold ml-1.5">
                      (Save {formData.currency} {totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Quick Discount Shortcut Chips */}
            {initialUnitPrice && initialUnitPrice > 0 && (
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <span className="text-[11px] text-[#64748B]">Quick adjust:</span>
                {[
                  { label: "-3%", val: 3 },
                  { label: "-5%", val: 5 },
                  { label: "-8%", val: 8 },
                  { label: "-10%", val: 10 },
                  { label: "-15%", val: 15 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => applyPercentReduction(chip.val)}
                    className="text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md transition-colors shadow-2xs press-tactile"
                  >
                    {chip.label} ({initialCurrency} {(initialUnitPrice * (1 - chip.val / 100)).toFixed(2)})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Counter Unit Price */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Counter Unit Price <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="unitPrice"
                  step="0.0001"
                  required
                  value={formData.unitPrice || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-bold text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
                />
              </div>
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Settlement Currency <span className="text-[#DC2626]">*</span>
              </label>
              <select
                name="currency"
                required
                value={formData.currency || "INR"}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-medium text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
              >
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
                <option value="AED">AED — UAE Dirham</option>
                <option value="SGD">SGD — Singapore Dollar</option>
                <option value="JPY">JPY — Japanese Yen (¥)</option>
                <option value="CNY">CNY — Chinese Yuan (¥)</option>
              </select>
            </div>

            {/* Proposed MOQ */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Proposed Minimum Order (MOQ) <span className="text-[#64748B] font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                name="minimumOrderQuantity"
                step="any"
                value={formData.minimumOrderQuantity || ""}
                onChange={handleChange}
                placeholder="e.g. 25"
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
              />
            </div>

            {/* Required Lead Time */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Required Lead Time (Business Days) <span className="text-[#64748B] font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                name="leadTimeDays"
                min="1"
                value={formData.leadTimeDays || ""}
                onChange={handleChange}
                placeholder="e.g. 7"
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
              />
            </div>
          </div>

          {/* Packaging Details */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Packaging & Handling Requirements <span className="text-[#64748B] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="packagingDetails"
              value={formData.packagingDetails || ""}
              onChange={handleChange}
              placeholder="e.g. 25kg HDPE drums with tamper-evident seal and batch CoA"
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
            />
          </div>

          {/* Commercial Rationale */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Commercial Rationale / Volume Commitment <span className="text-[#DC2626]">*</span>
            </label>
            <textarea
              name="commercialMessage"
              required
              rows={3}
              value={formData.commercialMessage || ""}
              onChange={handleChange}
              placeholder="e.g. We propose ₹95/kg for this initial batch with a quarterly forecast of 2,000 kg. Ready to issue formal PO immediately upon acceptance."
              className="w-full p-3 border border-slate-300 rounded-lg text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs resize-none transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto h-10 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-10 px-5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 press-tactile"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Transmitting Counter..." : "Submit Counter Offer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
