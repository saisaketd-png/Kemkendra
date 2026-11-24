"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Ban,
  RefreshCw,
  ArrowRight,
  Search,
  Filter,
  Globe2,
  UserCheck,
  ExternalLink,
  ShieldAlert,
  Award,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Download,
  Check,
} from "lucide-react";
import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";

interface SupplierRecord {
  id: number | string;
  name: string;
  legalName?: string;
  tradeName?: string;
  countryCode?: string;
  countryName?: string;
  city?: string;
  businessType?: string;
  logoUrl?: string | null;
  verified?: boolean;
  verificationStatus?: "PENDING" | "UNDER_REVIEW" | "INFORMATION_REQUIRED" | "VERIFIED" | "REJECTED" | "SUSPENDED" | "DRAFT" | string;
  exportReady?: boolean;
  offeringCount?: number;
  userStatus?: string;
  completenessPercentage?: number;
  createdAt?: string;
}

export default function SupplierModerationHubPage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "status" | "id">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authenticatedFetch("/api/v1/admin/suppliers?size=100&excludeDraft=false");
      if (!res.ok) throw new Error("Failed to load supplier moderation records");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.content || [];
      setSuppliers(list);
    } catch (err: any) {
      setError(err.message || "Failed to load supplier moderation hub");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived counts
  const pendingCount = useMemo(() => suppliers.filter((s) => s.verificationStatus === "PENDING").length, [suppliers]);
  const underReviewCount = useMemo(() => suppliers.filter((s) => s.verificationStatus === "UNDER_REVIEW").length, [suppliers]);
  const infoRequiredCount = useMemo(() => suppliers.filter((s) => s.verificationStatus === "INFORMATION_REQUIRED").length, [suppliers]);
  const verifiedCount = useMemo(() => suppliers.filter((s) => s.verificationStatus === "VERIFIED" || s.verified).length, [suppliers]);
  const rejectedCount = useMemo(() => suppliers.filter((s) => s.verificationStatus === "REJECTED").length, [suppliers]);
  const suspendedCount = useMemo(() => suppliers.filter((s) => s.verificationStatus === "SUSPENDED" || s.userStatus === "SUSPENDED").length, [suppliers]);

  const queueTotal = pendingCount + underReviewCount + infoRequiredCount;
  const complianceRate = suppliers.length > 0 ? Math.round((verifiedCount / suppliers.length) * 100) : 0;

  // Filtered and sorted suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter((sup) => {
        if (statusFilter !== "ALL") {
          if (statusFilter === "VERIFIED" && !(sup.verificationStatus === "VERIFIED" || sup.verified)) return false;
          if (statusFilter === "PENDING" && sup.verificationStatus !== "PENDING") return false;
          if (statusFilter === "UNDER_REVIEW" && sup.verificationStatus !== "UNDER_REVIEW") return false;
          if (statusFilter === "INFORMATION_REQUIRED" && sup.verificationStatus !== "INFORMATION_REQUIRED") return false;
          if (statusFilter === "REJECTED" && sup.verificationStatus !== "REJECTED") return false;
          if (statusFilter === "SUSPENDED" && sup.verificationStatus !== "SUSPENDED" && sup.userStatus !== "SUSPENDED") return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = sup.name?.toLowerCase().includes(q);
          const legalMatch = sup.legalName?.toLowerCase().includes(q);
          const countryMatch = sup.countryName?.toLowerCase().includes(q) || sup.countryCode?.toLowerCase().includes(q);
          const idMatch = String(sup.id).includes(q);
          return nameMatch || legalMatch || countryMatch || idMatch;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = sortBy === "status" ? (a.verificationStatus || (a.verified ? "VERIFIED" : "DRAFT")) : a[sortBy] ?? "";
        let valB: any = sortBy === "status" ? (b.verificationStatus || (b.verified ? "VERIFIED" : "DRAFT")) : b[sortBy] ?? "";
        if (sortBy === "id") {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [suppliers, statusFilter, searchQuery, sortBy, sortOrder]);

  const exportCsv = () => {
    const headers = ["ID", "Name", "Legal Name", "Country", "Status", "Export Ready"];
    const rows = filteredSuppliers.map((s) => [
      s.id,
      `"${s.name || ""}"`,
      `"${s.legalName || ""}"`,
      `"${s.countryName || s.countryCode || ""}"`,
      s.verificationStatus || (s.verified ? "VERIFIED" : "DRAFT"),
      s.exportReady ? "YES" : "NO",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kemkendra_suppliers_${statusFilter.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8 bg-[#F8F9FA] text-[#0F172A] antialiased">
      {/* 1. INSTITUTIONAL COMMAND HEADER */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/90 shadow-tactile-card p-6 sm:p-8">
        {/* Subtle coordinate watermark */}
        <div className="absolute right-0 top-0 w-96 h-full bg-radial-fade opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#EFF6FF] text-[#0052CC] border border-[#BFDBFE]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Institutional Clearinghouse
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Audited Registry
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#091E42] tracking-tight">
              Supplier Moderation & Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Autonomous due-diligence gateway, statutory document verification, and catalog clearance controls. All moderation decisions are cryptographically recorded to the immutable platform audit ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={exportCsv}
              disabled={filteredSuppliers.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors shadow-2xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export Ledger (.CSV)</span>
            </button>

            <button
              type="button"
              onClick={() => loadData()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Live Operational Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">Total Directory Entities</span>
            <strong className="text-lg sm:text-xl font-extrabold text-[#091E42]">{suppliers.length} Registered</strong>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">Compliance Rate</span>
            <strong className="text-lg sm:text-xl font-extrabold text-emerald-600">{complianceRate}% Audited</strong>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">Active Verification Queue</span>
            <strong className="text-lg sm:text-xl font-extrabold text-amber-600">{queueTotal} Awaiting Action</strong>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">Export-Ready Suppliers</span>
            <strong className="text-lg sm:text-xl font-extrabold text-[#0052CC]">
              {suppliers.filter((s) => s.exportReady).length} International
            </strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => loadData()} className="text-xs font-bold underline hover:text-rose-900">
            Retry
          </button>
        </div>
      )}

      {/* 2. PRIMARY WORKSPACE GATEWAYS (Bespoke Command Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gateway 1: Supplier Verification Workspace */}
        <div className="group relative overflow-hidden rounded-2xl bg-[#091E42] text-white border border-slate-700/80 shadow-tactile-card p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-colors hover:border-slate-500">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6 text-[#60A5FA]" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {pendingCount + underReviewCount} In Due Diligence
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Supplier Verification Workspace</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Inspect official Corporate Identification Numbers (CIN), statutory GST certificates, physical premises leases, and authorized representative profiles.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[9px] uppercase">Pending</span>
                <span className="font-bold text-amber-400">{pendingCount}</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[9px] uppercase">Under Review</span>
                <span className="font-bold text-blue-400">{underReviewCount}</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[9px] uppercase">Clarifications</span>
                <span className="font-bold text-amber-300">{infoRequiredCount}</span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/admin/suppliers/verification"
            className="inline-flex items-center justify-between w-full px-5 py-3.5 bg-white text-[#091E42] hover:bg-slate-100 rounded-xl text-xs font-extrabold tracking-wider transition-all shadow-md group-hover:shadow-lg"
          >
            <span className="uppercase tracking-wider">Launch Due Diligence Queue</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Gateway 2: Commercial Offering Portfolio Review */}
        <div className="group relative overflow-hidden rounded-2xl bg-[#091E42] text-white border border-slate-700/80 shadow-tactile-card p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-colors hover:border-slate-500">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shadow-inner">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Catalog Governance
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Commercial Offering Moderation</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Audit supplier catalog submissions, pharmacopeial grades (USP, BP, EP), CAS validation, purity assays, and HPLC certificates of analysis prior to public marketplace listing.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[9px] uppercase">Authorized Suppliers</span>
                <span className="font-bold text-emerald-400">{verifiedCount} Companies</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 block text-[9px] uppercase">Compliance Gate</span>
                <span className="font-bold text-slate-200">Pre-Publication Audit</span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/admin/catalog/offerings"
            className="inline-flex items-center justify-between w-full px-5 py-3.5 bg-white text-[#091E42] hover:bg-slate-100 rounded-xl text-xs font-extrabold tracking-wider transition-all shadow-md group-hover:shadow-lg"
          >
            <span className="uppercase tracking-wider">Inspect Commercial Offerings</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 3. INTERACTIVE SEGMENTED STATUS TILES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Lifecycle Verification Filters
          </span>
          <span className="text-xs font-medium text-slate-400">
            Showing <strong className="text-slate-900">{filteredSuppliers.length}</strong> of {suppliers.length} records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: "PENDING", label: "Pending", count: pendingCount, icon: Clock, color: "amber" },
            { key: "UNDER_REVIEW", label: "In Review", count: underReviewCount, icon: RefreshCw, color: "blue" },
            { key: "INFORMATION_REQUIRED", label: "Info Req", count: infoRequiredCount, icon: AlertCircle, color: "amber" },
            { key: "VERIFIED", label: "Verified", count: verifiedCount, icon: CheckCircle2, color: "emerald" },
            { key: "REJECTED", label: "Rejected", count: rejectedCount, icon: XCircle, color: "rose" },
            { key: "SUSPENDED", label: "Suspended", count: suspendedCount, icon: Ban, color: "slate" },
          ].map((item) => {
            const isSelected = statusFilter === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setStatusFilter(statusFilter === item.key ? "ALL" : item.key)}
                className={`text-left p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-[#0052CC] ring-2 ring-[#0052CC]/15 shadow-sm"
                    : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-1.5 rounded-lg ${
                    item.color === "emerald" ? "bg-emerald-50 text-emerald-700" :
                    item.color === "blue" ? "bg-blue-50 text-[#0052CC]" :
                    item.color === "amber" ? "bg-amber-50 text-amber-700" :
                    item.color === "rose" ? "bg-rose-50 text-rose-700" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <strong className="text-xl font-extrabold text-[#091E42] block">
                    {item.count}
                  </strong>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {item.key === "VERIFIED" ? "Marketplace Active" :
                     item.key === "PENDING" ? "Awaiting Audit" :
                     item.key === "UNDER_REVIEW" ? "Auditor Assigned" :
                     item.key === "INFORMATION_REQUIRED" ? "Missing KYC Docs" :
                     item.key === "REJECTED" ? "Failed Criteria" : "Account Blocked"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. HIGH-DENSITY SUPPLIER REGISTRY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-tactile-card overflow-hidden space-y-0">
        {/* Table Control Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-[#091E42] tracking-tight">
              Supplier Accounts Registry
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white text-slate-700 border border-slate-200">
              {filteredSuppliers.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, legal entity, country, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0052CC]"
              >
                <option value="id">Sort: Registered ID</option>
                <option value="name">Sort: Company Name</option>
                <option value="status">Sort: Moderation State</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs"
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>

            {statusFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6">Supplier Entity</th>
                <th className="py-3.5 px-4">Jurisdiction & City</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Due Diligence Status</th>
                <th className="py-3.5 px-4">Export Clearance</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((s) => {
                  const isVerified = s.verificationStatus === "VERIFIED" || s.verified;
                  const isUnderReview = s.verificationStatus === "UNDER_REVIEW";
                  const isInfoReq = s.verificationStatus === "INFORMATION_REQUIRED";
                  const isSuspended = s.verificationStatus === "SUSPENDED" || s.userStatus === "SUSPENDED";
                  const isRejected = s.verificationStatus === "REJECTED";

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* 1. Supplier Entity */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm overflow-hidden shrink-0 shadow-2xs group-hover:border-blue-300 transition-colors">
                            {s.logoUrl ? (
                              <img src={s.logoUrl} alt={s.name} className="w-full h-full object-contain" />
                            ) : (
                              <span>{s.name ? s.name[0].toUpperCase() : "S"}</span>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <strong className="font-extrabold text-[#091E42] group-hover:text-[#0052CC] transition-colors text-xs sm:text-sm">
                                {s.name}
                              </strong>
                              {isVerified && (
                                <span title="Verified Enterprise Supplier" className="text-emerald-600">
                                  <ShieldCheck className="w-3.5 h-3.5 inline" />
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                              <span>ID: #{s.id}</span>
                              {s.legalName && s.legalName !== s.name && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[200px]" title={s.legalName}>
                                    {s.legalName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Country & City */}
                      <td className="py-4 px-4 font-medium text-slate-700">
                        <div className="space-y-0.5">
                          <span className="font-semibold block text-slate-900">
                            {s.countryName || s.countryCode || "Global"}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {s.city || (s.countryCode ? `ISO: ${s.countryCode}` : "Headquarters")}
                          </span>
                        </div>
                      </td>

                      {/* 3. Classification */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {s.businessType || "MANUFACTURER"}
                        </span>
                      </td>

                      {/* 4. Due Diligence Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${
                            isVerified
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : isUnderReview
                              ? "bg-blue-50 text-[#0052CC] border border-blue-200"
                              : isInfoReq
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : isSuspended
                              ? "bg-slate-100 text-slate-800 border border-slate-300"
                              : isRejected
                              ? "bg-rose-50 text-rose-800 border border-rose-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isVerified ? "bg-emerald-500" :
                            isUnderReview ? "bg-blue-500" :
                            isInfoReq ? "bg-amber-500" :
                            isSuspended ? "bg-slate-400" :
                            isRejected ? "bg-rose-500" : "bg-amber-400"
                          }`} />
                          {s.verificationStatus || (s.verified ? "VERIFIED" : "PENDING")}
                        </span>
                      </td>

                      {/* 5. Export Clearance */}
                      <td className="py-4 px-4">
                        {s.exportReady ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] font-bold text-[10px] border border-blue-100">
                            <Globe2 className="w-3 h-3" /> Export Ready
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Domestic Only</span>
                        )}
                      </td>

                      {/* 6. Moderation Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/dashboard/admin/suppliers/verification/${s.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#091E42] hover:bg-[#0052CC] text-white rounded-xl font-bold text-[11px] transition-all shadow-2xs hover:shadow-sm"
                          >
                            <span>Due Diligence</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                          <Link
                            href={`/dashboard/admin/suppliers/${s.id}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Inspect Supplier Account Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <strong className="block text-sm font-bold text-slate-900">No matching suppliers found</strong>
                      <p className="text-xs text-slate-500">
                        Try modifying your search query or clear the selected status filter.
                      </p>
                    </div>
                    {statusFilter !== "ALL" && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("ALL")}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                      >
                        Reset Status Filter
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
