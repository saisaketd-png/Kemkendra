"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Package,
  Plus,
  Building2,
  ShoppingCart,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  FlaskConical,
  Clock,
  CheckCircle2,
  Receipt,
  TrendingUp,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/shared/components/ui/KemkendraUI";
import { getSupplierDashboardSummary } from "@/features/dashboard/api/dashboardApi";
import { SupplierDashboardSummaryResponse } from "@/features/dashboard/types/dashboardTypes";
import { PendingActionsCard } from "@/features/dashboard/components/PendingActionsCard";
import { ActivityTimeline } from "@/features/dashboard/components/ActivityTimeline";
import { QuickActionsBar } from "@/features/dashboard/components/QuickActionsBar";

export default function SupplierDashboardOverviewPage() {
  const [data, setData] = useState<SupplierDashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSupplierDashboardSummary();
      setData(res);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "₹0.00";
    return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isVerified = Boolean(data?.isVerified);
  const status = data?.verificationStatus || "DRAFT";

  return (
    <div className="space-y-6 pb-12 text-[#0F172A]">
      {/* 1. Header with Refresh and New Offering Action */}
      <PageHeader
        title="Supplier Operations Desk"
        description="Oversee chemical offerings, evaluate buyer quotation inquiries, manage order fulfillment, and confirm invoice settlements."
        actions={
          <div className="flex items-center gap-2">
            {lastRefreshed && (
              <span className="text-[11px] font-mono text-[#64748B] hidden sm:inline">
                Synced at {lastRefreshed}
              </span>
            )}
            <Link
              href="/dashboard/supplier/products/new"
              className="inline-flex items-center gap-1.5 px-3.5 h-9 text-xs font-medium text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] rounded-[6px] transition-colors shadow-xs active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Chemical Offering</span>
            </Link>
          </div>
        }
      />

      {/* 2. Verification Status Alert Banner */}
      {!loading && !isVerified && (
        <div className="p-4 rounded-[10px] bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-amber-900">
                  Verification Status: {status}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-800 uppercase font-semibold">
                  Action Recommended
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Complete compliance verification and KYC to unlock verified supplier badges, priority ranking, and unlimited quote responses.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/supplier/verification"
            className="h-8 px-3 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-[6px] transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
          >
            <span>Submit Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Quick Operations Shortcuts */}
      <QuickActionsBar role="SUPPLIER" />

      {/* 4. Pending Actions Card */}
      <PendingActionsCard actions={data?.pendingActions || []} loading={loading} />

      {/* 5. Structured Operational KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Catalog Offerings */}
        <Link
          href="/dashboard/supplier/products"
          className="p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] hover:border-[#0052CC] transition-colors group shadow-xs block"
        >
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">
              Live Chemical Offerings
            </span>
            <FlaskConical className="w-3.5 h-3.5 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-xl font-bold font-mono text-[#0F172A] group-hover:text-[#0052CC] transition-colors">
              {loading ? "—" : data?.activeOfferings || 0}
            </strong>
            <span className="text-[11px] text-[#64748B]">
              {data?.totalOfferings || 0} total
            </span>
          </div>
        </Link>

        {/* Incoming RFQs */}
        <Link
          href="/dashboard/supplier/rfqs"
          className="p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] hover:border-[#0052CC] transition-colors group shadow-xs block"
        >
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">
              RFQs Pending Quote
            </span>
            <FileText className="w-3.5 h-3.5 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong
              className={`text-xl font-bold font-mono ${
                (data?.pendingRfqs || 0) > 0 ? "text-[#0052CC]" : "text-[#0F172A]"
              }`}
            >
              {loading ? "—" : data?.pendingRfqs || 0}
            </strong>
            <span className="text-[11px] text-[#64748B]">
              {data?.rfqsReceived || 0} total
            </span>
          </div>
        </Link>

        {/* Orders in Fulfillment */}
        <Link
          href="/dashboard/supplier/orders"
          className="p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] hover:border-[#0052CC] transition-colors group shadow-xs block"
        >
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">
              Orders in Progress
            </span>
            <Package className="w-3.5 h-3.5 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-xl font-bold font-mono text-[#0F172A] group-hover:text-[#0052CC] transition-colors">
              {loading ? "—" : data?.pendingOrders || 0}
            </strong>
            <span className="text-[11px] text-[#64748B]">
              {data?.totalOrders || 0} total
            </span>
          </div>
        </Link>

        {/* Open Disputes */}
        <Link
          href="/dashboard/supplier/disputes"
          className="p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] hover:border-[#0052CC] transition-colors group shadow-xs block"
        >
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">
              Customer Disputes
            </span>
            <MessageSquare className="w-3.5 h-3.5 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong
              className={`text-xl font-bold font-mono ${
                (data?.openDisputes || 0) > 0 ? "text-amber-600" : "text-[#0F172A]"
              }`}
            >
              {loading ? "—" : data?.openDisputes || 0}
            </strong>
            <span className="text-[11px] text-[#64748B]">
              {(data?.openDisputes || 0) > 0 ? "Action needed" : "Zero open"}
            </span>
          </div>
        </Link>
      </div>

      {/* 6. Two Column Layout: Financial & Settlement Overview + Live Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Invoicing & Payment Settlements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Settlement Card */}
          <div className="bg-white border border-[#E4E4E7] rounded-[10px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#0052CC]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight">
                  Invoice Receivables & Settlement Pipeline
                </h3>
              </div>
              <Link
                href="/dashboard/supplier/invoices"
                className="text-xs text-[#0052CC] hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>View Invoices</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold block">
                    Outstanding Receivables
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                    {data?.outstandingInvoices || 0} invoices
                  </span>
                </div>
                <strong className="text-xl sm:text-2xl font-extrabold font-mono text-amber-900 block">
                  {loading ? "—" : formatCurrency(data?.outstandingInvoiceAmount)}
                </strong>
                <p className="text-[11px] text-[#64748B]">
                  Invoices issued awaiting buyer payment receipt or verification.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#E3FCEF]/50 border border-[#ABF5D1] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#006644] font-bold block">
                    Confirmed Payments
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#E3FCEF] text-[#006644]">
                    {data?.confirmedPayments || 0} settled
                  </span>
                </div>
                <strong className="text-xl sm:text-2xl font-extrabold font-mono text-[#006644] block">
                  {loading ? "—" : formatCurrency(data?.confirmedPaymentAmount)}
                </strong>
                <p className="text-[11px] text-[#64748B]">
                  Verified commercial wire transfers completed by buyers.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-[#64748B] pt-1">
              * Payments are recorded directly between buyer and supplier. KemKendra operates on zero-custody verified records.
            </div>
          </div>

          {/* Catalog & Verification Quick Links */}
          <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-[10px] p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569] font-mono">
              Manufacturer Tools & Compliance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/dashboard/supplier/verification"
                className="p-3 bg-white border border-[#E4E4E7] rounded-lg hover:border-[#0052CC] transition-colors flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-[#0F172A] group-hover:text-[#0052CC] block">
                    KYC & Due Diligence
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Manage manufacturing licenses and audit evidence
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0052CC] transition-colors shrink-0" />
              </Link>

              <Link
                href="/dashboard/supplier/documents"
                className="p-3 bg-white border border-[#E4E4E7] rounded-lg hover:border-[#0052CC] transition-colors flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-[#0F172A] group-hover:text-[#0052CC] block">
                    COA & MSDS Vault
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Upload batch certificates and safety data sheets
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0052CC] transition-colors shrink-0" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Activity Timeline */}
        <div className="space-y-6">
          <ActivityTimeline activities={data?.recentActivity || []} loading={loading} />

          {/* Notifications Widget */}
          {data?.recentNotifications && data.recentNotifications.length > 0 && (
            <div className="bg-white border border-[#E4E4E7] rounded-[10px] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                <span className="text-xs font-bold text-[#0F172A]">
                  Recent Supplier Alerts
                </span>
                <Link
                  href="/dashboard/notifications"
                  className="text-[11px] text-[#0052CC] hover:underline font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {data.recentNotifications.slice(0, 4).map((n) => (
                  <Link
                    key={n.id}
                    href={n.targetRoute || "/dashboard/notifications"}
                    className="block p-2 rounded-md hover:bg-slate-50 transition-colors text-xs space-y-0.5"
                  >
                    <div className="font-semibold text-[#0F172A] truncate">
                      {n.title}
                    </div>
                    <div className="text-[11px] text-[#64748B] line-clamp-1">
                      {n.message}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
