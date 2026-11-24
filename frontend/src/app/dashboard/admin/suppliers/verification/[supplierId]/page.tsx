"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Globe2,
  MapPin,
  FileCheck2,
  UserCheck,
  Flag,
  AlertTriangle,
  Lock,
  ExternalLink,
  Download,
  Eye,
  CheckSquare,
  History,
  Copy,
  Check,
  Printer,
  ChevronRight,
  ShieldAlert,
  Briefcase,
  Mail,
  Phone,
  BadgeCheck,
} from "lucide-react";
import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";

interface ChecklistItem {
  verificationType: string;
  status: "PENDING" | "VERIFIED" | "FLAGGED" | "REJECTED" | string;
  mandatory: boolean;
  evidenceDocumentId?: string;
  adminNotes?: string;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

interface AuditRecord {
  id?: number;
  adminName: string;
  previousStatus: string;
  newStatus: string;
  notes: string;
  timestamp: string;
}

interface WorkspaceData {
  supplierId: number | string;
  companyName: string;
  legalName?: string;
  tradeName?: string;
  businessType?: string;
  logoUrl?: string | null;
  countryCode?: string;
  countryName?: string;
  stateProvince?: string;
  city?: string;
  postalCode?: string;
  registeredAddress?: string;
  businessEmail?: string;
  businessPhone?: string;
  authorizedRepresentativeName?: string;
  authorizedRepresentativeDesignation?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  website?: string;
  taxVatNumber?: string;
  companyRegistrationNumber?: string;
  businessDescription?: string;
  countriesServed?: string;
  primaryCategories?: string;
  yearsInBusiness?: number;
  exportReady?: boolean;
  verified?: boolean;
  verificationStatus?: "PENDING" | "UNDER_REVIEW" | "INFORMATION_REQUIRED" | "VERIFIED" | "REJECTED" | "SUSPENDED" | string;
  completenessPercentage: number;
  completenessDetails?: {
    companyIdentity?: boolean;
    taxInformation?: boolean;
    businessDocuments?: boolean;
    catalogInformation?: boolean;
  };
  checklist: ChecklistItem[];
  auditHistory: AuditRecord[];
  offeringCount?: number;
  adminRequestNotes?: string;
  supplierResponseNotes?: string;
  verificationNotes?: string;
}

export default function SupplierDeepVerificationWorkspacePage() {
  const params = useParams();
  const supplierId = params.supplierId as string;
  const router = useRouter();

  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab: 1 = Identity, 2 = Tax & Reg, 3 = Business, 4 = Address & Contact, 5 = Documents, 6 = Checklist, 7 = Audit
  const [activeTab, setActiveTab] = useState<number>(1);

  // Action / Modal States
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Item Action Modal (Verify / Flag / Reject a field or document)
  const [itemModal, setItemModal] = useState<{
    open: boolean;
    type: string;
    action: "verify" | "flag" | "reject";
    title: string;
    value?: string;
    notes: string;
    docId?: string;
  }>({
    open: false,
    type: "",
    action: "verify",
    title: "",
    value: "",
    notes: "",
  });

  // Request Information Modal
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoReason, setInfoReason] = useState("");
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [infoCustomNote, setInfoCustomNote] = useState("");

  // Final Decision Confirmation Modals
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const parseBackendError = async (res: Response, fallback: string) => {
    try {
      const errData = await res.json();
      return errData.message || errData.error || fallback;
    } catch {
      return `${fallback} (HTTP ${res.status})`;
    }
  };

