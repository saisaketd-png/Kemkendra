"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { userAppealApi, UserSuspensionDetail, UserAppeal } from "@/features/account/api/userAppealApi";
import { logout } from "@/features/auth/api/auth";
import {
  ShieldAlert,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  RefreshCw,
  FileText,
} from "lucide-react";
import { KemKendraLogo } from "@/shared/components/KemkendraLogo";

export default function AccountReviewPage() {
  const router = useRouter();
  const [suspensionDetail, setSuspensionDetail] = useState<UserSuspensionDetail | null>(null);
  const [appeals, setAppeals] = useState<UserAppeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [appealReason, setAppealReason] = useState("");
  const [userResponse, setUserResponse] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [detail, userAppeals] = await Promise.all([
        userAppealApi.getMySuspension(),
        userAppealApi.getMyAppeals(),
      ]);
      setSuspensionDetail(detail);
      setAppeals(userAppeals);
    } catch (err: any) {
      setError(err?.message || "Failed to load account review status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleAppealSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!appealReason.trim() || appealReason.trim().length < 10) {
      setError("Please provide a detailed explanation of at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await userAppealApi.submitAppeal(appealReason.trim());
      setSuccessMessage("Your account review request has been submitted successfully.");
      setAppealReason("");
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to submit appeal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponseSubmit = async (appealId: string) => {
    if (!userResponse.trim()) {
      setError("Please enter a response for the compliance team.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await userAppealApi.respondToAppeal(appealId, userResponse.trim());
      setSuccessMessage("Your response has been submitted to the compliance team.");
      setUserResponse("");
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to submit information response");
    } finally {
      setSubmitting(false);
    }
  };

  const activeAppeal = appeals.length > 0 ? appeals[0] : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0052CC] border border-blue-200/80">
            <Clock className="w-3.5 h-3.5 text-[#0052CC]" /> Review Pending
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" /> In Active Review
          </span>
        );
      case "INFORMATION_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Action Required
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Appeal Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Appeal Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KemKendraLogo size="md" href="/dashboard/account-review" />
            <span className="hidden sm:inline-block h-5 w-px bg-slate-200 mx-1" />
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Account Governance & Review
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6 flex-1">
        {loading ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-4 shadow-tactile-card">
            <RefreshCw className="w-8 h-8 text-[#0052CC] animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-600">Loading your account review file...</p>
          </div>
        ) : (
          <>
            {/* Notification Messages */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-3 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-start gap-3 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Suspension Overview Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-tactile-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0 shadow-2xs">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account Review Center</h1>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Your KemKendra account access is currently suspended pending administrative review.
                    </p>
                  </div>
                </div>
                {activeAppeal && getStatusBadge(activeAppeal.status)}
              </div>

              {/* Suspension Reason Callout */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Suspension Notice
                </span>
                <p className="text-sm font-medium text-slate-800">
                  {suspensionDetail?.reason || "Administrative suspension applied for platform security and compliance."}
                </p>
                {suspensionDetail?.suspendedAt && (
                  <p className="text-xs text-slate-400">
                    Issued on {new Date(suspensionDetail.suspendedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              {/* Dynamic Appeal Status & Action Engine */}
              {!activeAppeal || activeAppeal.status === "REJECTED" ? (
                <div className="space-y-4 pt-2">
                  <div className="border-t border-slate-100 pt-6">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#0052CC]" />
                      Submit Formal Appeal
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      If you believe this suspension was made in error or if you have resolved the underlying issue, submit a formal explanation and documentation reference for administrative reconsideration.
                    </p>
                  </div>

                  <form onSubmit={handleAppealSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="appealReason" className="text-xs font-semibold text-slate-700">
                        Explanation & Remediation Statement <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="appealReason"
                        rows={5}
                        required
                        value={appealReason}
                        onChange={(e) => setAppealReason(e.target.value)}
                        placeholder="Detail the circumstances, any corrected credentials, updated licenses, or operational remediations completed..."
                        className="w-full text-xs rounded-lg border border-slate-300 p-3.5 focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 focus:outline-none placeholder:text-slate-400 bg-white shadow-2xs leading-relaxed"
                      />
                      <p className="text-[11px] text-slate-400">
                        Minimum 10 characters. Please provide accurate business references and details.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting || appealReason.trim().length < 10}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold shadow-2xs disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {submitting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Submit Appeal Request</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : activeAppeal.status === "INFORMATION_REQUIRED" ? (
                <div className="space-y-5 border-t border-slate-100 pt-6">
                  <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Compliance Administrator Request
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                      {activeAppeal.adminResponse || "Please provide additional clarifying information or documentation."}
                    </p>
                    {activeAppeal.requestedAt && (
                      <p className="text-[11px] text-amber-700/80">
                        Requested on {new Date(activeAppeal.requestedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="userResponse" className="text-xs font-semibold text-slate-700">
                      Your Response & Document References <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="userResponse"
                      rows={4}
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                      placeholder="Enter the requested information or confirm document upload..."
                      className="w-full text-xs rounded-lg border border-slate-300 p-3.5 focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 focus:outline-none placeholder:text-slate-400 bg-white shadow-2xs leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleResponseSubmit(activeAppeal.id)}
                        disabled={submitting || !userResponse.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold shadow-2xs disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {submitting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Submit Information Response</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeAppeal.status === "APPROVED" ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 space-y-4">
                  <div className="flex items-center gap-3 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    Account Reinstated Successfully
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {activeAppeal.adminResponse || "Your appeal has been reviewed and accepted. Your full marketplace access has been restored."}
                  </p>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                    <Clock className="w-4 h-4 text-[#0052CC] animate-spin" />
                    Appeal Under Review
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Your appeal has been queued for institutional compliance review. You will receive an email and system notification once an administrator acts on your case.
                  </p>
                  <p className="text-[11px] text-blue-600">
                    Submitted on {new Date(activeAppeal.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Appeal History Audit Card */}
            {appeals.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-tactile-card space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Appeal Submission History
                </h2>
                <div className="divide-y divide-slate-100">
                  {appeals.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-700">
                          Appeal Reference: #{item.id.slice(0, 8)}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        {item.submittedReason}
                      </p>
                      {item.adminResponse && (
                        <div className="text-xs text-slate-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                          <span className="font-semibold text-blue-900">Administrator Note:</span> {item.adminResponse}
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400">
                        Submitted: {new Date(item.createdAt).toLocaleString()}
                        {item.reviewedAt && ` • Reviewed: ${new Date(item.reviewedAt).toLocaleString()}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help & Support Footer */}
            <div className="text-center p-6 rounded-2xl bg-white border border-slate-200/90 shadow-tactile-card text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Need direct compliance assistance?</p>
              <p>Contact the KemKendra Governance Team at <span className="text-[#0052CC] font-medium">governance@kemkendra.com</span></p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
