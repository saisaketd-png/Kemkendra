  "use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSupplierRfqs, SupplierRfq } from "@/features/rfq/api/getSupplierRfqs";
import { getSupplierQuotations } from "@/features/rfq/api/getSupplierQuotations";
import { acceptSupplierCounterOffer } from "@/features/rfq/api/acceptSupplierCounterOffer";
import { rejectSupplierCounterOffer } from "@/features/rfq/api/rejectSupplierCounterOffer";
import { getProductDetail } from "@/app/products/api/getProductDetail";
import { QuotationForm } from "@/features/rfq/components/QuotationForm";
import { QuotationResponse } from "@/features/rfq/api/submitQuotation";
import { getOrderByRfqId } from "@/features/order/api/getOrderByRfqId";
import { PurchaseOrderResponse } from "@/features/order/api/createOrder";
import { GenericDocumentManager } from "@/features/documents/components/GenericDocumentManager";
import { TransactionTimeline } from "@/shared/components/procurement/TransactionTimeline";
import { useToast } from "@/shared/context/ToastContext";
import {
  ChevronRight,
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Edit3,
  ShieldCheck,
  History,
  X,
  ArrowRight,
  PackageCheck,
} from "lucide-react";

type ProductDetail = {
  id: string;
  name: string;
  category: string;
  casNumber: string;
  molecularFormula: string;
  purity: number;
  grade: string;
  price: number;
  moqKg: number;
  packaging: string;
  productCode?: string;
};

