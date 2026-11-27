"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
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
} from "lucide-react";
import {
  SourcingRequestDetail,
  SourcingProposalItem,
  SourcingProposalOptionItem,
  SourcingQuotationItem,
  fetchBuyerSourcingRequestDetail,
  fetchBuyerPublishedProposals,
  submitBuyerOptionDecision,
  submitBuyerClarificationInquiry,
} from "@/features/admin/api/adminSourcingApi";

export default function BuyerSourcingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;

  const [detail, setDetail] = useState<SourcingRequestDetail | null>(null);
  const [proposals, setProposals] = useState<SourcingProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decision Modal State
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

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [detailData, proposalsData] = await Promise.all([
        fetchBuyerSourcingRequestDetail(requestId),
        fetchBuyerPublishedProposals(requestId),
      ]);
      setDetail(detailData);
      setProposals(proposalsData);
    } catch (err: any) {
      setError(err.message || "Failed to load sourcing proposal details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  const handleOpenDecisionModal = (proposal: SourcingProposalItem, option: SourcingProposalOptionItem) => {
    setSelectedOptionForDecision({ proposal, option });
    setDecisionRemarks("");
    setDecisionSuccess(null);
  };

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
          ? `Option ${selectedOptionForDecision.option.optionLabel} selected! Our sourcing team has been notified to initiate escrow and contract drafting.`
          : `Decision recorded.`
      );
      await loadData();
      setTimeout(() => {
        setSelectedOptionForDecision(null);
      }, 1800);
    } catch (err: any) {
      alert(err.message || "Failed to submit option decision");
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const handleSubmitClarification = async (e: React.FormEvent, proposalId: string) => {
    e.preventDefault();
    if (!clarificationQuestion.trim()) return;

    setClarificationSubmitting(true);
    try {
      await submitBuyerClarificationInquiry(requestId, proposalId, {
        question: clarificationQuestion.trim(),
        subject: clarificationSubject.trim() || undefined,
      });
      setClarificationSuccess("Inquiry submitted! The KemKendra sourcing team will review and reply promptly.");
      setClarificationQuestion("");
      setClarificationSubject("");
      await loadData();
      setTimeout(() => setClarificationSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to submit clarification question");
    } finally {
      setClarificationSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center max-w-4xl mx-auto">
        <div className="w-7 h-7 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-bold text-[#0F172A]">Retrieving Sourcing Proposal Profile...</h3>
        <p className="text-xs text-[#64748B] mt-1">Loading requirement details and verified manufacturer options.</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="py-16 text-center max-w-xl mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto" />
        <h2 className="text-base font-bold text-[#0F172A]">Failed to Load Sourcing Request</h2>
        <p className="text-xs text-[#64748B]">{error || "Inquiry not found or access denied."}</p>
        <Link
          href="/dashboard/buyer/sourcing"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0052CC] text-white text-xs font-semibold rounded-[6px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sourcing Desk</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#0F172A]">
      {/* 1. Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/buyer/sourcing"
            className="p-2 text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0052CC]">
                {detail.sourcingRequestReference}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <h1 className="text-lg sm:text-xl font-bold text-[#091E42] tracking-tight">{detail.productName}</h1>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Category: {detail.category} • Target: {detail.quantity} {detail.unit} • Delivery: {detail.deliveryLocation}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="h-9 px-3.5 text-xs font-semibold text-[#0F172A] bg-white border border-slate-200 rounded-lg hover:bg-[#F8F9FA] flex items-center gap-1.5 cursor-pointer shadow-2xs press-tactile transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Requirement Snapshot Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-tactile-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0052CC]" />
            <span>Buyer Requirement Specifications</span>
          </h3>
          <span className="px-2.5 py-0.5 bg-blue-50 text-[#0052CC] border border-blue-200 rounded-md text-xs font-semibold">
            Status: {detail.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-[#64748B] block">Required Volume</span>
            <span className="font-bold text-[#0F172A] text-sm mt-0.5 block">{detail.quantity} {detail.unit}</span>
          </div>
          <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-[#64748B] block">Delivery Location</span>
            <span className="font-semibold text-[#0F172A] truncate block mt-0.5" title={detail.deliveryLocation}>
              {detail.deliveryLocation}
            </span>
          </div>
          <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-[#64748B] block">CAS Number</span>
            <span className="font-semibold text-[#0F172A] mt-0.5 block">{detail.casNumber || "Not specified"}</span>
          </div>
          <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-[#64748B] block">Target Price</span>
            <span className="font-bold text-[#0F172A] mt-0.5 block">
              {detail.targetPrice ? `${detail.currency} ${detail.targetPrice} / ${detail.unit}` : "Open to Market Quote"}
            </span>
          </div>
        </div>

        {(detail.grade || detail.specifications || detail.pharmacopeialStandard) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F8F9FA] p-3.5 rounded-xl border border-slate-200">
            {detail.grade && (
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] block">Required Grade</span>
                <span className="font-semibold text-[#0F172A]">{detail.grade}</span>
              </div>
            )}
            {detail.pharmacopeialStandard && (
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] block">Pharmacopeial Standard</span>
                <span className="font-semibold text-[#0F172A]">{detail.pharmacopeialStandard}</span>
              </div>
            )}
            {detail.specifications && (
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] block">Technical Specs</span>
                <span className="text-[#334155]">{detail.specifications}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Published Proposals Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#091E42]">Published Sourcing Proposals</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              {proposals.length} available
            </span>
          </div>
        </div>

        {proposals.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3 shadow-tactile-card">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-xs font-semibold text-[#0F172A]">Sourcing Specialists Actively In Market</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
              Our procurement team is currently reaching out to verified chemical manufacturers and securing competitive quotation terms. Once curated commercial proposals are assembled, they will appear here with option comparison.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => {
              const isAccepted = proposal.status === "ACCEPTED";
              const hasSelectedOption = Boolean(proposal.selectedOptionId);

              return (
                <div
                  key={proposal.id}
                  className={`bg-white border rounded-2xl p-6 shadow-tactile-card space-y-5 ${
                    isAccepted
                      ? "border-emerald-300 ring-1 ring-emerald-200"
                      : "border-slate-200/90"
                  }`}
                >
                  {/* Proposal Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-[#091E42]">{proposal.title}</h3>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
                            isAccepted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-[#0052CC] border-blue-200"
                          }`}
                        >
                          {proposal.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-1 flex items-center gap-2">
                        <span>Proposal Ref: {proposal.proposalReference}</span>
                        {proposal.sentToBuyerAt && (
                          <>
                            <span>•</span>
                            <span>Published: {new Date(proposal.sentToBuyerAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Procurement Summary & Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {proposal.summaryNotes && (
                      <div className="bg-[#F8F9FA] border border-slate-200 rounded-xl p-4">
                        <span className="text-[11px] font-semibold text-[#64748B] block mb-1.5 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#0052CC]" />
                          <span>Sourcing Executive Summary</span>
                        </span>
                        <p className="text-[#334155] leading-relaxed">{proposal.summaryNotes}</p>
                      </div>
                    )}

                    {proposal.recommendationNotes && (
                      <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
                        <span className="text-[11px] font-semibold text-emerald-800 block mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>KemKendra Recommendations</span>
                        </span>
                        <p className="text-emerald-900 font-medium leading-relaxed">{proposal.recommendationNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Option Comparison Cards */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#0052CC]" />
                        <span>Compare Curated Supplier Options ({proposal.options?.length || 0})</span>
                      </h4>
                      <span className="text-[11px] text-[#64748B]">All options include verified quality standard</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {proposal.options?.map((opt) => {
                        const isOptionSelected = proposal.selectedOptionId === opt.id || opt.status === "ACCEPTED";

                        return (
                          <div
                            key={opt.id}
                            className={`border rounded-xl p-5 flex flex-col justify-between transition-all relative ${
                              isOptionSelected
                                ? "bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-300 shadow-sm"
                                : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
                            }`}
                          >
                            {isOptionSelected && (
                              <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-emerald-700 text-white text-[10px] font-semibold rounded-full shadow-xs flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Accepted Option</span>
                              </div>
                            )}

                            <div className="space-y-3 text-xs">
                              {/* Option Header */}
                              <div>
                                <div className="font-bold text-sm text-[#0F172A]">{opt.optionLabel}</div>
                                <div className="text-[11px] text-[#0052CC] font-semibold mt-0.5">
                                  {opt.supplierDisplayName}
                                </div>
                              </div>

                              {/* Price Card */}
                              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] font-mono">
                                <span className="text-[10px] text-[#64748B] block font-sans">Offered Unit Price</span>
                                <div className="text-lg font-bold text-[#0F172A] mt-0.5">
                                  {opt.currency} {Number(opt.offeredPricePerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  <span className="text-xs text-[#64748B] font-normal"> / {opt.unit}</span>
                                </div>
                                <div className="text-[10px] text-[#64748B] mt-1">
                                  MOQ: {opt.moq || opt.quantity} {opt.unit} • Total: {opt.currency} {(Number(opt.offeredPricePerUnit) * Number(opt.quantity)).toLocaleString()}
                                </div>
                              </div>

                              {/* Technical Specs List */}
                              <div className="space-y-1.5 text-[11px] text-[#475569] divide-y divide-[#F1F5F9]">
                                <div className="pt-1 flex justify-between">
                                  <span className="text-[#64748B]">Grade:</span>
                                  <span className="font-semibold text-[#0F172A]">{opt.grade || "Commercial"}</span>
                                </div>
                                <div className="pt-1 flex justify-between">
                                  <span className="text-[#64748B]">Lead Time:</span>
                                  <span className="font-semibold text-[#0F172A]">
                                    {opt.leadTimeDays ? `${opt.leadTimeDays} business days` : "Ready dispatch"}
                                  </span>
                                </div>
                                <div className="pt-1 flex justify-between">
                                  <span className="text-[#64748B]">Delivery:</span>
                                  <span className="text-[#0F172A] font-medium truncate max-w-[170px]" title={opt.deliveryTerms}>
                                    {opt.deliveryTerms || "Standard Terms"}
                                  </span>
                                </div>
                                <div className="pt-1 flex justify-between">
                                  <span className="text-[#64748B]">Packaging:</span>
                                  <span className="text-[#0F172A]">{opt.packaging || "Export Drums"}</span>
                                </div>
                                {opt.puritySpecifications && (
                                  <div className="pt-1">
                                    <span className="text-[#64748B] block">Specifications:</span>
                                    <span className="text-[#1E293B] font-mono text-[10px] block mt-0.5">
                                      {opt.puritySpecifications}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {opt.recommendationNotes && (
                                <div className="p-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[11px] text-[#1D4ED8]">
                                  "{opt.recommendationNotes}"
                                </div>
                              )}

                              {opt.documentUrl && (
                                <a
                                  href={opt.documentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0052CC] hover:underline pt-1"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Permitted COA / Specs</span>
                                </a>
                              )}
                            </div>

                            {/* Option Action CTA */}
                            <div className="pt-4 border-t border-[#F1F5F9] mt-3">
                              {isOptionSelected ? (
                                <div className="w-full py-2 bg-[#DCFCE7] text-[#15803D] font-bold text-xs rounded-[6px] text-center flex items-center justify-center gap-1.5 border border-[#BBF7D0]">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Option Confirmed</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDecisionModal(proposal, opt)}
                                  className="w-full py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold text-xs rounded-[6px] transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Select / Proceed with Option</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Commercial Terms & Conditions */}
                  {proposal.termsAndConditions && (
                    <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg text-xs space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                        Commercial &amp; Escrow Terms
                      </span>
                      <p className="text-slate-600 leading-relaxed">{proposal.termsAndConditions}</p>
                    </div>
                  )}

                  {/* Inquiries Thread & Clarification Form */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#0052CC]" />
                        <span>Clarifications &amp; Procurement Inquiry Desk</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveClarificationProposalId(
                            activeClarificationProposalId === proposal.id ? null : proposal.id
                          )
                        }
                        className="text-xs font-semibold text-[#0052CC] hover:underline cursor-pointer"
                      >
                        {activeClarificationProposalId === proposal.id ? "Hide Inquiry Form" : "+ Request Clarification"}
                      </button>
                    </div>

                    {proposal.buyerFeedback && (
                      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 block">
                          Inquiry History
                        </span>
                        <p className="text-amber-900 whitespace-pre-line text-xs leading-relaxed">
                          {proposal.buyerFeedback}
                        </p>
                      </div>
                    )}

                    {activeClarificationProposalId === proposal.id && (
                      <form
                        onSubmit={(e) => handleSubmitClarification(e, proposal.id)}
                        className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg space-y-3 text-xs"
                      >
                        <span className="font-semibold text-slate-900 block">
                          Ask a Question or Request Price / Specification Adjustment
                        </span>

                        {clarificationSuccess && (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>{clarificationSuccess}</span>
                          </div>
                        )}

                        <div>
                          <label className="text-[11px] font-medium text-[#475569] block mb-1">
                            Inquiry Subject (Optional)
                          </label>
                          <input
                            type="text"
                            value={clarificationSubject}
                            onChange={(e) => setClarificationSubject(e.target.value)}
                            placeholder="e.g. Question on COA impurity threshold or payment schedule"
                            className="w-full h-8 px-2.5 bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-[#475569] block mb-1">
                            Your Question / Specification Clarification <span className="text-[#DC2626]">*</span>
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={clarificationQuestion}
                            onChange={(e) => setClarificationQuestion(e.target.value)}
                            placeholder="Type your question for the KemKendra chemical sourcing team..."
                            className="w-full p-2 bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveClarificationProposalId(null)}
                            className="px-3 py-1.5 bg-white border border-[#CBD5E1] text-[#475569] rounded font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={clarificationSubmitting}
                            className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold rounded transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                          >
                            {clarificationSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                            <span>Submit Question</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Permitted Supplier Quotations (if any shared) */}
      {detail.quotations && detail.quotations.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span>Approved Supplier Quotations & Technical Sheets</span>
            </h3>
            <span className="text-[11px] text-[#64748B]">Approved for direct review</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {detail.quotations.map((q) => (
              <div key={q.id} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">{q.productName || detail.productName}</span>
                  <span className="font-mono text-[10px] text-[#0052CC]">{q.quotationReference}</span>
                </div>
                <div className="text-sm font-bold text-[#15803D] font-mono">
                  {q.currency} {Number(q.unitPrice).toLocaleString()} <span className="text-[10px] text-[#64748B] font-normal">/ {q.unit || detail.unit}</span>
                </div>
                <div className="text-[11px] text-[#475569] space-y-0.5">
                  <div>Grade: {q.productGrade || "Commercial"}</div>
                  <div>Lead Time: {q.leadTimeDays ? `${q.leadTimeDays} days` : "Standard dispatch"}</div>
                  <div>Delivery Terms: {q.incoterms || "EXW"}</div>
                  {q.puritySpecifications && <div>Specifications: {q.puritySpecifications}</div>}
                </div>
                {q.attachmentUrl && (
                  <a
                    href={q.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0052CC] hover:underline pt-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Attachment</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ACCEPT OPTION CONFIRMATION
      ========================================================================= */}
      {selectedOptionForDecision && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#091E42] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Confirm Selection of Sourcing Option</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOptionForDecision(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {decisionSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                <p className="font-semibold text-xs">{decisionSuccess}</p>
              </div>
            ) : (
              <>
                <div className="p-3.5 bg-[#F8F9FA] border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-[#0F172A]">{selectedOptionForDecision.option.optionLabel}</div>
                  <div className="text-[11px] text-[#0052CC] font-semibold">
                    {selectedOptionForDecision.option.supplierDisplayName}
                  </div>
                  <div className="text-sm font-bold text-[#0F172A] pt-1">
                    {selectedOptionForDecision.option.currency} {Number(selectedOptionForDecision.option.offeredPricePerUnit).toLocaleString()} / {selectedOptionForDecision.option.unit}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Volume: {selectedOptionForDecision.option.quantity} {selectedOptionForDecision.option.unit} • Delivery: {selectedOptionForDecision.option.deliveryTerms}
                  </div>
                </div>

                <p className="text-[#475569] leading-relaxed">
                  By confirming this option, our sourcing team will transition your request into <span className="font-semibold text-[#0F172A]">Negotiation & Fulfillment</span>, prepare standard KemKendra escrow terms, and coordinate final batch sample verification.
                </p>

                <div>
                  <label className="text-xs font-semibold text-[#334155] block mb-1">
                    Optional Instructions / Commercial Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={decisionRemarks}
                    onChange={(e) => setDecisionRemarks(e.target.value)}
                    placeholder="e.g. Please expedite dispatch by the 15th, or need CoA stamped in duplicate..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 text-[#0F172A] placeholder:text-slate-400 shadow-2xs"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOptionForDecision(null)}
                    className="h-9 px-3.5 bg-white border border-slate-200 text-[#475569] font-semibold rounded-lg hover:bg-slate-50 cursor-pointer transition-colors press-tactile"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={decisionSubmitting}
                    onClick={() => handleConfirmDecision("ACCEPTED")}
                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs press-tactile"
                  >
                    {decisionSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm & Proceed</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
