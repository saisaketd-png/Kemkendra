"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import {
  FlaskConical,
  ArrowLeft,
  Calendar,
  Building2,
  Scale,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Download,
  Send,
  MessageSquare,
  FileText,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Lock,
  Copy,
  ChevronRight,
  Package,
  MapPin,
  Tag,
  DollarSign,
  AlertTriangle,
  UploadCloud,
  Loader2,
  Info,
} from "lucide-react";
import { getAuthUser, getAuthToken } from "@/features/auth/api/auth";
import { resolveApiUrl } from "@/lib/apiUrl";
import {
  SourcingRequestDetail,
  SourcingProposalItem,
  SourcingProposalOptionItem,
  SourcingStatus,
  fetchBuyerSourcingRequestDetail,
  fetchBuyerPublishedProposals,
  submitBuyerOptionDecision,
  submitBuyerClarificationInquiry,
  submitBuyerAdditionalInformation,
} from "@/features/admin/api/adminSourcingApi";

export default function BuyerSourcingTrackPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.requestId;
  const router = useRouter();

  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Data State
  const [detail, setDetail] = useState<SourcingRequestDetail | null>(null);
  const [proposals, setProposals] = useState<SourcingProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Additional Information Submission Form State
  const [additionalInfoText, setAdditionalInfoText] = useState("");
  const [additionalInfoFile, setAdditionalInfoFile] = useState<File | null>(null);
  const [submittingInfo, setSubmittingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);

  // Option Acceptance Modal State
  const [selectedOptionForDecision, setSelectedOptionForDecision] = useState<{
    proposal: SourcingProposalItem;
    option: SourcingProposalOptionItem;
  } | null>(null);
  const [decisionRemarks, setDecisionRemarks] = useState("");
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState<string | null>(null);

  // Clarification Inquiry Form State
  const [activeClarificationProposalId, setActiveClarificationProposalId] = useState<string | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState("");
  const [clarificationSubject, setClarificationSubject] = useState("");
  const [clarificationSubmitting, setClarificationSubmitting] = useState(false);
  const [clarificationSuccess, setClarificationSuccess] = useState<string | null>(null);

  // 1. Check Authentication on Mount
  useEffect(() => {
    const user = getAuthUser();
    const token = getAuthToken();
    if (!user || !token) {
      setCurrentUser(null);
    } else {
      setCurrentUser(user);
    }
    setAuthChecked(true);
  }, []);

  // 2. Load Request Data when Auth is verified
  const loadData = async () => {
    setLoading(true);
    setError(null);
    setIsForbidden(false);
    try {
      const [detailData, proposalsData] = await Promise.all([
        fetchBuyerSourcingRequestDetail(requestId),
        fetchBuyerPublishedProposals(requestId).catch(() => []),
      ]);
      setDetail(detailData);
      setProposals(proposalsData);
    } catch (err: any) {
      const message = err.message || "";
      if (message.includes("403") || message.toLowerCase().includes("access denied") || message.toLowerCase().includes("not authorized")) {
        setIsForbidden(true);
      } else {
        setError(message || "Failed to load sourcing tracking details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked && currentUser) {
      loadData();
    } else if (authChecked && !currentUser) {
      setLoading(false);
    }
  }, [authChecked, currentUser, requestId]);

  // Handle Copy Reference Number
  const handleCopyReference = () => {
    if (!detail) return;
    navigator.clipboard.writeText(detail.sourcingRequestReference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Handle Submitting Additional Info
  const handleSubmitAdditionalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!additionalInfoText.trim()) return;

    setSubmittingInfo(true);
    setInfoError(null);
    setInfoSuccess(null);

    try {
      let attachmentRef: string | undefined = undefined;
      if (additionalInfoFile) {
        try {
          const token = getAuthToken();
          const formData = new FormData();
          formData.append("file", additionalInfoFile);
          formData.append("ownerType", "USER");
          formData.append("ownerId", currentUser?.id || currentUser?.email || "buyer");
          formData.append("category", "SPECIFICATION");
          formData.append("title", `Supplemental Spec - ${detail?.productName || "Product"}`);

          const docRes = await fetch(resolveApiUrl("/api/v1/documents"), {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });

          if (docRes.ok) {
            const docData = await docRes.json();
            attachmentRef = docData.id ? String(docData.id) : (docData.url || additionalInfoFile.name);
          } else {
            attachmentRef = additionalInfoFile.name;
          }
        } catch {
          attachmentRef = additionalInfoFile.name;
        }
      }

      const updated = await submitBuyerAdditionalInformation(requestId, {
        additionalInfo: additionalInfoText.trim(),
        attachmentReferences: attachmentRef,
      });

      setDetail(updated);
      setInfoSuccess("Your additional details have been sent to our procurement desk. Review has resumed.");
      setAdditionalInfoText("");
      setAdditionalInfoFile(null);
      // Reload proposals in case status changed
      const proposalsData = await fetchBuyerPublishedProposals(requestId).catch(() => []);
      setProposals(proposalsData);
    } catch (err: any) {
      setInfoError(err.message || "Failed to submit additional information. Please try again.");
    } finally {
      setSubmittingInfo(false);
    }
  };

  // Handle Confirming Decision on Option
  const handleConfirmDecision = async (decision: "ACCEPTED" | "DECLINED") => {
    if (!selectedOptionForDecision) return;
    setDecisionSubmitting(true);
    try {
      await submitBuyerOptionDecision(
        requestId,
        selectedOptionForDecision.proposal.id,
        selectedOptionForDecision.option.id,
        {
          decision,
          remarks: decisionRemarks.trim() || undefined,
        }
      );
      setDecisionSuccess(
        decision === "ACCEPTED"
          ? `Interest in "${selectedOptionForDecision.option.optionLabel}" successfully recorded! Our procurement executive will contact you for fulfillment.`
          : `Declined "${selectedOptionForDecision.option.optionLabel}".`
      );
      await loadData();
      setTimeout(() => {
        setSelectedOptionForDecision(null);
        setDecisionSuccess(null);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to submit decision");
    } finally {
      setDecisionSubmitting(false);
    }
  };

  // Handle Clarification Question Submission
  const handleSubmitClarification = async (proposalId: string) => {
    if (!clarificationQuestion.trim()) return;
    setClarificationSubmitting(true);
    try {
      await submitBuyerClarificationInquiry(requestId, proposalId, {
        question: clarificationQuestion.trim(),
        subject: clarificationSubject.trim() || undefined,
      });
      setClarificationSuccess("Your clarification question has been submitted to the sourcing team.");
      setClarificationQuestion("");
      setClarificationSubject("");
      await loadData();
      setTimeout(() => {
        setClarificationSuccess(null);
        setActiveClarificationProposalId(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message || "Failed to submit clarification question");
    } finally {
      setClarificationSubmitting(false);
    }
  };

  // Helper for Status Badge styling and human-readable label
  const getStatusBadge = (status: SourcingStatus) => {
    switch (status) {
      case "SUBMITTED":
        return {
          label: "Submitted",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          desc: "Received by KemKendra procurement desk. Under initial review.",
        };
      case "UNDER_REVIEW":
        return {
          label: "Under Review",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          desc: "Specialists are evaluating chemical specifications and supplier reach.",
        };
      case "MORE_INFORMATION_REQUIRED":
        return {
          label: "Action Required: More Info Needed",
          bg: "bg-rose-50 text-rose-700 border-rose-300 animate-pulse",
          dot: "bg-rose-500",
          desc: "Our sourcing desk requested additional specifications from you.",
        };
      case "ACCEPTED":
        return {
          label: "Accepted for Sourcing",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dot: "bg-emerald-500",
          desc: "Requirement verified and accepted. Supplier matching is active.",
        };
      case "SOURCING":
      case "SUPPLIER_CONTACTED":
        return {
          label: "Sourcing in Progress",
          bg: "bg-blue-50 text-[#0052CC] border-blue-200/80",
          dot: "bg-[#0052CC]",
          desc: "Connecting directly with manufacturers and verified chemical distributors.",
        };
      case "QUOTATIONS_RECEIVED":
      case "PROPOSAL_READY":
        return {
          label: "Quotes Received",
          bg: "bg-blue-50 text-blue-700 border-blue-200/80",
          dot: "bg-blue-600",
          desc: "Supplier quotes received. Curating optimal commercial proposal.",
        };
      case "PROPOSAL_SENT":
        return {
          label: "Proposal Ready for Review",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
          dot: "bg-emerald-600",
          desc: "Sourcing proposal published with curated supplier options.",
        };
      case "NEGOTIATION":
        return {
          label: "Option Selected / Negotiation",
          bg: "bg-blue-50 text-blue-800 border-blue-200/80",
          dot: "bg-blue-700",
          desc: "Supplier option selected. Terms and shipment schedules finalizing.",
        };
      case "FULFILLED":
      case "COMPLETED":
        return {
          label: "Fulfilled",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dot: "bg-emerald-600",
          desc: "Procurement fulfilled and delivered successfully.",
        };
      case "CLOSED":
        return {
          label: "Closed",
          bg: "bg-slate-100 text-slate-700 border-slate-300",
          dot: "bg-slate-400",
          desc: "Sourcing inquiry cycle closed.",
        };
      case "REJECTED":
      case "CANCELLED":
        return {
          label: "Cancelled / Unavailable",
          bg: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
          desc: "Could not be fulfilled with current manufacturer availability.",
        };
      default:
        return {
          label: status,
          bg: "bg-slate-100 text-slate-700 border-slate-300",
          dot: "bg-slate-400",
          desc: "Status updated.",
        };
    }
  };

  // Status Stepper Milestone Definitions
  const getTimelineMilestone = (status: SourcingStatus) => {
    switch (status) {
      case "SUBMITTED":
        return 1;
      case "UNDER_REVIEW":
      case "MORE_INFORMATION_REQUIRED":
      case "ACCEPTED":
        return 2;
      case "SOURCING":
      case "SUPPLIER_CONTACTED":
      case "QUOTATIONS_RECEIVED":
      case "PROPOSAL_READY":
        return 3;
      case "PROPOSAL_SENT":
      case "NEGOTIATION":
        return 4;
      case "FULFILLED":
      case "COMPLETED":
      case "CLOSED":
        return 5;
      case "REJECTED":
      case "CANCELLED":
        return 2;
      default:
        return 1;
    }
  };

  // Find the latest more-info query if present in status history
  const latestMoreInfoRequest = detail?.statusHistory?.find(
    (h) => h.newStatus === "MORE_INFORMATION_REQUIRED"
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/sourcing" className="hover:text-blue-600 transition-colors">
            KemKendra Sourcing
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">
            {detail?.sourcingRequestReference || "Track Sourcing Request"}
          </span>
        </div>

        {/* 1. Unauthenticated Gate */}
        {authChecked && !currentUser && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 sm:p-12 text-center max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Sign In to Track Sourcing Request</h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Sourcing requests and proposals contain proprietary commercial and pricing information. Please sign in with your registered KemKendra buyer account to track this requirement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/login?redirect=/sourcing/track/${requestId}`}
                className="w-full sm:w-auto px-6 py-3 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg font-semibold shadow-xs transition-colors inline-flex items-center justify-center gap-2 press-tactile"
              >
                Sign In to Account
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sourcing"
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors inline-flex items-center justify-center press-tactile"
              >
                Learn About Sourcing
              </Link>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Strict enterprise confidentiality & NDA protected</span>
            </div>
          </div>
        )}

        {/* 2. Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">Retrieving Sourcing Tracker Data...</h3>
            <p className="text-sm text-slate-500 mt-1">Connecting to KemKendra procurement desk</p>
          </div>
        )}

        {/* 3. Access Restricted / Forbidden State */}
        {!loading && isForbidden && (
          <div className="bg-white rounded-2xl border border-rose-200/80 shadow-sm p-8 sm:p-12 text-center max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Confidential Sourcing Record</h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              This chemical sourcing request is private to the registered enterprise that submitted it. You do not have permission to view commercial proposals or tracking status for this inquiry.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/buyer/sourcing"
                className="w-full sm:w-auto px-6 py-3 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg font-semibold shadow-xs transition-colors press-tactile"
              >
                My Sourcing Requests
              </Link>
              <Link
                href="/sourcing/request"
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors press-tactile"
              >
                Submit New Request
              </Link>
            </div>
          </div>
        )}

        {/* 4. Generic Error State */}
        {!loading && error && !isForbidden && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-lg mx-auto my-12 shadow-tactile-card">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Unable to Load Sourcing Request</h3>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={loadData}
                className="px-5 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2 shadow-xs press-tactile"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
              <Link
                href="/sourcing"
                className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors press-tactile"
              >
                Back to Sourcing
              </Link>
            </div>
          </div>
        )}

        {/* 5. Main Tracking Content when Loaded */}
        {!loading && !error && !isForbidden && detail && (
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono text-sm font-semibold rounded-lg flex items-center gap-1.5 border border-slate-200">
                      {detail.sourcingRequestReference}
                      <button
                        type="button"
                        onClick={handleCopyReference}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                        title="Copy reference code"
                      >
                        {copiedRef ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(detail.status).bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${getStatusBadge(detail.status).dot}`} />
                      {getStatusBadge(detail.status).label}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {detail.productName}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      Category: <strong className="text-slate-700 font-medium">{detail.category}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Submitted on: {new Date(detail.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      Last update: {new Date(detail.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start lg:self-center">
                  <button
                    onClick={loadData}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh Status
                  </button>
                  <Link
                    href="/dashboard/buyer/sourcing"
                    className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-1.5"
                  >
                    Dashboard View
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Status explanation subtitle */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{getStatusBadge(detail.status).desc}</span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                Procurement Lifecycle Progress
              </h2>

              <div className="relative">
                {/* Connecting Track */}
                <div className="hidden md:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
                <div
                  className="hidden md:block absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-0"
                  style={{
                    width: `${((getTimelineMilestone(detail.status) - 1) / 4) * 100}%`,
                  }}
                />

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                  {[
                    {
                      step: 1,
                      name: "Requirement Submitted",
                      desc: "Specifications registered",
                    },
                    {
                      step: 2,
                      name: "Review & Accepted",
                      desc: "Feasibility verified",
                    },
                    {
                      step: 3,
                      name: "Supplier Outreach",
                      desc: "Direct outreach & quotes",
                    },
                    {
                      step: 4,
                      name: "Proposal Curated",
                      desc: "Options ready for review",
                    },
                    {
                      step: 5,
                      name: "Fulfillment",
                      desc: "Commercial execution",
                    },
                  ].map((m) => {
                    const currentMilestone = getTimelineMilestone(detail.status);
                    const isCompleted = currentMilestone > m.step;
                    const isCurrent = currentMilestone === m.step;

                    return (
                      <div
                        key={m.step}
                        className={`p-4 rounded-xl border flex md:flex-col items-center md:text-center gap-3 transition-colors duration-150 ${
                          isCurrent
                            ? "bg-blue-50/70 border-blue-400/80 shadow-sm"
                            : isCompleted
                            ? "bg-emerald-50/50 border-emerald-300 text-slate-800"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold shadow-sm ${
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                              ? "bg-blue-600 text-white ring-4 ring-blue-100"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : m.step}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-bold ${
                              isCurrent
                                ? "text-blue-900"
                                : isCompleted
                                ? "text-emerald-900"
                                : "text-slate-600"
                            }`}
                          >
                            {m.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ACTION REQUIRED: MORE INFORMATION REQUESTED BANNER & FORM */}
            {detail.status === "MORE_INFORMATION_REQUIRED" && (
              <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border-2 border-rose-300 shadow-md p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-rose-900">
                      Procurement Desk Inquiry: Additional Information Required
                    </h3>
                    <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                      To secure accurate manufacturer quotations and confirm regulatory standards, our sourcing specialists require supplemental information for this requirement:
                    </p>

                    {/* Display query from sourcing desk */}
                    {latestMoreInfoRequest?.reasonOrNotes && (
                      <div className="mt-3 p-4 bg-white/90 rounded-xl border border-rose-200 text-sm text-rose-950 font-medium">
                        "{latestMoreInfoRequest.reasonOrNotes}"
                      </div>
                    )}

                    {/* Feedback Messages */}
                    {infoSuccess && (
                      <div className="mt-4 p-3 bg-emerald-100 text-emerald-800 rounded-xl text-sm flex items-center gap-2 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>{infoSuccess}</span>
                      </div>
                    )}
                    {infoError && (
                      <div className="mt-4 p-3 bg-rose-100 text-rose-800 rounded-xl text-sm flex items-center gap-2 border border-rose-300">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{infoError}</span>
                      </div>
                    )}

                    {/* Responsive Form */}
                    <form onSubmit={handleSubmitAdditionalInfo} className="mt-5 space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Your Response / Specification Details <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={additionalInfoText}
                          onChange={(e) => setAdditionalInfoText(e.target.value)}
                          placeholder="E.g., Required assay purity is >= 99.5%, particle size < 50 microns, or acceptable international pharmacopeia..."
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 bg-white placeholder-slate-400"
                        />
                      </div>

                      {/* Optional File Attachment */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Supplemental COA / Spec Sheet (Optional PDF, DOCX, or Image)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setAdditionalInfoFile(e.target.files[0]);
                              }
                            }}
                            className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {additionalInfoFile && (
                            <span className="text-xs text-slate-500 truncate max-w-xs">
                              {additionalInfoFile.name} ({(additionalInfoFile.size / 1024).toFixed(0)} KB)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submittingInfo || !additionalInfoText.trim()}
                          className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] disabled:bg-slate-300 text-white font-semibold rounded-lg text-sm shadow-xs transition-colors duration-150 flex items-center gap-2 press-tactile"
                        >
                          {submittingInfo ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Transmitting Response...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Submit Supplemental Details
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Grid Layout: Sourcing Requirements & Curated Proposals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (1/3): Requirement Details Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
                  <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-blue-600" />
                    Requirement Specifications
                  </h2>

                  <dl className="divide-y divide-slate-100 text-xs sm:text-sm">
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-slate-500">Target Quantity</dt>
                      <dd className="font-semibold text-slate-900">
                        {(detail.quantity || (detail as any).targetQuantity)?.toLocaleString()} {detail.unit}
                      </dd>
                    </div>

                    {detail.casNumber && (
                      <div className="py-2.5 flex justify-between">
                        <dt className="text-slate-500">CAS Number</dt>
                        <dd className="font-mono text-slate-800">{detail.casNumber}</dd>
                      </div>
                    )}

                    {detail.grade && (
                      <div className="py-2.5 flex justify-between">
                        <dt className="text-slate-500">Grade</dt>
                        <dd className="text-slate-800 font-medium">{detail.grade}</dd>
                      </div>
                    )}

                    {detail.pharmacopeialStandard && (
                      <div className="py-2.5 flex justify-between">
                        <dt className="text-slate-500">Pharmacopeia</dt>
                        <dd className="font-semibold text-blue-700">{detail.pharmacopeialStandard}</dd>
                      </div>
                    )}

                    {detail.specifications && (
                      <div className="py-2.5 flex flex-col gap-1">
                        <dt className="text-slate-500">Purity / Technical Specs</dt>
                        <dd className="text-slate-800 bg-slate-50 p-2 rounded-lg text-xs leading-relaxed">
                          {detail.specifications}
                        </dd>
                      </div>
                    )}

                    <div className="py-2.5 flex justify-between">
                      <dt className="text-slate-500">Delivery Destination</dt>
                      <dd className="text-slate-800 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {detail.deliveryLocation}
                      </dd>
                    </div>

                    {detail.packaging && (
                      <div className="py-2.5 flex justify-between">
                        <dt className="text-slate-500">Packaging</dt>
                        <dd className="text-slate-800">{detail.packaging}</dd>
                      </div>
                    )}

                    {detail.targetPrice && (
                      <div className="py-2.5 flex justify-between">
                        <dt className="text-slate-500">Target Price</dt>
                        <dd className="font-semibold text-slate-900">
                          {detail.currency} {detail.targetPrice.toLocaleString()} / {detail.unit}
                        </dd>
                      </div>
                    )}

                    {detail.expectedDeliveryDate && (
                      <div className="py-2.5 flex justify-between">
                        <dt className="text-slate-500">Target Date</dt>
                        <dd className="text-slate-800">{detail.expectedDeliveryDate}</dd>
                      </div>
                    )}

                    {detail.attachmentReferences && (
                      <div className="py-2.5 flex flex-col gap-1">
                        <dt className="text-slate-500">Uploaded Specification</dt>
                        <dd className="text-xs text-blue-600 font-medium flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span className="truncate">{detail.attachmentReferences}</span>
                        </dd>
                      </div>
                    )}
                  </dl>

                  {detail.additionalRequirements && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Additional Requirements & Notes
                      </p>
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl whitespace-pre-wrap leading-relaxed">
                        {detail.additionalRequirements}
                      </p>
                    </div>
                  )}
                </div>

                {/* KemKendra Assurance Card */}
                <div className="bg-[#091E42] text-white rounded-2xl p-6 shadow-tactile-card border border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <h3 className="font-bold text-base">KemKendra Sourcing Shield</h3>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Direct supplier identity protected under neutral broker NDA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>COA & batch validation prior to commercial dispatch</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Secured escrow and verified quality guarantees</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column (2/3): Published Proposals & Curated Options */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Curated Sourcing Proposals
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reviewed supplier quotations compiled specifically for your requirement
                      </p>
                    </div>
                    {proposals.length > 0 && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                        {proposals.length} {proposals.length === 1 ? "Proposal" : "Proposals"} Available
                      </span>
                    )}
                  </div>

                  {/* 1. When Proposals are Available */}
                  {proposals.length > 0 ? (
                    <div className="space-y-6">
                      {proposals.map((proposal) => {
                        const isAccepted = proposal.status === "ACCEPTED";

                        return (
                          <div
                            key={proposal.id}
                            className={`rounded-2xl border p-6 transition-colors duration-150 ${
                              isAccepted
                                ? "border-emerald-300 bg-emerald-50/20 shadow-sm"
                                : "border-slate-200 bg-white shadow-tactile-card"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border">
                                    {proposal.proposalReference}
                                  </span>
                                  {isAccepted ? (
                                    <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                                      Option Selected
                                    </span>
                                  ) : (
                                    <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                      Open for Decision
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mt-1">{proposal.title}</h3>
                              </div>

                              <div className="text-left sm:text-right">
                                <p className="text-xs text-slate-500">Benchmark Price</p>
                                <p className="text-lg font-extrabold text-blue-900">
                                  {proposal.currency} {proposal.offeredPricePerUnit?.toLocaleString()} / {proposal.unit}
                                </p>
                              </div>
                            </div>

                            {proposal.summaryNotes && (
                              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4 leading-relaxed">
                                {proposal.summaryNotes}
                              </p>
                            )}

                            {/* Curated Supplier Options Table / Cards */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Evaluated Supplier Options
                              </h4>

                              <div className="grid grid-cols-1 gap-3">
                                {proposal.options.map((opt) => {
                                  const isSelected = proposal.selectedOptionId === opt.id;

                                  return (
                                    <div
                                      key={opt.id}
                                      className={`p-4 rounded-xl border transition-colors duration-150 ${
                                        isSelected
                                          ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                                          : "border-slate-200 bg-white hover:border-slate-300"
                                      }`}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold text-xs rounded">
                                              {opt.optionLabel}
                                            </span>
                                            <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                              {opt.supplierDisplayName || "Verified Supplier"}
                                            </span>
                                          </div>
                                          <p className="text-sm font-bold text-slate-900 mt-1">
                                            {opt.productName}{" "}
                                            {opt.grade ? <span className="text-slate-500 font-normal">({opt.grade})</span> : null}
                                          </p>
                                        </div>

                                        <div className="flex items-center gap-3 self-start sm:self-auto">
                                          <div className="text-left sm:text-right">
                                            <p className="text-base font-extrabold text-slate-900">
                                              {opt.currency} {opt.offeredPricePerUnit?.toLocaleString()} / {opt.unit}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                              MOQ: {opt.moq || "-"} {opt.unit} • Lead Time: {opt.leadTimeDays || "-"} days
                                            </p>
                                          </div>

                                          {!isAccepted && (
                                            <button
                                              onClick={() => {
                                                setSelectedOptionForDecision({ proposal, option: opt });
                                                setDecisionRemarks("");
                                                setDecisionSuccess(null);
                                              }}
                                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors duration-150 press-tactile"
                                            >
                                              Select Option
                                            </button>
                                          )}

                                          {isSelected && (
                                            <span className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1">
                                              <Check className="w-3.5 h-3.5" />
                                              Selected
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Commercial Terms Row */}
                                      <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                                        <div>
                                          <span className="text-slate-400 block text-[10px]">Packaging:</span>
                                          <span className="font-medium text-slate-700">{opt.packaging || "Standard"}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block text-[10px]">Delivery Terms:</span>
                                          <span className="font-medium text-slate-700">{opt.deliveryTerms || "Ex-Works"}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block text-[10px]">Payment Terms:</span>
                                          <span className="font-medium text-slate-700">{opt.paymentTerms || "Advance / Escrow"}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block text-[10px]">Quote Validity:</span>
                                          <span className="font-medium text-slate-700">{opt.validUntil || "14 Days"}</span>
                                        </div>
                                      </div>

                                      {opt.recommendationNotes && (
                                        <p className="mt-2 text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-lg">
                                          <strong>Desk Recommendation:</strong> {opt.recommendationNotes}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Clarification Box for this Proposal */}
                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                                Have questions on purity, batch size, or payment terms?
                              </p>
                              <button
                                onClick={() => {
                                  setActiveClarificationProposalId(
                                    activeClarificationProposalId === proposal.id ? null : proposal.id
                                  );
                                  setClarificationSuccess(null);
                                }}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                {activeClarificationProposalId === proposal.id
                                  ? "Hide Inquiry Form"
                                  : "Ask Clarification"}
                              </button>
                            </div>

                            {/* Active Clarification Form */}
                            {activeClarificationProposalId === proposal.id && (
                              <div className="mt-3 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                                <h5 className="text-xs font-bold text-blue-900 mb-2">
                                  Submit Clarification on {proposal.proposalReference}
                                </h5>
                                {clarificationSuccess && (
                                  <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs mb-2 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{clarificationSuccess}</span>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Subject (e.g. Lead time flexibility or COA request)"
                                    value={clarificationSubject}
                                    onChange={(e) => setClarificationSubject(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                  />
                                  <textarea
                                    rows={2}
                                    placeholder="Type your question or commercial requirement..."
                                    value={clarificationQuestion}
                                    onChange={(e) => setClarificationQuestion(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                  />
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => handleSubmitClarification(proposal.id)}
                                      disabled={clarificationSubmitting || !clarificationQuestion.trim()}
                                      className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition-colors duration-150 flex items-center gap-1.5 press-tactile"
                                    >
                                      {clarificationSubmitting ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Send className="w-3.5 h-3.5" />
                                      )}
                                      Send Inquiry
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* 2. Proposals Pending State */
                    <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                        <Clock className="w-6 h-6 animate-pulse" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">
                        Supplier Quotation Collection in Progress
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                        Our sourcing specialists are currently outreaching manufacturers and verified distributors for{" "}
                        <strong className="text-slate-700 font-semibold">{detail.productName}</strong>. Once quotes are received, verified, and compared, a curated proposal will appear here.
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>Average proposal turnaround: 24 - 48 business hours</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Timeline History Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Public Status Audit Log
                  </h3>

                  {detail.statusHistory && detail.statusHistory.length > 0 ? (
                    <div className="space-y-4">
                      {detail.statusHistory.map((item, index) => (
                        <div key={item.id || index} className="flex items-start gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-800">
                                {item.newStatus.replace(/_/g, " ")}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(item.createdAt).toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            {item.reasonOrNotes && (
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                {item.reasonOrNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No previous status transitions recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Option Acceptance Modal */}
      {selectedOptionForDecision && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Select Supplier Option
              </h3>
              <button
                onClick={() => setSelectedOptionForDecision(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                You are expressing interest in{" "}
                <strong className="text-slate-900 font-bold">
                  {selectedOptionForDecision.option.optionLabel} ({selectedOptionForDecision.option.productName})
                </strong>{" "}
                at{" "}
                <strong className="text-blue-900 font-bold">
                  {selectedOptionForDecision.option.currency}{" "}
                  {selectedOptionForDecision.option.offeredPricePerUnit?.toLocaleString()} /{" "}
                  {selectedOptionForDecision.option.unit}
                </strong>
                .
              </p>

              {decisionSuccess && (
                <div className="mt-3 p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{decisionSuccess}</span>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Instructions or Target Schedule for Sourcing Team
                </label>
                <textarea
                  rows={3}
                  value={decisionRemarks}
                  onChange={(e) => setDecisionRemarks(e.target.value)}
                  placeholder="E.g., Please prioritize early delivery batch or prepare proforma invoice..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOptionForDecision(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={decisionSubmitting}
                  onClick={() => handleConfirmDecision("ACCEPTED")}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  {decisionSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Confirm Option Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
