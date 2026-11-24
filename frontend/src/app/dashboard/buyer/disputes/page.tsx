"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Dispute, DisputeStatus } from "@/features/dispute/types/dispute";
import { getBuyerDisputes } from "@/features/dispute/api/dispute";
import { CreateDisputeModal } from "@/features/dispute/components/CreateDisputeModal";

export default function BuyerDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  async function loadDisputes() {
    try {
      setLoading(true);
      setError(null);
      const res = await getBuyerDisputes(statusFilter === "ALL" ? undefined : statusFilter);
      setDisputes(res.content || []);
    } catch (err: any) {
      setError(err.message || "Failed to load commercial disputes");
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<DisputeStatus, string> = {
    OPEN: "bg-amber-50 text-amber-800 border-amber-200/80",
    UNDER_REVIEW: "bg-blue-50 text-[#0052CC] border-blue-200/80",
    WAITING_FOR_INFORMATION: "bg-blue-50 text-blue-700 border-blue-200/80",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200/80",
    ESCALATED: "bg-orange-50 text-orange-800 border-orange-200/80",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#091E42] tracking-tight">
            Commercial Disputes & Adjudication
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, communicate, and resolve payment or specification disputes with suppliers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-medium focus:border-[#0052CC] outline-none transition shadow-2xs"
            >
              <option value="ALL">All Disputes</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="WAITING_FOR_INFORMATION">Waiting for Info</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            + Raise Dispute
          </button>
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
          <p className="text-xs font-medium">Loading disputes...</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200/90 bg-white shadow-tactile-card">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-base font-bold text-[#091E42]">No Active Disputes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            All transaction payments and deliveries are settled cleanly. When you raise a dispute, it will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-tactile-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Dispute #</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Disputed Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link href={`/dashboard/buyer/disputes/${d.id}`} className="hover:text-[#0052CC] transition-colors">
                        {d.disputeNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {d.invoiceNumber ? (
                        <span>Inv: <span className="font-mono">{d.invoiceNumber}</span></span>
                      ) : d.poNumber ? (
                        <span>PO: <span className="font-mono">{d.poNumber}</span></span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {d.reason.replace(/_/g, " ")}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-rose-600">
                      {d.disputedAmount
                        ? `₹${Number(d.disputedAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${statusColors[d.status]}`}>
                        {d.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/buyer/disputes/${d.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-semibold text-xs transition-colors inline-block"
                      >
                        View & Reply →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreateDisputeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(created) => {
          setDisputes((prev) => [created, ...prev]);
        }}
      />
    </div>
  );
}
