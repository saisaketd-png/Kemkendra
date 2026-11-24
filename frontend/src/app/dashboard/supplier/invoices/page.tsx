"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Invoice, InvoiceStatus } from "@/features/invoice/types/invoice";
import { getSupplierInvoices } from "@/features/invoice/api/invoice";

export default function SupplierInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  async function loadInvoices() {
    try {
      setLoading(true);
      setError(null);
      const res = await getSupplierInvoices(statusFilter === "ALL" ? undefined : statusFilter);
      setInvoices(res.content || []);
    } catch (err: any) {
      setError(err.message || "Failed to load supplier invoices");
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "PARTIALLY_PAID":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "ISSUED":
        return "bg-amber-50 text-amber-800 border-amber-200/80";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "DISPUTED":
        return "bg-orange-50 text-orange-800 border-orange-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#091E42] tracking-tight">
            Supplier Issued Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track issued tax invoices, reconcile non-custodial buyer payment proofs, and maintain GST records.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-medium focus:border-[#0052CC] outline-none transition shadow-2xs"
          >
            <option value="ALL">All Invoices</option>
            <option value="ISSUED">Issued (Pending Payment)</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid (Settled)</option>
            <option value="DISPUTED">Disputed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#0052CC] border-t-transparent mb-2"></div>
          <p className="text-xs font-medium">Loading issued invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200/90 bg-white shadow-tactile-card">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-base font-bold text-[#091E42]">No Issued Invoices Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            You can issue tax invoices directly from your confirmed purchase orders under Orders.
          </p>
          <div className="mt-4">
            <Link
              href="/dashboard/supplier/orders"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] active:scale-[0.98] text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              View Orders to Issue Invoice
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-tactile-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">PO Ref</th>
                  <th className="py-3 px-4">Date / Due</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                  <th className="py-3 px-4 text-right">Balance Due (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{inv.buyerLegalName}</p>
                      <p className="text-[11px] font-mono text-slate-500">GSTIN: {inv.buyerGstin || "N/A"}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {inv.poNumber || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p>{inv.invoiceDate}</p>
                      <p className="text-[11px] text-slate-400">Due: {inv.dueDate}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                      ₹{Number(inv.taxableAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{Number(inv.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                      ₹{Number(inv.amountDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getStatusBadge(inv.status)}`}>
                        {inv.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/supplier/invoices/${inv.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] active:scale-[0.98] text-white text-xs font-semibold transition-colors inline-block shadow-2xs"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
