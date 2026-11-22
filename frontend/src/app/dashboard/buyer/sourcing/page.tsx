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
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">SUBMITTED</span>;
      case "UNDER_REVIEW":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">UNDER_REVIEW</span>;
      case "MORE_INFORMATION_REQUIRED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D]">MORE_INFO_REQ</span>;
      case "ACCEPTED":
      case "SOURCING":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">SOURCING</span>;
      case "SUPPLIER_CONTACTED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">SUPPLIER_CONTACTED</span>;
      case "QUOTATIONS_RECEIVED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">QUOTES_RECEIVED</span>;
      case "PROPOSAL_READY":
      case "PROPOSAL_SENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] animate-pulse">
            <Sparkles className="w-3 h-3 text-[#15803D]" />
            PROPOSAL READY
          </span>
        );
      case "NEGOTIATION":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF]">NEGOTIATION</span>;
      case "FULFILLED":
      case "COMPLETED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">FULFILLED</span>;
      case "CLOSED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">CLOSED</span>;
      case "REJECTED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">REJECTED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">{status}</span>;
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-[#0052CC]" />
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">KemKendra Sourcing Desk</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Track custom chemical and pharmaceutical procurement requirements handled directly by KemKendra sourcing specialists.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadRequests}
            disabled={loading}
            className="h-9 px-3 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] rounded-[6px] hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/sourcing/request"
            className="h-9 px-4 text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded-[6px] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Sourcing Requirement</span>
          </Link>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product, CAS, reference..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#0052CC]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#0052CC] text-[#334155] font-medium"
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
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] text-xs text-[#991B1B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Requests List / Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-6 h-6 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-[#64748B]">Loading your sourcing requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center p-6">
            <FlaskConical className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#0F172A]">No Sourcing Inquiries Found</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter
                ? "No sourcing inquiries match your search criteria."
                : "Can't find the exact chemical, API, or specialty ingredient on KemKendra? Submit a custom sourcing request and our dedicated team will secure competitive quotations."}
            </p>
            <Link
              href="/sourcing/request"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[6px] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Chemical Sourcing Request</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-mono uppercase tracking-wider text-[#64748B]">
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
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredRequests.map((r) => {
                  const hasProposalReady = r.status === "PROPOSAL_SENT" || r.status === "PROPOSAL_READY";

                  return (
                    <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0052CC]">
                        {r.sourcingRequestReference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0F172A]">{r.productName}</div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                          <span className="bg-[#F1F5F9] px-1.5 py-0.2 rounded text-[10px]">{r.category}</span>
                          {r.casNumber && <span>CAS: {r.casNumber}</span>}
                          {r.grade && <span>• {r.grade}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                        {Number(r.quantity).toLocaleString()} <span className="text-[#64748B] font-normal">{r.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#334155]">
                        {r.deliveryLocation}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/dashboard/buyer/sourcing/${r.id}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors ${
                            hasProposalReady
                              ? "bg-[#15803D] hover:bg-[#166534] text-white shadow-2xs font-bold"
                              : "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A]"
                          }`}
                        >
                          {hasProposalReady ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
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
