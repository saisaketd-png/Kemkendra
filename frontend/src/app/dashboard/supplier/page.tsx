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
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Verification Status: {status}
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  Action Recommended
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Complete compliance verification and KYC to unlock verified supplier badges, priority ranking, and unlimited quote responses.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/supplier/verification"
            className="h-9 px-4 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Catalog Offerings */}
        <Link
          href="/dashboard/supplier/products"
          className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-xl hover:border-[#0052CC] transition-[border-color,box-shadow] duration-150 group shadow-2xs block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-500">
              Live Chemical Offerings
            </span>
            <FlaskConical className="w-4 h-4 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <strong className="text-2xl font-bold font-mono text-slate-900 group-hover:text-[#0052CC] transition-colors">
              {loading ? "—" : data?.activeOfferings || 0}
            </strong>
            <span className="text-xs text-slate-500">
              {data?.totalOfferings || 0} total
            </span>
          </div>
        </Link>

        {/* Incoming RFQs */}
        <Link
          href="/dashboard/supplier/rfqs"
          className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-xl hover:border-[#0052CC] transition-[border-color,box-shadow] duration-150 group shadow-2xs block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-500">
              RFQs Pending Quote
            </span>
            <FileText className="w-4 h-4 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <strong
              className={`text-2xl font-bold font-mono ${
                (data?.pendingRfqs || 0) > 0 ? "text-[#0052CC]" : "text-slate-900"
              }`}
            >
              {loading ? "—" : data?.pendingRfqs || 0}
            </strong>
            <span className="text-xs text-slate-500">
              {data?.rfqsReceived || 0} total
            </span>
          </div>
        </Link>

        {/* Orders in Fulfillment */}
        <Link
          href="/dashboard/supplier/orders"
          className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-xl hover:border-[#0052CC] transition-[border-color,box-shadow] duration-150 group shadow-2xs block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-500">
              Orders in Progress
            </span>
            <Package className="w-4 h-4 group-hover:text-[#0052CC] transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <strong className="text-2xl font-bold font-mono text-slate-900 group-hover:text-[#0052CC] transition-colors">
              {loading ? "—" : data?.pendingOrders || 0}
            </strong>
            <span className="text-xs text-slate-500">
              {data?.totalOrders || 0} total
            </span>
          </div>
        </Link>

        {/* Open Disputes */}
        <Link
          href="/dashboard/supplier/disputes"
          className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-xl hover:border-[#0052CC] transition-[border-color,box-shadow] duration-150 group shadow-2xs block"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-500">
              Customer Disputes
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
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] border border-blue-100 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
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
              <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">
                    Outstanding Receivables
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {data?.outstandingInvoices || 0} invoices
                  </span>
                </div>
                <strong className="text-2xl font-bold font-mono text-slate-900 block mt-1">
                  {loading ? "—" : formatCurrency(data?.outstandingInvoiceAmount)}
                </strong>
                <p className="text-xs text-slate-500">
                  Invoices issued awaiting buyer payment receipt or verification.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">
                    Confirmed Payments
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {data?.confirmedPayments || 0} settled
                  </span>
                </div>
                <strong className="text-2xl font-bold font-mono text-emerald-700 block mt-1">
                  {loading ? "—" : formatCurrency(data?.confirmedPaymentAmount)}
                </strong>
                <p className="text-xs text-slate-500">
                  Verified commercial wire transfers completed by buyers.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-1">
              * Payments are recorded directly between buyer and supplier. KemKendra operates on zero-custody verified records.
            </div>
          </div>

          {/* Catalog & Verification Quick Links */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Manufacturer Tools &amp; Compliance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Link
                href="/dashboard/supplier/verification"
                className="p-4 bg-white border border-slate-200 rounded-lg hover:border-[#0052CC] transition-colors flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#0052CC] block">
                    KYC &amp; Due Diligence
                  </span>
                  <span className="text-xs text-slate-500">
                    Manage manufacturing licenses and audit evidence
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0052CC] transition-colors shrink-0" />
              </Link>

              <Link
                href="/dashboard/supplier/documents"
                className="p-4 bg-white border border-slate-200 rounded-lg hover:border-[#0052CC] transition-colors flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#0052CC] block">
                    COA &amp; MSDS Vault
                  </span>
                  <span className="text-xs text-slate-500">
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
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold text-slate-900">
                  Recent Supplier Alerts
                </span>
                <Link
                  href="/dashboard/notifications"
                  className="text-xs text-[#0052CC] hover:underline font-semibold"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {data.recentNotifications.slice(0, 4).map((n) => (
                  <Link
                    key={n.id}
                    href={n.targetRoute || "/dashboard/notifications"}
                    className="block p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-xs space-y-0.5"
                  >
                    <div className="font-semibold text-slate-900 truncate">
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
