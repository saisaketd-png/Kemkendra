"use client";

import React, { useState } from "react";
import { Invoice, InvoiceStatus, PaymentStatus } from "../types/invoice";
import {
  cancelInvoice,
  confirmPayment,
  disputeInvoice,
  disputePayment,
  downloadInvoicePdfBlob,
  downloadPaymentProofBlob,
  rejectPayment,
  requestPaymentInfo,
} from "../api/invoice";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { CreateDisputeModal } from "@/features/dispute/components/CreateDisputeModal";

interface InvoiceDetailViewProps {
  initialInvoice: Invoice;
  userRole: "BUYER" | "SUPPLIER" | "ADMIN";
}

export function InvoiceDetailView({ initialInvoice, userRole }: InvoiceDetailViewProps) {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals for cancel, reject, request info, and dispute
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [paymentToReject, setPaymentToReject] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [paymentToRequestInfo, setPaymentToRequestInfo] = useState<string | null>(null);
  const [infoRequestNotes, setInfoRequestNotes] = useState("");

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const [paymentToDispute, setPaymentToDispute] = useState<string | null>(null);
  const [paymentDisputeReason, setPaymentDisputeReason] = useState("");

  async function handleDownloadPdf() {
    try {
      setDownloadingPdf(true);
      await downloadInvoicePdfBlob(invoice.id, `invoice-${invoice.invoiceNumber}.pdf`);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to download invoice PDF" });
    } finally {
      setDownloadingPdf(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleConfirmPayment(paymentId: string) {
    if (!confirm("Confirm receipt of these funds into your bank account?")) return;
    try {
      setActionLoading(true);
      const updated = await confirmPayment(invoice.id, paymentId);
      setInvoice(updated);
      setMessage({ type: "success", text: "Payment confirmed successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to confirm payment" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDownloadProof(paymentRecordId: string, fileName?: string) {
    try {
      await downloadPaymentProofBlob(paymentRecordId, fileName || `proof-${paymentRecordId}.pdf`);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to download payment proof" });
    }
  }

  async function handleRejectPaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentToReject || !rejectionReason.trim()) return;

    try {
      setActionLoading(true);
      const updated = await rejectPayment(invoice.id, paymentToReject, {
        rejectionReason: rejectionReason.trim(),
      });
      setInvoice(updated);
      setPaymentToReject(null);
      setRejectionReason("");
      setMessage({ type: "success", text: "Payment rejected." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to reject payment" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRequestInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentToRequestInfo || !infoRequestNotes.trim()) return;

    try {
      setActionLoading(true);
      const updated = await requestPaymentInfo(invoice.id, paymentToRequestInfo, {
        message: infoRequestNotes.trim(),
      });
      setInvoice(updated);
      setPaymentToRequestInfo(null);
      setInfoRequestNotes("");
      setMessage({ type: "success", text: "Clarification requested from buyer." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to request clarification" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisputePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentToDispute || !paymentDisputeReason.trim()) return;

    try {
      setActionLoading(true);
      const updated = await disputePayment(invoice.id, paymentToDispute, {
        disputeReason: paymentDisputeReason.trim(),
      });
      setInvoice(updated);
      setPaymentToDispute(null);
      setPaymentDisputeReason("");
      setMessage({ type: "success", text: "Payment proof marked as disputed." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to dispute payment" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelInvoiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cancelReason.trim()) return;

    try {
      setActionLoading(true);
      const updated = await cancelInvoice(invoice.id, {
        cancellationReason: cancelReason.trim(),
      });
      setInvoice(updated);
      setShowCancelModal(false);
      setMessage({ type: "success", text: "Tax invoice cancelled." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to cancel invoice" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisputeInvoiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    try {
      setActionLoading(true);
      const updated = await disputeInvoice(invoice.id, {
        disputeReason: disputeReason.trim(),
      });
      setInvoice(updated);
      setShowDisputeModal(false);
      setMessage({ type: "success", text: "Invoice marked as disputed." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to dispute invoice" });
    } finally {
      setActionLoading(false);
    }
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "PARTIALLY_PAID":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "ISSUED":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "DISPUTED":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {message && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline ml-4 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {invoice.invoiceNumber}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(
                invoice.status
              )}`}
            >
              {invoice.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Issued: {new Date(invoice.invoiceDate).toLocaleDateString()} | Due:{" "}
            {new Date(invoice.dueDate).toLocaleDateString()} | FY: {invoice.financialYear}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {downloadingPdf ? "Generating PDF..." : "Download PDF"}
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print
          </button>

          {/* Role specific primary actions */}
          {userRole === "BUYER" && invoice.status !== "CANCELLED" && invoice.status !== "PAID" && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-sm font-semibold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Record Payment Proof
            </button>
          )}

          {userRole === "BUYER" && invoice.status !== "CANCELLED" && invoice.status !== "DISPUTED" && (
            <button
              onClick={() => setShowDisputeModal(true)}
              className="px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-xs font-semibold transition cursor-pointer"
            >
              Dispute Invoice
            </button>
          )}

          {invoice.status !== "CANCELLED" && (
            <button
              onClick={() => setIsDisputeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold transition cursor-pointer"
            >
              Raise Dispute
            </button>
          )}

          {userRole === "SUPPLIER" && invoice.status !== "CANCELLED" && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold transition cursor-pointer"
            >
              Cancel Invoice
            </button>
          )}
        </div>
      </div>

      {/* Invoice Document Paper Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-wrap justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">KemKendra B2B Commerce</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              TAX INVOICE
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  invoice.isInterstate
                    ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                    : "bg-teal-500/10 text-teal-600 border-teal-500/20"
                }`}
              >
                {invoice.isInterstate ? "INTER-STATE (IGST)" : "INTRA-STATE (CGST + SGST)"}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Place of Supply: {invoice.placeOfSupplyState} ({invoice.placeOfSupplyStateCode})
              </span>
            </div>
          </div>

          <div className="text-right space-y-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{invoice.invoiceNumber}</p>
            <p className="text-xs text-slate-500">
              Date: <span className="font-medium text-slate-700 dark:text-slate-300">{invoice.invoiceDate}</span>
            </p>
            <p className="text-xs text-slate-500">
              Due: <span className="font-medium text-slate-700 dark:text-slate-300">{invoice.dueDate}</span>
            </p>
            {invoice.poNumber && (
              <p className="text-xs text-slate-500">
                PO: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{invoice.poNumber}</span>
              </p>
            )}
          </div>
        </div>

        {/* Parties (Supplier vs Buyer Snapshots) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supplier Snapshot */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2 text-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Supplier (Seller / Consignor)</p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{invoice.supplierLegalName}</h4>
            {invoice.supplierTradeName && (
              <p className="text-slate-600 dark:text-slate-400">Trade: {invoice.supplierTradeName}</p>
            )}
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
              GSTIN: {invoice.supplierGstin || "Unregistered / None"}
            </p>
            {invoice.supplierPan && <p className="font-mono text-slate-500">PAN: {invoice.supplierPan}</p>}
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {invoice.supplierAddress}, {invoice.supplierCity ? invoice.supplierCity + ", " : ""}
              {invoice.supplierState} ({invoice.supplierStateCode}) {invoice.supplierPostalCode || ""}
            </p>
            {invoice.supplierEmail && <p className="text-slate-500">Email: {invoice.supplierEmail}</p>}
          </div>

          {/* Buyer Snapshot */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2 text-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Buyer (Recipient / Bill To)</p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{invoice.buyerLegalName}</h4>
            {invoice.buyerTradeName && (
              <p className="text-slate-600 dark:text-slate-400">Trade: {invoice.buyerTradeName}</p>
            )}
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
              GSTIN: {invoice.buyerGstin || "Unregistered / None"}
            </p>
            {invoice.buyerPan && <p className="font-mono text-slate-500">PAN: {invoice.buyerPan}</p>}
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Billing: {invoice.buyerBillingAddress}
            </p>
            {invoice.buyerShippingAddress && invoice.buyerShippingAddress !== invoice.buyerBillingAddress && (
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Shipping: {invoice.buyerShippingAddress}
              </p>
            )}
            {invoice.buyerEmail && <p className="text-slate-500">Email: {invoice.buyerEmail}</p>}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-y border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Product Description</th>
                <th className="py-3 px-3">HSN</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3 text-right">Rate (₹)</th>
                <th className="py-3 px-3 text-right">Taxable (₹)</th>
                <th className="py-3 px-3 text-right">{invoice.isInterstate ? "IGST" : "CGST + SGST"}</th>
                <th className="py-3 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoice.items &&
                invoice.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-3 text-slate-400">{item.itemNumber}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.productName}</p>
                      {item.productCode && (
                        <span className="text-[11px] font-mono text-slate-500">Code: {item.productCode}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">{item.hsnCode}</td>
                    <td className="py-3.5 px-3 text-right font-medium text-slate-900 dark:text-white">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      ₹{Number(item.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      ₹{Number(item.taxableValue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      {invoice.isInterstate ? (
                        <span>
                          {item.igstRate}% (₹
                          {Number(item.igstAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })})
                        </span>
                      ) : (
                        <span>
                          C: {item.cgstRate}% + S: {item.sgstRate}% (₹
                          {Number(Number(item.cgstAmount) + Number(item.sgstAmount)).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                          )
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                      ₹{Number(item.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Monetary Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-3 text-xs text-slate-500 leading-relaxed">
            <h5 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              Terms & Non-Custodial Settlement
            </h5>
            <p>1. Buyer shall remit funds directly into Supplier verified bank account.</p>
            <p>2. KemKendra operates solely as a non-custodial B2B facilitator and does not handle or hold payment escrow.</p>
            <p>3. Upload transaction reference / UTR upon completing bank settlement.</p>
            {invoice.notes && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Note:</span> {invoice.notes}
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Taxable Value:</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                ₹{Number(invoice.taxableAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {!invoice.isInterstate ? (
              <>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>CGST:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    ₹{Number(invoice.cgstAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>SGST:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    ₹{Number(invoice.sgstAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>IGST:</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  ₹{Number(invoice.igstAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount Applied:</span>
                <span className="font-mono">
                  -₹{Number(invoice.discountAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {invoice.additionalCharges > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Additional Charges:</span>
                <span className="font-mono">
                  +₹{Number(invoice.additionalCharges).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-base font-extrabold text-slate-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="font-mono">
                ₹{Number(invoice.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-1">
              <span>Amount Paid (Confirmed):</span>
              <span className="font-mono font-semibold">
                ₹{Number(invoice.amountPaid || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold text-sm pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Balance Due:</span>
              <span className="font-mono">
                ₹{Number(invoice.amountDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Proof Records Log */}
        {invoice.paymentRecords && invoice.paymentRecords.length > 0 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Payment Settlement Log
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              {invoice.paymentRecords.map((rec) => (
                <div key={rec.id} className="p-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ₹{Number(rec.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        {rec.paymentMode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          rec.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : rec.status === "DISPUTED"
                            ? "bg-rose-500/10 text-rose-600"
                            : rec.status === "FAILED"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-blue-500/10 text-blue-600"
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Ref: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{rec.paymentReference}</span>
                      {rec.bankName ? ` | Bank: ${rec.bankName}` : ""} | Date: {rec.paymentDate}
                    </p>

                    {rec.notes && (
                      <p className="text-slate-600 dark:text-slate-400">Notes: {rec.notes}</p>
                    )}

                    {/* Proof Document Link */}
                    {rec.proofFileName && (
                      <div>
                        <button
                          type="button"
                          onClick={() => handleDownloadProof(rec.id, rec.proofFileName)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold text-primary transition cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Proof Document ({rec.proofFileName})
                        </button>
                      </div>
                    )}

                    {rec.reviewNotes && (
                      <p className="text-emerald-700 dark:text-emerald-400 italic">Confirmed Notes: {rec.reviewNotes}</p>
                    )}
                    {rec.rejectionReason && (
                      <p className="text-rose-600 dark:text-rose-400 font-medium">Rejection Reason: {rec.rejectionReason}</p>
                    )}
                    {rec.infoRequestedNotes && (
                      <p className="text-purple-600 dark:text-purple-400 font-medium">Clarification Requested: {rec.infoRequestedNotes}</p>
                    )}
                    {rec.disputeReason && (
                      <p className="text-rose-600 dark:text-rose-400 font-medium">Dispute: {rec.disputeReason}</p>
                    )}
                  </div>

                  {userRole === "SUPPLIER" && rec.status === "PROOF_UPLOADED" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleConfirmPayment(rec.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer"
                      >
                        Confirm Receipt
                      </button>
                      <button
                        onClick={() => setPaymentToRequestInfo(rec.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 font-semibold text-xs transition cursor-pointer"
                      >
                        Request Info
                      </button>
                      <button
                        onClick={() => setPaymentToReject(rec.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold text-xs transition cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setPaymentToDispute(rec.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition cursor-pointer"
                      >
                        Dispute
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Immutable Audit Trail */}
        {invoice.audits && invoice.audits.length > 0 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audit Trail</h4>
            <div className="space-y-2">
              {invoice.audits.map((a) => (
                <div
                  key={a.id}
                  className="text-[11px] p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 flex items-center justify-between"
                >
                  <span className="font-medium">
                    <strong className="text-slate-900 dark:text-white uppercase mr-2 font-mono">[{a.action}]</strong>
                    {a.details}
                  </span>
                  <span className="text-slate-400 shrink-0 ml-4">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        invoice={invoice}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={(updated) => {
          setInvoice(updated);
          setMessage({ type: "success", text: "Payment proof recorded successfully." });
        }}
      />

      {/* Cancel Invoice Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cancel Tax Invoice</h3>
            <p className="text-xs text-slate-500">
              Invoices with confirmed payments cannot be cancelled. Please state the cancellation reason.
            </p>
            <form onSubmit={handleCancelInvoiceSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Order cancelled or incorrect billing snapshot provided."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:border-primary"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-xs rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700"
                >
                  {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Invoice Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Dispute Tax Invoice</h3>
            <p className="text-xs text-slate-500">
              Explain why this invoice is disputed (e.g. rate mismatch, quantity discrepancy, or wrong GSTIN).
            </p>
            <form onSubmit={handleDisputeInvoiceSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="State your dispute reason in detail..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:border-primary"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-xs rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700"
                >
                  {actionLoading ? "Disputing..." : "Submit Dispute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Dispute Modal */}
      {paymentToDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Dispute Payment Proof</h3>
            <p className="text-xs text-slate-500">
              State why this payment is not confirmed (e.g. UTR not credited in supplier bank account).
            </p>
            <form onSubmit={handleDisputePaymentSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={paymentDisputeReason}
                onChange={(e) => setPaymentDisputeReason(e.target.value)}
                placeholder="Reason for payment dispute..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:border-primary"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentToDispute(null)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-xs rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700"
                >
                  {actionLoading ? "Submitting..." : "Dispute Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Payment Modal */}
      {paymentToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reject Payment Proof</h3>
            <p className="text-xs text-slate-500">
              State the reason for rejecting this payment record (e.g. UTR not found in bank statement, invalid transaction receipt).
            </p>
            <form onSubmit={handleRejectPaymentSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State why this payment is rejected..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:border-primary"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentToReject(null)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-xs rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700"
                >
                  {actionLoading ? "Rejecting..." : "Reject Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Payment Information Modal */}
      {paymentToRequestInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Request Information from Buyer</h3>
            <p className="text-xs text-slate-500">
              Send a clarification request to the buyer (e.g. asking for clearer bank advice copy, or verifying originating account number).
            </p>
            <form onSubmit={handleRequestInfoSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={infoRequestNotes}
                onChange={(e) => setInfoRequestNotes(e.target.value)}
                placeholder="What clarification do you require from buyer?..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:border-primary"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentToRequestInfo(null)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-xs rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
                >
                  {actionLoading ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Commercial Dispute Modal */}
      <CreateDisputeModal
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
        purchaseOrderId={invoice.purchaseOrderId}
        poNumber={invoice.poNumber}
        defaultAmount={invoice.amountDue || invoice.grandTotal}
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onSuccess={() => {
          setMessage({
            type: "success",
            text: "Commercial dispute raised successfully. Platform operations notified.",
          });
        }}
      />
    </div>
  );
}
