"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { OrderInvoiceSummaryDto, getOrderInvoiceSummary } from "../api/fulfillment";
import { 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  FileX
} from "lucide-react";
import { Badge, StatusBadge } from "@/shared/components/ui/KemkendraUI";

interface OrderInvoicePaymentCardProps {
  orderId: string;
  poNumber: string;
  isBuyer?: boolean;
}

export function OrderInvoicePaymentCard({
  orderId,
  poNumber,
  isBuyer = true,
}: OrderInvoicePaymentCardProps) {
  const [summary, setSummary] = useState<OrderInvoiceSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderInvoiceSummary(orderId);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoice information");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-tactile-card animate-pulse">
        <div className="h-5 w-48 bg-slate-100 rounded-md mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-12 bg-slate-50 rounded-xl" />
          <div className="h-12 bg-slate-50 rounded-xl" />
          <div className="h-12 bg-slate-50 rounded-xl" />
          <div className="h-12 bg-slate-50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-tactile-card">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
          <Receipt className="w-4 h-4 text-[#0052CC]" />
          Invoice & Payment Tracking
        </div>
        <p className="text-xs text-slate-500">
          {error || "No invoice generated yet for this purchase order."}
        </p>
      </div>
    );
  }

  const currency = summary.currency || "INR";
  const formatMoney = (val?: number | null) => {
    if (val === undefined || val === null) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getInvoiceBadgeVariant = (status?: string | null): "neutral" | "success" | "warning" | "danger" | "brand" => {
    switch (status) {
      case "PAID":
        return "success";
      case "PARTIALLY_PAID":
      case "ISSUED":
        return "warning";
      case "CANCELLED":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-tactile-card flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0052CC] border border-blue-100 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Invoice & Commercial Settlement</h3>
            <p className="text-xs text-slate-500">
              {summary.hasInvoice ? `Invoice Ref: ${summary.invoiceNumber}` : `Associated with PO #${poNumber}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {summary.hasInvoice && summary.status && (
            <Badge variant={getInvoiceBadgeVariant(summary.status)}>
              {summary.status.replace(/_/g, " ")}
            </Badge>
          )}

          {summary.hasInvoice && summary.downloadPdfUrl && (
            <a
              href={summary.downloadPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              PDF
            </a>
          )}

          {summary.hasInvoice && summary.invoiceId && (
            <Link
              href={`/dashboard/invoices/${summary.invoiceId}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0052CC] border border-blue-100 transition-colors shadow-2xs"
            >
              View Full Invoice
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      {summary.hasInvoice ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Invoice</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">{formatMoney(summary.totalAmount)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tax (GST)</div>
              <div className="text-sm font-semibold font-mono text-slate-700 mt-0.5">{formatMoney(summary.taxAmount)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Amount Settled</div>
              <div className="text-sm font-bold font-mono text-emerald-600 mt-0.5">{formatMoney(summary.paidAmount)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Balance Due</div>
              <div className={`text-sm font-bold font-mono mt-0.5 ${(summary.balanceDue || 0) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {formatMoney(summary.balanceDue)}
              </div>
            </div>
          </div>

          {/* Payment Status & Proof Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <CreditCard className="w-4 h-4 text-[#0052CC]" />
              <div>
                <span className="font-semibold text-slate-900">Payment Record: </span>
                <span className={summary.paymentRecorded ? "text-emerald-600 font-semibold" : "text-slate-500"}>
                  {summary.paymentRecorded ? "Settlement Recorded" : "Pending Payment Registration"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
              {summary.proofVerified ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : summary.paymentProofUploaded ? (
                <FileCheck2 className="w-4 h-4 text-[#0052CC]" />
              ) : (
                <Clock className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <span className="font-semibold text-slate-900">Payment Proof: </span>
                <span className={summary.proofVerified ? "text-emerald-600 font-semibold" : summary.paymentProofUploaded ? "text-[#0052CC]" : "text-slate-500"}>
                  {summary.proofVerified
                    ? "Verified & Confirmed"
                    : summary.paymentProofUploaded
                    ? "Proof Uploaded (Verification Pending)"
                    : "Awaiting Bank Transfer Proof"}
                </span>
              </div>
            </div>
          </div>

          {/* Due date if applicable */}
          {summary.dueDate && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Payment Terms Due Date: <strong className="text-slate-900 font-mono">{summary.dueDate}</strong></span>
              {summary.issueDate && <span>Issued on: <span className="font-mono">{summary.issueDate}</span></span>}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">No Commercial Invoice Issued Yet</h4>
              <p className="text-xs text-slate-500">
                {isBuyer
                  ? "The supplier has not generated an invoice for this order yet. You will be notified when it is issued."
                  : "You can generate a formal tax invoice for this purchase order from your supplier dashboard."}
              </p>
            </div>
          </div>
          {!isBuyer && (
            <Link
              href={`/dashboard/invoices/new?orderId=${orderId}`}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white transition-colors flex-shrink-0 shadow-2xs"
            >
              Generate Invoice
            </Link>
          )}
        </div>
      )}

      {/* Compliance Disclaimer */}
      <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-2.5">
        Direct B2B Settlement: KemKendra provides commercial document tracking and status transparency without holding escrow custody.
      </p>
    </div>
  );
}
