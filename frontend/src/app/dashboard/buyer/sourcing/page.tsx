"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Building2,
  Calendar,
  Sparkles,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  SourcingRequestSummary,
  SourcingStatus,
  fetchBuyerSourcingRequests,
} from "@/features/admin/api/adminSourcingApi";

export default function BuyerSourcingPage() {
  const [requests, setRequests] = useState<SourcingRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBuyerSourcingRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || "Failed to load sourcing inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const getStatusBadge = (status: SourcingStatus | string) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-[#0052CC] border border-blue-200">Submitted</span>;
      case "UNDER_REVIEW":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Under Review</span>;
      case "MORE_INFORMATION_REQUIRED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">Action Required</span>;
      case "ACCEPTED":
      case "SOURCING":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Sourcing Active</span>;
      case "SUPPLIER_CONTACTED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-[#0052CC] border border-blue-200">Suppliers Contacted</span>;
      case "QUOTATIONS_RECEIVED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Quotes Received</span>;
      case "PROPOSAL_READY":
      case "PROPOSAL_SENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Proposal Ready
          </span>
        );
      case "NEGOTIATION":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-[#0747A6] border border-blue-200">Negotiation</span>;
      case "FULFILLED":
      case "COMPLETED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Fulfilled</span>;
      case "CLOSED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Closed</span>;
      case "REJECTED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Declined</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesQuery =
      searchQuery.trim() === "" ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sourcingRequestReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.casNumber && r.casNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "" || r.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#0F172A]">
      {/* 1. Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-[#0052CC]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#091E42]">KemKendra Sourcing Desk</h1>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Track custom chemical and pharmaceutical procurement requirements handled directly by KemKendra sourcing specialists.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadRequests}
            disabled={loading}
            className="h-9 px-3.5 text-xs font-semibold text-[#0F172A] bg-white border border-slate-200 hover:bg-[#F8F9FA] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs press-tactile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/sourcing/request"
            className="h-9 px-4 text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs press-tactile"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Sourcing Requirement</span>
          </Link>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-tactile-card">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product, CAS, reference..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 text-[#0F172A] placeholder:text-slate-400 shadow-2xs transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 text-[#0F172A] font-semibold shadow-2xs cursor-pointer transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SOURCING">Sourcing Active</option>
            <option value="PROPOSAL_SENT">Proposal Ready</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="FULFILLED">Fulfilled</option>
          </select>
        </div>
      </div>

      {/* 3. Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Requests List / Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-tactile-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-6 h-6 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-[#64748B]">Loading your sourcing requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center p-6 space-y-2.5 max-w-md mx-auto">
            <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-xs font-semibold text-[#0F172A]">No Sourcing Inquiries Found</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {searchQuery || statusFilter
                ? "No sourcing inquiries match your search criteria."
                : "Can't find the exact chemical, API, or specialty ingredient on KemKendra? Submit a custom sourcing request and our dedicated team will secure competitive quotations."}
            </p>
            <div className="pt-2">
              <Link
                href="/sourcing/request"
                className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs press-tactile"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Sourcing Request</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-slate-200 text-xs font-semibold text-[#64748B]">
                <tr>
                  <th className="py-3 px-4">Inquiry Ref</th>
                  <th className="py-3 px-4">Chemical / Compound</th>
                  <th className="py-3 px-4">Target Volume</th>
                  <th className="py-3 px-4">Delivery SEZ / City</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((r) => {
                  const hasProposalReady = r.status === "PROPOSAL_SENT" || r.status === "PROPOSAL_READY";

                  return (
                    <tr key={r.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0052CC]">
                        {r.sourcingRequestReference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0F172A]">{r.productName}</div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">{r.category}</span>
                          {r.casNumber && <span>CAS: {r.casNumber}</span>}
                          {r.grade && <span>• {r.grade}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                        {Number(r.quantity).toLocaleString()} <span className="text-[#64748B] font-normal">{r.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#475569]">
                        {r.deliveryLocation}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/dashboard/buyer/sourcing/${r.id}`}
                          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors press-tactile ${
                            hasProposalReady
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              : "bg-[#0052CC] hover:bg-[#0747A6] text-white shadow-xs"
                          }`}
                        >
                          {hasProposalReady ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>View Proposal</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Status</span>
                            </>
                          )}
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
