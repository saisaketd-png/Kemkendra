"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Search,
  Filter,
  RefreshCw,
  FileCheck,
  History,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Lock,
  Globe,
} from "lucide-react";
import {
  DocumentResponse,
  DocumentComplianceStatsDto,
  getAdminComplianceStats,
  getAdminDocuments,
  approveDocument,
  rejectDocument,
  expireDocument,
  downloadDocument,
  getDocumentAuditHistory,
  getDocumentVersions,
} from "@/features/documents/api/documentApi";
import { DocumentStatusBadge } from "@/shared/components/documents/DocumentStatusBadge";

export const AdminComplianceWorkspace: React.FC = () => {
  const [stats, setStats] = useState<DocumentComplianceStatsDto | null>(null);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 15;

  // Modals state
  const [selectedDoc, setSelectedDoc] = useState<DocumentResponse | null>(null);
  const [docVersions, setDocVersions] = useState<DocumentResponse[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const [approveModalDoc, setApproveModalDoc] = useState<DocumentResponse | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const [rejectModalDoc, setRejectModalDoc] = useState<DocumentResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [expireModalDoc, setExpireModalDoc] = useState<DocumentResponse | null>(null);
  const [expireReason, setExpireReason] = useState("");

  const [auditModalDoc, setAuditModalDoc] = useState<DocumentResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Load Stats
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getAdminComplianceStats();
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load compliance stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load Documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminDocuments({
        status: statusFilter,
        category: categoryFilter,
        ownerType: ownerTypeFilter,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        size: pageSize,
      });
      setDocuments(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load compliance documents.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, ownerTypeFilter, searchQuery, currentPage]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleApprove = async () => {
    if (!approveModalDoc) return;
    try {
      setSubmittingAction(true);
      await approveDocument(approveModalDoc.id, approveNotes);
      setApproveModalDoc(null);
      setApproveNotes("");
      await Promise.all([loadStats(), loadDocuments()]);
    } catch (err: any) {
      alert(err.message || "Failed to approve document.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalDoc) return;
    if (!rejectReason.trim()) {
      alert("A rejection reason is mandatory.");
      return;
    }
    try {
      setSubmittingAction(true);
      await rejectDocument(rejectModalDoc.id, rejectReason.trim());
      setRejectModalDoc(null);
      setRejectReason("");
      await Promise.all([loadStats(), loadDocuments()]);
    } catch (err: any) {
      alert(err.message || "Failed to reject document.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleExpire = async () => {
    if (!expireModalDoc) return;
    try {
      setSubmittingAction(true);
      await expireDocument(expireModalDoc.id, expireReason.trim() || undefined);
      setExpireModalDoc(null);
      setExpireReason("");
      await Promise.all([loadStats(), loadDocuments()]);
    } catch (err: any) {
      alert(err.message || "Failed to expire document.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const openAuditModal = async (doc: DocumentResponse) => {
    setAuditModalDoc(doc);
    setLoadingAudit(true);
    try {
      const logs = await getDocumentAuditHistory(doc.id);
      setAuditLogs(logs);
    } catch (e) {
      setAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  const openDetailsModal = async (doc: DocumentResponse) => {
    setSelectedDoc(doc);
    if (doc.documentGroupId) {
      setLoadingVersions(true);
      try {
        const versions = await getDocumentVersions(doc.documentGroupId);
        setDocVersions(versions);
      } catch (e) {
        setDocVersions([doc]);
      } finally {
        setLoadingVersions(false);
      }
    } else {
      setDocVersions([doc]);
    }
  };

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      await downloadDocument(doc.id, doc.originalFileName);
    } catch (e: any) {
      alert(e.message || "Error downloading document.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <FileCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Compliance & Document Verification
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and govern supplier licenses, quality certifications, regulatory certificates, and transaction proofs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadStats();
              loadDocuments();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Documents
            </span>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {statsLoading ? "..." : stats?.totalCount ?? 0}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Active repository lineage</span>
        </div>

        <div
          onClick={() => setStatusFilter("PENDING_REVIEW")}
          className={`p-4 rounded-xl cursor-pointer transition-all border shadow-xs ${
            statusFilter === "PENDING_REVIEW"
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
              : "bg-white dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/80 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Pending Review
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {statsLoading ? "..." : stats?.pendingReviewCount ?? 0}
          </div>
          <span className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1 block">Requires manual audit</span>
        </div>

        <div
          onClick={() => setStatusFilter("APPROVED")}
          className={`p-4 rounded-xl cursor-pointer transition-all border shadow-xs ${
            statusFilter === "APPROVED"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
              : "bg-white dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/80 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Approved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {statsLoading ? "..." : stats?.approvedCount ?? 0}
          </div>
          <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 block">Compliant & verified</span>
        </div>

        <div
          onClick={() => setStatusFilter("EXPIRED")}
          className={`p-4 rounded-xl cursor-pointer transition-all border shadow-xs ${
            statusFilter === "EXPIRED"
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800"
              : "bg-white dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/80 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Expired
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {statsLoading ? "..." : stats?.expiredCount ?? 0}
          </div>
          <span className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1 block">Past valid validity date</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Expiring Soon
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-2">
            {statsLoading ? "..." : stats?.expiringSoonCount ?? 0}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Expiring within 30 days</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-900/60 rounded-lg">
            {["ALL", "PENDING_REVIEW", "APPROVED", "REJECTED", "EXPIRED", "REPLACED"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(0);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === st
                    ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search file name, title, doc number..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Secondary Category and Owner Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200"
            >
              <option value="ALL">All Categories</option>
              <option value="COA">COA</option>
              <option value="MSDS">MSDS / Safety Data Sheet</option>
              <option value="MANUFACTURING_LICENSE">Manufacturing License</option>
              <option value="TECHNICAL_SPECIFICATION">Product Specification</option>
              <option value="GST_CERTIFICATE">GST Certificate</option>
              <option value="REGULATORY_CERTIFICATE">Regulatory Certificate</option>
              <option value="SUPPLIER_AUTHORIZATION_DOCUMENT">Supplier Authorization</option>
              <option value="PURITY_CERTIFICATE">Purity Certificate</option>
              <option value="PURCHASE_ORDER">Purchase Order</option>
              <option value="DELIVERY_CHALLAN">Delivery Document</option>
              <option value="COMMERCIAL_INVOICE">Commercial Invoice</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Owner Target:</span>
            <select
              value={ownerTypeFilter}
              onChange={(e) => {
                setOwnerTypeFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200"
            >
              <option value="ALL">All Targets</option>
              <option value="PRODUCT">Product</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="PURCHASE_ORDER">Purchase Order</option>
              <option value="SHIPMENT">Shipment</option>
              <option value="INVOICE">Invoice</option>
              <option value="RFQ">RFQ</option>
              <option value="QUOTATION">Quotation</option>
            </select>
          </div>

          <div className="ml-auto text-xs text-gray-400">
            Showing {documents.length} of {totalElements} documents
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading compliance documents...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-60" />
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No documents found</p>
            <p className="text-xs text-gray-400 mt-1">Try changing filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3.5">Document Details</th>
                  <th className="px-4 py-3.5">Category & Owner</th>
                  <th className="px-3 py-3.5 text-center">Version</th>
                  <th className="px-4 py-3.5">Validity / Expiry</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
                {documents.map((doc) => {
                  const isPending = doc.status === "PENDING_REVIEW" || doc.verificationStatus === "PENDING_REVIEW";
                  const isApproved = doc.status === "APPROVED" || doc.verificationStatus === "APPROVED";

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                              {doc.title || doc.originalFileName}
                              {doc.isPublic ? (
                                <span
                                  title="Publicly accessible document"
                                  className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400"
                                >
                                  <Globe className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span
                                  title="Confidential - Access strictly verified"
                                  className="inline-flex items-center text-xs text-gray-400"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                              <span>{doc.originalFileName}</span>
                              <span>&bull;</span>
                              <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                              {doc.documentNumber && (
                                <>
                                  <span>&bull;</span>
                                  <span className="font-mono text-gray-500">#{doc.documentNumber}</span>
                                </>
                              )}
                            </div>
                            {doc.reviewNotes && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic line-clamp-1">
                                Note: {doc.reviewNotes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-block font-medium text-xs text-gray-800 dark:text-gray-200">
                          {doc.category.replace(/_/g, " ")}
                        </span>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {doc.ownerType}: <span className="font-mono">{doc.ownerId.slice(0, 8)}...</span>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          v{doc.version || 1}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {doc.expiryDate ? (
                          <div className="space-y-0.5">
                            <div className="text-xs text-gray-800 dark:text-gray-200">
                              Exp: {new Date(doc.expiryDate).toLocaleDateString()}
                            </div>
                            <DocumentStatusBadge status={doc.expiryStatus} isActive={doc.isActive} />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No Expiry Date</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <DocumentStatusBadge
                          verificationStatus={doc.status || doc.verificationStatus}
                          isActive={doc.isActive}
                        />
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve / Reject Actions if pending */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => setApproveModalDoc(doc)}
                                title="Approve Document"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRejectModalDoc(doc)}
                                title="Reject Document"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Expire Action if approved */}
                          {isApproved && (
                            <button
                              onClick={() => setExpireModalDoc(doc)}
                              title="Mark as Expired"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          {/* Details & Lineage */}
                          <button
                            onClick={() => openDetailsModal(doc)}
                            title="View Details & Versions"
                            className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Audit Trail */}
                          <button
                            onClick={() => openAuditModal(doc)}
                            title="Compliance Audit Log"
                            className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Secure Download */}
                          <button
                            onClick={() => handleDownload(doc)}
                            title="Download Document"
                            className="p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================== MODALS ===================== */}

      {/* Details & Lineage Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {selectedDoc.title || selectedDoc.originalFileName}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedDoc.originalFileName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                <span className="text-gray-400 block">Category</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">
                  {selectedDoc.category.replace(/_/g, " ")}
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                <span className="text-gray-400 block">Verification Status</span>
                <div className="mt-1">
                  <DocumentStatusBadge
                    verificationStatus={selectedDoc.status || selectedDoc.verificationStatus}
                    isActive={selectedDoc.isActive}
                  />
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                <span className="text-gray-400 block">Owner Type & ID</span>
                <span className="font-mono text-gray-800 dark:text-gray-200 mt-0.5 block">
                  {selectedDoc.ownerType} ({selectedDoc.ownerId})
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                <span className="text-gray-400 block">File Size & Format</span>
                <span className="font-medium text-gray-800 dark:text-gray-200 mt-0.5 block">
                  {(selectedDoc.fileSize / 1024).toFixed(1)} KB ({selectedDoc.mimeType})
                </span>
              </div>
              {selectedDoc.issuingAuthority && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                  <span className="text-gray-400 block">Issuing Authority</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 mt-0.5 block">
                    {selectedDoc.issuingAuthority}
                  </span>
                </div>
              )}
              {selectedDoc.expiryDate && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                  <span className="text-gray-400 block">Expiry Date</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 mt-0.5 block">
                    {new Date(selectedDoc.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {selectedDoc.checksum && (
                <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                  <span className="text-gray-400 block">Cryptographic SHA-256 Hash</span>
                  <span className="font-mono text-[11px] text-gray-700 dark:text-gray-300 mt-0.5 block break-all">
                    {selectedDoc.checksum}
                  </span>
                </div>
              )}
              {selectedDoc.reviewNotes && (
                <div className="col-span-2 p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <span className="text-amber-800 dark:text-amber-300 font-semibold block">Compliance Review Note</span>
                  <p className="text-amber-700 dark:text-amber-400 mt-0.5">{selectedDoc.reviewNotes}</p>
                </div>
              )}
            </div>

            {/* Version Lineage Section */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Lineage & Version History
              </h4>
              {loadingVersions ? (
                <p className="text-xs text-gray-400">Loading version history...</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {docVersions.map((ver) => (
                    <div
                      key={ver.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        ver.id === selectedDoc.id
                          ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                          : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                          v{ver.version || 1}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                          {ver.title || ver.originalFileName}
                        </span>
                        <DocumentStatusBadge
                          verificationStatus={ver.status || ver.verificationStatus}
                          isActive={ver.isActive}
                        />
                      </div>
                      <button
                        onClick={() => handleDownload(ver)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-xs font-medium flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => handleDownload(selectedDoc)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download Document
              </button>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Approve Document</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Confirm verification for: {approveModalDoc.title || approveModalDoc.originalFileName}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Review Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Verified against official registry or portal..."
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                className="w-full text-xs p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setApproveModalDoc(null)}
                disabled={submittingAction}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submittingAction}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                {submittingAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Reject Document</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Document will be flagged REJECTED and supplier notified.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain why this document was rejected (e.g. illegible scan, expired certificate, missing signature)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setRejectModalDoc(null)}
                disabled={submittingAction}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={submittingAction || !rejectReason.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                {submittingAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expire Modal */}
      {expireModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Mark Document Expired</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  The document will be preserved in historical lineage but marked inactive.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Reason / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Supplier revoked authorization, superseded early..."
                value={expireReason}
                onChange={(e) => setExpireReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setExpireModalDoc(null)}
                disabled={submittingAction}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleExpire}
                disabled={submittingAction}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                {submittingAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Expiration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {auditModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">Compliance Audit Trail</h3>
              </div>
              <button
                onClick={() => setAuditModalDoc(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Immutable ledger for document ID: <span className="font-mono text-gray-700 dark:text-gray-300">{auditModalDoc.id}</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {loadingAudit ? (
                <p className="text-xs text-gray-400 py-6 text-center">Loading audit records...</p>
              ) : auditLogs.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No compliance actions logged for this document yet.</p>
              ) : (
                auditLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-gray-700 dark:text-gray-300">{log.details}</p>
                    )}
                    <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 border-t border-gray-200/40 dark:border-gray-700/40">
                      <span>Actor: <span className="font-mono">{log.adminId || log.userId || "System"}</span></span>
                      {log.ipAddress && <span>&bull; IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAuditModalDoc(null)}
                className="px-4 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