export default function SupplierRfqDetailPage() {
  const params = useParams();
  const rfqId = params?.id as string;

  const [rfq, setRfq] = useState<SupplierRfq | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
  const [existingPo, setExistingPo] = useState<PurchaseOrderResponse | null>(null);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decision Modal State
  const [decisionModalMode, setDecisionModalMode] = useState<"accept" | "reject" | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const toast = useToast();

  const loadRfq = useCallback(async (silent = false) => {
    if (!rfqId) return;
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      const [rfqs, quotes, poData] = await Promise.all([
        getSupplierRfqs(),
        getSupplierQuotations(rfqId).catch(() => [] as QuotationResponse[]),
        getOrderByRfqId(rfqId).catch(() => null),
      ]);

      const matching = rfqs.find((r) => r.id === rfqId);

      if (!matching) {
        throw new Error("Sourcing inquiry not found or unauthorized access.");
      }

      setRfq(matching);
      setQuotations(quotes || []);
      setExistingPo(poData);

      // Fetch product monograph details if not already loaded
      const prodId = matching.masterProductId || matching.productId;
      if (prodId && !product) {
        getProductDetail(prodId)
          .then((p) => {
            if (p) setProduct(p as ProductDetail);
          })
          .catch(() => {});
      }
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load RFQ");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [rfqId, product]);

  useEffect(() => {
    // Initial fetch
    loadRfq(false);

    // Visibility-aware polling interval (10 seconds)
    const intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadRfq(true);
      }
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadRfq(true);
      }
    };

    const handleWindowFocus = () => {
      loadRfq(true);
    };

    const handleRfqUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<{ rfqId?: string }>;
      if (!customEvt.detail?.rfqId || customEvt.detail.rfqId === rfqId) {
        loadRfq(true);
      }
    };

    const handleNotificationsUpdate = () => {
      loadRfq(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("rfq-updated", handleRfqUpdate);
    window.addEventListener("notifications-updated", handleNotificationsUpdate);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("rfq-updated", handleRfqUpdate);
      window.removeEventListener("notifications-updated", handleNotificationsUpdate);
    };
  }, [loadRfq, rfqId]);

  // Smooth scroll to negotiation history section
  const scrollToHistory = () => {
    const el = document.getElementById("negotiation-history");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle Supplier Accept Counter-Offer
  const handleConfirmAccept = async () => {
    if (!latestQuotation || !rfq) return;
    try {
      setDecisionSubmitting(true);
      setDecisionError(null);

      await acceptSupplierCounterOffer(rfq.id, latestQuotation.id, decisionNotes.trim() || undefined);
      toast.success("Buyer counter-offer accepted. Commercial terms locked.");
      setDecisionModalMode(null);
      setDecisionNotes("");
      await loadRfq(true);
      window.dispatchEvent(new CustomEvent("rfq-updated", { detail: { rfqId } }));
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to accept counter-offer";
      setDecisionError(msg);
      toast.error(msg);
    } finally {
      setDecisionSubmitting(false);
    }
  };

  // Handle Supplier Reject Counter-Offer
  const handleConfirmReject = async () => {
    if (!latestQuotation || !rfq) return;
    try {
      setDecisionSubmitting(true);
      setDecisionError(null);

      await rejectSupplierCounterOffer(rfq.id, latestQuotation.id, decisionNotes.trim() || undefined);
      toast.success("Buyer counter-offer declined.");
      setDecisionModalMode(null);
      setDecisionNotes("");
      await loadRfq(true);
      window.dispatchEvent(new CustomEvent("rfq-updated", { detail: { rfqId } }));
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to decline counter-offer";
      setDecisionError(msg);
      toast.error(msg);
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const latestQuotation = quotations.length > 0 ? quotations[0] : null;

  const supplierTurnIndicator = useMemo(() => {
    if (!rfq) {
      return {
        label: "Commercial Proposal Pending",
        variant: "neutral",
        subtext: "Loading sourcing workspace details.",
      };
    }
    if (rfq.status === "ACCEPTED") {
      return {
        label: "Commercial Proposal Accepted & Finalized",
        variant: "success",
        subtext: "Buyer accepted commercial terms. Ready for formal Purchase Order issuance.",
      };
    }
    if (rfq.status === "REJECTED") {
      return {
        label: "Commercial Proposal Declined",
        variant: "danger",
        subtext: "This commercial negotiation has concluded.",
      };
    }
    if (rfq.status === "CLOSED" || rfq.status === "CANCELLED") {
      return {
        label: "Inquiry Closed",
        variant: "neutral",
        subtext: "This procurement inquiry is no longer active.",
      };
    }
    if (!latestQuotation) {
      return {
        label: "Action Required: Initial Proposal Pending",
        variant: "warning",
        subtext: "Buyer submitted inquiry. Please formulate pricing, MOQ, and dispatch lead times.",
      };
    }
    if (latestQuotation.actorType === "BUYER" || rfq.status === "COUNTERED") {
      return {
        label: "Action Required: Buyer Counter-Offer Received",
        variant: "warning",
        subtext: "Buyer proposed modified commercial terms. You may Accept, Decline, or Propose Revision.",
      };
    }
    return {
      label: "Awaiting Buyer Decision",
      variant: "brand",
      subtext: `Your proposal (V${latestQuotation.quotationVersion}) is under active review by the buyer.`,
    };
  }, [rfq?.status, latestQuotation]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto p-8 min-h-[65vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">
          Loading Sourcing Workspace...
        </span>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="max-w-[1440px] mx-auto p-6 lg:p-8">
        <div className="bg-white border border-rose-200/90 rounded-2xl p-8 text-center space-y-3 shadow-tactile-card">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-[#091E42]">Inquiry Record Unavailable</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{error || "The requested RFQ record could not be retrieved."}</p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => loadRfq(false)}
              className="px-4 py-2 bg-[#0052CC] text-white text-xs font-semibold rounded-xl hover:bg-[#0747A6] active:scale-[0.98] transition-colors cursor-pointer shadow-xs"
            >
              Retry
            </button>
            <Link
              href="/dashboard/supplier/rfqs"
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Back to Inquiries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rfqShortId = rfq.rfqReference || (rfq.id ? `RFQ-${rfq.id.substring(0, 8).toUpperCase()}` : "RFQ-INQUIRY");
  const isCounterOffer = latestQuotation?.actorType === "BUYER" || rfq.status === "COUNTERED";
  const isAccepted = rfq.status === "ACCEPTED";
  const isPending = rfq.status === "PENDING" && quotations.length === 0;
  const isQuoted = rfq.status === "QUOTED";
  const isClosed = rfq.status === "CLOSED" || rfq.status === "CANCELLED";

  const nextVersionNumber = latestQuotation ? latestQuotation.quotationVersion + 1 : 1;

  // Format numbers cleanly
  const formatMoney = (val?: number | null, curr = "INR") => {
    if (val == null) return "—";
    return `${curr} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatQty = (val?: number | null, u = rfq.unit) => {
    if (val == null) return "Standard";
    return `${val.toLocaleString()} ${u.toUpperCase()}`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "30 days";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const counterOfferCount = quotations.filter((q) => q.actorType === "BUYER").length;

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-24 text-slate-900">
      {/* ========================================================================= */}
      {/* 1. TOP BREADCRUMB & CONTEXT                                               */}
      {/* ========================================================================= */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href="/dashboard/supplier" className="hover:text-[#0052CC] transition-colors">
            Supplier Desk
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/dashboard/supplier/rfqs" className="hover:text-[#0052CC] transition-colors">
            RFQ Inquiries
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900">{rfqShortId}</span>
        </div>

        <span className="text-[11px] text-slate-500">
          Negotiation Reference: <strong className="font-mono text-slate-900">{rfq.id.substring(0, 8).toUpperCase()}</strong>
        </span>
      </nav>

      {/* ========================================================================= */}
      {/* 2. RFQ HEADER (Full-Width Top Strip)                                      */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-[#0052CC]">
                {rfqShortId}
              </span>
              <span className="text-slate-300">•</span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
                  isAccepted
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                    : isCounterOffer
                    ? "bg-amber-50 text-amber-800 border-amber-200/80"
                    : isQuoted
                    ? "bg-blue-50 text-[#0052CC] border-blue-200/80"
                    : "bg-amber-50 text-amber-800 border-amber-200/80"
                }`}
              >
                {isCounterOffer && !isAccepted
                  ? "Counter-Offer Received"
                  : isAccepted
                  ? "Accepted / Agreed"
                  : isQuoted
                  ? "Quoted"
                  : "Awaiting Quote"}
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 flex-wrap pt-0.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[#091E42] tracking-tight">
                {product?.name || "Specialty Chemical Raw Material"}
              </h1>
              {product?.casNumber && (
                <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                  CAS {product.casNumber}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Buyer Organization: <strong className="text-slate-800">{rfq.buyerName || "Verified Enterprise Buyer"}</strong> • Sourcing Category: <span className="font-medium text-slate-800">{product?.category || "Chemical Consignment"}</span>
            </p>
          </div>

          {/* Header Quick Action: Scroll to Negotiation History */}
          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            {quotations.length > 0 && (
              <button
                type="button"
                onClick={scrollToHistory}
                className="h-9 px-3.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
                title="Scroll down to complete negotiation history"
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Negotiation History ({quotations.length}) ↓</span>
              </button>
            )}
          </div>
        </div>

        {/* Structured Context Metadata Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Requested Volume
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5 tabular-nums">
              {formatQty(rfq.quantity, rfq.unit)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Current Terms
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5 tabular-nums">
              {latestQuotation ? `${formatMoney(latestQuotation.unitPrice, latestQuotation.currency)} / ${rfq.unit.toUpperCase()}` : "Not Quoted Yet"}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Inquiry Received
            </span>
            <span className="text-xs text-slate-900 block mt-0.5 tabular-nums">
              {formatDate(rfq.createdAt)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Response Target
            </span>
            <span className="text-xs font-medium text-emerald-600 block mt-0.5">
              Within 24 Hours
            </span>
          </div>
        </div>
      </div>

      {/* Unified Commercial Lifecycle Timeline */}
      <TransactionTimeline
        rfq={rfq}
        quotations={quotations}
        order={existingPo}
        userRole="SUPPLIER"
      />

      {/* ========================================================================= */}
      {/* 3. TWO-COLUMN WORKSPACE (Main Left 7 Cols / Buyer Context Right 5 Cols)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: Main RFQ & Commercial Workspace (7 Cols)                  */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Supplier Turn Ownership Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-tactile-card ${
              supplierTurnIndicator.variant === "warning"
                ? "bg-amber-50/80 border-amber-200/90 text-amber-900"
                : supplierTurnIndicator.variant === "success"
                ? "bg-emerald-50/80 border-emerald-200/90 text-emerald-950"
                : supplierTurnIndicator.variant === "danger"
                ? "bg-rose-50/80 border-rose-200/90 text-rose-950"
                : supplierTurnIndicator.variant === "brand"
                ? "bg-blue-50/80 border-blue-200/90 text-[#091E42]"
                : "bg-slate-50 border-slate-200/90 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
                  supplierTurnIndicator.variant === "warning"
                    ? "bg-amber-100/80 text-amber-900 border-amber-300/80"
                    : supplierTurnIndicator.variant === "success"
                    ? "bg-emerald-100/80 text-emerald-900 border-emerald-300/80"
                    : supplierTurnIndicator.variant === "danger"
                    ? "bg-rose-100/80 text-rose-900 border-rose-300/80"
                    : supplierTurnIndicator.variant === "brand"
                    ? "bg-blue-100/80 text-[#0052CC] border-blue-300/80"
                    : "bg-slate-200 text-slate-700 border-slate-300"
                }`}
              >
                {supplierTurnIndicator.label}
              </span>
              <span className="text-xs font-medium">{supplierTurnIndicator.subtext}</span>
            </div>
          </div>

          {/* 1. CURRENT QUOTATION / NEGOTIATION CARD */}
          {latestQuotation ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card overflow-hidden">
              {/* Light Refined Header */}
              <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0052CC]">
                      Current Quotation · Version {latestQuotation.quotationVersion}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {latestQuotation.actorType === "BUYER"
                        ? "Buyer Counter-Offer"
                        : latestQuotation.quotationVersion > 1
                        ? "Revised Quotation by Supplier"
                        : "Original Quotation by Supplier"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Transmitted on {formatDateTime(latestQuotation.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={scrollToHistory}
                    className="text-xs text-[#0052CC] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Revision History</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4-Column Commercial Metrics Grid */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Unit Price
                    </span>
                    <strong className="text-base sm:text-lg font-bold text-slate-900 block mt-0.5 tabular-nums">
                      {formatMoney(latestQuotation.unitPrice, latestQuotation.currency)}
                    </strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">per {rfq.unit.toLowerCase()}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      MOQ
                    </span>
                    <strong className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5 tabular-nums">
                      {formatQty(latestQuotation.minimumOrderQuantity, rfq.unit)}
                    </strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Threshold</span>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Lead Time
                    </span>
                    <strong className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5">
                      {latestQuotation.leadTimeDays ? `${latestQuotation.leadTimeDays} Days` : "Standard"}
                    </strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Upon PO confirm</span>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Validity
                    </span>
                    <strong className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5">
                      {formatDate(latestQuotation.validityDate)}
                    </strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Commercial offer</span>
                  </div>
                </div>

                {/* Packaging & Commercial Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  {latestQuotation.packagingDetails && (
                    <div className="flex items-start gap-2 p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
                      <span className="font-semibold text-slate-500 shrink-0 text-[11px]">Packaging:</span>
                      <span className="text-slate-900 font-medium">{latestQuotation.packagingDetails}</span>
                    </div>
                  )}

                  {latestQuotation.commercialMessage && (
                    <div className="flex items-start gap-2 p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl sm:col-span-2">
                      <span className="font-semibold text-slate-500 shrink-0 text-[11px]">Notes:</span>
                      <span className="text-slate-800 italic">"{latestQuotation.commercialMessage}"</span>
                    </div>
                  )}
                </div>

                {/* Action Bar (Deliberate visual hierarchy) */}
                {!isAccepted && !isClosed && (
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Commercial Next Step
                      </span>
                      <p className="text-xs text-slate-800 mt-0.5">
                        {isCounterOffer
                          ? "Review buyer counter-offer and transmit acceptance or revision."
                          : "Commercial proposal transmitted to buyer. Awaiting feedback."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCounterOffer ? (
                        <>
                          {/* 1. DECLINE / REJECT */}
                          <button
                            type="button"
                            onClick={() => setDecisionModalMode("reject")}
                            disabled={decisionSubmitting}
                            className="h-9 px-3.5 text-xs font-semibold text-rose-600 hover:text-rose-700 border border-slate-300 hover:border-rose-300 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                          >
                            Decline Proposal
                          </button>

                          {/* 2. COUNTER / REVISE */}
                          <button
                            type="button"
                            onClick={() => setShowRevisionForm(!showRevisionForm)}
                            disabled={decisionSubmitting}
                            className={`h-9 px-3.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 active:scale-[0.98] ${
                              showRevisionForm
                                ? "bg-blue-50 text-[#0052CC] border-blue-200"
                                : "border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{showRevisionForm ? "Close Form" : "Counter Offer"}</span>
                          </button>

                          {/* 3. ACCEPT */}
                          <button
                            type="button"
                            onClick={() => setDecisionModalMode("accept")}
                            disabled={decisionSubmitting}
                            className="h-9 px-4 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Terms</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowRevisionForm(!showRevisionForm)}
                          className="h-9 px-4 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{showRevisionForm ? "Hide Revision Form" : "Revise Quotation"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Accepted States: PO Active vs Awaiting PO */}
                {isAccepted && existingPo ? (
                  <div className="pt-4 border-t border-slate-100 p-5 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-semibold text-emerald-800">
                          Purchase Order Active
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{existingPo.poNumber}</h3>
                      <p className="text-xs text-slate-600">
                        Binding order placed by buyer on {formatDate(existingPo.placedAt)}. Status:{" "}
                        <strong className="text-emerald-700 font-semibold">{existingPo.status}</strong>
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/supplier/orders/${existingPo.id}`}
                      className="h-9 px-4 bg-[#0052CC] hover:bg-[#0747A6] active:scale-[0.98] text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 shrink-0"
                    >
                      <span>View Purchase Order →</span>
                    </Link>
                  </div>
                ) : isAccepted && !existingPo ? (
                  <div className="pt-4 border-t border-[#E2E8F0] p-4 bg-[#E3FCEF]/60 border border-[#ABF5D1] rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00875A] shrink-0" />
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#006644] uppercase block">
                        COMMERCIAL TERMS ACCEPTED
                      </span>
                      <p className="text-xs text-[#526581] mt-0.5">
                        Buyer accepted quotation terms. Awaiting formal Purchase Order generation from buyer.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : isPending && !showRevisionForm ? (
            /* Pending Initial Quotation Banner */
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#0052CC] block">
                  Action Required
                </span>
                <h3 className="text-base font-bold text-[#091E42] mt-0.5">
                  Submit Commercial Quotation
                </h3>
                <p className="text-xs text-slate-500">
                  Buyer is awaiting your pricing and fulfillment terms for this inquiry.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRevisionForm(true)}
                className="h-9 px-4 bg-[#0052CC] hover:bg-[#0747A6] active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Commercial Proposal</span>
              </button>
            </div>
          ) : null}

          {/* 2. REVISE / SUBMIT COMMERCIAL FORM (Inline when toggled) */}
          {showRevisionForm && !isAccepted && !isClosed && (
            <QuotationForm
              rfqId={rfq.id}
              targetQuantity={rfq.quantity}
              unit={rfq.unit}
              isRevision={quotations.length > 0}
              revisionNumber={nextVersionNumber}
              buyerProposal={
                latestQuotation && isCounterOffer
                  ? {
                      unitPrice: latestQuotation.unitPrice,
                      currency: latestQuotation.currency,
                      minimumOrderQuantity: latestQuotation.minimumOrderQuantity,
                      leadTimeDays: latestQuotation.leadTimeDays,
                      validityDate: latestQuotation.validityDate,
                      packagingDetails: latestQuotation.packagingDetails,
                      commercialNotes: latestQuotation.commercialNotes,
                    }
                  : undefined
              }
              initialData={{
                unitPrice: latestQuotation?.unitPrice,
                currency: latestQuotation?.currency || "INR",
                minimumOrderQuantity: latestQuotation?.minimumOrderQuantity ?? undefined,
                leadTimeDays: latestQuotation?.leadTimeDays ?? undefined,
                validityDate: latestQuotation?.validityDate ? latestQuotation.validityDate.split("T")[0] : "",
                packagingDetails: latestQuotation?.packagingDetails || "",
                commercialNotes: latestQuotation?.commercialNotes || "",
              }}
              onSuccess={() => {
                setShowRevisionForm(false);
                loadRfq(true);
                window.dispatchEvent(new CustomEvent("rfq-updated", { detail: { rfqId } }));
                window.dispatchEvent(new CustomEvent("notifications-updated"));
              }}
              onCancel={() => setShowRevisionForm(false)}
            />
          )}

          {/* 3. COMPLETE EMBEDDED NEGOTIATION HISTORY SECTION (#negotiation-history) */}
          <section id="negotiation-history" className="bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card overflow-hidden scroll-mt-6">
            {/* Header & Negotiation Summary Metrics */}
            <div className="px-6 py-5 bg-slate-50/80 border-b border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#0052CC]" />
                    <h2 className="text-sm font-bold text-[#091E42]">
                      Negotiation History
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Commercial revision record and progression.
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 px-3 py-1 rounded-lg shadow-2xs">
                  {quotations.length} Version{quotations.length > 1 ? "s" : ""} Logged
                </span>
              </div>

              {/* 4-Metric Compact Summary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="p-3 bg-white border border-slate-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Revisions
                  </span>
                  <strong className="text-base font-bold text-slate-900 block mt-0.5 tabular-nums">
                    {quotations.length}
                  </strong>
                </div>

                <div className="p-3 bg-white border border-slate-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Participants
                  </span>
                  <strong className="text-sm font-semibold text-slate-900 block mt-0.5">
                    2 (Buyer · Supplier)
                  </strong>
                </div>

                <div className="p-3 bg-white border border-slate-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Counter-Offers
                  </span>
                  <strong className="text-base font-bold text-slate-900 block mt-0.5 tabular-nums">
                    {counterOfferCount}
                  </strong>
                </div>

                <div className="p-3 bg-white border border-slate-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Current Status
                  </span>
                  <strong className="text-xs font-semibold text-slate-900 block mt-1">
                    {isAccepted ? "Accepted" : isCounterOffer ? "Countered" : isQuoted ? "Quoted" : "Pending"}
                  </strong>
                </div>
              </div>
            </div>

            {/* AGREED COMMERCIAL TERMS BANNER (If Accepted) */}
            {isAccepted && latestQuotation && (
              <div className="p-5 bg-emerald-50/70 border-b border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Commercial Terms Agreed</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-900">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Agreed Unit Price:</span>
                    <strong className="tabular-nums">{formatMoney(latestQuotation.unitPrice, latestQuotation.currency)} / {rfq.unit.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Agreed Quantity:</span>
                    <strong className="tabular-nums">{formatQty(rfq.quantity, rfq.unit)}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Fulfillment Lead Time:</span>
                    <strong>{latestQuotation.leadTimeDays ? `${latestQuotation.leadTimeDays} days` : "Standard"}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Status:</span>
                    <strong className="text-emerald-700">Purchase Order Ready</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Timeline List of Historical Revisions */}
            <div className="p-6">
              {quotations.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 space-y-1">
                  <strong className="text-slate-800 block">No Negotiation History Yet</strong>
                  <p>The original quotation and any subsequent counter-offers will appear here when submitted.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {quotations.map((quote, idx) => {
                    const isCurrent = idx === 0;
                    const isBuyer = quote.actorType === "BUYER";
                    const prevQuote = idx < quotations.length - 1 ? quotations[idx + 1] : null;

                    // Calculate changes from preceding chronological version
                    const deltaPrice = prevQuote && prevQuote.unitPrice !== quote.unitPrice ? { prev: prevQuote.unitPrice, curr: quote.unitPrice } : null;
                    const deltaLead = prevQuote && prevQuote.leadTimeDays !== quote.leadTimeDays ? { prev: prevQuote.leadTimeDays, curr: quote.leadTimeDays } : null;
                    const deltaMoq = prevQuote && prevQuote.minimumOrderQuantity !== quote.minimumOrderQuantity ? { prev: prevQuote.minimumOrderQuantity, curr: quote.minimumOrderQuantity } : null;
                    const deltaValidity = prevQuote && prevQuote.validityDate !== quote.validityDate ? { prev: prevQuote.validityDate, curr: quote.validityDate } : null;
                    const hasChanges = deltaPrice || deltaLead || deltaMoq || deltaValidity;

                    const formatActionBadge = () => {
                      if (isBuyer) return "Counter-Offer";
                      if (quote.quotationVersion === 1) return "Initial Quotation";
                      return "Supplier Revision";
                    };

                    return (
                      <div key={quote.id} className="relative space-y-3">
                        {/* Timeline Bullet */}
                        <div
                          className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 bg-white ${
                            isCurrent
                              ? isAccepted
                                ? "border-emerald-600 bg-emerald-600"
                                : isBuyer
                                ? "border-amber-500 bg-amber-500"
                                : "border-[#0052CC] bg-[#0052CC]"
                              : "border-slate-400"
                          }`}
                        />

                        {/* Card Entry */}
                        <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 sm:p-5 space-y-3">
                          {/* Top Tag Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                                  isBuyer
                                    ? "bg-amber-100 text-amber-900 border-amber-300"
                                    : "bg-blue-100 text-[#0052CC] border-blue-300"
                                }`}
                              >
                                {isBuyer ? "Buyer" : "Supplier"}
                              </span>
                              <strong className="text-xs text-slate-900">
                                Version {quote.quotationVersion} · {formatActionBadge()}
                              </strong>
                              {isCurrent && (
                                <span className="text-[10px] font-bold bg-[#091E42] text-white px-2 py-0.5 rounded-md uppercase">
                                  Current Active
                                </span>
                              )}
                            </div>

                            <span className="text-xs text-slate-500">
                              {formatDateTime(quote.createdAt)}
                            </span>
                          </div>

                          {/* Commercial Terms Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-[11px] font-semibold text-slate-500 block">
                                Unit Price
                              </span>
                              <strong className="text-sm font-bold text-slate-900 block mt-0.5 tabular-nums">
                                {formatMoney(quote.unitPrice, quote.currency)} / {rfq.unit.toUpperCase()}
                              </strong>
                            </div>

                            <div>
                              <span className="text-[11px] font-semibold text-slate-500 block">
                                Minimum Order (MOQ)
                              </span>
                              <span className="text-xs text-slate-900 block mt-0.5 font-medium tabular-nums">
                                {formatQty(quote.minimumOrderQuantity, rfq.unit)}
                              </span>
                            </div>

                            <div>
                              <span className="text-[11px] font-semibold text-slate-500 block">
                                Fulfillment Lead Time
                              </span>
                              <span className="text-xs text-slate-900 block mt-0.5 font-medium">
                                {quote.leadTimeDays ? `${quote.leadTimeDays} business days` : "Standard"}
                              </span>
                            </div>

                            <div>
                              <span className="text-[11px] font-semibold text-slate-500 block">
                                Offer Validity
                              </span>
                              <span className="text-xs text-slate-900 block mt-0.5 font-medium">
                                {formatDate(quote.validityDate)}
                              </span>
                            </div>
                          </div>

                          {/* Changed Fields Compared with Previous Revision */}
                          {hasChanges && prevQuote && (
                            <div className="pt-2 border-t border-slate-200/70 text-xs">
                              <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                                Changes from Version {prevQuote.quotationVersion}
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {deltaPrice && (
                                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md text-[11px]">
                                    <span className="text-slate-500">Unit Price:</span>
                                    <span className="line-through text-slate-400 tabular-nums">{deltaPrice.prev.toFixed(2)}</span>
                                    <ArrowRight className="w-3 h-3 text-[#0052CC]" />
                                    <strong className="text-slate-900 tabular-nums">{deltaPrice.curr.toFixed(2)}</strong>
                                  </span>
                                )}

                                {deltaLead && (
                                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md text-[11px]">
                                    <span className="text-slate-500">Lead Time:</span>
                                    <span className="line-through text-slate-400">{deltaLead.prev}d</span>
                                    <ArrowRight className="w-3 h-3 text-[#0052CC]" />
                                    <strong className="text-slate-900">{deltaLead.curr}d</strong>
                                  </span>
                                )}

                                {deltaMoq && (
                                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md text-[11px]">
                                    <span className="text-slate-500">MOQ:</span>
                                    <span className="line-through text-slate-400 tabular-nums">{deltaMoq.prev ?? "Std"}</span>
                                    <ArrowRight className="w-3 h-3 text-[#0052CC]" />
                                    <strong className="text-slate-900 tabular-nums">{deltaMoq.curr ?? "Std"}</strong>
                                  </span>
                                )}

                                {deltaValidity && (
                                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md text-[11px]">
                                    <span className="text-slate-500">Validity:</span>
                                    <span className="line-through text-slate-400">{formatDate(deltaValidity.prev)}</span>
                                    <ArrowRight className="w-3 h-3 text-[#0052CC]" />
                                    <strong className="text-slate-900">{formatDate(deltaValidity.curr)}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Commercial Message / Notes */}
                          {quote.commercialMessage && (
                            <div className="pt-2 border-t border-slate-200/70 text-xs text-slate-600 italic">
                              "{quote.commercialMessage}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: Buyer Context & Lifecycle Sidebar (5 Cols)                */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. BUYER SOURCING REQUIREMENTS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0052CC]" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#091E42]">
                  Buyer Sourcing Requirements
                </h2>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                SPEC: {product?.id ? product.id.substring(0, 8).toUpperCase() : "STANDARD"}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-baseline py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Target Monograph</span>
                  <strong className="text-slate-900">{product?.name || "Chemical Raw Material"}</strong>
                </div>

                <div className="flex justify-between items-baseline py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Requested Volume</span>
                  <span className="font-semibold tabular-nums text-slate-900">{formatQty(rfq.quantity, rfq.unit)}</span>
                </div>

                <div className="flex justify-between items-baseline py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">CAS Registry Number</span>
                  <span className="font-mono font-semibold text-slate-900">{product?.casNumber || "—"}</span>
                </div>

                <div className="flex justify-between items-baseline py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Assay / Minimum Purity</span>
                  <span className="font-medium text-slate-900">{product?.purity ? `${product.purity}% minimum` : "Standard Technical Grade"}</span>
                </div>

                <div className="flex justify-between items-baseline py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Pharmacopoeia Standard</span>
                  <span className="font-medium text-slate-900 uppercase">{product?.grade || "IP / BP / USP Standard"}</span>
                </div>

                <div className="flex justify-between items-baseline py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Packaging Required</span>
                  <span className="font-medium text-slate-900">{product?.packaging || "Standard Drum Container"}</span>
                </div>
              </div>

              {/* Buyer Notes */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Buyer Message & Technical Remarks
                </span>
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs text-slate-800 leading-relaxed">
                  {rfq.message || "Standard commercial inquiry for monograph raw material. Please provide best price and dispatch timeline."}
                </div>
              </div>
            </div>
          </div>

          {/* 2. INQUIRY DOCUMENTS & TECHNICAL ATTACHMENTS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card p-6">
            <GenericDocumentManager
              title="Inquiry Documents"
              description="Technical specifications, test protocols, NDA and compliance requirements."
              ownerType="RFQ"
              ownerId={rfq.id}
              canUpload={true}
              canDelete={true}
              allowedCategories={[
                { value: "TECHNICAL_SPECIFICATION", label: "Technical Specification" },
                { value: "CERTIFICATION", label: "Certification / COA" },
              ]}
              emptyMessage="No buyer documents have been attached to this inquiry yet."
            />
          </div>

          {/* 3. NEGOTIATION STATUS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-tactile-card space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block border-b border-slate-100 pb-2">
              Negotiation Status
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Current Stage</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
                    isAccepted
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                      : isCounterOffer
                      ? "bg-amber-50 text-amber-800 border-amber-200/80"
                      : isQuoted
                      ? "bg-blue-50 text-[#0052CC] border-blue-200/80"
                      : "bg-amber-50 text-amber-800 border-amber-200/80"
                  }`}
                >
                  {isCounterOffer && !isAccepted
                    ? "Action Required"
                    : isAccepted
                    ? "Accepted"
                    : isQuoted
                    ? "Quoted"
                    : "Pending"}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                  Next Step
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {isAccepted
                    ? "Commercial consensus reached. Buyer will issue formal purchase order."
                    : isCounterOffer
                    ? "Review the buyer's proposal and send your revised terms."
                    : isPending
                    ? "Submit your initial quotation to start the commercial review."
                    : "Awaiting buyer review of your quotation."}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Version</span>
                <strong className="font-semibold text-slate-900">
                  {latestQuotation ? `V${latestQuotation.quotationVersion}` : "Draft"}
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Revisions</span>
                <span className="font-bold text-slate-900 tabular-nums">{quotations.length}</span>
              </div>
            </div>
          </div>

          {/* 4. PROCUREMENT MILESTONES */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-tactile-card space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block border-b border-slate-100 pb-2">
              Procurement Milestones
            </span>

            <div className="space-y-3 text-xs">
              {/* Step 1: RFQ Transmitted */}
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <strong className="text-slate-900 block">RFQ Transmitted</strong>
                  <span className="text-[11px] text-slate-500">{formatDate(rfq.createdAt)}</span>
                </div>
              </div>

              {/* Step 2: Quotation Provided */}
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    quotations.length > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 border border-slate-200 text-slate-600"
                  }`}
                >
                  {quotations.length > 0 ? "✓" : "2"}
                </div>
                <div>
                  <strong className="text-slate-900 block">Quotation Provided</strong>
                  <span className="text-[11px] text-slate-500">
                    {quotations.length > 0 ? `${quotations.length} revision${quotations.length > 1 ? "s" : ""}` : "Pending"}
                  </span>
                </div>
              </div>

              {/* Step 3: Purchase Order */}
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    isAccepted
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 border border-slate-200 text-slate-400"
                  }`}
                >
                  {isAccepted ? "✓" : "3"}
                </div>
                <div>
                  <strong className="text-slate-900 block">Purchase Order</strong>
                  <span className="text-[11px] text-slate-500">
                    {isAccepted ? "Agreement reached" : "Pending agreement"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. BUYER PROFILE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-tactile-card space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 block border-b border-slate-100 pb-2">
              Buyer Profile
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Organization</span>
                <strong className="text-slate-900">{rfq.buyerName || "Enterprise Chemical Buyer"}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Buyer
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Payment Rating</span>
                <span className="font-semibold text-slate-800">AAA (Prompt Settlement)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SUPPLIER ACCEPT / REJECT CONFIRMATION MODAL                            */}
      {/* ========================================================================= */}
      {decisionModalMode && latestQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-slate-900 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#091E42]">
                {decisionModalMode === "accept" ? "Accept Buyer Counter-Offer?" : "Decline Buyer Counter-Offer?"}
              </h3>
              <button
                type="button"
                onClick={() => setDecisionModalMode(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {decisionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
                  {decisionError}
                </div>
              )}

              {decisionModalMode === "accept" ? (
                <div className="space-y-3">
                  <p className="text-slate-700 leading-relaxed">
                    You are accepting the buyer's counter-offer (Version {latestQuotation.quotationVersion}) under the following agreed commercial terms:
                  </p>

                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Unit Price:</span>
                      <strong className="text-slate-900 tabular-nums">{formatMoney(latestQuotation.unitPrice, latestQuotation.currency)} / {rfq.unit.toUpperCase()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Quantity:</span>
                      <span className="text-slate-900 font-semibold tabular-nums">{formatQty(rfq.quantity, rfq.unit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Lead Time:</span>
                      <span className="text-slate-900 font-semibold">{latestQuotation.leadTimeDays ? `${latestQuotation.leadTimeDays} days` : "Standard"}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Once accepted, these commercial terms become the agreed quotation and can proceed toward purchase-order issuance.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-slate-700 leading-relaxed">
                    You are about to decline the buyer's proposed commercial terms. This will mark the current negotiation as rejected.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Remarks / Operational Reason
                </label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder={
                    decisionModalMode === "accept"
                      ? "e.g. Terms accepted. Ready for standard dispatch schedule."
                      : "e.g. Price below minimum production margin."
                  }
                  className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDecisionModalMode(null)}
                  disabled={decisionSubmitting}
                  className="h-9 px-3.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={decisionModalMode === "accept" ? handleConfirmAccept : handleConfirmReject}
                  disabled={decisionSubmitting}
                  className={`h-9 px-4 rounded-xl text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors active:scale-[0.98] ${
                    decisionModalMode === "accept"
                      ? "bg-[#059669] hover:bg-[#047857]"
                      : "bg-[#DC2626] hover:bg-[#B91C1C]"
                  }`}
                >
                  {decisionSubmitting
                    ? decisionModalMode === "accept"
                      ? "Accepting..."
                      : "Rejecting..."
                    : decisionModalMode === "accept"
                    ? "Accept Quotation"
                    : "Decline Proposal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
