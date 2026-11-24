"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Dispute,
  DisputeStatus,
} from "../types/dispute";
import {
  downloadDisputeAttachment,
  respondToBuyerDispute,
  respondToSupplierDispute,
  respondToAdminDispute,
  assignDispute,
  updateDisputeStatus,
  resolveDispute,
  rejectDispute,
} from "../api/dispute";

interface DisputeDetailViewProps {
  initialDispute: Dispute;
  role: "buyer" | "supplier" | "admin";
  onUpdated?: (dispute: Dispute) => void;
}

export function DisputeDetailView({ initialDispute, role, onUpdated }: DisputeDetailViewProps) {
  const [dispute, setDispute] = useState<Dispute>(initialDispute);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Admin action states
  const [assignedAdminId, setAssignedAdminId] = useState(dispute.assignedAdminId || "");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingAdminAction, setProcessingAdminAction] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmittingMessage(true);
    setError(null);
    try {
      let updated: Dispute;
      if (role === "buyer") {
        updated = await respondToBuyerDispute(dispute.id, { message: message.trim() }, file || undefined);
      } else if (role === "supplier") {
        updated = await respondToSupplierDispute(dispute.id, { message: message.trim() }, file || undefined);
      } else {
        updated = await respondToAdminDispute(dispute.id, { message: message.trim() }, file || undefined);
      }

      setDispute(updated);
      setMessage("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setActionSuccess("Message posted to dispute timeline");
      setTimeout(() => setActionSuccess(null), 4000);
      if (onUpdated) onUpdated(updated);
    } catch (err: any) {
      setError(err.message || "Failed to post message");
    } finally {
      setSubmittingMessage(false);
    }
  }

  async function handleAssignAdmin() {
    if (!assignedAdminId.trim()) return;
    setProcessingAdminAction(true);
    setError(null);
    try {
      const updated = await assignDispute(dispute.id, { assignedAdminId: assignedAdminId.trim() });
      setDispute(updated);
      setActionSuccess("Dispute assigned successfully");
      setTimeout(() => setActionSuccess(null), 4000);
      if (onUpdated) onUpdated(updated);
    } catch (err: any) {
      setError(err.message || "Failed to assign dispute");
    } finally {
      setProcessingAdminAction(false);
    }
  }

  async function handleStatusChange(newStatus: DisputeStatus) {
    setProcessingAdminAction(true);
    setError(null);
    try {
      const updated = await updateDisputeStatus(dispute.id, { status: newStatus });
      setDispute(updated);
      setActionSuccess(`Dispute status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 4000);
      if (onUpdated) onUpdated(updated);
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setProcessingAdminAction(false);
    }
  }

  async function handleResolveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolutionNotes.trim()) return;
    setProcessingAdminAction(true);
    setError(null);
    try {
      const updated = await resolveDispute(dispute.id, { resolutionNotes: resolutionNotes.trim() });
      setDispute(updated);
      setShowResolveModal(false);
      setActionSuccess("Dispute resolved successfully");
      setTimeout(() => setActionSuccess(null), 4000);
      if (onUpdated) onUpdated(updated);
    } catch (err: any) {
      setError(err.message || "Failed to resolve dispute");
    } finally {
      setProcessingAdminAction(false);
    }
  }

  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    setProcessingAdminAction(true);
    setError(null);
    try {
      const updated = await rejectDispute(dispute.id, { rejectionReason: rejectionReason.trim() });
      setDispute(updated);
      setShowRejectModal(false);
      setActionSuccess("Dispute rejected");
      setTimeout(() => setActionSuccess(null), 4000);
      if (onUpdated) onUpdated(updated);
    } catch (err: any) {
      setError(err.message || "Failed to reject dispute");
    } finally {
      setProcessingAdminAction(false);
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

  const isClosed = dispute.status === "RESOLVED" || dispute.status === "REJECTED";

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium shadow-xs">
          {error}
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium shadow-xs">
          {actionSuccess}
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#091E42] font-mono">
                {dispute.disputeNumber}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${statusColors[dispute.status]}`}>
                {dispute.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Raised on {new Date(dispute.createdAt).toLocaleString("en-IN")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-2.5">
            {dispute.invoiceId && (
              <Link
                href={
                  role === "buyer"
                    ? `/dashboard/buyer/invoices/${dispute.invoiceId}`
                    : role === "supplier"
                    ? `/dashboard/supplier/invoices/${dispute.invoiceId}`
                    : `/dashboard/admin/transactions/invoices/${dispute.invoiceId}`
                }
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-colors shadow-2xs"
              >
                View Invoice ({dispute.invoiceNumber || "Invoice"}) →
              </Link>
            )}
            {dispute.purchaseOrderId && (
              <Link
                href={
                  role === "buyer"
                    ? `/dashboard/buyer/orders/${dispute.purchaseOrderId}`
                    : role === "supplier"
                    ? `/dashboard/supplier/orders/${dispute.purchaseOrderId}`
                    : `/dashboard/admin/transactions/orders/${dispute.purchaseOrderId}`
                }
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-colors shadow-2xs"
              >
                View Order ({dispute.poNumber || "Order"}) →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Dispute Summary & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispute Reason & Description */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card">
            <h2 className="text-sm font-semibold text-[#091E42] mb-3">
              Dispute Subject & Category
            </h2>
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Category:</span>
                <span className="font-semibold text-slate-900">
                  {dispute.reason.replace(/_/g, " ")}
                </span>
              </div>
              {dispute.customReason && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">Subject:</span>
                  <span className="font-semibold text-slate-900">{dispute.customReason}</span>
                </div>
              )}
              {dispute.disputedAmount && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">Disputed Amount:</span>
                  <span className="font-bold text-rose-600 tabular-nums text-sm">
                    ₹{Number(dispute.disputedAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-semibold text-slate-600 mb-1.5">
                Initial Description
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/60">
                {dispute.description}
              </p>
            </div>

            {dispute.resolutionNotes && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <h3 className="text-xs font-semibold text-emerald-800 mb-1">
                  Resolution Decision
                </h3>
                <p className="text-xs text-emerald-900 whitespace-pre-line leading-relaxed">
                  {dispute.resolutionNotes}
                </p>
                {dispute.resolvedAt && (
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Resolved at: {new Date(dispute.resolvedAt).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Audit Timeline */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card">
            <h2 className="text-sm font-semibold text-[#091E42] mb-4">
              Dispute Timeline & Communication History
            </h2>

            {dispute.timelineEvents && dispute.timelineEvents.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {dispute.timelineEvents.map((evt) => {
                  const isSupplier = evt.actorRole === "SUPPLIER";
                  const isAdmin = evt.actorRole === "ADMIN";

                  return (
                    <div key={evt.id} className="relative">
                      <div
                        className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 bg-white ${
                          isAdmin
                            ? "border-[#0052CC]"
                            : isSupplier
                            ? "border-amber-500"
                            : "border-emerald-600"
                        }`}
                      />
                      <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                isAdmin
                                  ? "bg-blue-100 text-[#0052CC]"
                                  : isSupplier
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-emerald-100 text-emerald-900"
                              }`}
                            >
                              {evt.actorRole}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">
                              {evt.action.replace(/_/g, " ")}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(evt.createdAt).toLocaleString("en-IN")}
                          </span>
                        </div>
                        {evt.notes && (
                          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                            {evt.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No timeline events recorded yet.</p>
            )}

            {/* Message Reply Box */}
            {!isClosed && (
              <form onSubmit={handleSendMessage} className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Post Response / Update Evidence
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message, banking clarification, or inquiry..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:border-[#0052CC] outline-none transition resize-none shadow-2xs"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingMessage || !message.trim()}
                    className="h-9 px-5 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] active:scale-[0.98] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-2xs"
                  >
                    {submittingMessage ? "Posting..." : "Send Reply"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Col: Evidence Files & Admin Adjudication Controls */}
        <div className="space-y-6">
          {/* Supporting Evidence Attachments */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card">
            <h2 className="text-sm font-semibold text-[#091E42] mb-3">
              Evidence Attachments ({dispute.attachments?.length || 0})
            </h2>

            {dispute.attachments && dispute.attachments.length > 0 ? (
              <div className="space-y-2.5">
                {dispute.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-2"
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {att.fileName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {(att.fileSize / 1024).toFixed(1)} KB • {new Date(att.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadDisputeAttachment(dispute.id, att.id, att.fileName)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-[11px] font-semibold text-[#0052CC] hover:bg-slate-50 active:scale-[0.98] transition-colors shrink-0 cursor-pointer shadow-2xs"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No attachments uploaded.</p>
            )}
          </div>

          {/* Admin Operations Panel */}
          {role === "admin" && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card space-y-4">
              <h2 className="text-sm font-semibold text-[#091E42]">
                Admin Adjudication Center
              </h2>

              {/* Assignment */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Assigned Admin ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assignedAdminId}
                    onChange={(e) => setAssignedAdminId(e.target.value)}
                    placeholder="Admin UUID"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-mono shadow-2xs"
                  />
                  <button
                    type="button"
                    disabled={processingAdminAction}
                    onClick={handleAssignAdmin}
                    className="px-3 py-1.5 rounded-xl bg-[#091E42] text-white text-xs font-semibold hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 cursor-pointer transition-colors shadow-2xs"
                  >
                    Assign
                  </button>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Update Investigation Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={processingAdminAction || dispute.status === "UNDER_REVIEW"}
                    onClick={() => handleStatusChange("UNDER_REVIEW")}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-blue-200 text-[#0052CC] hover:bg-blue-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Under Review
                  </button>
                  <button
                    type="button"
                    disabled={processingAdminAction || dispute.status === "WAITING_FOR_INFORMATION"}
                    onClick={() => handleStatusChange("WAITING_FOR_INFORMATION")}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Request Info
                  </button>
                  <button
                    type="button"
                    disabled={processingAdminAction || dispute.status === "ESCALATED"}
                    onClick={() => handleStatusChange("ESCALATED")}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-amber-300 text-amber-800 hover:bg-amber-50 transition-colors disabled:opacity-50 cursor-pointer col-span-2"
                  >
                    Escalate to Legal / Ops
                  </button>
                </div>
              </div>

              {/* Adjudication Decision Buttons */}
              {!isClosed && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowResolveModal(true)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Resolve Dispute
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Reject Dispute
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Resolve Dispute */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#091E42]">Resolve Commercial Dispute</h3>
            <p className="text-xs text-slate-500">
              Provide formal platform adjudication notes explaining the resolution findings and outcome.
            </p>
            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <textarea
                rows={4}
                required
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Bank statement confirmed fund transfer UTR12345. Supplier acknowledged receipt. Payment confirmed."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:border-[#0052CC] outline-none resize-none shadow-2xs"
              />
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingAdminAction}
                  className="px-4 py-2 rounded-xl bg-emerald-600 active:scale-[0.98] text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-2xs"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reject Dispute */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#091E42]">Reject Commercial Dispute</h3>
            <p className="text-xs text-slate-500">
              State the reason why this dispute claim is invalid or dismissed.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Evidence submitted does not establish payment debit. Claim dismissed."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:border-[#0052CC] outline-none resize-none shadow-2xs"
              />
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingAdminAction}
                  className="px-4 py-2 rounded-xl bg-rose-600 active:scale-[0.98] text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-2xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
