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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active RFQs */}
        <Link
          href="/dashboard/rfqs"
          className="p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] hover:border-[#0052CC] transition-colors group shadow-xs block"
        >
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">
              Active Sourcing RFQs
            </span>
            <FileText className="w-3.5 h-3.5 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-xl font-bold font-mono text-[#0F172A] group-hover:text-[#0052CC] transition-colors">
              {loading ? "—" : data?.activeRfqs || 0}
            </strong>
            <span className="text-[11px] text-[#64748B]">
              {data?.totalRfqs || 0} total
            </span>
          </div>
        </Link>

        {/* Quotes Received */}
        <Link
          href="/dashboard/rfqs?filter=QUOTED"
          className="p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] hover:border-[#0052CC] transition-colors group shadow-xs block"
        >
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">
              Quotes to Review
            </span>
            <TrendingUp className="w-3.5 h-3.5 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-xl font-bold font-mono text-[#0F172A] group-hover:text-[#0052CC] transition-colors">
              {loading ? "—" : data?.pendingQuotations || 0}
            </strong>
            <span className="text-[11px] text-[#006644] font-medium">
              {data?.acceptedQuotations || 0} accepted
            </span>
          </div>
        </Link>

        {/* Purchase Orders */}
        <Link
          href="/dashboard/orders"
          className="p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] hover:border-[#0052CC] transition-colors group shadow-xs block"
        >
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">
              Orders in Pipeline
            </span>
            <Package className="w-3.5 h-3.5 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <strong className="text-xl font-bold font-mono text-[#0F172A] group-hover:text-[#0052CC] transition-colors">
              {loading ? "—" : data?.pendingOrders || 0}
            </strong>
            <span className="text-[11px] text-[#64748B]">
              {data?.completedOrders || 0} completed
            </span>
          </div>
        </Link>

        {/* Open Disputes */}
        <Link
          href="/dashboard/buyer/disputes"
          className="p-3.5 bg-white border border-[#E4E4E7] rounded-[8px] hover:border-[#0052CC] transition-colors group shadow-xs block"
        >
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">
              Open Disputes
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
          <div className="bg-white border border-[#E4E4E7] rounded-[10px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#0052CC]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight">
                  Invoicing & Commercial Settlements
                </h3>
              </div>
              <Link
                href="/dashboard/buyer/invoices"
                className="text-xs text-[#0052CC] hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>View All Invoices</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/80 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold block">
                  Outstanding Invoice Payable
                </span>
                <strong className="text-xl sm:text-2xl font-extrabold font-mono text-amber-900 block">
                  {loading ? "—" : formatCurrency(data?.outstandingInvoiceAmount)}
                </strong>
                <p className="text-[11px] text-[#64748B]">
                  Unpaid or pending verification invoices from active suppliers.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#E3FCEF]/50 border border-[#ABF5D1] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#006644] font-bold block">
                  Settled Invoices
                </span>
                <strong className="text-xl sm:text-2xl font-extrabold font-mono text-[#006644] block">
                  {loading ? "—" : formatCurrency(data?.paidInvoiceAmount)}
                </strong>
                <p className="text-[11px] text-[#64748B]">
                  Confirmed payments verified by suppliers with formal receipts.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-[#64748B] pt-1">
              * Indicative invoice amounts reflect commercial PO valuations. Final wire and GST credit adjustments apply at bank settlement.
            </div>
          </div>

          {/* Quick Navigation Sections */}
          <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-[10px] p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569] font-mono">
              Chemical Procurement Resources
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/products"
                className="p-3 bg-white border border-[#E4E4E7] rounded-lg hover:border-[#0052CC] transition-colors flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-[#0F172A] group-hover:text-[#0052CC] block">
                    Catalog Discovery
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Search 10,000+ chemicals by CAS or formula
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0052CC] transition-colors shrink-0" />
              </Link>

              <Link
                href="/suppliers"
                className="p-3 bg-white border border-[#E4E4E7] rounded-lg hover:border-[#0052CC] transition-colors flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-[#0F172A] group-hover:text-[#0052CC] block">
                    Verified Manufacturers
                  </span>
                  <span className="text-[11px] text-[#64748B]">
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
            <div className="bg-white border border-[#E4E4E7] rounded-[10px] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                <span className="text-xs font-bold text-[#0F172A]">
                  Recent Platform Alerts
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