  const loadWorkspace = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setActionError(null);
      const res = await authenticatedFetch(`/api/v1/admin/suppliers/${supplierId}/verification`);
      if (!res.ok) {
        throw new Error(await parseBackendError(res, "Failed to load supplier due-diligence workspace"));
      }
      const data = await res.json();
      setWorkspace(data);
    } catch (e: any) {
      setError(e.message || "Failed to load supplier due-diligence workspace");
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    if (supplierId) loadWorkspace();
  }, [supplierId, loadWorkspace]);

  // Handle Start Review
  const handleStartReview = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await authenticatedFetch(`/api/v1/admin/suppliers/${supplierId}/verification/start-review`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(await parseBackendError(res, "Failed to start review"));
      }
      await loadWorkspace();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Item-level Action (Verify, Flag, Reject)
  const submitItemAction = async () => {
    if (!itemModal.type) return;
    try {
      setActionLoading(true);
      setActionError(null);
      let body: any = {};
      if (itemModal.action === "verify") {
        body = {
          notes: itemModal.notes.trim() || "Verified by Platform Compliance Officer",
          documentId: itemModal.docId || undefined,
        };
      } else if (itemModal.action === "flag") {
        if (!itemModal.notes.trim()) {
          setActionError("Please provide an audit justification for flagging this item.");
          setActionLoading(false);
          return;
        }
        body = { notes: itemModal.notes.trim() };
      } else if (itemModal.action === "reject") {
        if (!itemModal.notes.trim()) {
          setActionError("Please specify the exact compliance non-conformance for rejecting this item.");
          setActionLoading(false);
          return;
        }
        body = { reason: itemModal.notes.trim() };
      }

      const res = await authenticatedFetch(
        `/api/v1/admin/suppliers/${supplierId}/verification/items/${itemModal.type}/${itemModal.action}`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        throw new Error(await parseBackendError(res, `Failed to ${itemModal.action} ${itemModal.title}`));
      }

      setItemModal({ open: false, type: "", action: "verify", title: "", value: "", notes: "" });
      await loadWorkspace();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Request Information
  const submitRequestInfo = async () => {
    const combinedMessage = [
      infoReason.trim() ? `Deficiency Details: ${infoReason.trim()}` : "",
      missingItems.length > 0 ? `Required Remediation Items: ${missingItems.join(", ")}` : "",
      infoCustomNote.trim() ? `Compliance Instructions: ${infoCustomNote.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!combinedMessage) {
      setActionError("Please provide specific instructions detailing what the supplier must provide.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      const res = await authenticatedFetch(`/api/v1/admin/suppliers/${supplierId}/verification/request-info`, {
        method: "POST",
        body: JSON.stringify({ requestedNotes: combinedMessage }),
      });
      if (!res.ok) {
        throw new Error(await parseBackendError(res, "Failed to send information request"));
      }
      setInfoModalOpen(false);
      setInfoReason("");
      setMissingItems([]);
      setInfoCustomNote("");
      await loadWorkspace();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Final Verify Supplier
  const submitFinalVerify = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await authenticatedFetch(`/api/v1/admin/suppliers/${supplierId}/verification/finalize`, {
        method: "POST",
        body: JSON.stringify({
          overrideReason: overrideReason.trim() || undefined,
        }),
      });
      if (!res.ok) {
        throw new Error(await parseBackendError(res, "Failed to finalize supplier verification"));
      }
      setVerifyModalOpen(false);
      setOverrideReason("");
      await loadWorkspace();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Supplier
  const submitRejectSupplier = async () => {
    if (!rejectReason.trim()) {
      setActionError("Please record a formal rejection rationale for the compliance ledger.");
      return;
    }
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await authenticatedFetch(`/api/v1/admin/suppliers/${supplierId}/verification/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      if (!res.ok) {
        throw new Error(await parseBackendError(res, "Failed to reject supplier application"));
      }
      setRejectModalOpen(false);
      setRejectReason("");
      await loadWorkspace();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Suspend Supplier
  const submitSuspendSupplier = async () => {
    if (!suspendReason.trim()) {
      setActionError("Please record a formal suspension rationale for the compliance ledger.");
      return;
    }
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await authenticatedFetch(`/api/v1/admin/suppliers/${supplierId}/verification/suspend`, {
        method: "POST",
        body: JSON.stringify({ reason: suspendReason.trim() }),
      });
      if (!res.ok) {
        throw new Error(await parseBackendError(res, "Failed to suspend supplier account"));
      }
      setSuspendModalOpen(false);
      setSuspendReason("");
      await loadWorkspace();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper mappings
  const getChecklistItem = (type: string) => {
    return workspace?.checklist?.find((c) => c.verificationType === type);
  };

  const getHumanTypeLabel = (type: string) => {
    switch (type) {
      case "LEGAL_IDENTITY":
        return "Legal Corporate Identity & Incorporation";
      case "TAX_IDENTITY":
        return "Tax Identification (GSTIN / VAT)";
      case "BUSINESS_ADDRESS":
        return "Registered Corporate Physical Address";
      case "BUSINESS_TYPE":
        return "Business Classification & Entity Type";
      case "CONTACT_INFORMATION":
        return "Authorized Key Managerial Personnel (KMP)";
      case "WEBSITE":
        return "Official Corporate Domain & Website";
      case "COMPLIANCE_CERTIFICATION":
        return "Pharmacopeia & Quality Certifications";
      case "EXPORT_CAPABILITY":
        return "Export Clearance & International Readiness";
      case "BUSINESS_OPERATION":
        return "Corporate Identification Number (CIN) Registry";
      default:
        return type.replace(/_/g, " ");
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="max-w-[1560px] mx-auto p-8 sm:p-12 min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-[#0052CC] rounded-full animate-spin" />
        <div className="space-y-1">
          <p className="text-sm font-extrabold text-[#091E42]">Accessing Due-Diligence Workspace</p>
          <p className="text-xs text-slate-500 font-mono">Retrieving statutory dossier for Supplier #{supplierId}...</p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error || !workspace) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <div className="p-6 bg-white border border-rose-200 rounded-2xl shadow-tactile-card space-y-3">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h2 className="text-sm font-extrabold">Dossier Unavailable</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || "The requested supplier due-diligence record could not be found or verification access is restricted."}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/dashboard/admin/suppliers"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Supplier Hub
            </Link>
            <button
              type="button"
              onClick={loadWorkspace}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const vStatus = workspace.verificationStatus || (workspace.verified ? "VERIFIED" : "PENDING");
  const isVerified = vStatus === "VERIFIED" || workspace.verified;
  const isUnderReview = vStatus === "UNDER_REVIEW";
  const isPending = vStatus === "PENDING";
  const isInfoReq = vStatus === "INFORMATION_REQUIRED";
  const isRejected = vStatus === "REJECTED";
  const isSuspended = vStatus === "SUSPENDED";

  // Mandatory items calculation
  const mandatoryItems = workspace.checklist?.filter((c) => c.mandatory) || [];
  const incompleteMandatory = mandatoryItems.filter((c) => c.status !== "VERIFIED");
  const canFinalVerify = incompleteMandatory.length === 0;

  // Counts for tabs
  const legalVerified = getChecklistItem("LEGAL_IDENTITY")?.status === "VERIFIED";
  const taxVerified = getChecklistItem("TAX_IDENTITY")?.status === "VERIFIED" && getChecklistItem("BUSINESS_OPERATION")?.status === "VERIFIED";
  const opsVerified = getChecklistItem("BUSINESS_TYPE")?.status === "VERIFIED" && getChecklistItem("EXPORT_CAPABILITY")?.status === "VERIFIED";
  const addressVerified = getChecklistItem("BUSINESS_ADDRESS")?.status === "VERIFIED" && getChecklistItem("CONTACT_INFORMATION")?.status === "VERIFIED";
  const totalVerifiedCount = workspace.checklist?.filter((c) => c.status === "VERIFIED").length || 0;
  const totalChecklistCount = workspace.checklist?.length || 0;

  return (
    <div className="max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8 bg-[#F8F9FA] text-[#0F172A] antialiased">
      {/* 1. TOP BREADCRUMB & CONTEXT BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <Link href="/dashboard/admin/suppliers" className="hover:text-[#0052CC] transition-colors">
              Moderation Registry
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link href="/dashboard/admin/suppliers/verification" className="hover:text-[#0052CC] transition-colors">
              Due Diligence
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-[#091E42]">Dossier #{workspace.supplierId}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/dashboard/admin/suppliers"
              className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 transition-colors"
              title="Return to Supplier Moderation Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <h1 className="text-xl sm:text-2xl font-black text-[#091E42] tracking-tight">
              {workspace.companyName || workspace.legalName || `Supplier #${supplierId}`}
            </h1>

            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                isVerified
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : isUnderReview
                  ? "bg-blue-50 text-blue-800 border-blue-200"
                  : isInfoReq
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : isPending
                  ? "bg-slate-100 text-slate-700 border-slate-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {vStatus}
            </span>

            {workspace.countryCode && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200">
                ISO: {workspace.countryCode}
              </span>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {workspace.offeringCount !== undefined && workspace.offeringCount > 0 && (
            <Link
              href={`/dashboard/admin/catalog/offerings?supplierId=${workspace.supplierId}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/90 transition-colors shadow-2xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>Catalog Offerings ({workspace.offeringCount})</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/90 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>

          <button
            type="button"
            onClick={loadWorkspace}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/90 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0052CC]" : ""}`} />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs font-bold text-rose-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. EXECUTIVE DUE-DILIGENCE RADAR & STATUTORY TELEMETRY */}
      <div className="bg-[#091E42] text-white rounded-2xl border border-slate-800 shadow-tactile-card p-6 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Overall Completeness Metric */}
          <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-700/80 pb-6 lg:pb-0 lg:pr-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Statutory Clearance Progress
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                    {workspace.completenessPercentage}%
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    ({totalVerifiedCount}/{totalChecklistCount} criteria cleared)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono uppercase text-slate-400 block">Standing</span>
                <span
                  className={`text-xs font-bold font-mono uppercase ${
                    isVerified
                      ? "text-emerald-400"
                      : isUnderReview
                      ? "text-blue-300"
                      : isInfoReq
                      ? "text-amber-400"
                      : "text-slate-300"
                  }`}
                >
                  {isVerified ? "Cleared for Catalog" : isUnderReview ? "Investigation Underway" : isInfoReq ? "Awaiting Data" : "Pending Intake"}
                </span>
              </div>
            </div>

            {/* Solid Single Progress Track (No Rainbow Gradient) */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isVerified ? "bg-emerald-500" : "bg-[#0052CC]"}`}
                style={{ width: `${workspace.completenessPercentage}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isVerified
                ? "This supplier possesses authenticated corporate standing, valid tax registration, and clearance for commercial offering listings."
                : incompleteMandatory.length > 0
                ? `${incompleteMandatory.length} mandatory requirement(s) require administrative review before catalog permissions can be granted.`
                : "All mandatory statutory checks are satisfied. Reviewer may grant Verified Supplier standing."}
            </p>
          </div>

          {/* Right: 4 Pillar Clearance Checkpoints */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Pillar 1 */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">1. Legal Entity</span>
              <strong className="text-xs font-bold text-white block truncate">
                {workspace.legalName || workspace.companyName}
              </strong>
              <div className="pt-1 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    workspace.completenessDetails?.companyIdentity ? "bg-emerald-400" : "bg-slate-500"
                  }`}
                />
                <span className="text-[10px] font-mono text-slate-300">
                  {workspace.completenessDetails?.companyIdentity ? "Recorded" : "Missing"}
                </span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">2. Tax / GST</span>
              <strong className="text-xs font-bold text-white font-mono block truncate">
                {workspace.taxVatNumber || "Not Provided"}
              </strong>
              <div className="pt-1 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    workspace.completenessDetails?.taxInformation ? "bg-emerald-400" : "bg-slate-500"
                  }`}
                />
                <span className="text-[10px] font-mono text-slate-300">
                  {workspace.completenessDetails?.taxInformation ? "Filed" : "Missing"}
                </span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">3. Operations</span>
              <strong className="text-xs font-bold text-white block truncate">
                {workspace.businessType || "Manufacturer"}
              </strong>
              <div className="pt-1 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${workspace.exportReady ? "bg-emerald-400" : "bg-blue-400"}`}
                />
                <span className="text-[10px] font-mono text-slate-300">
                  {workspace.exportReady ? "Export Ready" : "Domestic"}
                </span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">4. KYC Vault</span>
              <strong className="text-xs font-bold text-white block truncate">
                {workspace.checklist?.filter((c) => c.evidenceDocumentId).length} Documents
              </strong>
              <div className="pt-1 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    workspace.completenessDetails?.businessDocuments ? "bg-emerald-400" : "bg-slate-500"
                  }`}
                />
                <span className="text-[10px] font-mono text-slate-300">
                  {workspace.completenessDetails?.businessDocuments ? "Uploaded" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEGMENTED WORKSTATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
        {[
          { id: 1, label: "Entity & Identity", verified: legalVerified },
          { id: 2, label: "Tax & Statutory", verified: taxVerified },
          { id: 3, label: "Operations & Export", verified: opsVerified },
          { id: 4, label: "Site & Personnel", verified: addressVerified },
          { id: 5, label: "Evidence Vault", count: workspace.checklist?.filter((c) => c.evidenceDocumentId).length },
          { id: 6, label: "Verification Matrix", count: totalChecklistCount },
          { id: 7, label: "Audit Ledger", count: workspace.auditHistory?.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? "bg-[#091E42] text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90"
              }`}
            >
              <span>{tab.label}</span>
              {tab.verified && (
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isActive ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  ✓
                </span>
              )}
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. MAIN WORKSPACE CONTENT: 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Active Tab Investigation Pane */}
        <div className="lg:col-span-8 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: COMPANY IDENTITY & CORPORATE INCORPORATION */}
          {/* ======================================================== */}
          {activeTab === 1 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-tactile-card space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-[#091E42] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0052CC]" />
                    Legal Entity Identity & Brand Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify statutory corporate name against Ministry of Corporate Affairs (MCA) records.
                  </p>
                </div>
                {getChecklistItem("LEGAL_IDENTITY") && (
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border ${
                      getChecklistItem("LEGAL_IDENTITY")?.status === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : getChecklistItem("LEGAL_IDENTITY")?.status === "FLAGGED"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : getChecklistItem("LEGAL_IDENTITY")?.status === "REJECTED"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {getChecklistItem("LEGAL_IDENTITY")?.status}
                  </span>
                )}
              </div>

              {/* Corporate Identity Inspector */}
              <div className="flex flex-col sm:flex-row items-start gap-6 pt-2">
                <div className="w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 p-2">
                  {workspace.logoUrl ? (
                    <img src={workspace.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xl font-black text-slate-400 font-mono">
                      {(workspace.companyName || "KK").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">
                      Legal Registered Corporate Name
                    </span>
                    <strong className="text-slate-900 font-extrabold text-sm block mt-0.5">
                      {workspace.legalName || workspace.companyName}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">
                      Trading / Brand Name
                    </span>
                    <strong className="text-slate-900 font-bold block mt-0.5">
                      {workspace.tradeName || workspace.companyName}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">
                      Entity Classification
                    </span>
                    <strong className="text-slate-900 block mt-0.5">{workspace.businessType || "Manufacturer"}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">
                      Years in Commercial Operation
                    </span>
                    <strong className="text-slate-900 block mt-0.5">
                      {workspace.yearsInBusiness ? `${workspace.yearsInBusiness} Years` : "Not Stated"}
                    </strong>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">
                      Official Corporate Domain
                    </span>
                    {workspace.website ? (
                      <a
                        href={workspace.website.startsWith("http") ? workspace.website : `https://${workspace.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0052CC] hover:underline font-mono font-semibold inline-flex items-center gap-1 mt-0.5"
                      >
                        {workspace.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400 font-mono mt-0.5 block">Not Provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* MCA Status Note */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                  Statutory Requirement Class: MANDATORY
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Verification of legal corporate entity establishes identity legitimacy and ensures the supplier is authorized to execute commercial B2B transactions.
                </p>
              </div>

              {/* Action Buttons for Legal Identity */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Item Audit Action:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setItemModal({
                        open: true,
                        type: "LEGAL_IDENTITY",
                        action: "verify",
                        title: "Legal Corporate Identity",
                        value: workspace.legalName || workspace.companyName,
                        notes: "",
                      })
                    }
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    Verify Identity
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setItemModal({
                        open: true,
                        type: "LEGAL_IDENTITY",
                        action: "flag",
                        title: "Legal Corporate Identity",
                        value: workspace.legalName || workspace.companyName,
                        notes: "",
                      })
                    }
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    Flag
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setItemModal({
                        open: true,
                        type: "LEGAL_IDENTITY",
                        action: "reject",
                        title: "Legal Corporate Identity",
                        value: workspace.legalName || workspace.companyName,
                        notes: "",
                      })
                    }
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: TAX & STATUTORY REGISTRATION (GSTIN & CIN) */}
          {/* ======================================================== */}
          {activeTab === 2 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-tactile-card space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-[#091E42] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
                    Tax Identification & Corporate Incorporation Numbers
                  </h3>
                  <p className="text-xs text-slate-500">
                    Validate official GSTIN and Ministry of Corporate Affairs CIN.
                  </p>
                </div>
              </div>

              {/* Item A: GSTIN / Tax Identification */}
              <div className="p-5 rounded-xl border border-slate-200/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      GSTIN / Goods and Services Tax Identification Number
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <strong className="text-base font-black text-slate-900 font-mono tracking-wider">
                        {workspace.taxVatNumber || "Not Provided"}
                      </strong>
                      {workspace.taxVatNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(workspace.taxVatNumber!, "gstin")}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                          title="Copy GSTIN"
                        >
                          {copiedKey === "gstin" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {getChecklistItem("TAX_IDENTITY") && (
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase self-start sm:self-auto border ${
                        getChecklistItem("TAX_IDENTITY")?.status === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : getChecklistItem("TAX_IDENTITY")?.status === "FLAGGED"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : getChecklistItem("TAX_IDENTITY")?.status === "REJECTED"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {getChecklistItem("TAX_IDENTITY")?.status}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-mono text-slate-500">Requirement: MANDATORY</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setItemModal({
                          open: true,
                          type: "TAX_IDENTITY",
                          action: "verify",
                          title: "Tax / GST Identity",
                          value: workspace.taxVatNumber,
                          notes: "",
                        })
                      }
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      Verify GSTIN
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setItemModal({
                          open: true,
                          type: "TAX_IDENTITY",
                          action: "flag",
                          title: "Tax / GST Identity",
                          value: workspace.taxVatNumber,
                          notes: "",
                        })
                      }
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      Flag
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setItemModal({
                          open: true,
                          type: "TAX_IDENTITY",
                          action: "reject",
                          title: "Tax / GST Identity",
                          value: workspace.taxVatNumber,
                          notes: "",
                        })
                      }
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>

              {/* Item B: Company Registration / CIN */}
              <div className="p-5 rounded-xl border border-slate-200/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                      CIN / Corporate Identification Number (MCA India)
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <strong className="text-base font-black text-slate-900 font-mono tracking-wider">
                        {workspace.companyRegistrationNumber || "Not Provided"}
                      </strong>
                      {workspace.companyRegistrationNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(workspace.companyRegistrationNumber!, "cin")}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                          title="Copy CIN"
                        >
                          {copiedKey === "cin" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {getChecklistItem("BUSINESS_OPERATION") && (
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase self-start sm:self-auto border ${
                        getChecklistItem("BUSINESS_OPERATION")?.status === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : getChecklistItem("BUSINESS_OPERATION")?.status === "FLAGGED"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : getChecklistItem("BUSINESS_OPERATION")?.status === "REJECTED"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {getChecklistItem("BUSINESS_OPERATION")?.status}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-mono text-slate-500">Requirement: MANDATORY</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setItemModal({
                          open: true,
                          type: "BUSINESS_OPERATION",
                          action: "verify",
                          title: "Company Registration / CIN",
                          value: workspace.companyRegistrationNumber,
                          notes: "",
                        })
                      }
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      Verify CIN
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setItemModal({
                          open: true,
                          type: "BUSINESS_OPERATION",
                          action: "flag",
                          title: "Company Registration / CIN",
                          value: workspace.companyRegistrationNumber,
                          notes: "",
                        })
                      }
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      Flag
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setItemModal({
                          open: true,
                          type: "BUSINESS_OPERATION",
                          action: "reject",
                          title: "Company Registration / CIN",
                          value: workspace.companyRegistrationNumber,
                          notes: "",
                        })
                      }
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: COMMERCIAL & OPERATIONS PROFILE */}
          {/* ======================================================== */}
          {activeTab === 3 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-tactile-card space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-[#091E42] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0052CC]" />
                    Commercial & Chemical Operations Profile
                  </h3>
                  <p className="text-xs text-slate-500">
                    Industrial capabilities, product categories, and cross-border export standing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200/90 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Operating Classification
                  </span>
                  <strong className="text-slate-900 block font-bold text-sm">
                    {workspace.businessType || "Manufacturer"}
                  </strong>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/90 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Export Readiness Standing
                  </span>
                  <strong className="text-slate-900 block font-bold text-sm font-mono">
                    {workspace.exportReady ? "Export Authorized (International)" : "Domestic Supply Only"}
                  </strong>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/90 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Primary Product Categories
                  </span>
                  <span className="text-slate-800 font-medium block">
                    {workspace.primaryCategories || "Active Pharmaceutical Ingredients, Fine Chemicals, Intermediates"}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/90 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Export Jurisdictions Served
                  </span>
                  <span className="text-slate-800 font-medium block">
                    {workspace.countriesServed || "India, UAE, Germany, United States"}
                  </span>
                </div>

                <div className="sm:col-span-2 p-4 rounded-xl border border-slate-200/90 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Corporate & Plant Operations Summary
                  </span>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {workspace.businessDescription ||
                      "Certified bulk chemical and API synthesis plant operating in compliance with cGMP and pharmacopeial monographs (USP, EP, IP)."}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Operations */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Business Classification Verification:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setItemModal({
                        open: true,
                        type: "BUSINESS_TYPE",
                        action: "verify",
                        title: "Business Classification",
                        value: workspace.businessType,
                        notes: "",
                      })
                    }
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    Verify Classification
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setItemModal({
                        open: true,
                        type: "EXPORT_CAPABILITY",
                        action: "verify",
                        title: "Export Clearance",
                        value: workspace.exportReady ? "Export Ready" : "Domestic Only",
                        notes: "",
                      })
                    }
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    Verify Export Standing
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: REGISTERED SITE & KEY PERSONNEL (KMP) */}
          {/* ======================================================== */}
          {activeTab === 4 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-tactile-card space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-[#091E42] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0052CC]" />
                    Registered Site Address & Key Managerial Personnel
                  </h3>
                  <p className="text-xs text-slate-500">
                    Physical corporate facility and authorized compliance signatory contacts.
                  </p>
                </div>
              </div>

              {/* Physical Address Section */}
              <div className="p-5 rounded-xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Registered Physical Site Address
                  </span>
                  {getChecklistItem("BUSINESS_ADDRESS") && (
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border ${
                        getChecklistItem("BUSINESS_ADDRESS")?.status === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {getChecklistItem("BUSINESS_ADDRESS")?.status}
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-800 leading-relaxed font-mono">
                  {workspace.registeredAddress || "MIDC Industrial Estate, Chemical Zone"}, {workspace.city || "Mumbai"},{" "}
                  {workspace.stateProvince || "Maharashtra"} {workspace.postalCode ? `- ${workspace.postalCode}` : ""},{" "}
                  {workspace.countryName || "India"}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-mono text-slate-500">Requirement: MANDATORY</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setItemModal({
                          open: true,
                          type: "BUSINESS_ADDRESS",
                          action: "verify",
                          title: "Registered Business Address",
                          value: workspace.registeredAddress,
                          notes: "",
                        })
                      }
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      Verify Site Address
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setItemModal({
                          open: true,
                          type: "BUSINESS_ADDRESS",
                          action: "flag",
                          title: "Registered Business Address",
                          value: workspace.registeredAddress,
                          notes: "",
                        })
                      }
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      Flag
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Managerial Personnel (KMP) Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200/90 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Authorized Signatory
                  </span>
                  <strong className="text-slate-900 block font-bold text-sm">
                    {workspace.authorizedRepresentativeName || "Not Recorded"}
                  </strong>
                  <span className="text-[11px] text-slate-500 block">
                    {workspace.authorizedRepresentativeDesignation || "Director / Managing Partner"}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/90 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Corporate Email
                  </span>
                  <strong className="text-slate-900 block truncate font-mono text-xs">
                    {workspace.businessEmail || "N/A"}
                  </strong>
                  {workspace.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">Unverified</span>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-slate-200/90 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Direct Telephone
                  </span>
                  <strong className="text-slate-900 block font-mono text-xs">
                    {workspace.businessPhone || "N/A"}
                  </strong>
                  {workspace.phoneVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">Unverified</span>
                  )}
                </div>
              </div>

              {/* Action Buttons for Contacts */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Authorized Signatory Sign-off:</span>
                <button
                  type="button"
                  onClick={() =>
                    setItemModal({
                      open: true,
                      type: "CONTACT_INFORMATION",
                      action: "verify",
                      title: "Authorized Signatory Contacts",
                      value: `${workspace.authorizedRepresentativeName || ""} (${workspace.businessEmail || ""})`,
                      notes: "",
                    })
                  }
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Verify Key Personnel
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: EVIDENCE DOCUMENTS VAULT */}
          {/* ======================================================== */}
          {activeTab === 5 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-tactile-card space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-[#091E42] flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#0052CC]" />
                    KYC Evidence Vault & Statutory Documentation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inspect uploaded certificates, incorporation charters, and compliance filings.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {workspace.checklist
                  ?.filter((c) => c.evidenceDocumentId || c.mandatory)
                  .map((item, idx) => {
                    const isDocVerified = item.status === "VERIFIED";
                    return (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <strong className="text-slate-900 font-extrabold text-xs">
                                {getHumanTypeLabel(item.verificationType)}
                              </strong>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                  item.mandatory ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {item.mandatory ? "MANDATORY" : "OPTIONAL"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                                  isDocVerified
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : item.status === "FLAGGED"
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : item.status === "REJECTED"
                                    ? "bg-rose-50 text-rose-800 border-rose-200"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>

                            {item.adminNotes && (
                              <p className="text-xs text-slate-600">
                                <span className="font-mono text-slate-400">Auditor Memo:</span> {item.adminNotes}
                              </p>
                            )}
                            {item.rejectionReason && (
                              <p className="text-xs text-rose-700 font-bold">
                                <span className="font-mono">Deficiency:</span> {item.rejectionReason}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons for Document */}
                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            {item.evidenceDocumentId && (
                              <a
                                href={`/api/v1/documents/${item.evidenceDocumentId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" /> View File
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setItemModal({
                                  open: true,
                                  type: item.verificationType,
                                  action: "verify",
                                  title: getHumanTypeLabel(item.verificationType),
                                  docId: item.evidenceDocumentId,
                                  notes: "",
                                })
                              }
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setItemModal({
                                  open: true,
                                  type: item.verificationType,
                                  action: "flag",
                                  title: getHumanTypeLabel(item.verificationType),
                                  docId: item.evidenceDocumentId,
                                  notes: "",
                                })
                              }
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                            >
                              Flag
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setItemModal({
                                  open: true,
                                  type: item.verificationType,
                                  action: "reject",
                                  title: getHumanTypeLabel(item.verificationType),
                                  docId: item.evidenceDocumentId,
                                  notes: "",
                                })
                              }
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: VERIFICATION MATRIX (DATA-DRIVEN CHECKLIST) */}
          {/* ======================================================== */}
          {activeTab === 6 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-tactile-card space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-[#091E42] flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#0052CC]" />
                    Data-Driven Verification Checklist Matrix
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive compliance breakdown across all 9 statutory due-diligence criteria.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {workspace.checklist?.map((item, idx) => {
                  const isVerifiedItem = item.status === "VERIFIED";
                  return (
                    <div
                      key={idx}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 mt-0.5 ${
                            isVerifiedItem
                              ? "bg-emerald-600 text-white"
                              : item.status === "FLAGGED"
                              ? "bg-amber-600 text-white"
                              : item.status === "REJECTED"
                              ? "bg-rose-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {isVerifiedItem ? "✓" : item.status === "FLAGGED" ? "!" : item.status === "REJECTED" ? "✕" : "○"}
                        </span>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 font-bold text-xs">
                              {getHumanTypeLabel(item.verificationType)}
                            </strong>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                                item.mandatory ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.mandatory ? "Mandatory" : "Optional"}
                            </span>
                          </div>
                          {item.adminNotes && (
                            <p className="text-[11px] text-slate-500 italic">{item.adminNotes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border ${
                            isVerifiedItem
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : item.status === "FLAGGED"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : item.status === "REJECTED"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {item.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (item.verificationType === "LEGAL_IDENTITY") setActiveTab(1);
                            else if (item.verificationType === "TAX_IDENTITY" || item.verificationType === "BUSINESS_OPERATION") setActiveTab(2);
                            else if (item.verificationType === "BUSINESS_TYPE" || item.verificationType === "EXPORT_CAPABILITY") setActiveTab(3);
                            else if (item.verificationType === "BUSINESS_ADDRESS" || item.verificationType === "CONTACT_INFORMATION") setActiveTab(4);
                            else setActiveTab(5);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Inspect Tab
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: AUDIT HISTORY LEDGER */}
          {/* ======================================================== */}
          {activeTab === 7 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-tactile-card space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-[#091E42] flex items-center gap-2">
                    <History className="w-4 h-4 text-[#0052CC]" />
                    Immutable Administrative Verification Audit Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chronological audit log recording every moderation decision, reviewer identity, and timestamp.
                  </p>
                </div>
              </div>

              {workspace.auditHistory && workspace.auditHistory.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {workspace.auditHistory.map((audit, idx) => (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-bold">{audit.adminName || "Platform Administrator"}</strong>
                          <span className="font-mono text-slate-400 text-[10px]">
                            {audit.previousStatus} &rarr; <span className="font-bold text-slate-700">{audit.newStatus}</span>
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{audit.notes || "No additional comments"}</p>
                      </div>
                      <span className="text-slate-400 text-[11px] font-mono shrink-0 self-start sm:self-auto">
                        {new Date(audit.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-mono italic">
                  No moderation actions or status transitions recorded for this supplier profile yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Guarded Decision Engine */}
        <div className="lg:col-span-4 sticky top-6 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#0052CC]" />
                Guarded Decision Engine
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-500">Tier-1 Protocol</span>
            </div>

            {/* Application State Box */}
            {isPending && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <span className="text-xs font-black text-slate-900 block font-mono uppercase">
                  Pending Intake Review
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Application has not been formally opened by a compliance officer. Transition state to UNDER REVIEW to begin active inspection.
                </p>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleStartReview}
                  className="w-full py-2.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
                >
                  Start Review
                </button>
              </div>
            )}

            {isUnderReview && (
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-blue-900 block font-mono uppercase">
                  Investigation Underway
                </span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Supplier is under active administrative investigation. Inspect all statutory evidence tabs before issuing clearance.
                </p>
              </div>
            )}

            {/* Request Information Button */}
            <div>
              <button
                type="button"
                disabled={actionLoading || isVerified}
                onClick={() => setInfoModalOpen(true)}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-200 disabled:opacity-50"
              >
                Request Clarification (Info Required)
              </button>
            </div>

            {/* Final Verify Supplier Decision Gate */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              {isVerified ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                  <span className="text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 font-mono uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Supplier Standing
                  </span>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Statutory corporate identity authenticated. Catalog publishing rights active.
                  </p>
                </div>
              ) : (
                <>
                  {!canFinalVerify && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                      <strong className="block font-bold">Verification Gate Guarded:</strong>
                      <p>
                        {incompleteMandatory.length} mandatory requirement(s) remain unverified. Finalization requires an administrative override justification.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setVerifyModalOpen(true)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs disabled:opacity-50"
                  >
                    Grant Verified Supplier Seal
                  </button>
                </>
              )}
            </div>

            {/* Reject & Suspend Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {!isVerified && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setRejectModalOpen(true)}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold transition-colors border border-rose-200 disabled:opacity-50"
                >
                  Reject Application
                </button>
              )}

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setSuspendModalOpen(true)}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
              >
                Suspend Account & Revoke Catalog
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. TACTILE MODALS (AUTHENTIC, NON-SLOP) */}
      {/* ======================================================== */}

      {/* Modal 1: Item-Level Verification / Flag / Reject */}
      {itemModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#091E42]">
                {itemModal.action === "verify"
                  ? `Verify ${itemModal.title}`
                  : itemModal.action === "flag"
                  ? `Flag Discrepancy: ${itemModal.title}`
                  : `Reject ${itemModal.title}`}
              </h3>
            </div>

            {itemModal.value && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Submitted Value</span>
                <strong className="text-slate-800 font-mono mt-0.5 block">{itemModal.value}</strong>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {itemModal.action === "verify" ? "Auditor Remarks (Optional)" : "Reason / Defect Specification (Required)"}
              </label>
              <textarea
                rows={3}
                value={itemModal.notes}
                onChange={(e) => setItemModal({ ...itemModal, notes: e.target.value })}
                placeholder={
                  itemModal.action === "verify"
                    ? "Record certificate inspection notes or evidence verification remarks..."
                    : "Specify the exact discrepancy, missing detail, or justification..."
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0052CC]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemModal({ ...itemModal, open: false })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={submitItemAction}
                className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs ${
                  itemModal.action === "verify"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : itemModal.action === "flag"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-rose-600 hover:bg-rose-700"
                  }`}
              >
                {actionLoading ? "Saving..." : `Confirm ${itemModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Request Information Modal */}
      {infoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#091E42]">Request Information & Remediation</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Specify missing or deficient documentation for the supplier to address before re-submitting.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select Deficient Document Items</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {["GST Certificate", "CIN Incorporation", "Plant Address Proof", "Drug License", "ISO 9001 / cGMP", "Official Website / Monogram"].map((item) => (
                  <label key={item} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={missingItems.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) setMissingItems([...missingItems, item]);
                        else setMissingItems(missingItems.filter((i) => i !== item));
                      }}
                      className="rounded text-[#0052CC]"
                    />
                    <span className="font-semibold text-slate-800">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Instructions to Supplier</label>
              <textarea
                rows={3}
                value={infoCustomNote}
                onChange={(e) => setInfoCustomNote(e.target.value)}
                placeholder="e.g. Upload renewed GST-3B certificate valid for current fiscal quarter..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0052CC]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={submitRequestInfo}
                className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
              >
                {actionLoading ? "Transmitting..." : "Send Clarification Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Final Verify Confirmation Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#091E42]">Grant Verified Supplier Seal</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Granting official verified status to <strong className="text-slate-900">{workspace.companyName}</strong> activates commercial catalog publishing permissions.
              </p>
            </div>

            {!canFinalVerify && (
              <div className="space-y-1.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                <span className="font-bold text-amber-900 block">
                  Mandatory Requirements Incomplete ({incompleteMandatory.length} Pending)
                </span>
                <p className="text-amber-800 leading-relaxed">
                  Compliance protocol requires recording an explicit administrative override rationale to authorize this supplier without all standard checklist items.
                </p>
                <textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Record formal override justification..."
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium focus:outline-none mt-1"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || (!canFinalVerify && !overrideReason.trim())}
                onClick={submitFinalVerify}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs disabled:opacity-40"
              >
                {actionLoading ? "Authorizing..." : "Authorize Verification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Reject Supplier Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-rose-900">Reject Supplier Application</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Record the formal compliance or regulatory rationale for rejecting this application.
              </p>
            </div>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incongruent tax filings and invalid CIN incorporation charter..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={submitRejectSupplier}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Suspend Supplier Modal */}
      {suspendModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#091E42]">Suspend Supplier Account</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                This immediately suspends platform trading capabilities and hides all commercial offerings from the Chemical Catalog.
              </p>
            </div>

            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Critical chemical quality dispute or regulatory sanction reported..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-700"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={submitSuspendSupplier}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
              >
                {actionLoading ? "Suspending..." : "Confirm Account Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
