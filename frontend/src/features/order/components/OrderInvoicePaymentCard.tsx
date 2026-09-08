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
      <div className="bg-white rounded-[8px] border border-[#E4E4E7] p-5 shadow-tactile animate-pulse">
        <div className="h-5 w-48 bg-[#F1F5F9] rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-12 bg-[#F8FAFC] rounded" />
          <div className="h-12 bg-[#F8FAFC] rounded" />
          <div className="h-12 bg-[#F8FAFC] rounded" />
          <div className="h-12 bg-[#F8FAFC] rounded" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-white rounded-[8px] border border-[#E4E4E7] p-5 shadow-tactile">
        <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-sm mb-2">
          <Receipt className="w-4 h-4 text-[#0284C7]" />
          Invoice & Payment Tracking
        </div>
        <p className="text-xs text-[#64748B]">
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
    <div className="bg-white rounded-[8px] border border-[#E4E4E7] p-5 shadow-tactile flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Invoice & Commercial Settlement</h3>
            <p className="text-[11px] text-[#64748B]">
              {summary.hasInvoice ? `Invoice Ref: ${summary.invoiceNumber}` : `Associated with PO #${poNumber}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-[6px] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B]" />
              PDF
            </a>
          )}

          {summary.hasInvoice && summary.invoiceId && (
            <Link
              href={`/dashboard/invoices/${summary.invoiceId}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-[6px] bg-[#0284C7]/10 hover:bg-[#0284C7]/20 text-[#0284C7] transition-colors"
            >
              View Full Invoice
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      {summary.hasInvoice ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAFAFA] p-3.5 rounded-[6px] border border-[#F1F5F9]">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Total Invoice</div>
              <div className="text-sm font-bold text-[#0F172A] mt-0.5">{formatMoney(summary.totalAmount)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Tax (GST)</div>
              <div className="text-sm font-semibold text-[#475569] mt-0.5">{formatMoney(summary.taxAmount)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Amount Settled</div>
              <div className="text-sm font-bold text-[#059669] mt-0.5">{formatMoney(summary.paidAmount)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Balance Due</div>
              <div className={`text-sm font-bold mt-0.5 ${(summary.balanceDue || 0) > 0 ? "text-[#DC2626]" : "text-[#059669]"}`}>
                {formatMoney(summary.balanceDue)}
              </div>
            </div>
          </div>

          {/* Payment Status & Proof Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-[6px] border border-[#E2E8F0] bg-white">
              <CreditCard className="w-4 h-4 text-[#0284C7]" />
              <div>
                <span className="font-semibold text-[#0F172A]">Payment Record: </span>
                <span className={summary.paymentRecorded ? "text-[#059669] font-medium" : "text-[#64748B]"}>
                  {summary.paymentRecorded ? "Settlement Recorded" : "Pending Payment Registration"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-[6px] border border-[#E2E8F0] bg-white">
              {summary.proofVerified ? (
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
              ) : summary.paymentProofUploaded ? (
                <FileCheck2 className="w-4 h-4 text-[#0284C7]" />
              ) : (
                <Clock className="w-4 h-4 text-[#94A3B8]" />
              )}
              <div>
                <span className="font-semibold text-[#0F172A]">Payment Proof: </span>
                <span className={summary.proofVerified ? "text-[#059669] font-medium" : summary.paymentProofUploaded ? "text-[#0284C7]" : "text-[#64748B]"}>
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
            <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
              <span>Payment Terms Due Date: <strong className="text-[#0F172A]">{summary.dueDate}</strong></span>
              {summary.issueDate && <span>Issued on: {summary.issueDate}</span>}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between bg-[#FAFAFA] p-4 rounded-[6px] border border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#94A3B8]" />
            <div>
              <h4 className="text-xs font-semibold text-[#0F172A]">No Commercial Invoice Issued Yet</h4>
              <p className="text-[11px] text-[#64748B]">
                {isBuyer
                  ? "The supplier has not generated an invoice for this order yet. You will be notified when it is issued."
                  : "You can generate a formal tax invoice for this purchase order from your supplier dashboard."}
              </p>
            </div>
          </div>
          {!isBuyer && (
            <Link
              href={`/dashboard/invoices/new?orderId=${orderId}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-[6px] bg-[#0284C7] hover:bg-[#0369A1] text-white transition-colors flex-shrink-0"
            >
              Generate Invoice
            </Link>
          )}
        </div>
      )}

      {/* Compliance Disclaimer */}
      <p className="text-[10px] text-[#94A3B8] border-t border-[#F8FAFC] pt-2 italic">
        Direct B2B Settlement: KemKendra provides commercial document tracking and status transparency without holding escrow custody.
      </p>
    </div>
  );
}
