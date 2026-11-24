"use client";

import React, { useState, useEffect } from "react";
import { Send, AlertCircle, Calculator, X, ShieldCheck, Clock, FileCheck2, ArrowRight } from "lucide-react";
import { CreateQuotationRequest, QuotationResponse, submitQuotation } from "../api/submitQuotation";
import { useToast } from "@/shared/context/ToastContext";

interface QuotationFormProps {
  rfqId: string;
  targetQuantity?: number;
  unit?: string;
  initialData?: Partial<CreateQuotationRequest>;
  isRevision?: boolean;
  revisionNumber?: number;
  buyerProposal?: {
    unitPrice?: number;
    currency?: string;
    minimumOrderQuantity?: number | null;
    leadTimeDays?: number | null;
    validityDate?: string | null;
    packagingDetails?: string | null;
    commercialNotes?: string | null;
  };
  onSuccess: (quotation: QuotationResponse) => void;
  onCancel?: () => void;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  rfqId,
  targetQuantity = 100,
  unit = "KG",
  initialData,
  isRevision = false,
  revisionNumber = 2,
  buyerProposal,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<CreateQuotationRequest>>({
    unitPrice: initialData?.unitPrice,
    currency: initialData?.currency || "INR",
    minimumOrderQuantity: initialData?.minimumOrderQuantity,
    leadTimeDays: initialData?.leadTimeDays,
    validityDate: initialData?.validityDate || "",
    packagingDetails: initialData?.packagingDetails || "",
    commercialNotes: initialData?.commercialNotes || "",
  });

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        unitPrice: initialData.unitPrice,
        currency: initialData.currency || "INR",
        minimumOrderQuantity: initialData.minimumOrderQuantity,
        leadTimeDays: initialData.leadTimeDays,
        validityDate: initialData.validityDate ? initialData.validityDate.split("T")[0] : "",
        packagingDetails: initialData.packagingDetails || "",
        commercialNotes: initialData.commercialNotes || "",
      });
    }
  }, [initialData]);

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

  const estimatedTotal =
    targetQuantity && formData.unitPrice ? targetQuantity * formData.unitPrice : 0;

  const formatCurrency = (val?: number | null, curr = "INR") => {
    if (val == null) return "—";
    return `${curr} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatQuantity = (val?: number | null, u = unit) => {
    if (val == null) return "Standard";
    return `${val.toLocaleString()} ${u.toUpperCase()}`;
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.unitPrice || formData.unitPrice <= 0) {
      setError("Unit price must be greater than zero.");
      return;
    }
    if (!formData.currency) {
      setError("Currency is required.");
      return;
    }
    if (!formData.validityDate) {
      setError("Validity date is required.");
      return;
    }

    if (isRevision) {
      setConfirmModalOpen(true);
    } else {
      executeSubmission();
    }
  };

  const executeSubmission = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await submitQuotation(rfqId, formData as CreateQuotationRequest);
      toast.success(
        isRevision
          ? `Commercial revision V${revisionNumber} transmitted successfully.`
          : "Commercial quotation transmitted successfully."
      );
      setConfirmModalOpen(false);
      window.dispatchEvent(new CustomEvent("rfq-updated", { detail: { rfqId } }));
      window.dispatchEvent(new CustomEvent("notifications-updated"));
      onSuccess(response);
    } catch (err: any) {
      const msg = err.message || "Failed to submit quotation. Please check your inputs.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-tactile-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0052CC] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
              {isRevision ? `Commercial Revision · Version ${revisionNumber}` : "Supplier Proposal Desk"}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Factory-Gate Pricing
            </span>
          </div>
          <h3 className="text-base font-bold text-[#0F172A] mt-1 tracking-tight">
            {isRevision ? "Revise Commercial Terms" : "Submit Formal Commercial Quotation"}
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            {isRevision
              ? "Submit adjusted pricing and dispatch terms in response to buyer counter proposal."
              : "Specify unit pricing, committed MOQ, fulfillment lead time, and batch dispatch terms."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#0F172A] font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            Target Volume: {formatQuantity(targetQuantity, unit)}
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-[#64748B] hover:text-[#0F172A] font-semibold transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handlePreSubmit} className="p-5 sm:p-6 text-xs">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Input Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Unit Price <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  step="0.01"
                  required
                  value={formData.unitPrice ?? ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs font-bold text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Currency <span className="text-[#DC2626]">*</span>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Minimum Order Quantity (MOQ) <span className="text-[#64748B] font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="minimumOrderQuantity"
                  step="1"
                  value={formData.minimumOrderQuantity ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Fulfillment Lead Time (Days) <span className="text-[#64748B] font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="leadTimeDays"
                  min="1"
                  value={formData.leadTimeDays ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. 7"
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Quotation Validity Date <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="date"
                  name="validityDate"
                  required
                  value={formData.validityDate || ""}
                  onChange={handleChange}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Packaging Specification <span className="text-[#64748B] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="packagingDetails"
                  value={formData.packagingDetails || ""}
                  onChange={handleChange}
                  placeholder="e.g. 25kg UN-rated HDPE drums"
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Commercial & Technical Notes <span className="text-[#64748B] font-normal">(Optional)</span>
              </label>
              <textarea
                name="commercialNotes"
                rows={3}
                value={formData.commercialNotes || ""}
                onChange={handleChange}
                placeholder="Include payment terms (e.g. 30% advance, 70% against BL), shelf-life warranties, lot inspection terms, or export compliance notes..."
                className="w-full p-3 border border-slate-300 rounded-lg text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs resize-none transition-colors"
              />
            </div>
          </div>

          {/* Settlement Breakdown Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#F8F9FA] border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h4 className="text-xs font-bold text-[#0F172A]">
                  Commercial Settlement Breakdown
                </h4>
                <span className="text-[11px] font-semibold text-[#0052CC] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                  Fixed Proposal
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200">
                  <span className="text-[#64748B]">Target Volume:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {formatQuantity(targetQuantity, unit)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200">
                  <span className="text-[#64748B]">Quoted Unit Price:</span>
                  <strong className="text-[#0052CC] font-bold">
                    {formatCurrency(formData.unitPrice, formData.currency)} / {unit}
                  </strong>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200">
                  <span className="text-[#64748B]">Lead Time SLA:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {formData.leadTimeDays ? `${formData.leadTimeDays} business days` : "Standard dispatch"}
                  </span>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-center mt-3 shadow-2xs">
                  <span className="text-[11px] text-[#64748B] block font-medium">
                    Estimated Gross Consignment Value
                  </span>
                  <strong className="text-xl font-bold text-emerald-700 block mt-1 tracking-tight">
                    {formatCurrency(estimatedTotal, formData.currency)}
                  </strong>
                  <span className="text-[11px] text-[#64748B] mt-0.5 block">Excluding statutory GST & freight</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 press-tactile"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {loading
                      ? isRevision
                        ? `Sending Revision V${revisionNumber}...`
                        : "Transmitting..."
                      : isRevision
                      ? "Send Revised Quotation →"
                      : "Submit Commercial Proposal"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Revision Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 bg-[#F8F9FA] border-b border-slate-200 text-[#0F172A] flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Send Revision V{revisionNumber} to Buyer?
              </h3>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-[#0F172A] leading-relaxed">
                You are sending <strong className="text-[#0F172A]">Revision Version {revisionNumber}</strong> to the buyer in response to their counter-offer.
              </p>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F8F9FA] rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-[#64748B] block mb-0.5">
                    Buyer Counter
                  </span>
                  <span className="text-xs font-semibold text-[#0F172A] block">
                    {buyerProposal?.unitPrice ? `${buyerProposal.currency || "INR"} ${buyerProposal.unitPrice.toFixed(2)}` : "—"}
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    {buyerProposal?.leadTimeDays ? `${buyerProposal.leadTimeDays}d lead` : ""}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#0052CC] block mb-0.5">
                    Your Revision V{revisionNumber}
                  </span>
                  <strong className="text-xs font-bold text-[#0052CC] block">
                    {formData.currency} {formData.unitPrice ? Number(formData.unitPrice).toFixed(2) : "0.00"}
                  </strong>
                  <span className="text-[11px] text-[#64748B]">
                    {formData.leadTimeDays ? `${formData.leadTimeDays}d lead` : "Standard"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  disabled={loading}
                  className="h-9 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={executeSubmission}
                  disabled={loading}
                  className="h-9 px-5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 press-tactile"
                >
                  {loading ? "Transmitting..." : "Confirm & Transmit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
