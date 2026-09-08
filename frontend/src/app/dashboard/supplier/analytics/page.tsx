"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  TrendingUp,
  FileText,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  RefreshCw,
} from "lucide-react";

import {
  SupplierAnalyticsSummaryResponse,
  getSupplierAnalyticsSummary,
  downloadSupplierExport,
  TopProduct,
} from "@/features/analytics/api/analyticsApi";

import {
  AnalyticsFilterBar,
  FilterState,
} from "@/features/analytics/components/AnalyticsFilterBar";

import {
  KpiStatCard,
  TrendLineChart,
  DistributionBarChart,
  AnalyticsTable,
} from "@/features/analytics/components/AnalyticsVisualizations";

export default function SupplierAnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    period: searchParams.get("period") || "30d",
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
  });

  const [summary, setSummary] = useState<SupplierAnalyticsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.period) params.set("period", newFilters.period);
    if (newFilters.from) params.set("from", newFilters.from);
    if (newFilters.to) params.set("to", newFilters.to);
    router.replace(`/dashboard/supplier/analytics?${params.toString()}`);
  };

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSupplierAnalyticsSummary({
        period: filters.period,
        from: filters.from,
        to: filters.to,
      });
      setSummary(data);
    } catch (err: any) {
      console.error("Failed to load supplier analytics", err);
      setError(err.message || "Failed to load supplier performance metrics.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleExport = async (reportType: string) => {
    setIsExporting(true);
    try {
      await downloadSupplierExport(reportType, {
        period: filters.period,
        from: filters.from,
        to: filters.to,
      });
    } catch (err: any) {
      alert(`Export failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    { label: "Export Inquiries (RFQs)", value: "rfqs" },
    { label: "Export Quotations Submitted", value: "quotations" },
    { label: "Export Purchase Orders", value: "orders" },
    { label: "Export Invoices & GST", value: "invoices" },
    { label: "Export Payment Records", value: "payments" },
  ];

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "₹0.00";
    return `₹${Number(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-16 text-[#0F172A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#0052CC] block mb-1">
            Supplier Intelligence
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#091E42]">
            Performance & Operational Analytics
          </h1>
          <p className="text-xs text-[#626F86] mt-0.5">
            Real activity tracking for inquiry turnaround, win rates, order fulfillment, and transaction collections.
          </p>
        </div>

        <button
          onClick={fetchSummary}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#44546F] bg-white border border-[#DCDFE4] rounded-lg hover:bg-[#F4F5F7] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#0052CC]" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <AnalyticsFilterBar
        filters={filters}
        onFilterChange={updateFilters}
        onExport={handleExport}
        exportOptions={exportOptions}
        showCategoryFilter={false}
        showStatusFilter={false}
        isExporting={isExporting}
      />

      {error && (
        <div className="p-4 bg-[#FFEBE6] border border-[#FFBDAD] text-[#DE350B] rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white border border-[#E4E4E7] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-white border border-[#E4E4E7] rounded-xl animate-pulse" />
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KpiStatCard
              title="RFQs Received"
              value={summary.rfqsReceived}
              subtitle={`${summary.activeRfqs} requiring response`}
              icon={FileText}
              tone="amber"
            />
            <KpiStatCard
              title="Quotation Win Rate"
              value={`${summary.quotationAcceptanceRate}%`}
              subtitle={`${summary.quotationsAccepted} of ${summary.quotationsSubmitted} accepted`}
              icon={TrendingUp}
              tone="emerald"
            />
            <KpiStatCard
              title="Avg Response Time"
              value={`${summary.averageResponseTimeHours} hrs`}
              subtitle="From RFQ to Quote"
              icon={Clock}
              tone="purple"
            />
            <KpiStatCard
              title="Fulfilled GMV"
              value={formatCurrency(summary.totalFulfilledGmv)}
              subtitle={`${summary.ordersCompleted} orders delivered`}
              icon={DollarSign}
              tone="blue"
            />
          </div>

          {/* Trend chart & Status distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrendLineChart
                title="Fulfilled Order Volume Trajectory"
                subtitle="Daily transaction fulfillment execution"
                data={summary.fulfillmentTrends}
                color="#0052CC"
                valueFormatter={formatCurrency}
              />
            </div>
            <div>
              <DistributionBarChart
                title="Purchase Order Distribution"
                data={Object.entries(summary.ordersByStatus).map(([status, count]) => ({
                  label: status,
                  count,
                }))}
                totalCount={summary.ordersReceived}
              />
            </div>
          </div>

          {/* Top selling products table */}
          <AnalyticsTable<TopProduct>
            title="Top Performing Chemical Products (By Revenue)"
            columns={[
              { header: "Chemical Product", accessor: (r) => <span className="font-semibold text-[#091E42]">{r.productName}</span> },
              { header: "Product Code", accessor: (r) => <span className="font-mono text-[11px] text-[#626F86]">{r.productCode || "—"}</span> },
              { header: "Orders", accessor: (r) => r.orderCount, align: "right" },
              { header: "Quantity Delivered", accessor: (r) => `${Number(r.totalQuantity).toLocaleString()} ${r.unit}`, align: "right" },
              { header: "Fulfilled Value", accessor: (r) => <span className="font-semibold font-mono text-[#0052CC]">{formatCurrency(r.totalAmount)}</span>, align: "right" },
            ]}
            data={summary.topSellingProducts}
            emptyMessage="No chemical products fulfilled in this time range."
          />
        </div>
      ) : null}
    </div>
  );
}
