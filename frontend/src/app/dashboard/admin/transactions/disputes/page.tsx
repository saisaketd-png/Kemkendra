"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Dispute, DisputeStatus } from "@/features/dispute/types/dispute";
import { getAdminDisputes } from "@/features/dispute/api/dispute";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  async function loadDisputes() {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminDisputes(statusFilter === "ALL" ? undefined : statusFilter);
      setDisputes(res.content || []);
    } catch (err: any) {
      setError(err.message || "Failed to load platform disputes");
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<DisputeStatus, string> = {
    OPEN: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    UNDER_REVIEW: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    WAITING_FOR_INFORMATION: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    RESOLVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    REJECTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    ESCALATED: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Commercial Dispute Oversight
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Platform governance and adjudication center for trade payment issues and merchant disputes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition"
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
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
          <p className="text-sm">Loading platform disputes...</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <svg className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Disputes Requiring Action</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            There are currently no active merchant or buyer disputes submitted to the platform.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Dispute #</th>
                  <th className="py-3.5 px-4">Subject / Reason</th>
                  <th className="py-3.5 px-4">Invoice / Order</th>
                  <th className="py-3.5 px-4">Disputed Value</th>
                  <th className="py-3.5 px-4">Assigned Admin</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Adjudicate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      <Link
                        href={`/dashboard/admin/transactions/disputes/${d.id}`}
                        className="hover:text-primary transition"
                      >
                        {d.disputeNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {d.reason.replace(/_/g, " ")}
                      </p>
                      {d.customReason && (
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{d.customReason}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {d.invoiceNumber ? (
                        <span>Inv: <span className="font-mono">{d.invoiceNumber}</span></span>
                      ) : d.poNumber ? (
                        <span>PO: <span className="font-mono">{d.poNumber}</span></span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-rose-600 dark:text-rose-400">
                      {d.disputedAmount
                        ? `₹${Number(d.disputedAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {d.assignedAdminId ? `${d.assignedAdminId.slice(0, 8)}...` : <span className="italic text-slate-400">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[d.status]}`}>
                        {d.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/admin/transactions/disputes/${d.id}`}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition"
                      >
                        Manage →
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
