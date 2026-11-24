"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Package,
  Plus,
  Building2,
  ShoppingCart,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Receipt,
  AlertCircle,
  TrendingUp,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/shared/components/ui/KemkendraUI";
import { getBuyerDashboardSummary } from "@/features/dashboard/api/dashboardApi";
import { BuyerDashboardSummaryResponse } from "@/features/dashboard/types/dashboardTypes";
import { PendingActionsCard } from "@/features/dashboard/components/PendingActionsCard";
import { ActivityTimeline } from "@/features/dashboard/components/ActivityTimeline";
import { QuickActionsBar } from "@/features/dashboard/components/QuickActionsBar";

export default function BuyerDashboardOverviewPage() {
  const [data, setData] = useState<BuyerDashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBuyerDashboardSummary();
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

  return (
    <div className="space-y-6 pb-12 text-[#0F172A]">
      {/* 1. Header with Refresh & Create RFQ */}
      <PageHeader
        title="Buyer Procurement Desk"
        description="Monitor active chemical sourcing RFQs, evaluate supplier commercial quotations, track orders, and oversee invoicing."
        actions={
          <div className="flex items-center gap-2">
            {lastRefreshed && (
              <span className="text-[11px] font-mono text-[#64748B] hidden sm:inline">
                Synced at {lastRefreshed}
              </span>
            )}
            <Link
              href="/rfq"
              className="inline-flex items-center gap-1.5 px-3.5 h-9 text-xs font-medium text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] rounded-[6px] transition-colors shadow-xs active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Sourcing RFQ</span>
            </Link>
          </div>
        }
      />

      {/* 2. Quick Operations Shortcuts */}
      <QuickActionsBar role="BUYER" />

      {/* 3. Pending Operational Actions Banner */}
      <PendingActionsCard actions={data?.pendingActions || []} loading={loading} />

      {/* 4. Structured Operational KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active RFQs */}
        <Link
          href="/dashboard/rfqs"
          className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-[#0052CC] transition-[border-color,box-shadow] duration-150 group shadow-tactile-card block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-500">
              Active Sourcing RFQs
            </span>
            <FileText className="w-4 h-4 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <strong className="text-2xl font-bold font-mono text-slate-900 group-hover:text-[#0052CC] transition-colors">
              {loading ? "—" : data?.activeRfqs || 0}
            </strong>
            <span className="text-xs text-slate-500">
              {data?.totalRfqs || 0} total
            </span>
          </div>
        </Link>

        {/* Quotes Received */}
        <Link
          href="/dashboard/rfqs?filter=QUOTED"
          className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-[#0052CC] transition-[border-color,box-shadow] duration-150 group shadow-tactile-card block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-500">
              Quotes to Review
            </span>
            <TrendingUp className="w-4 h-4 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <strong className="text-2xl font-bold font-mono text-slate-900 group-hover:text-[#0052CC] transition-colors">
              {loading ? "—" : data?.pendingQuotations || 0}
            </strong>
            <span className="text-xs text-emerald-600 font-semibold">
              {data?.acceptedQuotations || 0} accepted
            </span>
          </div>
        </Link>

        {/* Purchase Orders */}
        <Link
          href="/dashboard/orders"
          className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-[#0052CC] transition-[border-color,box-shadow] duration-150 group shadow-tactile-card block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-500">
              Orders in Pipeline
            </span>
            <Package className="w-4 h-4 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <strong className="text-2xl font-bold font-mono text-slate-900 group-hover:text-[#0052CC] transition-colors">
              {loading ? "—" : data?.pendingOrders || 0}
            </strong>
            <span className="text-xs text-slate-500">
              {data?.completedOrders || 0} completed
            </span>
          </div>
        </Link>

        {/* Open Disputes */}
        <Link
          href="/dashboard/buyer/disputes"
          className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-[#0052CC] transition-[border-color,box-shadow] duration-150 group shadow-tactile-card block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-500">
              Open Disputes
            </span>
            <MessageSquare className="w-4 h-4 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <strong
              className={`text-2xl font-bold font-mono ${
                (data?.openDisputes || 0) > 0 ? "text-amber-600" : "text-slate-900"
              }`}
            >
              {loading ? "—" : data?.openDisputes || 0}
            </strong>
            <span className="text-xs text-slate-500">
              {(data?.openDisputes || 0) > 0 ? "Action required" : "Zero open"}
            </span>
          </div>
        </Link>
      </div>

      {/* 5. Two Column Layout: Financial Breakdown + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Invoicing & Financial Health Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Summary Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-tactile-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] border border-blue-100 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Invoicing & Commercial Settlements
                </h3>
              </div>
              <Link
                href="/dashboard/buyer/invoices"
                className="text-xs text-[#0052CC] hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>View All Invoices</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="text-xs uppercase tracking-wider text-amber-800 font-bold block">
                  Outstanding Invoice Payable
                </span>
                <strong className="text-2xl font-extrabold font-mono text-amber-900 block">
                  {loading ? "—" : formatCurrency(data?.outstandingInvoiceAmount)}
                </strong>
                <p className="text-xs text-slate-500">
                  Unpaid or pending verification invoices from active suppliers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold block">
                  Settled Invoices
                </span>
                <strong className="text-2xl font-extrabold font-mono text-emerald-800 block">
                  {loading ? "—" : formatCurrency(data?.paidInvoiceAmount)}
                </strong>
                <p className="text-xs text-slate-500">
                  Confirmed payments verified by suppliers with formal receipts.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-1">
              * Indicative invoice amounts reflect commercial PO valuations. Final wire and GST credit adjustments apply at bank settlement.
            </div>
          </div>

          {/* Quick Navigation Sections */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Chemical Procurement Resources
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Link
                href="/products"
                className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-[#0052CC] transition-colors flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#0052CC] block">
                    Catalog Discovery
                  </span>
                  <span className="text-xs text-slate-500">
                    Search 10,000+ chemicals by CAS or formula
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0052CC] transition-colors shrink-0" />
              </Link>

              <Link
                href="/suppliers"
                className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-[#0052CC] transition-colors flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#0052CC] block">
                    Verified Manufacturers
                  </span>
                  <span className="text-xs text-slate-500">
                    Browse GMP and ISO certified global suppliers
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
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-tactile-card space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold text-slate-900">
                  Recent Platform Alerts
                </span>
                <Link
                  href="/dashboard/notifications"
                  className="text-xs text-[#0052CC] hover:underline font-bold"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {data.recentNotifications.slice(0, 4).map((n) => (
                  <Link
                    key={n.id}
                    href={n.targetRoute || "/dashboard/notifications"}
                    className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs space-y-0.5"
                  >
                    <div className="font-bold text-slate-900 truncate">
                      {n.title}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1">
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
